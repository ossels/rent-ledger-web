"use client";

import { useState } from "react";
import { Button, Input, SegmentedControl, Sheet, SplitBar } from "@/components/ds";
import { useLedger } from "@/lib/store";
import { daysInMonth, formatNumber, monthDate, shareLabel } from "@/lib/format";
import type { Entry, EntryStatus } from "@/lib/api";

export function EntryEditSheet({ entry, open, onClose }: { entry: Entry; open: boolean; onClose: () => void }) {
  const { buildings, currency, locale, partyName, updateEntry, deleteEntry } = useLedger();
  const building = buildings.find((b) => b.id === entry.buildingId);
  const isRent = entry.kind === "RENT";

  const [total, setTotal] = useState(String(entry.total));
  const [shareA, setShareA] = useState(String(entry.splitA));
  const [note, setNote] = useState(entry.note ?? "");
  const [date, setDate] = useState(monthDate(entry.month, entry.day));
  const [status, setStatus] = useState<EntryStatus>(entry.status);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = Number(total) || 0;
  const a = Math.min(Number(shareA) || 0, t);
  // The picked date decides both the day and the ledger month the entry lives in.
  const newMonth = date.slice(0, 7) || entry.month;
  const d = Math.min(Math.max(Number(date.slice(8, 10)) || entry.day, 1), daysInMonth(newMonth));
  const nameA = partyName("a");
  const nameB = partyName("b");

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await updateEntry(entry.id, {
        total: t,
        splitA: a,
        splitB: t - a,
        note: note || undefined,
        month: newMonth,
        day: d,
        status: isRent ? status : "PAID",
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the entry");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setError(null);
    try {
      await deleteEntry(entry.id);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete the entry");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={isRent ? "Edit rent" : "Edit expense"}
      footer={
        <Button size="lg" variant="accent" full icon="check" disabled={busy || t <= 0} onClick={save}>
          Save changes
        </Button>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-14, 14px)" }}>
        {building ? (
          <span style={{ fontSize: "var(--text-label)", color: "var(--text-muted)" }}>
            {building.name} — {building.unit}
          </span>
        ) : null}
        <Input label={isRent ? "Amount received" : "Amount spent"} amount prefix={currency} value={total} onChange={setTotal} />
        {isRent ? (
          <div>
            <span className="k-label" style={{ display: "block", marginBottom: "var(--space-6)" }}>Status</span>
            <SegmentedControl
              full
              value={status === "COLLECTED" ? "COLLECTED" : "AWAITED"}
              onChange={(v) => setStatus(v as EntryStatus)}
              options={[
                { value: "COLLECTED", label: "Collected" },
                { value: "AWAITED", label: "Awaited" },
              ]}
            />
          </div>
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
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={setDate}
          hint="Picking a date in another month moves the entry to that month’s ledger."
        />
        <Input label="Note" value={note} onChange={setNote} placeholder={isRent ? "Paid by UPI" : "Plumbing, 2F bathroom"} />

        {confirmDelete ? (
          <div style={{ display: "flex", gap: "var(--space-10)", alignItems: "center" }}>
            <Button variant="danger" size="md" icon="trash-2" disabled={busy} onClick={remove} style={{ flex: 1 }}>
              Delete for good
            </Button>
            <Button variant="secondary" size="md" onClick={() => setConfirmDelete(false)} style={{ flex: 1 }}>
              Keep it
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="md" icon="trash-2" onClick={() => setConfirmDelete(true)}>
            Delete this entry
          </Button>
        )}

        {error ? <span style={{ fontSize: "var(--text-label)", color: "var(--text-negative)" }}>{error}</span> : null}
      </div>
    </Sheet>
  );
}
