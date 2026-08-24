const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const currencySymbol: Record<string, string> = {
  INR: "₹",
  USD: "$",
  AED: "د.إ",
  GBP: "£",
};

/** "2026-08" → "August 2026" — months are named, never numeric. */
export function monthLabel(key: string): string {
  const [y, m] = key.split("-");
  return `${MONTH_NAMES[Number(m) - 1]} ${y}`;
}

/** "2026-08" → "Aug ’26" */
export function monthShort(key: string): string {
  const [y, m] = key.split("-");
  return `${MONTH_NAMES[Number(m) - 1].slice(0, 3)} ’${y.slice(2)}`;
}

/** "2026-08" → "Aug" */
export function monthAbbr(key: string): string {
  const [, m] = key.split("-");
  return MONTH_NAMES[Number(m) - 1].slice(0, 3);
}

export function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function formatNumber(value: number, locale = "en-IN"): string {
  return Math.abs(value).toLocaleString(locale, { maximumFractionDigits: 0 });
}

/** "Ravi" → "Ravi’s share"; the default owner name "You" → "Your share". */
export function shareLabel(name: string): string {
  return name.trim().toLowerCase() === "you" ? "Your share" : `${name}’s share`;
}
