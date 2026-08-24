"use client";

import type { CSSProperties } from "react";
import { Icon } from "./Icon";

export type SelectOption = string | { value: string; label: string };

export interface SelectProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  options?: SelectOption[];
  hint?: string;
  disabled?: boolean;
  style?: CSSProperties;
}

export function Select({ label, value, onChange, options = [], hint, disabled, style }: SelectProps) {
  return (
    <label style={{ display: "block", ...style }}>
      {label ? (
        <span
          style={{
            display: "block",
            marginBottom: "var(--space-6)",
            fontSize: "var(--text-label)",
            fontWeight: "var(--weight-semibold)",
            letterSpacing: "var(--track-label)",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          {label}
        </span>
      ) : null}
      <span style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange && onChange(e.target.value)}
          style={{
            appearance: "none",
            width: "100%",
            height: 48,
            padding: "0 40px 0 14px",
            background: disabled ? "var(--sand-100)" : "var(--white)",
            border: "var(--border-width-strong) solid var(--border-hairline)",
            borderRadius: "var(--radius-sm)",
            fontFamily: "var(--font-ui)",
            fontSize: "var(--text-body-lg)",
            color: "var(--text-strong)",
            cursor: "pointer",
          }}
        >
          {options.map((o) => {
            const opt = typeof o === "string" ? { value: o, label: o } : o;
            return (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            );
          })}
        </select>
        <Icon name="chevron-down" size={18} style={{ position: "absolute", right: 12, color: "var(--text-muted)", pointerEvents: "none" }} />
      </span>
      {hint ? <span style={{ display: "block", marginTop: "var(--space-6)", fontSize: "var(--text-label)", color: "var(--text-muted)" }}>{hint}</span> : null}
    </label>
  );
}
