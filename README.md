# password-roaster

> The honest password strength meter. Submit a password, get a brutally honest verdict, and never have your plaintext stored.

A small full-stack CRUD app:

- **Frontend** — React 18 + Vite + TypeScript + Tailwind + Framer Motion
- **Backend** — Node.js 20 + Express + TypeScript + Prisma + zxcvbn-ts
- **Database** — SQLite for dev, Postgres in prod (one-line schema swap)

## Layout

```
.
├── apps
│   ├── server   # Express API + Prisma
│   └── web      # Vite React SPA
└── packages
    └── shared   # Zod schemas + shared types
```

## Quick start

```bash
pnpm install
cp .env.example .env

# Generate the Prisma client and create the SQLite DB
pnpm --filter @hpm/server db:generate
pnpm db:migrate
pnpm db:seed       # 50 sample passwords for the hall of shame

pnpm dev           # web on :5173, api on :3001
```

Open <http://localhost:5173>.

## Scripts (root)

| Command           | Action                              |
| ----------------- | ----------------------------------- |
| `pnpm dev`        | Concurrent client + server with HMR |
| `pnpm build`      | Build server + client               |
| `pnpm start`      | Run production server               |
| `pnpm test`       | Vitest unit/integration             |
| `pnpm test:e2e`   | Playwright e2e                      |
| `pnpm db:migrate` | Apply Prisma migrations             |
| `pnpm db:seed`    | Insert 50 seed roasts               |
| `pnpm lint`       | ESLint                              |
| `pnpm format`     | Prettier                            |

## Environment variables

| Var              | Required | Default                 | Purpose                               |
| ---------------- | -------- | ----------------------- | ------------------------------------- |
| `DATABASE_URL`   | yes      | `file:./dev.db`         | Prisma connection string              |
| `PORT`           | no       | `3001`                  | API port                              |
| `VITE_API_URL`   | yes      | `http://localhost:3001` | Client → API base URL                 |
| `RATE_LIMIT_MAX` | no       | `30`                    | Roast requests per minute per IP      |
| `ARGON2_PEPPER`  | no       | unset                   | Enables optional dedup hashing if set |
| `NODE_ENV`       | no       | `development`           |                                       |

## Privacy guarantees (the important part)

- Plaintext passwords live only inside the `POST /roasts` request handler frame and are dropped before the response. They are never written to disk, never logged, never returned in any API response.
- pino-http is configured **not** to serialize request bodies; the logger redacts any field named `password`.
- All `/api/*` responses set `Cache-Control: no-store`.
- The `Content-Security-Policy` blocks third-party scripts on the password page.
- The optional dedup hash uses argon2id with a per-record salt + a server-side pepper from `ARGON2_PEPPER`. Disabled unless that env var is set.

## API

Base path: `/api/v1`.

| Method   | Path           | Notes                                                                                              |
| -------- | -------------- | -------------------------------------------------------------------------------------------------- |
| `POST`   | `/roasts`      | Analyze a password and create a roast. Returns the roast + a one-time `ownerToken`.                |
| `GET`    | `/roasts`      | Paginated list. Pass `ownedIds=a,b,c` to fetch your history; otherwise returns only public roasts. |
| `GET`    | `/roasts/:id`  | Permalink fetch.                                                                                   |
| `PATCH`  | `/roasts/:id`  | Mutate `nickname` or `isPublic`. Requires `X-Owner-Token`.                                         |
| `DELETE` | `/roasts/:id`  | Delete. Requires `X-Owner-Token`.                                                                  |
| `GET`    | `/leaderboard` | Top 50 worst public roasts by ascending entropy. 60s cache.                                        |
| `GET`    | `/health`      | Liveness probe.                                                                                    |

## Ownership without accounts

There are no user accounts. Instead, `POST /roasts` returns a per-record `ownerToken`. The browser stores it in `localStorage` and presents it via `X-Owner-Token` on subsequent `PATCH`/`DELETE` calls. Lose the token, lose write access — the record is still publicly readable if it was marked public.

## Severity ladder

- **PATHETIC** — score 0, length < 8, or in the top-10k common list
- **WEAK** — score 1
- **MID** — score 2
- **DECENT** — score 3
- **FORTRESS** — score 4 **and** length ≥ 14 **and** entropy ≥ 70

## Roast engine

Template-based, deterministic-ish (seeded by length and boundary characters — not by the plaintext itself), 20+ templates per severity. Specific call-outs override the generic templates: literal `password`, all-digit, keyboard walk, trailing year, first-name-plus-digits, sub-6 length, and "you used a password manager".

## Deployment

- **Frontend** → Vercel/Netlify, static build of `apps/web`.
- **Backend** → Fly.io/Railway, single container.
- **DB** → Managed Postgres (Neon, Supabase, RDS). Change `provider` in `prisma/schema.prisma` to `postgresql` and re-run migrations.
- Put Cloudflare in front for WAF + edge caching of the leaderboard.

## Out of scope (v1)

- User accounts and auth
- Server-side password history beyond localStorage
- "Suggest a stronger password" feature
- Multi-language roasts (English only at launch)
- Mobile apps
