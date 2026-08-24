"use client";

import type { CSSProperties } from "react";
import { Icon } from "./Icon";

export interface TabItem {
  value: string;
  label: string;
  icon: string;
}

export interface TabBarProps {
  items?: TabItem[];
  value?: string;
  onChange?: (value: string) => void;
  style?: CSSProperties;
}

export function TabBar({ items = [], value, onChange, style }: TabBarProps) {
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "stretch",
        gap: 2,
        padding: "var(--space-6) var(--space-8) calc(var(--space-10) + var(--safe-bottom))",
        background: "rgba(255,255,255,.88)",
        backdropFilter: "var(--blur-sheet)",
        borderTop: "var(--border-width) solid var(--border-hairline)",
        ...style,
      }}
    >
      {items.map((it) => {
        const on = it.value === value;
        return (
          <button
            key={it.value}
            type="button"
            onClick={() => onChange && onChange(it.value)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              minHeight: "var(--tap-min)",
              padding: "var(--space-6) 0",
              background: "transparent",
              border: "none",
              color: on ? "var(--text-brand)" : "var(--text-faint)",
              cursor: "pointer",
              transition: "color var(--dur-fast) var(--ease-standard)",
            }}
          >
            <Icon name={it.icon} size={22} strokeWidth={on ? 2.1 : 1.6} />
            <span style={{ fontSize: "var(--text-micro)", fontWeight: on ? "var(--weight-semibold)" : "var(--weight-medium)", letterSpacing: ".02em" }}>
              {it.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
