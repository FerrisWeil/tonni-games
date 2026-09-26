# Tonni Games — Wordle

Free daily Wordle for Tonni. Classic rules, no paywall, no play limits.

Games are built independently; a multi-game shell comes later. Backend/sign-in is deferred — board and stats use **localStorage**.

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
pnpm test     # evaluation unit tests
pnpm build    # production → dist/
pnpm preview  # serve production build
```

## Personal NYT source spike

Default puzzle source is the **local Tonni list**. For personal/family testing only (not monetized; usage-rights risk accepted):

```bash
# Env (rebuild/restart after changing)
VITE_WORDLE_SOURCE=nyt pnpm dev

# Or query (no rebuild)
# http://127.0.0.1:43127/wordle?source=nyt
# http://127.0.0.1:43127/wordle?source=nyt&date=2022-01-01
```

Browser CORS blocks direct `nytimes.com` calls, so the client hits same-origin `/api/wordle-nyt/{YYYY-MM-DD}` (Vite proxy in dev; Vercel serverless in prod). If the fetch fails, the game falls back to the local list and shows a toast.

## Testing

Vitest unit tests ship with the app (`pnpm test`). Full Playwright PR matrix follows ADR 0008 / the testing strategy plan — **not required to ship** playable Wordle (no nightly for now).

## Where the game lives

| Path | Role |
| --- | --- |
| `src/pages/home.tsx` | Minimal home (`/`) |
| `src/pages/wordle.tsx` | Wordle route (`/wordle`) |
| `src/components/wordle/` | Board, keyboard, stats, how-to-play UI |
| `src/lib/daily.ts` | Deterministic day → solution (default) |
| `src/lib/nyt-wordle.ts` | Opt-in NYT JSON parse + fetch (spike) |
| `api/wordle-nyt/[date].ts` | Vercel proxy for NYT `svc/wordle/v2` |
| `src/lib/evaluate.ts` | Official-style tile colors (incl. doubles) |
| `src/lib/storage.ts` | localStorage board + stats |
| `src/data/` | Solutions + allowed guesses |
| `src/App.tsx` | React Router routes |

## Deploy

See `.github/workflows/deploy-vercel.yml`. Optional GitHub secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`. Supports `workflow_dispatch` on `main`.
