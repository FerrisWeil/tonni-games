# Tonni Games — Wordle

Free daily Wordle for Tonni. Classic rules, no paywall, no play limits.

Optimized for **mobile** — snappy touch feedback and basic accessibility ([ADR 0010](https://github.com/FerrisWeil/tonni-games)). Games are built independently; a multi-game shell comes later. Backend/sign-in is deferred — board and stats use **localStorage**.

## Stack

Vite + React + TypeScript · Tailwind · pnpm

## Run

```bash
pnpm install
pnpm dev
```

Open [http://127.0.0.1:43127](http://127.0.0.1:43127).

| Route | What |
| --- | --- |
| `/` | Home — button to Wordle |
| `/wordle` | Playable Wordle (direct URL) |

```bash
pnpm test            # Vitest unit + component (RTL)
pnpm test:e2e:smoke  # Playwright smoke (desktop + phone-md)
pnpm build           # production → dist/
pnpm preview         # serve production build
```

### Optional NYT source (personal/family — ADR 0009)

Default is the local Tonni schedule. Opt in without changing production defaults:

- Query: `/wordle?source=nyt` (optional `&date=YYYY-MM-DD`)
- Env: `VITE_WORDLE_SOURCE=nyt`
- Same-origin proxy: `/api/wordle-nyt/{YYYY-MM-DD}` (Vite in dev; Vercel `api/wordle-nyt/[date].ts` in prod)
- Fetch failure → toast + soft fallback to local list

## Where the game lives

| Path | Role |
| --- | --- |
| `src/pages/home.tsx` | Minimal home (`/`) |
| `src/pages/wordle.tsx` | Wordle route (`/wordle`) |
| `src/components/wordle/` | Board, keyboard, stats, how-to-play UI |
| `src/lib/daily.ts` | Deterministic day → solution |
| `src/lib/nyt-wordle.ts` | Opt-in NYT fetch client (ADR 0009) |
| `src/lib/evaluate.ts` | Official-style tile colors (incl. doubles) |
| `src/lib/storage.ts` | localStorage board + stats |
| `src/data/` | Solutions + allowed guesses |
| `src/App.tsx` | React Router routes |
| `e2e/` | Playwright smoke tests |

## Deploy

See `.github/workflows/deploy-vercel.yml` and `.github/workflows/ci.yml`. Optional GitHub secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
