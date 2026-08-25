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
  ApiError,
  type AuthUser,
  type Building,
  type MonthDetail,
  type MonthSummary,
  type NewBuilding,
  type NewEntry,
  type Party,
  type Settings,
} from "./api";
import { currencySymbol, currentMonthKey } from "./format";

interface LedgerState {
  authChecked: boolean;
  user: AuthUser | null;
  setupRequired: boolean;
  login: (email: string, password: string) => Promise<void>;
  setupAccount: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

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
  addEntry: (entry: NewEntry) => Promise<void>;
  updateEntry: (entryId: string, patch: Partial<Omit<NewEntry, "buildingId" | "kind">>) => Promise<void>;
  deleteEntry: (entryId: string) => Promise<void>;
  prefillMonth: () => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  refreshBuildings: () => Promise<void>;
  addBuilding: (data: NewBuilding) => Promise<void>;
  updateBuilding: (id: string, data: Partial<NewBuilding> & { archived?: boolean }) => Promise<void>;
  updateParty: (key: "a" | "b", data: { name?: string; note?: string }) => Promise<void>;
}

const LedgerContext = createContext<LedgerState | null>(null);

export function LedgerProvider({ children }: { children: ReactNode }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [setupRequired, setSetupRequired] = useState(false);
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
      if (e instanceof ApiError && e.status === 401) {
        setUser(null);
      } else {
        setError(e instanceof Error ? e.message : "Could not reach the ledger");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Establish the session before touching ledger data.
  useEffect(() => {
    (async () => {
      try {
        const status = await api.authStatus();
        setSetupRequired(status.setupRequired);
        if (!status.setupRequired) {
          try {
            setUser(await api.me());
          } catch {
            setUser(null);
          }
        }
      } catch {
        setError("Could not reach the ledger");
        setLoading(false);
      } finally {
        setAuthChecked(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (user) loadAll();
  }, [user, loadAll]);

  const login = useCallback(async (email: string, password: string) => {
    setUser(await api.login(email, password));
    setSetupRequired(false);
  }, []);

  const setupAccount = useCallback(async (name: string, email: string, password: string) => {
    setUser(await api.setupAccount(name, email, password));
    setSetupRequired(false);
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

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
    async (entry: NewEntry) => {
      await api.createEntry(entry);
      // Follow the entry: if it was dated into another month, show that month.
      setSelectedMonth(entry.month);
      await Promise.all([loadMonth(entry.month), refreshIndex()]);
    },
    [loadMonth, refreshIndex],
  );

  const updateEntry = useCallback(
    async (entryId: string, patch: Partial<Omit<NewEntry, "buildingId" | "kind">>) => {
      await api.updateEntry(entryId, patch);
      const target = patch.month ?? selectedMonth;
      setSelectedMonth(target);
      await Promise.all([loadMonth(target), refreshIndex()]);
    },
    [selectedMonth, loadMonth, refreshIndex],
  );

  const deleteEntry = useCallback(
    async (entryId: string) => {
      await api.deleteEntry(entryId);
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

  const addBuilding = useCallback(
    async (data: NewBuilding) => {
      await api.createBuilding(data);
      await refreshBuildings();
    },
    [refreshBuildings],
  );

  const updateBuilding = useCallback(
    async (id: string, data: Partial<NewBuilding> & { archived?: boolean }) => {
      await api.updateBuilding(id, data);
      await refreshBuildings();
    },
    [refreshBuildings],
  );

  const updateParty = useCallback(async (key: "a" | "b", data: { name?: string; note?: string }) => {
    await api.updateParty(key, data);
    setParties(await api.parties());
  }, []);

  const value: LedgerState = {
    authChecked,
    user,
    setupRequired,
    login,
    setupAccount,
    logout,
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
    updateEntry,
    deleteEntry,
    prefillMonth,
    updateSettings,
    refreshBuildings,
    addBuilding,
    updateBuilding,
    updateParty,
  };

  return <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>;
}

export function useLedger(): LedgerState {
  const ctx = useContext(LedgerContext);
  if (!ctx) throw new Error("useLedger must be used inside LedgerProvider");
  return ctx;
}
