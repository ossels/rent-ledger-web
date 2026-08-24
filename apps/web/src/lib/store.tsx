"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  api,
  type Building,
  type MonthDetail,
  type MonthSummary,
  type NewEntry,
  type Party,
  type Settings,
} from "./api";
import { currencySymbol, currentMonthKey } from "./format";

interface LedgerState {
  loading: boolean;
  error: string | null;
  settings: Settings | null;
  parties: Party[];
  buildings: Building[];
  monthsIndex: MonthSummary[];
  monthKeys: string[];
  selectedMonth: string;
  monthDetail: MonthDetail | null;
  monthLoading: boolean;
  sheetOpen: boolean;
  currency: string;
  locale: string;
  partyName: (key: "a" | "b") => string;

  selectMonth: (key: string) => void;
  openSheet: () => void;
  closeSheet: () => void;
  retry: () => void;
  markPaid: (entryId: string) => Promise<void>;
  addEntry: (entry: Omit<NewEntry, "month" | "day">) => Promise<void>;
  prefillMonth: () => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  refreshBuildings: () => Promise<void>;
}

const LedgerContext = createContext<LedgerState | null>(null);

export function LedgerProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [parties, setParties] = useState<Party[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [monthsIndex, setMonthsIndex] = useState<MonthSummary[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey());
  const [monthDetail, setMonthDetail] = useState<MonthDetail | null>(null);
  const [monthLoading, setMonthLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, p, b, m] = await Promise.all([api.settings(), api.parties(), api.buildings(), api.months()]);
      setSettings(s);
      setParties(p);
      setBuildings(b);
      setMonthsIndex(m);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reach the ledger");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const loadMonth = useCallback(async (key: string) => {
    setMonthLoading(true);
    try {
      setMonthDetail(await api.month(key));
    } catch {
      setMonthDetail(null);
    } finally {
      setMonthLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && !error) loadMonth(selectedMonth);
  }, [selectedMonth, loading, error, loadMonth]);

  const refreshIndex = useCallback(async () => {
    setMonthsIndex(await api.months());
  }, []);

  const monthKeys = useMemo(() => {
    const keys = monthsIndex.map((m) => m.key);
    const current = currentMonthKey();
    if (!keys.includes(current)) keys.push(current);
    return keys.sort();
  }, [monthsIndex]);

  const partyName = useCallback(
    (key: "a" | "b") => parties.find((p) => p.key === key)?.name ?? (key === "a" ? "Owner A" : "Owner B"),
    [parties],
  );

  const markPaid = useCallback(
    async (entryId: string) => {
      await api.updateEntry(entryId, { status: "COLLECTED" });
      await Promise.all([loadMonth(selectedMonth), refreshIndex()]);
    },
    [selectedMonth, loadMonth, refreshIndex],
  );

  const addEntry = useCallback(
    async (entry: Omit<NewEntry, "month" | "day">) => {
      await api.createEntry({ ...entry, month: selectedMonth, day: new Date().getDate() });
      await Promise.all([loadMonth(selectedMonth), refreshIndex()]);
    },
    [selectedMonth, loadMonth, refreshIndex],
  );

  const prefillMonth = useCallback(async () => {
    await api.prefillMonth(selectedMonth);
    await Promise.all([loadMonth(selectedMonth), refreshIndex()]);
  }, [selectedMonth, loadMonth, refreshIndex]);

  const updateSettings = useCallback(async (patch: Partial<Settings>) => {
    setSettings((s) => (s ? { ...s, ...patch } : s));
    setSettings(await api.updateSettings(patch));
  }, []);

  const refreshBuildings = useCallback(async () => {
    setBuildings(await api.buildings());
  }, []);

  const value: LedgerState = {
    loading,
    error,
    settings,
    parties,
    buildings,
    monthsIndex,
    monthKeys,
    selectedMonth,
    monthDetail,
    monthLoading,
    sheetOpen,
    currency: currencySymbol[settings?.currencyCode ?? "INR"] ?? "₹",
    locale: settings?.locale ?? "en-IN",
    partyName,
    selectMonth: setSelectedMonth,
    openSheet: () => setSheetOpen(true),
    closeSheet: () => setSheetOpen(false),
    retry: loadAll,
    markPaid,
    addEntry,
    prefillMonth,
    updateSettings,
    refreshBuildings,
  };

  return <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>;
}

export function useLedger(): LedgerState {
  const ctx = useContext(LedgerContext);
  if (!ctx) throw new Error("useLedger must be used inside LedgerProvider");
  return ctx;
}
