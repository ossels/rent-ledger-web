"use client";

import type { CSSProperties, ReactNode } from "react";
import { IconButton } from "./IconButton";

export interface SheetProps {
  open?: boolean;
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
  style?: CSSProperties;
}

export function Sheet({ open, title, children, footer, onClose, style }: SheetProps) {
  if (!open) return null;
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 40, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "var(--scrim)", backdropFilter: "blur(2px)" }} />
      <div
        style={{
          position: "relative",
          background: "var(--surface-card)",
          borderTopLeftRadius: "var(--radius-xl)",
          borderTopRightRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-sheet)",
          maxHeight: "92%",
          display: "flex",
          flexDirection: "column",
          ...style,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-8)", padding: "var(--space-16) var(--space-16) var(--space-8)" }}>
          <span style={{ flex: 1, fontFamily: "var(--font-display)", fontWeight: "var(--weight-display)", fontSize: "var(--text-title)", color: "var(--text-strong)" }}>
            {title}
          </span>
          <IconButton icon="x" label="Close" size={36} onClick={onClose} />
        </div>
        <div style={{ padding: "0 var(--space-16) var(--space-16)", overflowY: "auto" }}>{children}</div>
        {footer ? (
          <div
            style={{
              display: "flex",
              gap: "var(--space-10)",
              padding: "var(--space-12) var(--space-16) var(--space-20)",
              borderTop: "var(--border-width) solid var(--border-hairline)",
              background: "var(--surface-card)",
            }}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
