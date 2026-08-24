"use client";

import { useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from "react";
import { Icon } from "./Icon";

const buttonSizeMap = {
  sm: { height: 34, pad: "0 12px", font: "var(--text-label)", radius: "var(--radius-xs)", icon: 15 },
  md: { height: 44, pad: "0 18px", font: "var(--text-body-md)", radius: "var(--radius-sm)", icon: 18 },
  lg: { height: 52, pad: "0 22px", font: "var(--text-body-lg)", radius: "var(--radius-md)", icon: 20 },
};

const buttonVariantMap = {
  primary: { bg: "var(--action-primary)", fg: "var(--white)", border: "transparent", hover: "var(--action-primary-hover)" },
  accent: { bg: "var(--action-accent)", fg: "var(--teal-900)", border: "transparent", hover: "var(--action-accent-hover)" },
  secondary: { bg: "var(--white)", fg: "var(--text-strong)", border: "var(--border-strong)", hover: "var(--sand-50)" },
  ghost: { bg: "transparent", fg: "var(--text-brand)", border: "transparent", hover: "var(--teal-50)" },
  danger: { bg: "var(--action-danger)", fg: "var(--white)", border: "transparent", hover: "var(--action-danger-hover)" },
};

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style"> {
  children?: ReactNode;
  variant?: keyof typeof buttonVariantMap;
  size?: keyof typeof buttonSizeMap;
  icon?: string;
  iconEnd?: string;
  full?: boolean;
  style?: CSSProperties;
}

export function Button({ children, variant = "primary", size = "md", icon, iconEnd, full, disabled, onClick, type = "button", style, ...rest }: ButtonProps) {
  const [hot, setHot] = useState(false);
  const [down, setDown] = useState(false);
  const s = buttonSizeMap[size] || buttonSizeMap.md;
  const v = buttonVariantMap[variant] || buttonVariantMap.primary;
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => {
        setHot(false);
        setDown(false);
      }}
      onMouseDown={() => setDown(true)}
      onMouseUp={() => setDown(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-8)",
        height: s.height,
        padding: s.pad,
        width: full ? "100%" : undefined,
        background: hot && !disabled ? v.hover : v.bg,
        color: v.fg,
        border: "var(--border-width) solid " + v.border,
        borderRadius: s.radius,
        fontFamily: "var(--font-ui)",
        fontSize: s.font,
        fontWeight: "var(--weight-semibold)",
        letterSpacing: size === "sm" ? "var(--track-label)" : "0",
        textTransform: size === "sm" ? "uppercase" : "none",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.42 : 1,
        transform: down && !disabled ? "scale(var(--press-scale))" : "scale(1)",
        transition: "background var(--dur-fast) var(--ease-standard), transform var(--dur-instant) var(--ease-standard)",
        ...style,
      }}
      {...rest}
    >
      {icon ? <Icon name={icon} size={s.icon} /> : null}
      {children}
      {iconEnd ? <Icon name={iconEnd} size={s.icon} /> : null}
    </button>
  );
}
