"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Amount, Badge, Card, ListRow, SplitBar, TopBar } from "@/components/ds";
import { ScreenState } from "@/components/screen-state";
import { useLedger } from "@/lib/store";
import type { Entry } from "@/lib/api";
import { formatNumber, monthAbbr, monthLabel } from "@/lib/format";

export function BuildingScreen({ buildingId }: { buildingId: string }) {
  const router = useRouter();
  const { buildings, currency, locale, partyName, monthKeys, selectMonth, loading } = useLedger();
  const building = buildings.find((b) => b.id === buildingId);
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    fetch(`/api/entries?buildingId=${encodeURIComponent(buildingId)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!cancelled) setEntries(data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [buildingId, loading]);

  if (!building) {
    return (
      <ScreenState>
        <div style={{ padding: "var(--space-16)", color: "var(--text-muted)" }}>This building is not in the ledger.</div>
      </ScreenState>
    );
  }

  const ownerLabel =
    building.owner === "SHARED" ? "Shared" : building.owner === "A" ? `${partyName("a")} only` : `${partyName("b")} only`;

  const history = monthKeys
    .slice()
    .reverse()
    .map((k) => ({
      key: k,
      label: monthLabel(k),
      entry: entries.find((e) => e.month === k && e.kind === "RENT"),
      expenses: entries.filter((e) => e.month === k && e.kind === "EXPENSE"),
    }))
    .filter((h) => h.entry || h.expenses.length);

  return (
    <ScreenState>
      <div>
        <TopBar title={building.name} subtitle={[ownerLabel, building.area].filter(Boolean).join(" · ")} back onBack={() => router.back()} />
        <div style={{ padding: "var(--space-16)", display: "flex", flexDirection: "column", gap: "var(--space-16)" }}>
          <Card pad="lg">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div className="k-label">Monthly rent</div>
                <Amount value={building.rent} currency={currency} size="hero" locale={locale} />
                <div style={{ marginTop: 4, fontSize: "var(--text-body-md)", color: "var(--text-muted)" }}>
                  {[building.unit, building.tenant].filter(Boolean).join(" · ")}
                </div>
              </div>
              <Badge tone={building.owner === "SHARED" ? "brand" : building.owner === "A" ? "neutral" : "accent"}>{ownerLabel}</Badge>
            </div>
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--rule-ledger)" }}>
              <div className="k-label" style={{ marginBottom: 8 }}>Agreed split</div>
              <SplitBar
                currency={currency}
                parts={[
                  { label: partyName("a"), value: building.splitA, party: "a" },
                  { label: partyName("b"), value: building.splitB, party: "b" },
                ]}
              />
            </div>
          </Card>

          <div>
            <div className="k-label" style={{ marginBottom: 8 }}>History</div>
            <Card pad="sm">
              {history.map((h, i) => (
                <ListRow
                  key={h.key}
                  ledger={i < history.length - 1}
                  onClick={() => {
                    selectMonth(h.key);
                    router.push("/");
                  }}
                  chevron
                  title={h.label}
                  subtitle={h.entry && h.entry.status === "COLLECTED" ? `Received ${h.entry.day} ${monthAbbr(h.key)}` : "Awaited"}
                  amount={h.entry ? h.entry.total : 0}
                  currency={currency}
                  amountTone={h.entry && h.entry.status === "COLLECTED" ? "positive" : "muted"}
                  meta={
                    h.expenses.length
                      ? `−${currency}${formatNumber(h.expenses.reduce((s, e) => s + e.total, 0), locale)} spent`
                      : undefined
                  }
                />
              ))}
              {history.length === 0 ? (
                <div style={{ padding: "var(--space-16)", color: "var(--text-muted)", fontSize: "var(--text-body-md)" }}>
                  Nothing recorded for this building yet.
                </div>
              ) : null}
            </Card>
          </div>
        </div>
      </div>
    </ScreenState>
  );
}
