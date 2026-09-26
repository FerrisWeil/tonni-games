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

```bash
pnpm test     # evaluation unit tests
pnpm build    # production → dist/
pnpm preview  # serve production build
```

## Where the game lives

| Path | Role |
| --- | --- |
| `src/components/wordle/` | Board, keyboard, stats, how-to-play UI |
| `src/lib/daily.ts` | Deterministic day → solution |
| `src/lib/evaluate.ts` | Official-style tile colors (incl. doubles) |
| `src/lib/storage.ts` | localStorage board + stats |
| `src/data/` | Solutions + allowed guesses |
| `src/App.tsx` | Mounts Wordle (single-game surface) |

## Deploy

See `.github/workflows/deploy-vercel.yml`. Optional GitHub secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
