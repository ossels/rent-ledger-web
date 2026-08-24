"use client";

import type { CSSProperties, ReactNode } from "react";
import { IconButton } from "./IconButton";

export interface MonthNavProps {
  label: ReactNode;
  sublabel?: ReactNode;
  onPrev?: () => void;
  onNext?: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  tone?: "ink" | "paper";
  onLabelClick?: () => void;
  style?: CSSProperties;
}

/** Month stepper — the primary time control in RentLedger. */
export function MonthNav({ label, sublabel, onPrev, onNext, prevDisabled, nextDisabled, tone = "paper", onLabelClick, style }: MonthNavProps) {
  const inverse = tone === "ink";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-8)",
        padding: "var(--space-6)",
        borderRadius: "var(--radius-sm)",
        background: inverse ? "rgba(250,247,241,.10)" : "var(--surface-card)",
        border: "var(--border-width) solid " + (inverse ? "rgba(250,247,241,.14)" : "var(--border-hairline)"),
        ...style,
      }}
    >
      <IconButton icon="chevron-left" label="Previous month" size={36} variant={inverse ? "inverse" : "quiet"} onClick={onPrev} disabled={prevDisabled} />
      <button
        type="button"
        onClick={onLabelClick}
        style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", cursor: onLabelClick ? "pointer" : "default", textAlign: "center", padding: 0 }}
      >
        <span
          style={{
            display: "block",
            fontFamily: "var(--font-display)",
            fontWeight: "var(--weight-display)",
            fontSize: "var(--text-heading)",
            color: inverse ? "var(--text-on-inverse)" : "var(--text-strong)",
          }}
        >
          {label}
        </span>
        {sublabel ? (
          <span
            style={{
              display: "block",
              fontSize: "var(--text-micro)",
              letterSpacing: "var(--track-label)",
              textTransform: "uppercase",
              color: inverse ? "rgba(250,247,241,.66)" : "var(--text-muted)",
            }}
          >
            {sublabel}
          </span>
        ) : null}
      </button>
      <IconButton icon="chevron-right" label="Next month" size={36} variant={inverse ? "inverse" : "quiet"} onClick={onNext} disabled={nextDisabled} />
    </div>
  );
}
