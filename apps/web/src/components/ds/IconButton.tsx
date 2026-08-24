"use client";

import { useState, type ButtonHTMLAttributes, type CSSProperties } from "react";
import { Icon } from "./Icon";

const skins = {
  quiet: { bg: "transparent", fg: "var(--text-body)", hover: "var(--sand-100)", border: "transparent" },
  outline: { bg: "var(--white)", fg: "var(--text-strong)", hover: "var(--sand-50)", border: "var(--border-hairline)" },
  solid: { bg: "var(--action-primary)", fg: "var(--white)", hover: "var(--action-primary-hover)", border: "transparent" },
  inverse: { bg: "rgba(250,247,241,.12)", fg: "var(--text-on-inverse)", hover: "rgba(250,247,241,.22)", border: "transparent" },
};

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style"> {
  icon: string;
  label: string;
  size?: number;
  variant?: keyof typeof skins;
  style?: CSSProperties;
}

export function IconButton({ icon, label, size = 44, variant = "quiet", onClick, disabled, style, ...rest }: IconButtonProps) {
  const [hot, setHot] = useState(false);
  const skin = skins[variant];
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
      style={{
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: hot && !disabled ? skin.hover : skin.bg,
        color: skin.fg,
        border: "var(--border-width) solid " + skin.border,
        borderRadius: "var(--radius-sm)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "background var(--dur-fast) var(--ease-standard)",
        ...style,
      }}
      {...rest}
    >
      <Icon name={icon} size={Math.round(size * 0.45)} />
    </button>
  );
}
