import { Injectable } from "@nestjs/common";
import { Entry, EntryKind, EntryStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

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
  const collected = rent.filter((e) => e.status === EntryStatus.COLLECTED);
  const sum = (arr: Entry[], f: (e: Entry) => number) => arr.reduce((s, e) => s + f(e), 0);
  return {
    due: sum(rent, (e) => e.total),
    collected: sum(collected, (e) => e.total),
    awaited: sum(rent.filter((e) => e.status !== EntryStatus.COLLECTED), (e) => e.total),
    expenses: sum(expenses, (e) => e.total),
    net: sum(collected, (e) => e.total) - sum(expenses, (e) => e.total),
    shareA: sum(collected, (e) => e.splitA) - sum(expenses, (e) => e.splitA),
    shareB: sum(collected, (e) => e.splitB) - sum(expenses, (e) => e.splitB),
    countCollected: collected.length,
    countTotal: rent.length,
  };
}

@Injectable()
export class LedgerService {
  constructor(private prisma: PrismaService) {}

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
    const entries = await this.prisma.entry.findMany({
      where: { month: key },
      orderBy: [{ day: "asc" }, { createdAt: "asc" }],
    });
    return { key, entries, totals: totalsOf(entries) };
  }
}
