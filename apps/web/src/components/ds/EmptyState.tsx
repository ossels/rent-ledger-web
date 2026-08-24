"use client";

import type { CSSProperties } from "react";
import { Icon } from "./Icon";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon?: string;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: CSSProperties;
}

export function EmptyState({ icon = "notebook-pen", title, body, actionLabel, onAction, style }: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: "var(--space-10)",
        padding: "var(--space-32) var(--space-20)",
        ...style,
      }}
    >
      <span
        style={{
          width: 52,
          height: 52,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "var(--radius-md)",
          background: "var(--sand-100)",
          color: "var(--stone-500)",
        }}
      >
        <Icon name={icon} size={24} />
      </span>
      <span style={{ fontFamily: "var(--font-display)", fontWeight: "var(--weight-display)", fontSize: "var(--text-title)", color: "var(--text-strong)" }}>
        {title}
      </span>
      {body ? <span style={{ maxWidth: 300, fontSize: "var(--text-body-md)", color: "var(--text-muted)", textWrap: "pretty" }}>{body}</span> : null}
      {actionLabel ? (
        <Button variant="secondary" size="md" icon="plus" onClick={onAction} style={{ marginTop: "var(--space-4)" }}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
