import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Mukta, Sora } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { LedgerProvider } from "@/lib/store";
import { SwRegister } from "@/components/sw-register";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sora",
});

const mukta = Mukta({
  subsets: ["latin", "devanagari"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-mukta",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "RentLedger",
  description: "A rent ledger for families who own buildings together.",
  applicationName: "RentLedger",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RentLedger",
  },
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }, { url: "/icons/icon-192.png", sizes: "192x192" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0E332D",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${mukta.variable} ${plexMono.variable}`}>
      <body>
        <LedgerProvider>
          <AppShell>{children}</AppShell>
        </LedgerProvider>
        <SwRegister />
      </body>
    </html>
  );
}
