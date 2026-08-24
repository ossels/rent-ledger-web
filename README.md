# RentLedger

A rent ledger for families who own buildings together. Some buildings are yours, some are your
wife's, some are shared on a fixed rupee split (₹4,000 to you, ₹2,000 to her). Every month you
record what came in and what you spent on maintenance — nothing is ever overwritten, the whole
history stays browsable month by month.

Built from the **Khaata Design System** (Claude Design project): warm paper surfaces, teal ink,
marigold accents, IBM Plex Mono amounts with Indian digit grouping.

## Stack

| Piece | Tech |
|---|---|
| `apps/web` | Next.js 15 (App Router) · React 19 · installable PWA (manifest + service worker) |
| `apps/api` | NestJS 11 · Prisma 6 |
| Database | PostgreSQL 16 (docker-compose) |

## Getting started

```bash
# 1. Install
npm install

# 2. Start Postgres
docker compose up -d db

# 3. Configure the API env
cp .env.example apps/api/.env

# 4. Create the schema and seed demo data
npm run db:migrate       # prisma migrate dev
npm run db:seed          # 2 owners, 5 buildings, 8 months of history

# 5. Run both apps
npm run dev              # web on :3000, api on :4000
```

Open http://localhost:3000. The web app proxies `/api/*` to the NestJS server
(set `API_ORIGIN` to point elsewhere).

## Login

Every route requires a signed-in session (httpOnly JWT cookie, 30 days). On first run the
app shows a **setup screen** that creates the first account; after that, setup is locked and
the login screen appears instead. Set a real `JWT_SECRET` in `apps/api/.env` for production.
Another account (e.g. the other owner) can be added while signed in via
`POST /api/auth/users` with `{ name, email, password }`.

## PWA

- `apps/web/src/app/manifest.ts` — installable manifest (standalone, portrait, themed `#0E332D`).
- `apps/web/public/sw.js` — service worker: app shell cached, `/api` network-first with
  offline fallback to the last-known data. Registered in production builds only.
- Icons live in `apps/web/public/icons` and are regenerated with `npm run gen:icons --workspace apps/web`.

## API surface

All under `/api` (auth-guarded except `auth/status`, `auth/setup`, `auth/login`):

- `GET /auth/status`, `POST /auth/setup`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/users`
- `GET/POST /buildings`, `GET/PATCH /buildings/:id` — PATCH takes `archived: true` to retire a building
- `GET /entries?month=2026-08&buildingId=…`, `POST /entries`, `PATCH/DELETE /entries/:id`
- `POST /entries/prefill` — one awaited rent row per building for a month
- `GET /ledger/months` — every month with totals (collected, awaited, expenses, net, per-owner share)
- `GET /ledger/months/:key` — one month's entries + totals
- `GET/PATCH /settings`, `GET /parties`, `PATCH /parties/:key`

Amounts are whole rupees; splits must satisfy `splitA + splitB = total` (validated server-side).
