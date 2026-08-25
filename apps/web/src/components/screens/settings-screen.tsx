"use client";

import { useEffect, useState } from "react";
import { Badge, Card, ListRow, Select, Switch, TopBar } from "@/components/ds";
import { LoginSheet } from "@/components/login-sheet";
import { PersonSheet } from "@/components/person-sheet";
import { ScreenState } from "@/components/screen-state";
import { api, type AuthUser } from "@/lib/api";
import { useLedger } from "@/lib/store";

export function SettingsScreen() {
  const { settings, updateSettings, parties, buildings, partyName, user, logout } = useLedger();
  const [editingParty, setEditingParty] = useState<"a" | "b" | null>(null);
  const [addingLogin, setAddingLogin] = useState(false);
  const [logins, setLogins] = useState<AuthUser[]>([]);
  const loadLogins = () => api.authUsers().then(setLogins).catch(() => undefined);
  useEffect(() => {
    if (settings) loadLogins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings !== null]);
  if (!settings) return <ScreenState>{null}</ScreenState>;
  const partyBeingEdited = parties.find((p) => p.key === editingParty);

  const owned = (key: "a" | "b") =>
    buildings.filter((b) => (key === "a" ? b.splitA > 0 : b.splitB > 0)).length;

  return (
    <ScreenState>
      <div>
        <TopBar title="Settings" subtitle="Currency, people and reminders" />
        <div style={{ padding: "var(--space-16)", display: "flex", flexDirection: "column", gap: "var(--space-16)" }}>
          <Card pad="lg">
            <div className="k-label" style={{ marginBottom: 12 }}>Money & time</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-14, 14px)" }}>
              <Select
                label="Currency"
                value={settings.currencyCode}
                onChange={(v) => updateSettings({ currencyCode: v })}
                options={[
                  { value: "INR", label: "₹ Indian Rupee (INR)" },
                  { value: "USD", label: "$ US Dollar (USD)" },
                  { value: "AED", label: "د.إ UAE Dirham (AED)" },
                  { value: "GBP", label: "£ Pound Sterling (GBP)" },
                ]}
              />
              <Select
                label="Number format"
                value={settings.locale}
                onChange={(v) => updateSettings({ locale: v })}
                options={[
                  { value: "en-IN", label: "Indian — 1,86,000" },
                  { value: "en-US", label: "International — 186,000" },
                ]}
              />
              <Select
                label="Time zone"
                value={settings.timezone}
                onChange={(v) => updateSettings({ timezone: v })}
                options={[
                  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
                  { value: "Asia/Dubai", label: "Asia/Dubai (GST)" },
                  { value: "Europe/London", label: "Europe/London (BST)" },
                ]}
                hint="Entry dates and reminders follow this zone."
              />
            </div>
          </Card>

          <Card pad="sm">
            <div className="k-label" style={{ padding: "var(--space-8) var(--space-4)" }}>People</div>
            {parties.map((p, i) => (
              <ListRow
                key={p.key}
                ledger={i < parties.length - 1}
                leading={
                  <span
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: p.key === "a" ? "var(--party-a)" : "var(--party-b)",
                      color: p.key === "a" ? "var(--white)" : "var(--teal-900)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                    }}
                  >
                    {p.name.slice(0, 1)}
                  </span>
                }
                title={p.name}
                subtitle={`${p.note ?? ""}${p.note ? " · " : ""}owner of ${owned(p.key)} buildings`}
                chevron
                onClick={() => setEditingParty(p.key)}
              />
            ))}
          </Card>

          <Card pad="sm">
            <div className="k-label" style={{ padding: "var(--space-8) var(--space-4)" }}>Logins</div>
            {logins.map((u) => (
              <ListRow
                key={u.id}
                ledger
                leadingIcon="shield-check"
                title={u.name}
                subtitle={u.email}
                trailing={u.email === user?.email ? <Badge tone="brand">You</Badge> : undefined}
              />
            ))}
            <ListRow leadingIcon="user-plus" title="Add a login" subtitle="Let the other owner sign in" chevron onClick={() => setAddingLogin(true)} />
          </Card>

          <Card pad="lg">
            <div className="k-label" style={{ marginBottom: 6 }}>Every month</div>
            <Switch
              label="Auto-carry rent"
              description="Pre-fill each month with last month’s amounts"
              checked={settings.autoCarry}
              onChange={(v) => updateSettings({ autoCarry: v })}
            />
            <Switch
              label="Collection reminder"
              description="On the 5th, 9:00 AM"
              checked={settings.reminder}
              onChange={(v) => updateSettings({ reminder: v })}
            />
            <Switch
              label="Ask before closing a month"
              description="Confirm all entries are recorded"
              checked={settings.confirmClose}
              onChange={(v) => updateSettings({ confirmClose: v })}
            />
          </Card>

          <Card pad="sm">
            <ListRow
              ledger
              leadingIcon="download"
              title="Export ledger"
              subtitle="CSV of every entry"
              chevron
              onClick={() => {
                window.open("/api/entries", "_blank");
              }}
            />
            <ListRow
              leadingIcon="shield-check"
              title="Sign out"
              subtitle={user?.email}
              chevron
              onClick={logout}
            />
          </Card>
          <div
            style={{ textAlign: "center", fontSize: "var(--text-micro)", color: "var(--text-faint)", letterSpacing: "var(--track-label)", textTransform: "uppercase" }}
          >
            RentLedger · {partyName("a")} & {partyName("b")}
          </div>
        </div>
        {partyBeingEdited ? (
          <PersonSheet key={partyBeingEdited.key} party={partyBeingEdited} open onClose={() => setEditingParty(null)} />
        ) : null}
        {addingLogin ? <LoginSheet open onClose={() => setAddingLogin(false)} onAdded={loadLogins} /> : null}
      </div>
    </ScreenState>
  );
}
