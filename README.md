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
pnpm test
pnpm build
pnpm preview
```

## Deploy

See `.github/workflows/deploy-vercel.yml`. Optional GitHub secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
