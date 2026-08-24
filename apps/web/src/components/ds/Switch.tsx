"use client";

import type { CSSProperties } from "react";

export interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  style?: CSSProperties;
}

export function Switch({ checked, onChange, label, description, disabled, style }: SwitchProps) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-12)",
        minHeight: "var(--tap-min)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      <span style={{ flex: 1 }}>
        {label ? (
          <span style={{ display: "block", fontSize: "var(--text-body-md)", fontWeight: "var(--weight-medium)", color: "var(--text-strong)" }}>{label}</span>
        ) : null}
        {description ? <span style={{ display: "block", fontSize: "var(--text-label)", color: "var(--text-muted)" }}>{description}</span> : null}
      </span>
      <span
        onClick={() => !disabled && onChange && onChange(!checked)}
        style={{
          width: 48,
          height: 28,
          flex: "0 0 auto",
          borderRadius: "var(--radius-pill)",
          padding: 3,
          background: checked ? "var(--action-primary)" : "var(--sand-300)",
          transition: "background var(--dur-base) var(--ease-standard)",
        }}
      >
        <span
          style={{
            display: "block",
            width: 22,
            height: 22,
            borderRadius: "var(--radius-pill)",
            background: "var(--white)",
            boxShadow: "0 1px 2px rgba(25,23,18,.28)",
            transform: "translateX(" + (checked ? 20 : 0) + "px)",
            transition: "transform var(--dur-base) var(--ease-settle)",
          }}
        />
      </span>
    </label>
  );
}
