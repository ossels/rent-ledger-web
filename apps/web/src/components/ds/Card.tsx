"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

export interface CardProps {
  children?: ReactNode;
  tone?: "paper" | "sunken" | "ink" | "accent";
  pad?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
  style?: CSSProperties;
}

export function Card({ children, tone = "paper", pad = "md", onClick, style }: CardProps) {
  const [hot, setHot] = useState(false);
  const tones = {
    paper: { bg: "var(--surface-card)", border: "var(--border-hairline)", color: "var(--text-body)" },
    sunken: { bg: "var(--surface-sunken)", border: "transparent", color: "var(--text-body)" },
    ink: { bg: "var(--surface-inverse)", border: "transparent", color: "var(--text-on-inverse)" },
    accent: { bg: "var(--surface-accent-soft)", border: "var(--marigold-100)", color: "var(--text-body)" },
  }[tone];
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
      style={{
        background: tones.bg,
        color: tones.color,
        border: "var(--border-width) solid " + tones.border,
        borderRadius: "var(--radius-md)",
        padding: pad === "none" ? 0 : pad === "lg" ? "var(--card-pad-lg)" : pad === "sm" ? "var(--space-12)" : "var(--card-pad)",
        boxShadow: tone === "sunken" ? "none" : hot && onClick ? "var(--shadow-raised)" : "var(--shadow-card)",
        cursor: onClick ? "pointer" : "default",
        transition: "box-shadow var(--dur-base) var(--ease-standard)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
