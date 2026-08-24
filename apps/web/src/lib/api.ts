export type OwnerKind = "A" | "B" | "SHARED";
export type EntryKind = "RENT" | "EXPENSE";
export type EntryStatus = "COLLECTED" | "AWAITED" | "PAID";

export interface Party {
  id: string;
  key: "a" | "b";
  name: string;
  note?: string | null;
}

export interface Building {
  id: string;
  name: string;
  unit: string;
  area?: string | null;
  tenant?: string | null;
  rent: number;
  splitA: number;
  splitB: number;
  owner: OwnerKind;
  archived: boolean;
}

export interface Entry {
  id: string;
  buildingId: string;
  kind: EntryKind;
  month: string;
  day: number;
  total: number;
  splitA: number;
  splitB: number;
  status: EntryStatus;
  note?: string | null;
}

export interface MonthTotals {
  due: number;
  collected: number;
  awaited: number;
  expenses: number;
  net: number;
  shareA: number;
  shareB: number;
  countCollected: number;
  countTotal: number;
}

export interface MonthSummary {
  key: string;
  totals: MonthTotals;
}

export interface MonthDetail {
  key: string;
  entries: Entry[];
  totals: MonthTotals;
}

export interface Settings {
  currencyCode: string;
  locale: string;
  timezone: string;
  autoCarry: boolean;
  reminder: boolean;
  confirmClose: boolean;
}

export interface NewEntry {
  buildingId: string;
  kind: EntryKind;
  month: string;
  day: number;
  total: number;
  splitA: number;
  splitB: number;
  status?: EntryStatus;
  note?: string;
}

export interface NewBuilding {
  name: string;
  unit: string;
  area?: string;
  tenant?: string;
  rent: number;
  splitA: number;
  splitB: number;
  owner: OwnerKind;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

const BASE = "/api";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) message = Array.isArray(body.message) ? body.message.join(", ") : body.message;
    } catch {
      // keep the default message
    }
    throw new ApiError(message, res.status);
  }
  return res.json();
}

export const api = {
  authStatus: () => request<{ setupRequired: boolean }>("/auth/status"),
  me: () => request<AuthUser>("/auth/me"),
  login: (email: string, password: string) =>
    request<AuthUser>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  setupAccount: (name: string, email: string, password: string) =>
    request<AuthUser>("/auth/setup", { method: "POST", body: JSON.stringify({ name, email, password }) }),
  logout: () => request<{ loggedOut: boolean }>("/auth/logout", { method: "POST" }),

  parties: () => request<Party[]>("/parties"),
  updateParty: (key: string, data: Partial<Pick<Party, "name" | "note">>) =>
    request<Party>(`/parties/${key}`, { method: "PATCH", body: JSON.stringify(data) }),

  buildings: () => request<Building[]>("/buildings"),
  building: (id: string) => request<Building>(`/buildings/${id}`),
  createBuilding: (data: NewBuilding) => request<Building>("/buildings", { method: "POST", body: JSON.stringify(data) }),
  updateBuilding: (id: string, data: Partial<NewBuilding> & { archived?: boolean }) =>
    request<Building>(`/buildings/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  months: () => request<MonthSummary[]>("/ledger/months"),
  month: (key: string) => request<MonthDetail>(`/ledger/months/${key}`),

  createEntry: (data: NewEntry) => request<Entry>("/entries", { method: "POST", body: JSON.stringify(data) }),
  updateEntry: (id: string, data: Partial<Omit<NewEntry, "buildingId" | "kind" | "month">>) =>
    request<Entry>(`/entries/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteEntry: (id: string) => request<{ deleted: boolean }>(`/entries/${id}`, { method: "DELETE" }),
  prefillMonth: (month: string) =>
    request<{ created: number; entries: Entry[] }>("/entries/prefill", { method: "POST", body: JSON.stringify({ month }) }),

  settings: () => request<Settings>("/settings"),
  updateSettings: (data: Partial<Settings>) => request<Settings>("/settings", { method: "PATCH", body: JSON.stringify(data) }),
};
