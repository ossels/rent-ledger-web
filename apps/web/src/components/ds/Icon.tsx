"use client";

import type { CSSProperties } from "react";
import {
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  EllipsisVertical,
  Filter,
  History,
  IndianRupee,
  Landmark,
  type LucideIcon,
  NotebookPen,
  Pencil,
  Plus,
  ReceiptIndianRupee,
  Settings,
  Share2,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  Wrench,
  X,
} from "lucide-react";

// The design system's working set (Lucide, stroke 1.75), keyed by its kebab names.
const ICONS: Record<string, LucideIcon> = {
  "building-2": Building2,
  "indian-rupee": IndianRupee,
  "receipt-indian-rupee": ReceiptIndianRupee,
  wrench: Wrench,
  users: Users,
  "user-plus": UserPlus,
  "calendar-days": CalendarDays,
  history: History,
  settings: Settings,
  plus: Plus,
  check: Check,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "chevron-down": ChevronDown,
  x: X,
  pencil: Pencil,
  filter: Filter,
  "share-2": Share2,
  download: Download,
  "shield-check": ShieldCheck,
  "notebook-pen": NotebookPen,
  landmark: Landmark,
  "trash-2": Trash2,
  "ellipsis-vertical": EllipsisVertical,
};

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: CSSProperties;
}

export function Icon({ name, size = 20, color = "currentColor", strokeWidth = 1.75, style }: IconProps) {
  const Glyph = ICONS[name];
  return (
    <span
      aria-hidden="true"
      style={{ display: "inline-flex", width: size, height: size, color, flex: "0 0 auto", ...style }}
    >
      {Glyph ? <Glyph size={size} strokeWidth={strokeWidth} style={{ display: "block" }} /> : null}
    </span>
  );
}
