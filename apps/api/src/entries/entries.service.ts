import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { EntryKind, EntryStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEntryDto, ListEntriesQuery, UpdateEntryDto } from "./entries.dto";

@Injectable()
export class EntriesService {
  constructor(private prisma: PrismaService) {}

  findAll(query: ListEntriesQuery) {
    return this.prisma.entry.findMany({
      where: {
        month: query.month,
        buildingId: query.buildingId,
      },
      orderBy: [{ month: "asc" }, { day: "asc" }, { createdAt: "asc" }],
    });
  }

  async create(dto: CreateEntryDto) {
    if (dto.splitA + dto.splitB !== dto.total) {
      throw new BadRequestException("splitA + splitB must equal total");
    }
    const building = await this.prisma.building.findUnique({ where: { id: dto.buildingId } });
    if (!building) throw new NotFoundException("Building not found");

    const status =
      dto.status ?? (dto.kind === EntryKind.EXPENSE ? EntryStatus.PAID : EntryStatus.COLLECTED);
    return this.prisma.entry.create({ data: { ...dto, status } });
  }

  async update(id: string, dto: UpdateEntryDto) {
    const existing = await this.prisma.entry.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Entry not found");
    const total = dto.total ?? existing.total;
    const splitA = dto.splitA ?? existing.splitA;
    const splitB = dto.splitB ?? existing.splitB;
    if (splitA + splitB !== total) {
      throw new BadRequestException("splitA + splitB must equal total");
    }
    return this.prisma.entry.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const existing = await this.prisma.entry.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Entry not found");
    await this.prisma.entry.delete({ where: { id } });
    return { deleted: true };
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
