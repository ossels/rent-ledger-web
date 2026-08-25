"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Checkbox, Input, SegmentedControl, Select, Sheet, SplitBar } from "@/components/ds";
import { useLedger } from "@/lib/store";
import { daysInMonth, formatNumber, monthDate, monthLabel, shareLabel, todayISO } from "@/lib/format";
import { api, type EntryKind } from "@/lib/api";

export function AddEntrySheet() {
  const { buildings, currency, locale, selectedMonth, partyName, addEntry, closeSheet, sheetOpen, reloadMonth } = useLedger();
  const [kind, setKind] = useState<EntryKind>("RENT");
  const [buildingId, setBuildingId] = useState(buildings[0]?.id ?? "");
  const [total, setTotal] = useState("");
  const [shareA, setShareA] = useState("");
  const [note, setNote] = useState("");
  const [full, setFull] = useState(true);
  const [receivedNow, setReceivedNow] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
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
      const created = await addEntry({
        kind,
        buildingId: building.id,
        total: t,
        splitA: a,
        splitB: t - a,
        month: entryMonth,
        day: Math.min(Math.max(Number(date.slice(8, 10)) || 1, 1), daysInMonth(entryMonth)),
        note: note || undefined,
      });
      // Rent: record what actually arrived as the first payment installment.
      if (kind === "RENT") {
        const paid = full ? t : Math.min(Number(receivedNow) || 0, t);
        if (paid > 0) await api.addPayment(created.id, { amount: paid, date });
      }
      if (receiptFile) await api.uploadReceipt(created.id, receiptFile);
      await reloadMonth();
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
        {kind === "RENT" && !full ? (
          <Input
            label="Received so far"
            amount
            prefix={currency}
            value={receivedNow}
            onChange={setReceivedNow}
            placeholder="0"
            hint="Leave 0 if nothing has arrived yet — add installments later from the entry."
          />
        ) : null}
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
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              setReceiptFile(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
          <Button variant="secondary" size="sm" icon="receipt-indian-rupee" onClick={() => fileRef.current?.click()}>
            {receiptFile ? "Photo attached" : "Attach a photo"}
          </Button>
          {receiptFile ? (
            <span style={{ marginLeft: "var(--space-10)", fontSize: "var(--text-label)", color: "var(--text-muted)" }}>
              {receiptFile.name}
            </span>
          ) : null}
        </div>
        {error ? <span style={{ fontSize: "var(--text-label)", color: "var(--text-negative)" }}>{error}</span> : null}
      </div>
    </Sheet>
  );
}
