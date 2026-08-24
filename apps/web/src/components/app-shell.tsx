"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { TabBar } from "@/components/ds";
import { AddEntrySheet } from "@/components/add-entry-sheet";
import { AuthScreen } from "@/components/auth-screen";
import { useLedger } from "@/lib/store";

const TABS = [
  { value: "month", label: "Month", icon: "calendar-days", href: "/" },
  { value: "buildings", label: "Buildings", icon: "building-2", href: "/buildings" },
  { value: "history", label: "History", icon: "history", href: "/history" },
  { value: "settings", label: "Settings", icon: "settings", href: "/settings" },
];

function tabForPath(pathname: string): string {
  if (pathname.startsWith("/buildings")) return "buildings";
  if (pathname.startsWith("/history")) return "history";
  if (pathname.startsWith("/settings")) return "settings";
  return "month";
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { sheetOpen, authChecked, user, error } = useLedger();

  let body: ReactNode;
  if (!authChecked) {
    body = (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
        Opening the ledger…
      </div>
    );
  } else if (!user && !error) {
    body = <AuthScreen />;
  } else {
    body = (
      <>
        <div className="scroll">{children}</div>
        <TabBar
          value={tabForPath(pathname)}
          onChange={(t) => {
            const tab = TABS.find((x) => x.value === t);
            if (tab) router.push(tab.href);
          }}
          items={TABS}
        />
        {sheetOpen ? <AddEntrySheet /> : null}
      </>
    );
  }

  return (
    <div className="phone">
      <div className="screen">{body}</div>
    </div>
  );
}
