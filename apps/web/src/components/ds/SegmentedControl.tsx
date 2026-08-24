"use client";

import type { CSSProperties } from "react";

export type SegmentOption = string | { value: string; label: string };

export interface SegmentedControlProps {
  value?: string;
  options?: SegmentOption[];
  onChange?: (value: string) => void;
  size?: "sm" | "md";
  full?: boolean;
  style?: CSSProperties;
}

export function SegmentedControl({ value, options = [], onChange, size = "md", full, style }: SegmentedControlProps) {
  const h = size === "sm" ? 34 : 40;
  return (
    <div
      style={{
        display: "inline-flex",
        padding: 3,
        gap: 2,
        background: "var(--sand-100)",
        border: "var(--border-width) solid var(--border-hairline)",
        borderRadius: "var(--radius-sm)",
        width: full ? "100%" : undefined,
        ...style,
      }}
    >
      {options.map((o) => {
        const opt = typeof o === "string" ? { value: o, label: o } : o;
        const on = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange && onChange(opt.value)}
            style={{
              flex: full ? 1 : undefined,
              height: h,
              padding: "0 14px",
              background: on ? "var(--white)" : "transparent",
              color: on ? "var(--text-strong)" : "var(--text-muted)",
              border: "none",
              borderRadius: "var(--radius-xs)",
              boxShadow: on ? "0 1px 2px rgba(25,23,18,.10)" : "none",
              fontFamily: "var(--font-ui)",
              fontSize: "var(--text-body-md)",
              fontWeight: on ? "var(--weight-semibold)" : "var(--weight-medium)",
              cursor: "pointer",
              transition: "background var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard)",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
