"use client";

import { useState } from "react";
import { Button, Input, SegmentedControl, Sheet, SplitBar } from "@/components/ds";
import { useLedger } from "@/lib/store";
import { formatNumber } from "@/lib/format";
import type { Building, OwnerKind } from "@/lib/api";

export interface BuildingSheetProps {
  open: boolean;
  onClose: () => void;
  /** When set, the sheet edits this building; otherwise it creates one. */
  building?: Building;
  /** Called after an archive so the caller can navigate away. */
  onArchived?: () => void;
}

export function BuildingSheet({ open, onClose, building, onArchived }: BuildingSheetProps) {
  const { currency, locale, partyName, addBuilding, updateBuilding } = useLedger();
  const [name, setName] = useState(building?.name ?? "");
  const [unit, setUnit] = useState(building?.unit ?? "");
  const [area, setArea] = useState(building?.area ?? "");
  const [tenant, setTenant] = useState(building?.tenant ?? "");
  const [rent, setRent] = useState(building ? String(building.rent) : "");
  const [owner, setOwner] = useState<OwnerKind>(building?.owner ?? "SHARED");
  const [shareA, setShareA] = useState(building ? String(building.splitA) : "");
  const [busy, setBusy] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameA = partyName("a");
  const nameB = partyName("b");
  const total = Number(rent) || 0;
  const a = owner === "A" ? total : owner === "B" ? 0 : Math.min(Number(shareA) || 0, total);
  const ready = name.trim() && unit.trim() && total > 0;

  const save = async () => {
    setBusy(true);
    setError(null);
    const data = {
      name: name.trim(),
      unit: unit.trim(),
      area: area.trim() || undefined,
      tenant: tenant.trim() || undefined,
      rent: total,
      splitA: a,
      splitB: total - a,
      owner,
    };
    try {
      if (building) await updateBuilding(building.id, data);
      else await addBuilding(data);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the building");
    } finally {
      setBusy(false);
    }
  };

  const archive = async () => {
    if (!building) return;
    setBusy(true);
    setError(null);
    try {
      await updateBuilding(building.id, { archived: true });
      onClose();
      onArchived?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not archive the building");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={building ? "Edit building" : "Add a building"}
      footer={
        <Button size="lg" variant="accent" full icon="check" disabled={!ready || busy} onClick={save}>
          {building ? "Save changes" : "Add building"}
        </Button>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-14, 14px)" }}>
        <Input label="Building name" value={name} onChange={setName} placeholder="Sai Nivas" />
        <div style={{ display: "flex", gap: "var(--space-10)" }}>
          <Input label="Unit" value={unit} onChange={setUnit} placeholder="2F" style={{ flex: 1 }} />
          <Input label="Area" value={area} onChange={setArea} placeholder="Kothrud" style={{ flex: 2 }} />
        </div>
        <Input label="Tenant" value={tenant} onChange={setTenant} placeholder="Deshpande family" />
        <Input label="Monthly rent" amount prefix={currency} value={rent} onChange={setRent} />

        <div>
          <span className="k-label" style={{ display: "block", marginBottom: "var(--space-6)" }}>Owner</span>
          <SegmentedControl
            full
            value={owner}
            onChange={(v) => setOwner(v as OwnerKind)}
            options={[
              { value: "A", label: `${nameA} only` },
              { value: "SHARED", label: "Shared" },
              { value: "B", label: `${nameB} only` },
            ]}
          />
        </div>

        {owner === "SHARED" ? (
          <div>
            <Input
              label={`${nameA}’s share`}
              amount
              prefix={currency}
              value={String(a)}
              onChange={setShareA}
              hint={`${nameB} gets ${currency}${formatNumber(total - a, locale)}`}
            />
            <div style={{ marginTop: 12 }}>
              <SplitBar
                currency={currency}
                parts={[
                  { label: nameA, value: a, party: "a" },
                  { label: nameB, value: total - a, party: "b" },
                ]}
              />
            </div>
          </div>
        ) : (
          <span style={{ fontSize: "var(--text-label)", color: "var(--text-muted)" }}>
            {owner === "A" ? nameA : nameB} gets the whole {currency}
            {formatNumber(total, locale)}.
          </span>
        )}

        {building ? (
          confirmArchive ? (
            <div style={{ display: "flex", gap: "var(--space-10)", alignItems: "center" }}>
              <Button variant="danger" size="md" icon="trash-2" disabled={busy} onClick={archive} style={{ flex: 1 }}>
                Archive for good
              </Button>
              <Button variant="secondary" size="md" onClick={() => setConfirmArchive(false)} style={{ flex: 1 }}>
                Keep it
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="md" icon="trash-2" onClick={() => setConfirmArchive(true)}>
              Archive this building
            </Button>
          )
        ) : null}

        {error ? <span style={{ fontSize: "var(--text-label)", color: "var(--text-negative)" }}>{error}</span> : null}
      </div>
    </Sheet>
  );
}
