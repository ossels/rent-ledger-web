"use client";

import { useState } from "react";
import { Button, Card, Input } from "@/components/ds";
import { useLedger } from "@/lib/store";

export function AuthScreen() {
  const { setupRequired, login, setupAccount } = useLedger();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      if (setupRequired) await setupAccount(name.trim(), email.trim(), password);
      else await login(email.trim(), password);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  };

  const ready = setupRequired ? name.trim() && email.trim() && password.length >= 8 : email.trim() && password;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ background: "var(--surface-inverse)", padding: "var(--space-40) var(--space-20) var(--space-32)", textAlign: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-mark-inverse.svg" width="56" height="56" alt="" />
        <div
          style={{
            marginTop: 10,
            fontFamily: "var(--font-display)",
            fontWeight: "var(--weight-display)",
            letterSpacing: "-0.02em",
            fontSize: "var(--text-display-2)",
            color: "var(--paper)",
          }}
        >
          RentLedger
        </div>
        <div style={{ marginTop: 4, fontSize: "var(--text-body-md)", color: "rgba(250,247,241,.68)" }}>
          {setupRequired ? "Set up the ledger for your family" : "Your buildings, month by month"}
        </div>
      </div>

      <div style={{ flex: 1, padding: "var(--space-20) var(--space-16)" }}>
        <Card pad="lg">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (ready && !busy) submit();
            }}
            style={{ display: "flex", flexDirection: "column", gap: "var(--space-14, 14px)" }}
          >
            {setupRequired ? <Input label="Your name" value={name} onChange={setName} placeholder="Ravi" /> : null}
            <Input label="Email" type="email" inputMode="email" value={email} onChange={setEmail} placeholder="you@example.com" />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              hint={setupRequired ? "At least 8 characters" : undefined}
              error={error ?? undefined}
            />
            <Button size="lg" full type="submit" disabled={!ready || busy}>
              {setupRequired ? "Create your ledger" : "Open the ledger"}
            </Button>
          </form>
        </Card>
        <div
          style={{
            marginTop: "var(--space-16)",
            textAlign: "center",
            fontSize: "var(--text-micro)",
            color: "var(--text-faint)",
            letterSpacing: "var(--track-label)",
            textTransform: "uppercase",
          }}
        >
          Nothing is ever overwritten
        </div>
      </div>
    </div>
  );
}
