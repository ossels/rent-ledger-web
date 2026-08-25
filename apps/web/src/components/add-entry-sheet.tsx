"use client";

import { useEffect, useState } from "react";
import { Button, Checkbox, Input, SegmentedControl, Select, Sheet, SplitBar } from "@/components/ds";
import { useLedger } from "@/lib/store";
import { daysInMonth, formatNumber, monthDate, monthLabel, shareLabel, todayISO } from "@/lib/format";
import type { EntryKind } from "@/lib/api";

export function AddEntrySheet() {
  const { buildings, currency, locale, selectedMonth, partyName, addEntry, closeSheet, sheetOpen } = useLedger();
  const [kind, setKind] = useState<EntryKind>("RENT");
  const [buildingId, setBuildingId] = useState(buildings[0]?.id ?? "");
  const [total, setTotal] = useState("");
  const [shareA, setShareA] = useState("");
  const [note, setNote] = useState("");
  const [full, setFull] = useState(true);
  // Default to today; when browsing an older month, fall inside that month instead.
  const [date, setDate] = useState(() => {
    const today = todayISO();
    return today.startsWith(selectedMonth) ? today : monthDate(selectedMonth, 1);
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const building = buildings.find((b) => b.id === buildingId) ?? buildings[0];

  useEffect(() => {
    if (!building) return;
    setTotal(String(building.rent));
    setShareA(String(building.splitA));
  }, [buildingId, building]);

  if (!building) return null;

  const t = Number(total) || 0;
  const a = Math.min(Number(shareA) || 0, t);
  const nameA = partyName("a");
  const nameB = partyName("b");
  // The entry lands in the ledger month of whatever date was picked.
  const entryMonth = date.slice(0, 7) || selectedMonth;
  const monthWord = monthLabel(entryMonth).split(" ")[0];

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await addEntry({
        kind,
        buildingId: building.id,
        total: t,
        splitA: a,
        splitB: t - a,
        month: entryMonth,
        day: Math.min(Math.max(Number(date.slice(8, 10)) || 1, 1), daysInMonth(entryMonth)),
        note: note || undefined,
        status: kind === "RENT" ? (full ? "COLLECTED" : "AWAITED") : "PAID",
      });
      closeSheet();
      setNote("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the entry");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet
      open={sheetOpen}
      onClose={closeSheet}
      title={kind === "RENT" ? "Record rent" : "Record expense"}
      footer={
        <Button size="lg" variant="accent" full icon="check" disabled={saving || t <= 0} onClick={save}>
          Save to {monthWord}
        </Button>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-14, 14px)" }}>
        <SegmentedControl
          full
          value={kind}
          onChange={(v) => setKind(v as EntryKind)}
          options={[
            { value: "RENT", label: "Rent" },
            { value: "EXPENSE", label: "Expense" },
          ]}
        />
        <Select
          label="Building"
          value={buildingId}
          onChange={setBuildingId}
          options={buildings.map((x) => ({ value: x.id, label: `${x.name} — ${x.unit}` }))}
        />
        <Input label={kind === "RENT" ? "Amount received" : "Amount spent"} amount prefix={currency} value={total} onChange={setTotal} />
        <Input label="Date" type="date" value={date} onChange={setDate} />
        {kind === "RENT" ? <Checkbox label="Received in full" checked={full} onChange={setFull} /> : null}
        <div>
          <Input
            label={shareLabel(nameA)}
            amount
            prefix={currency}
            value={String(a)}
            onChange={setShareA}
            hint={`${nameB} gets ${currency}${formatNumber(t - a, locale)}`}
          />
          <div style={{ marginTop: 12 }}>
            <SplitBar
              currency={currency}
              parts={[
                { label: nameA, value: a, party: "a" },
                { label: nameB, value: t - a, party: "b" },
              ]}
            />
          </div>
        </div>
        <Input label="Note" placeholder={kind === "RENT" ? "Paid by UPI" : "Plumbing, 2F bathroom"} value={note} onChange={setNote} />
        {error ? <span style={{ fontSize: "var(--text-label)", color: "var(--text-negative)" }}>{error}</span> : null}
      </div>
    </Sheet>
  );
}
