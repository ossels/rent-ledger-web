"use client";

import type { CSSProperties } from "react";
import { Icon } from "./Icon";

export interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  style?: CSSProperties;
}

export function Checkbox({ checked, onChange, label, disabled, style }: CheckboxProps) {
  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-10)",
        minHeight: "var(--tap-min)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      <span
        onClick={() => !disabled && onChange && onChange(!checked)}
        style={{
          width: 22,
          height: 22,
          flex: "0 0 auto",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "var(--radius-xs)",
          background: checked ? "var(--leaf-500)" : "var(--white)",
          border: "var(--border-width-strong) solid " + (checked ? "var(--leaf-500)" : "var(--border-strong)"),
          color: "var(--white)",
          transition: "background var(--dur-fast) var(--ease-standard)",
        }}
      >
        {checked ? <Icon name="check" size={15} strokeWidth={2.6} /> : null}
      </span>
      {label ? <span style={{ fontSize: "var(--text-body-md)", color: "var(--text-strong)" }}>{label}</span> : null}
    </label>
  );
}
