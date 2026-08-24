"use client";

import { useState, type CSSProperties, type HTMLInputTypeAttribute, type ReactNode } from "react";

export interface InputProps {
  label?: string;
  hint?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  type?: HTMLInputTypeAttribute;
  amount?: boolean;
  error?: string;
  disabled?: boolean;
  inputMode?: "numeric" | "text" | "decimal" | "tel" | "search" | "email" | "url";
  style?: CSSProperties;
}

export function Input({ label, hint, value, onChange, placeholder, prefix, suffix, type = "text", amount, error, disabled, inputMode, style }: InputProps) {
  const [focus, setFocus] = useState(false);
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
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-8)",
          height: amount ? 56 : 48,
          padding: "0 var(--space-14, 14px)",
          background: disabled ? "var(--sand-100)" : "var(--white)",
          border:
            "var(--border-width-strong) solid " +
            (error ? "var(--action-danger)" : focus ? "var(--border-brand)" : "var(--border-hairline)"),
          borderRadius: "var(--radius-sm)",
          boxShadow: focus ? "var(--ring-focus)" : "none",
          transition: "border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)",
        }}
      >
        {prefix ? <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--amount-md)", color: "var(--text-muted)" }}>{prefix}</span> : null}
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          inputMode={inputMode || (amount ? "numeric" : undefined)}
          onChange={(e) => onChange && onChange(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            outline: "none",
            background: "transparent",
            fontFamily: amount ? "var(--font-mono)" : "var(--font-ui)",
            fontVariantNumeric: amount ? "tabular-nums" : "normal",
            fontSize: amount ? "var(--amount-lg)" : "var(--text-body-lg)",
            fontWeight: amount ? "var(--weight-medium)" : "var(--weight-regular)",
            color: "var(--text-strong)",
          }}
        />
        {suffix ? <span style={{ fontSize: "var(--text-label)", color: "var(--text-faint)" }}>{suffix}</span> : null}
      </span>
      {hint || error ? (
        <span style={{ display: "block", marginTop: "var(--space-6)", fontSize: "var(--text-label)", color: error ? "var(--text-negative)" : "var(--text-muted)" }}>
          {error || hint}
        </span>
      ) : null}
    </label>
  );
}
