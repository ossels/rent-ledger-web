"use client";

import { useState } from "react";
import { Button, Input, Sheet } from "@/components/ds";
import { api } from "@/lib/api";

export function LoginSheet({ open, onClose, onAdded }: { open: boolean; onClose: () => void; onAdded: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = name.trim() && email.trim() && password.length >= 8;

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.addAuthUser(name.trim(), email.trim(), password);
      onAdded();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add the login");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Add a login"
      footer={
        <Button size="lg" variant="accent" full icon="check" disabled={!ready || busy} onClick={save}>
          Add login
        </Button>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-14, 14px)" }}>
        <span style={{ fontSize: "var(--text-body-md)", color: "var(--text-muted)" }}>
          They sign in with their own email and password and see the same ledger.
        </span>
        <Input label="Name" value={name} onChange={setName} placeholder="Meera" />
        <Input label="Email" type="email" inputMode="email" value={email} onChange={setEmail} placeholder="meera@example.com" />
        <Input label="Password" type="password" value={password} onChange={setPassword} hint="At least 8 characters" error={error ?? undefined} />
      </div>
    </Sheet>
  );
}
