import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Entry, EntryKind, EntryStatus, Prisma } from "@prisma/client";
import { promises as fs } from "node:fs";
import path from "node:path";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEntryDto, CreatePaymentDto, ListEntriesQuery, UpdateEntryDto } from "./entries.dto";

const ENTRY_INCLUDE: Prisma.EntryInclude = { payments: { orderBy: [{ date: "asc" }, { createdAt: "asc" }] } };

export function receiptsDir(): string {
  return process.env.RECEIPTS_DIR || path.join(process.cwd(), "uploads");
}

/** Rent status is derived from what has actually been received; never client-set. */
function rentStatus(received: number, total: number): EntryStatus {
  if (received >= total && total > 0) return EntryStatus.COLLECTED;
  if (received > 0) return EntryStatus.PARTIAL;
  return EntryStatus.AWAITED;
}

@Injectable()
export class EntriesService {
  constructor(private prisma: PrismaService) {}

  findAll(query: ListEntriesQuery) {
    return this.prisma.entry.findMany({
      where: {
        month: query.month,
        buildingId: query.buildingId,
      },
      include: ENTRY_INCLUDE,
      orderBy: [{ month: "asc" }, { day: "asc" }, { createdAt: "asc" }],
    });
  }

  private async getEntry(id: string): Promise<Entry> {
    const entry = await this.prisma.entry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException("Entry not found");
    return entry;
  }

  async create(dto: CreateEntryDto) {
    if (dto.splitA + dto.splitB !== dto.total) {
      throw new BadRequestException("splitA + splitB must equal total");
    }
    const building = await this.prisma.building.findUnique({ where: { id: dto.buildingId } });
    if (!building) throw new NotFoundException("Building not found");

    const isExpense = dto.kind === EntryKind.EXPENSE;
    const { status: _ignored, ...data } = dto;
    return this.prisma.entry.create({
      data: {
        ...data,
        received: isExpense ? dto.total : 0,
        status: isExpense ? EntryStatus.PAID : EntryStatus.AWAITED,
      },
      include: ENTRY_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateEntryDto) {
    const existing = await this.getEntry(id);
    const total = dto.total ?? existing.total;
    const splitA = dto.splitA ?? existing.splitA;
    const splitB = dto.splitB ?? existing.splitB;
    if (splitA + splitB !== total) {
      throw new BadRequestException("splitA + splitB must equal total");
    }
    const isExpense = existing.kind === EntryKind.EXPENSE;
    const { status: _ignored, ...data } = dto;
    return this.prisma.entry.update({
      where: { id },
      data: {
        ...data,
        received: isExpense ? total : existing.received,
        status: isExpense ? EntryStatus.PAID : rentStatus(existing.received, total),
      },
      include: ENTRY_INCLUDE,
    });
  }

  async remove(id: string) {
    const existing = await this.getEntry(id);
    await this.prisma.entry.delete({ where: { id } });
    if (existing.receiptPath) {
      await fs.unlink(path.join(receiptsDir(), existing.receiptPath)).catch(() => undefined);
    }
    return { deleted: true };
  }

  // --- Payments (installments against a rent entry) ---

  async addPayment(entryId: string, dto: CreatePaymentDto) {
    const entry = await this.getEntry(entryId);
    if (entry.kind !== EntryKind.RENT) {
      throw new BadRequestException("Payments are recorded against rent entries only");
    }
    if (entry.received + dto.amount > entry.total) {
      throw new BadRequestException(
        `That would exceed the rent due — only ${entry.total - entry.received} is outstanding`,
      );
    }
    const received = entry.received + dto.amount;
    const [, updated] = await this.prisma.$transaction([
      this.prisma.payment.create({ data: { entryId, ...dto } }),
      this.prisma.entry.update({
        where: { id: entryId },
        data: { received, status: rentStatus(received, entry.total) },
        include: ENTRY_INCLUDE,
      }),
    ]);
    return updated;
  }

  async removePayment(entryId: string, paymentId: string) {
    const entry = await this.getEntry(entryId);
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment || payment.entryId !== entryId) throw new NotFoundException("Payment not found");
    const received = Math.max(0, entry.received - payment.amount);
    const [, updated] = await this.prisma.$transaction([
      this.prisma.payment.delete({ where: { id: paymentId } }),
      this.prisma.entry.update({
        where: { id: entryId },
        data: { received, status: rentStatus(received, entry.total) },
        include: ENTRY_INCLUDE,
      }),
    ]);
    return updated;
  }

  // --- Receipt photo (one per entry) ---

  async setReceipt(entryId: string, filename: string) {
    const entry = await this.getEntry(entryId);
    if (entry.receiptPath && entry.receiptPath !== filename) {
      await fs.unlink(path.join(receiptsDir(), entry.receiptPath)).catch(() => undefined);
    }
    return this.prisma.entry.update({
      where: { id: entryId },
      data: { receiptPath: filename },
      include: ENTRY_INCLUDE,
    });
  }

  async getReceiptPath(entryId: string): Promise<string> {
    const entry = await this.getEntry(entryId);
    if (!entry.receiptPath) throw new NotFoundException("No receipt on this entry");
    return path.join(receiptsDir(), entry.receiptPath);
  }

  async removeReceipt(entryId: string) {
    const entry = await this.getEntry(entryId);
    if (entry.receiptPath) {
      await fs.unlink(path.join(receiptsDir(), entry.receiptPath)).catch(() => undefined);
    }
    return this.prisma.entry.update({
      where: { id: entryId },
      data: { receiptPath: null },
      include: ENTRY_INCLUDE,
    });
  }

  // Pre-fill a month with one awaited rent row per active building ("auto-carry").
  // Buildings that already have a rent row that month are skipped.
  async prefillMonth(month: string) {
    const buildings = await this.prisma.building.findMany({ where: { archived: false } });
    const existing = await this.prisma.entry.findMany({
      where: { month, kind: EntryKind.RENT },
      select: { buildingId: true },
    });
    const have = new Set(existing.map((e) => e.buildingId));
    const created = [];
    for (const b of buildings) {
      if (have.has(b.id)) continue;
      created.push(
        await this.prisma.entry.create({
          data: {
            buildingId: b.id,
            kind: EntryKind.RENT,
            month,
            day: 1,
            total: b.rent,
            splitA: b.splitA,
            splitB: b.splitB,
            status: EntryStatus.AWAITED,
            note: b.tenant,
          },
        }),
      );
    }
    return { created: created.length, entries: created };
  }
}
