"use client";

import { useRef, useState } from "react";
import { Amount, Badge, Button, IconButton, Input, Sheet, SplitBar } from "@/components/ds";
import { useLedger } from "@/lib/store";
import { daysInMonth, formatNumber, monthDate, shareLabel, todayISO } from "@/lib/format";
import { api, type Entry } from "@/lib/api";

function statusBadge(entry: Entry) {
  if (entry.kind === "EXPENSE") return <Badge tone="negative">Paid</Badge>;
  if (entry.status === "COLLECTED") return <Badge tone="positive" dot>Collected</Badge>;
  if (entry.status === "PARTIAL") return <Badge tone="accent" dot>Partly paid</Badge>;
  return <Badge tone="pending">Awaited</Badge>;
}

export function EntryEditSheet({ entry, open, onClose }: { entry: Entry; open: boolean; onClose: () => void }) {
  const { buildings, currency, locale, partyName, updateEntry, deleteEntry, reloadMonth } = useLedger();
  // Payments and the receipt mutate server-side and return the fresh entry;
  // track it locally so the sheet stays current while it is open.
  const [current, setCurrent] = useState<Entry>(entry);
  const building = buildings.find((b) => b.id === current.buildingId);
  const isRent = current.kind === "RENT";

  const [total, setTotal] = useState(String(entry.total));
  const [shareA, setShareA] = useState(String(entry.splitA));
  const [note, setNote] = useState(entry.note ?? "");
  const [date, setDate] = useState(monthDate(entry.month, entry.day));
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inline "add payment" row
  const outstanding = Math.max(0, current.total - current.received);
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(todayISO());
  const fileRef = useRef<HTMLInputElement>(null);

  const t = Number(total) || 0;
  const a = Math.min(Number(shareA) || 0, t);
  const newMonth = date.slice(0, 7) || current.month;
  const d = Math.min(Math.max(Number(date.slice(8, 10)) || current.day, 1), daysInMonth(newMonth));
  const nameA = partyName("a");
  const nameB = partyName("b");

  const run = async (work: () => Promise<Entry>) => {
    setBusy(true);
    setError(null);
    try {
      setCurrent(await work());
      await reloadMonth();
    } catch (e) {
      setError(e instanceof Error ? e.message : "That did not work");
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await updateEntry(current.id, {
        total: t,
        splitA: a,
        splitB: t - a,
        note: note || undefined,
        month: newMonth,
        day: d,
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
      await deleteEntry(current.id);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete the entry");
    } finally {
      setBusy(false);
    }
  };

  const addPayment = () => {
    const amount = Number(payAmount) || 0;
    if (amount <= 0) return;
    run(() => api.addPayment(current.id, { amount, date: payDate })).then(() => {
      setPayAmount("");
      setPayDate(todayISO());
    });
  };

  const onFilePicked = (file: File | undefined) => {
    if (!file) return;
    run(() => api.uploadReceipt(current.id, file));
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          {isRent ? "Edit rent" : "Edit expense"}
          {statusBadge(current)}
        </span>
      }
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
        <Input label={isRent ? "Rent due" : "Amount spent"} amount prefix={currency} value={total} onChange={setTotal} />
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

        {isRent ? (
          <div>
            <span className="k-label" style={{ display: "block", marginBottom: "var(--space-8)" }}>
              Payments · {currency}
              {formatNumber(current.received, locale)} of {currency}
              {formatNumber(current.total, locale)}
            </span>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {(current.payments ?? []).map((p, i, arr) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-10)",
                    padding: "var(--space-8) 0",
                    borderBottom: i < arr.length - 1 ? "var(--border-width) solid var(--rule-ledger)" : "none",
                  }}
                >
                  <Amount value={p.amount} currency={currency} size="md" tone="positive" locale={locale} />
                  <span style={{ flex: 1, fontSize: "var(--text-label)", color: "var(--text-muted)" }}>
                    {p.date}
                    {p.note ? ` · ${p.note}` : ""}
                  </span>
                  <IconButton icon="trash-2" label="Remove payment" size={32} disabled={busy} onClick={() => run(() => api.deletePayment(current.id, p.id))} />
                </div>
              ))}
              {(current.payments ?? []).length === 0 ? (
                <span style={{ fontSize: "var(--text-label)", color: "var(--text-muted)", padding: "var(--space-4) 0" }}>
                  Nothing received yet.
                </span>
              ) : null}
            </div>
            {outstanding > 0 ? (
              <div style={{ display: "flex", gap: "var(--space-8)", alignItems: "flex-end", marginTop: "var(--space-10)" }}>
                <Input label="Amount" amount prefix={currency} value={payAmount} onChange={setPayAmount} placeholder={String(outstanding)} style={{ flex: 1, minWidth: 0 }} />
                <Input label="On" type="date" value={payDate} onChange={setPayDate} style={{ flex: 1, minWidth: 0 }} />
                <Button variant="secondary" size="md" icon="plus" disabled={busy || (Number(payAmount) || 0) <= 0} onClick={addPayment}>
                  Add
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}

        <div>
          <span className="k-label" style={{ display: "block", marginBottom: "var(--space-8)" }}>Receipt</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              onFilePicked(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          {current.receiptPath ? (
            <div style={{ display: "flex", gap: "var(--space-12)", alignItems: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={api.receiptUrl(current.id)}
                alt="Receipt"
                onClick={() => window.open(api.receiptUrl(current.id), "_blank")}
                style={{ width: 72, height: 72, objectFit: "cover", borderRadius: "var(--radius-sm)", border: "var(--border-width) solid var(--border-hairline)", cursor: "pointer" }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
                <Button variant="secondary" size="sm" icon="pencil" disabled={busy} onClick={() => fileRef.current?.click()}>
                  Replace
                </Button>
                <Button variant="ghost" size="sm" icon="trash-2" disabled={busy} onClick={() => run(() => api.deleteReceipt(current.id))}>
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="secondary" size="md" icon="receipt-indian-rupee" disabled={busy} onClick={() => fileRef.current?.click()}>
              Attach a photo
            </Button>
          )}
        </div>

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
