"use client";

import type { CSSProperties, ReactNode } from "react";

const badgeToneMap: Record<string, { bg: string; fg: string; bd: string }> = {
  neutral: { bg: "var(--sand-100)", fg: "var(--text-body)", bd: "var(--sand-200)" },
  positive: { bg: "var(--surface-positive-soft)", fg: "var(--leaf-700)", bd: "var(--leaf-100)" },
  negative: { bg: "var(--surface-negative-soft)", fg: "var(--terracotta-700)", bd: "var(--terracotta-100)" },
  accent: { bg: "var(--marigold-50)", fg: "var(--marigold-600)", bd: "var(--marigold-100)" },
  brand: { bg: "var(--teal-50)", fg: "var(--teal-700)", bd: "var(--teal-100)" },
  pending: { bg: "var(--white)", fg: "var(--text-muted)", bd: "var(--border-strong)" },
};

export interface BadgeProps {
  children?: ReactNode;
  tone?: keyof typeof badgeToneMap;
  dot?: boolean;
  style?: CSSProperties;
}

export function Badge({ children, tone = "neutral", dot, style }: BadgeProps) {
  const t = badgeToneMap[tone] || badgeToneMap.neutral;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: 22,
        padding: "0 9px",
        background: t.bg,
        color: t.fg,
        border: "var(--border-width) solid " + t.bd,
        borderRadius: "var(--radius-pill)",
        fontSize: "var(--text-micro)",
        fontWeight: "var(--weight-semibold)",
        letterSpacing: "var(--track-label)",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {dot ? <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} /> : null}
      {children}
    </span>
  );
}
