"use client";

import { Button, EmptyState } from "@/components/ds";
import { useLedger } from "@/lib/store";
import type { ReactNode } from "react";

/** Wraps a screen: shows a quiet loading / error state until the ledger is ready. */
export function ScreenState({ children }: { children: ReactNode }) {
  const { loading, error, retry } = useLedger();
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 320, color: "var(--text-muted)" }}>
        Opening the ledger…
      </div>
    );
  }
  if (error) {
    return (
      <div style={{ paddingTop: "var(--space-48)" }}>
        <EmptyState icon="notebook-pen" title="The ledger is unreachable" body={error} />
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button variant="secondary" onClick={retry}>Try again</Button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
