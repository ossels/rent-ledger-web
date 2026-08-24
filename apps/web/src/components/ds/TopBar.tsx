"use client";

import type { CSSProperties, ReactNode } from "react";
import { IconButton } from "./IconButton";

export interface TopBarProps {
  title: ReactNode;
  subtitle?: ReactNode;
  back?: boolean;
  onBack?: () => void;
  actions?: ReactNode;
  tone?: "ink" | "paper";
  style?: CSSProperties;
}

export function TopBar({ title, subtitle, back, onBack, actions, tone = "ink", style }: TopBarProps) {
  const inverse = tone === "ink";
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-8)",
        padding: "var(--space-12) var(--space-12)",
        background: inverse ? "var(--surface-inverse)" : "var(--surface-card)",
        color: inverse ? "var(--text-on-inverse)" : "var(--text-strong)",
        borderBottom: inverse ? "none" : "var(--border-width) solid var(--border-hairline)",
        ...style,
      }}
    >
      {back ? <IconButton icon="chevron-left" label="Back" size={38} variant={inverse ? "inverse" : "quiet"} onClick={onBack} /> : null}
      <span style={{ flex: 1, minWidth: 0, paddingLeft: back ? 0 : "var(--space-4)" }}>
        <span
          style={{
            display: "block",
            fontFamily: "var(--font-display)",
            fontWeight: "var(--weight-display)",
            fontSize: "var(--text-title)",
            letterSpacing: "-0.01em",
            lineHeight: "var(--leading-tight)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </span>
        {subtitle ? (
          <span style={{ display: "block", marginTop: 2, fontSize: "var(--text-label)", color: inverse ? "rgba(250,247,241,.68)" : "var(--text-muted)" }}>
            {subtitle}
          </span>
        ) : null}
      </span>
      <span style={{ display: "flex", gap: "var(--space-4)", flex: "0 0 auto" }}>{actions}</span>
    </header>
  );
}
