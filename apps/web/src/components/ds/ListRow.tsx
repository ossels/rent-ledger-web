"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { Icon } from "./Icon";
import { Amount, type AmountProps } from "./Amount";

export interface ListRowProps {
  title: ReactNode;
  subtitle?: ReactNode;
  amount?: number | null;
  currency?: string;
  amountTone?: AmountProps["tone"];
  meta?: ReactNode;
  leading?: ReactNode;
  leadingIcon?: string;
  trailing?: ReactNode;
  chevron?: boolean;
  onClick?: () => void;
  ledger?: boolean;
  style?: CSSProperties;
}

export function ListRow({ title, subtitle, amount, currency = "₹", amountTone = "neutral", meta, leading, leadingIcon, trailing, chevron, onClick, ledger, style }: ListRowProps) {
  const [hot, setHot] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-12)",
        minHeight: "var(--row-min-height)",
        padding: "var(--space-12) var(--space-4)",
        borderBottom: ledger ? "var(--border-width) solid var(--rule-ledger)" : "none",
        background: hot && onClick ? "var(--sand-50)" : "transparent",
        cursor: onClick ? "pointer" : "default",
        transition: "background var(--dur-fast) var(--ease-standard)",
        ...style,
      }}
    >
      {leading ? (
        leading
      ) : leadingIcon ? (
        <span
          style={{
            width: 38,
            height: 38,
            flex: "0 0 auto",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "var(--radius-sm)",
            background: "var(--teal-50)",
            color: "var(--teal-600)",
          }}
        >
          <Icon name={leadingIcon} size={19} />
        </span>
      ) : null}
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontSize: "var(--text-body-lg)",
            fontWeight: "var(--weight-medium)",
            color: "var(--text-strong)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </span>
        {subtitle ? <span style={{ display: "block", fontSize: "var(--text-label)", color: "var(--text-muted)" }}>{subtitle}</span> : null}
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: "var(--space-10)", flex: "0 0 auto" }}>
        <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
          {amount !== undefined && amount !== null ? <Amount value={amount} currency={currency} tone={amountTone} size="md" /> : null}
          {meta ? (
            <span style={{ fontSize: "var(--text-micro)", color: "var(--text-faint)", letterSpacing: "var(--track-label)", textTransform: "uppercase" }}>
              {meta}
            </span>
          ) : null}
        </span>
        {trailing}
        {chevron ? <Icon name="chevron-right" size={18} style={{ color: "var(--text-faint)" }} /> : null}
      </span>
    </div>
  );
}
