"use client";

import type { CSSProperties } from "react";
import { Amount } from "./Amount";

export interface SplitPart {
  label: string;
  value: number;
  party?: "a" | "b" | "shared";
  color?: string;
}

export interface SplitBarProps {
  parts?: SplitPart[];
  currency?: string;
  showLegend?: boolean;
  height?: number;
  style?: CSSProperties;
}

/** Horizontal bar showing how one amount divides between owners. */
export function SplitBar({ parts = [], currency = "₹", showLegend = true, height = 10, style }: SplitBarProps) {
  const total = parts.reduce((s, p) => s + (Number(p.value) || 0), 0) || 1;
  const colorFor = (p: SplitPart) =>
    p.color || (p.party === "b" ? "var(--party-b)" : p.party === "shared" ? "var(--party-shared)" : "var(--party-a)");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)", color: "var(--text-muted)", ...style }}>
      <div style={{ display: "flex", height, borderRadius: "var(--radius-pill)", overflow: "hidden", background: "var(--sand-200)" }}>
        {parts.map((p, i) => (
          <div
            key={i}
            title={p.label}
            style={{ width: ((Number(p.value) || 0) / total) * 100 + "%", background: colorFor(p), transition: "width var(--dur-base) var(--ease-standard)" }}
          />
        ))}
      </div>
      {showLegend ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-16)" }}>
          {parts.map((p, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--text-label)", color: "var(--text-muted)" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: colorFor(p) }} />
              {p.label}
              <Amount value={p.value} currency={currency} size="sm" tone="neutral" style={{ color: "inherit" }} />
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
