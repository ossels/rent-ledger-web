"use client";

import type { CSSProperties } from "react";

const amountSizeMap: Record<string, string> = {
  hero: "var(--amount-hero)",
  lg: "var(--amount-lg)",
  md: "var(--amount-md)",
  sm: "var(--amount-sm)",
};
const amountToneMap: Record<string, string> = {
  neutral: "var(--text-strong)",
  positive: "var(--text-positive)",
  negative: "var(--text-negative)",
  muted: "var(--text-muted)",
  inverse: "var(--text-on-inverse)",
};

export interface AmountProps {
  value?: number;
  currency?: string;
  size?: "hero" | "lg" | "md" | "sm";
  tone?: "neutral" | "positive" | "negative" | "muted" | "inverse";
  sign?: "always";
  locale?: string;
  weight?: string;
  style?: CSSProperties;
}

/** Formats money with Indian digit grouping (1,20,000) by default. */
export function Amount({ value = 0, currency = "₹", size = "md", tone = "neutral", sign, locale = "en-IN", weight, style }: AmountProps) {
  const n = Number(value) || 0;
  const body = Math.abs(n).toLocaleString(locale, { maximumFractionDigits: 0 });
  const mark = sign === "always" ? (n < 0 ? "−" : "+") : n < 0 ? "−" : "";
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontVariantNumeric: "tabular-nums",
        fontSize: amountSizeMap[size] || amountSizeMap.md,
        fontWeight: weight || "var(--weight-medium)",
        letterSpacing: size === "hero" ? "-0.02em" : "0",
        color: amountToneMap[tone] || amountToneMap.neutral,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {mark}
      {currency}
      {body}
    </span>
  );
}
