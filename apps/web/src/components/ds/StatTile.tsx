"use client";

import type { CSSProperties } from "react";
import { Amount } from "./Amount";
import { Icon } from "./Icon";

export interface StatTileProps {
  label: string;
  value: number;
  currency?: string;
  tone?: "neutral" | "positive" | "negative" | "muted" | "inverse";
  icon?: string;
  delta?: string;
  style?: CSSProperties;
}

export function StatTile({ label, value, currency = "₹", tone = "neutral", icon, delta, style }: StatTileProps) {
  const inverse = tone === "inverse";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-6)",
        padding: "var(--space-14, 14px)",
        background: inverse ? "rgba(250,247,241,.10)" : "var(--surface-card)",
        border: "var(--border-width) solid " + (inverse ? "rgba(250,247,241,.16)" : "var(--border-hairline)"),
        borderRadius: "var(--radius-sm)",
        minWidth: 0,
        ...style,
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: "var(--text-micro)",
          fontWeight: "var(--weight-semibold)",
          letterSpacing: "var(--track-label)",
          textTransform: "uppercase",
          color: inverse ? "rgba(250,247,241,.70)" : "var(--text-muted)",
        }}
      >
        {icon ? <Icon name={icon} size={13} /> : null}
        {label}
      </span>
      <Amount value={value} currency={currency} size="lg" tone={inverse ? "inverse" : tone} />
      {delta ? <span style={{ fontSize: "var(--text-label)", color: inverse ? "rgba(250,247,241,.66)" : "var(--text-muted)" }}>{delta}</span> : null}
    </div>
  );
}
