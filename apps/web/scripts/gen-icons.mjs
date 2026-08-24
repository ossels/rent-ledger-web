// One-off: renders the PWA PNG icons from the logo mark. Run `npm run gen:icons`.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const out = path.join(root, "public", "icons");
await mkdir(out, { recursive: true });

const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 5.2 57 25v27a4 4 0 0 1-4 4H15a4 4 0 0 1-4-4V25L32 5.2Z" fill="#14453D"/><rect x="20" y="31" width="24" height="4.2" rx="2.1" fill="#FAF7F1"/><rect x="20" y="40" width="14.5" height="4.2" rx="2.1" fill="#FAF7F1"/><rect x="36.8" y="40" width="7.2" height="4.2" rx="2.1" fill="#EFB350"/></svg>`;

// Plain icon: mark on paper, gently padded.
const plain = (size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}"><rect width="64" height="64" rx="14" fill="#FAF7F1"/><g transform="translate(6.4,6.4) scale(0.8)">${mark.replace(/<\/?svg[^>]*>/g, "")}</g></svg>`;

// Maskable: ink background, mark inside the safe zone (inner 60%).
const maskable = (size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}"><rect width="64" height="64" fill="#0E332D"/><g transform="translate(12.8,12.8) scale(0.6)"><path d="M32 5.2 57 25v27a4 4 0 0 1-4 4H15a4 4 0 0 1-4-4V25L32 5.2Z" fill="#FAF7F1"/><rect x="20" y="31" width="24" height="4.2" rx="2.1" fill="#0E332D"/><rect x="20" y="40" width="14.5" height="4.2" rx="2.1" fill="#0E332D"/><rect x="36.8" y="40" width="7.2" height="4.2" rx="2.1" fill="#C97F14"/></g></svg>`;

const jobs = [
  ["icon-192.png", plain(192), 192],
  ["icon-512.png", plain(512), 512],
  ["icon-maskable-192.png", maskable(192), 192],
  ["icon-maskable-512.png", maskable(512), 512],
  ["apple-touch-icon.png", maskable(180), 180],
];

for (const [name, svg, size] of jobs) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(path.join(out, name));
  console.log("wrote", name);
}
