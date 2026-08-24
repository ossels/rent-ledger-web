"use client";

import { useState } from "react";
import { Button, Input, Sheet } from "@/components/ds";
import { useLedger } from "@/lib/store";
import type { Party } from "@/lib/api";

export function PersonSheet({ party, open, onClose }: { party: Party; open: boolean; onClose: () => void }) {
  const { updateParty } = useLedger();
  const [name, setName] = useState(party.name);
  const [note, setNote] = useState(party.note ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await updateParty(party.key, { name: name.trim(), note: note.trim() });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Edit person"
      footer={
        <Button size="lg" variant="accent" full icon="check" disabled={!name.trim() || busy} onClick={save}>
          Save
        </Button>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-14, 14px)" }}>
        <Input label="Name" value={name} onChange={setName} />
        <Input label="Note" value={note} onChange={setNote} placeholder="You / Wife" hint="Shown under their name in Settings." />
        <span style={{ fontSize: "var(--text-label)", color: "var(--text-muted)" }}>
          Their colour in bars and dots stays the same — the name changes everywhere.
        </span>
        {error ? <span style={{ fontSize: "var(--text-label)", color: "var(--text-negative)" }}>{error}</span> : null}
      </div>
    </Sheet>
  );
}
