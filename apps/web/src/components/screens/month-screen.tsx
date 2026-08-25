"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Amount, Badge, Button, Card, EmptyState, IconButton, ListRow, MonthNav, SplitBar, StatTile } from "@/components/ds";
import { EntryEditSheet } from "@/components/entry-edit-sheet";
import { ScreenState } from "@/components/screen-state";
import { useLedger } from "@/lib/store";
import { addMonths, formatNumber, monthAbbr, monthLabel } from "@/lib/format";
import type { Entry, MonthTotals } from "@/lib/api";

function MonthSummary({ totals }: { totals: MonthTotals }) {
  const { currency, locale, partyName } = useLedger();
  return (
    <Card tone="ink" pad="lg" style={{ borderRadius: 0, border: "none", boxShadow: "none", paddingTop: 4 }}>
      <div style={{ fontSize: "var(--text-micro)", letterSpacing: "var(--track-micro)", textTransform: "uppercase", color: "rgba(250,247,241,.62)" }}>
        Net for the month
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 4 }}>
        <Amount value={totals.net} currency={currency} size="hero" tone="inverse" locale={locale} />
        {totals.awaited > 0 ? (
          <span style={{ fontSize: "var(--text-label)", color: "var(--marigold-200)" }}>
            {currency}
            {formatNumber(totals.awaited, locale)} awaited
          </span>
        ) : (
          <Badge tone="positive" dot>
            All collected
          </Badge>
        )}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <StatTile label="Collected" value={totals.collected} tone="inverse" icon="indian-rupee" currency={currency} style={{ flex: 1 }} />
        <StatTile label="Expenses" value={totals.expenses} tone="inverse" icon="wrench" currency={currency} style={{ flex: 1 }} />
      </div>
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: "var(--text-micro)", letterSpacing: "var(--track-micro)", textTransform: "uppercase", color: "rgba(250,247,241,.62)", marginBottom: 8 }}>
          Your split
        </div>
        <SplitBar
          parts={[
            { label: partyName("a"), value: Math.max(totals.shareA, 0), party: "a" },
            { label: partyName("b"), value: Math.max(totals.shareB, 0), party: "b" },
          ]}
          currency={currency}
          style={{ color: "var(--text-on-inverse)" }}
        />
      </div>
    </Card>
  );
}

export function MonthScreen() {
  const router = useRouter();
  const {
    buildings, currency, locale, partyName, selectedMonth, selectMonth,
    monthDetail, monthLoading, markPaid, openSheet, prefillMonth, settings,
  } = useLedger();

  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const label = monthLabel(selectedMonth);
  const abbr = monthAbbr(selectedMonth);
  const entries = monthDetail?.entries ?? [];
  const totals = monthDetail?.totals ?? {
    due: 0, collected: 0, awaited: 0, expenses: 0, net: 0, shareA: 0, shareB: 0, countCollected: 0, countTotal: 0,
  };
  const rent = entries.filter((e) => e.kind === "RENT");
  const expenses = entries.filter((e) => e.kind === "EXPENSE");
  const monthEmpty = !monthLoading && entries.length === 0;

  return (
    <ScreenState>
      <div>
        <div style={{ background: "var(--surface-inverse)", padding: "calc(var(--space-12) + var(--safe-top)) var(--space-16) var(--space-20)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark-inverse.svg" width="26" height="26" alt="" />
            <span style={{ flex: 1, fontFamily: "var(--font-display)", fontWeight: "var(--weight-display)", letterSpacing: "-0.02em", fontSize: 20, color: "var(--paper)" }}>
              RentLedger
            </span>
            <span style={{ fontSize: "var(--text-micro)", letterSpacing: "var(--track-label)", textTransform: "uppercase", color: "rgba(250,247,241,.6)" }}>
              {settings?.timezone === "Asia/Kolkata" ? "IST" : settings?.timezone ?? ""}
            </span>
          </div>
          <MonthNav
            tone="ink"
            label={label}
            sublabel={`${totals.countCollected} of ${totals.countTotal} collected`}
            onPrev={() => selectMonth(addMonths(selectedMonth, -1))}
            onNext={() => selectMonth(addMonths(selectedMonth, 1))}
          />
          <div style={{ marginTop: 14 }}>
            <MonthSummary totals={totals} />
          </div>
        </div>

        <div style={{ padding: "var(--space-16)", display: "flex", flexDirection: "column", gap: "var(--space-16)" }}>
          {monthEmpty ? (
            <Card pad="sm">
              <EmptyState
                icon="notebook-pen"
                title={`Nothing recorded for ${label.split(" ")[0]} yet.`}
                body="Start the month with one awaited rent row per building, or add an entry yourself."
                actionLabel="Start from your buildings"
                onAction={prefillMonth}
              />
            </Card>
          ) : (
            <>
              <div>
                <div className="k-label" style={{ marginBottom: 8 }}>Rent</div>
                <Card pad="sm">
                  {rent.map((e, i) => {
                    const b = buildings.find((x) => x.id === e.buildingId);
                    const collected = e.status === "COLLECTED";
                    const partial = e.status === "PARTIAL";
                    return (
                      <ListRow
                        key={e.id}
                        ledger={i < rent.length - 1}
                        onClick={() => b && router.push(`/buildings/${b.id}`)}
                        leadingIcon="building-2"
                        title={b ? `${b.name} — ${b.unit}` : "Building"}
                        subtitle={`${partyName("a")} ${formatNumber(e.splitA, locale)} · ${partyName("b")} ${formatNumber(e.splitB, locale)}`}
                        amount={e.total}
                        amountTone={collected ? "positive" : "muted"}
                        currency={currency}
                        meta={
                          collected
                            ? `${e.day} ${abbr}`
                            : partial
                              ? `${currency}${formatNumber(e.received, locale)} / ${currency}${formatNumber(e.total, locale)}`
                              : undefined
                        }
                        trailing={
                          <>
                            {collected ? null : (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={(ev) => {
                                  ev.stopPropagation();
                                  markPaid(e);
                                }}
                              >
                                Mark paid
                              </Button>
                            )}
                            <IconButton
                              icon="pencil"
                              label="Edit entry"
                              size={34}
                              onClick={(ev) => {
                                ev.stopPropagation();
                                setEditingEntry(e);
                              }}
                            />
                          </>
                        }
                      />
                    );
                  })}
                  {rent.length === 0 ? (
                    <EmptyState icon="building-2" title="No rent rows" body={`No rent recorded for ${label.split(" ")[0]}.`} style={{ padding: "var(--space-20)" }} />
                  ) : null}
                </Card>
              </div>

              <div>
                <div className="k-label" style={{ marginBottom: 8 }}>Expenses</div>
                <Card pad="sm">
                  {expenses.length === 0 ? (
                    <EmptyState icon="wrench" title="No expenses" body="Nothing spent on maintenance this month." style={{ padding: "var(--space-20)" }} />
                  ) : (
                    expenses.map((e, i) => {
                      const b = buildings.find((x) => x.id === e.buildingId);
                      return (
                        <ListRow
                          key={e.id}
                          ledger={i < expenses.length - 1}
                          leadingIcon="wrench"
                          title={e.note || "Expense"}
                          subtitle={b ? b.name : undefined}
                          amount={-e.total}
                          amountTone="negative"
                          currency={currency}
                          meta={`${e.day} ${abbr}`}
                          onClick={() => setEditingEntry(e)}
                          trailing={<IconButton icon="pencil" label="Edit entry" size={34} onClick={(ev) => { ev.stopPropagation(); setEditingEntry(e); }} />}
                        />
                      );
                    })
                  )}
                </Card>
              </div>
            </>
          )}

          <Button size="lg" variant="accent" full icon="plus" onClick={openSheet}>
            Add entry
          </Button>
          <div style={{ height: 8 }} />
        </div>
        {editingEntry ? <EntryEditSheet key={editingEntry.id} entry={editingEntry} open onClose={() => setEditingEntry(null)} /> : null}
      </div>
    </ScreenState>
  );
}
