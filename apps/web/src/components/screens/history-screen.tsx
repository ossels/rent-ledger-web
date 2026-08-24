"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Amount, Card, ListRow, SegmentedControl, SplitBar, TopBar } from "@/components/ds";
import { ScreenState } from "@/components/screen-state";
import { useLedger } from "@/lib/store";
import { formatNumber, monthLabel } from "@/lib/format";
import type { MonthTotals } from "@/lib/api";

export function HistoryScreen() {
  const router = useRouter();
  const { monthsIndex, currency, locale, partyName, selectMonth } = useLedger();
  const [who, setWho] = useState("all");

  const rows = monthsIndex
    .slice()
    .reverse()
    .map((m) => ({ key: m.key, label: monthLabel(m.key), t: m.totals }));
  const pick = (t: MonthTotals) => (who === "a" ? t.shareA : who === "b" ? t.shareB : t.net);
  const yearNet = rows.reduce((s, r) => s + pick(r.t), 0);
  const yearA = rows.reduce((s, r) => s + r.t.shareA, 0);
  const yearB = rows.reduce((s, r) => s + r.t.shareB, 0);

  return (
    <ScreenState>
      <div>
        <TopBar title="History" subtitle="Every month since you started" />
        <div style={{ padding: "var(--space-16)", display: "flex", flexDirection: "column", gap: "var(--space-16)" }}>
          <SegmentedControl
            full
            value={who}
            onChange={setWho}
            options={[
              { value: "all", label: "Both" },
              { value: "a", label: partyName("a") },
              { value: "b", label: partyName("b") },
            ]}
          />
          <Card pad="lg">
            <div className="k-label">{rows.length ? `${rows[0].label.split(" ")[1]} so far` : "So far"}</div>
            <Amount value={yearNet} currency={currency} size="hero" locale={locale} />
            <div style={{ marginTop: 14 }}>
              <SplitBar
                currency={currency}
                parts={[
                  { label: partyName("a"), value: yearA, party: "a" },
                  { label: partyName("b"), value: yearB, party: "b" },
                ]}
              />
            </div>
          </Card>
          <Card pad="sm">
            {rows.map((r, i) => (
              <ListRow
                key={r.key}
                ledger={i < rows.length - 1}
                chevron
                onClick={() => {
                  selectMonth(r.key);
                  router.push("/");
                }}
                title={r.label}
                subtitle={`${r.t.countCollected} of ${r.t.countTotal} collected · ${currency}${formatNumber(r.t.expenses, locale)} spent`}
                amount={pick(r.t)}
                currency={currency}
                amountTone={pick(r.t) >= 0 ? "neutral" : "negative"}
              />
            ))}
            {rows.length === 0 ? (
              <div style={{ padding: "var(--space-16)", color: "var(--text-muted)", fontSize: "var(--text-body-md)" }}>
                Nothing recorded yet.
              </div>
            ) : null}
          </Card>
        </div>
      </div>
    </ScreenState>
  );
}
