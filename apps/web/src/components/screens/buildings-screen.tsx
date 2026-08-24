"use client";

import { useRouter } from "next/navigation";
import { Amount, Button, Card, SplitBar, TopBar } from "@/components/ds";
import { ScreenState } from "@/components/screen-state";
import { useLedger } from "@/lib/store";
import { formatNumber } from "@/lib/format";
import type { OwnerKind } from "@/lib/api";

export function BuildingsScreen() {
  const router = useRouter();
  const { buildings, currency, locale, partyName, openSheet } = useLedger();

  const groups: { key: OwnerKind; label: string }[] = [
    { key: "SHARED", label: "Shared" },
    { key: "A", label: `${partyName("a")} only` },
    { key: "B", label: `${partyName("b")} only` },
  ];
  const total = buildings.reduce((s, b) => s + b.rent, 0);

  return (
    <ScreenState>
      <div>
        <TopBar title="Buildings" subtitle={`${buildings.length} properties · ${currency}${formatNumber(total, locale)} a month`} />
        <div style={{ padding: "var(--space-16)", display: "flex", flexDirection: "column", gap: "var(--space-20)" }}>
          {groups.map((g) => {
            const list = buildings.filter((b) => b.owner === g.key);
            if (!list.length) return null;
            return (
              <div key={g.key}>
                <div className="k-label" style={{ marginBottom: 8 }}>{g.label}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-10)" }}>
                  {list.map((b) => (
                    <Card key={b.id} pad="md" onClick={() => router.push(`/buildings/${b.id}`)}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                        <div>
                          <div style={{ fontSize: "var(--text-body-lg)", fontWeight: "var(--weight-semibold)", color: "var(--text-strong)" }}>{b.name}</div>
                          <div style={{ fontSize: "var(--text-label)", color: "var(--text-muted)" }}>
                            {[b.unit, b.area, b.tenant].filter(Boolean).join(" · ")}
                          </div>
                        </div>
                        <Amount value={b.rent} currency={currency} size="lg" locale={locale} />
                      </div>
                      {b.owner === "SHARED" ? (
                        <div style={{ marginTop: 12 }}>
                          <SplitBar
                            height={8}
                            currency={currency}
                            parts={[
                              { label: partyName("a"), value: b.splitA, party: "a" },
                              { label: partyName("b"), value: b.splitB, party: "b" },
                            ]}
                          />
                        </div>
                      ) : null}
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
          <Button variant="secondary" full size="md" icon="plus" onClick={openSheet}>
            Add an entry
          </Button>
        </div>
      </div>
    </ScreenState>
  );
}
