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
| `/` | Home — Play Wordle + Themes |
| `/themes` | Built-in theme picker (persists) |
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

## Themes

Open **Themes** from home (`/themes`) or the palette icon in the Wordle header. Built-ins:

| Id | Name | Notes |
| --- | --- | --- |
| `system` | System | Classic by day, Midnight by night (`prefers-color-scheme`) |
| `classic` | Classic | Tonni default light |
| `midnight` | Midnight | Tonni dark |
| `high-contrast` | High Contrast | Near-black / white chrome |
| `meadow` | Meadow | Warm parchment + moss/ochre |

Selection is stored in `localStorage` under `tonni-theme-v2` (migrates legacy `tonni-theme-v1` light/dark/system). Games read CSS variables (`--background`, `--tile-correct`, `--key-bg`, …) — not hardcoded colors.

### Extending themes

Add a `ThemeDefinition` in `src/themes/registry.ts` (or call `registerTheme()` at runtime). Board/keyboard already consume tokens; no game rewrites needed. See comments at the top of the registry.

## Testing

Vitest unit tests ship with the app (`pnpm test`), including theme registry / resolve / persist / apply. Full Playwright PR matrix follows ADR 0008 / the testing strategy plan — **not required to ship** playable Wordle (no nightly for now).

## Where the game lives

| Path | Role |
| --- | --- |
| `src/pages/home.tsx` | Minimal home (`/`) |
| `src/pages/themes.tsx` | Theme picker (`/themes`) |
| `src/pages/wordle.tsx` | Wordle route (`/wordle`) |
| `src/components/wordle/` | Board, keyboard, stats, how-to-play UI |
| `src/themes/registry.ts` | Built-in theme tokens + extension point |
| `src/components/theme-*` | Theme provider + palette link |
| `src/lib/theme.ts` | Selection resolve / persist / apply |
| `src/lib/daily.ts` | Deterministic day → solution (default) |
| `src/lib/nyt-wordle.ts` | Opt-in NYT JSON parse + fetch (spike) |
| `api/wordle-nyt/[date].ts` | Vercel proxy for NYT `svc/wordle/v2` |
| `src/lib/evaluate.ts` | Official-style tile colors (incl. doubles) |
| `src/lib/storage.ts` | localStorage board + stats |
| `src/data/` | Solutions + allowed guesses |
| `src/App.tsx` | React Router routes |

## Deploy

See `.github/workflows/deploy-vercel.yml`. Optional GitHub secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`. Supports `workflow_dispatch` on `main`.
