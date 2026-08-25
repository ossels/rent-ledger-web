import { Injectable } from "@nestjs/common";
import { Entry, EntryKind, EntryStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { EntriesService } from "../entries/entries.service";

export interface MonthTotals {
  due: number;
  collected: number;
  awaited: number;
  expenses: number;
  net: number;
  shareA: number;
  shareB: number;
  countCollected: number;
  countTotal: number;
}

function totalsOf(entries: Entry[]): MonthTotals {
  const rent = entries.filter((e) => e.kind === EntryKind.RENT);
  const expenses = entries.filter((e) => e.kind === EntryKind.EXPENSE);
  const sum = (arr: Entry[], f: (e: Entry) => number) => arr.reduce((s, e) => s + f(e), 0);
  // Partial installments count what actually arrived; owner shares split
  // the received amount in the same proportion as the agreed split.
  const shareOf = (e: Entry, split: number) => (e.total > 0 ? Math.round((e.received * split) / e.total) : 0);
  const collected = sum(rent, (e) => e.received);
  const spent = sum(expenses, (e) => e.total);
  return {
    due: sum(rent, (e) => e.total),
    collected,
    awaited: sum(rent, (e) => Math.max(0, e.total - e.received)),
    expenses: spent,
    net: collected - spent,
    shareA: sum(rent, (e) => shareOf(e, e.splitA)) - sum(expenses, (e) => e.splitA),
    shareB: sum(rent, (e) => shareOf(e, e.splitB)) - sum(expenses, (e) => e.splitB),
    countCollected: rent.filter((e) => e.status === EntryStatus.COLLECTED).length,
    countTotal: rent.length,
  };
}

/** Today's month key in the household's timezone, e.g. "2026-08". */
function currentMonthKey(timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit" })
    .formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}`;
}

@Injectable()
export class LedgerService {
  constructor(
    private prisma: PrismaService,
    private entriesService: EntriesService,
  ) {}

  // Every month that has entries, oldest first, each with its totals.
  async months() {
    const entries = await this.prisma.entry.findMany({
      orderBy: [{ month: "asc" }, { day: "asc" }],
    });
    const byMonth = new Map<string, Entry[]>();
    for (const e of entries) {
      const list = byMonth.get(e.month) ?? [];
      list.push(e);
      byMonth.set(e.month, list);
    }
    return [...byMonth.entries()].map(([key, list]) => ({ key, totals: totalsOf(list) }));
  }

  async month(key: string) {
    await this.autoCarry(key);
    const entries = await this.prisma.entry.findMany({
      where: { month: key },
      include: { payments: { orderBy: [{ date: "asc" }, { createdAt: "asc" }] } },
      orderBy: [{ day: "asc" }, { createdAt: "asc" }],
    });
    return { key, entries, totals: totalsOf(entries) };
  }

  // "Auto-carry rent": the current month starts itself with one awaited row per
  // building the first time it is opened. Only ever the current month.
  private async autoCarry(key: string) {
    const settings = await this.prisma.settings.findUnique({ where: { id: 1 } });
    if (!settings?.autoCarry) return;
    if (key !== currentMonthKey(settings.timezone)) return;
    const rentRows = await this.prisma.entry.count({ where: { month: key, kind: EntryKind.RENT } });
    if (rentRows > 0) return;
    await this.entriesService.prefillMonth(key);
  }
}
