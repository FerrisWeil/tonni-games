# Tonni Games

Free NYT-style puzzle games for Tonni. No paywall, no play limits.

Games are built independently; a multi-game shell comes later. Backend/sign-in is deferred — progress uses **localStorage**.

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
| `/` | Home — Wordle + Connections + Themes |
| `/themes` | Built-in theme picker (persists) |
| `/wordle` | Playable Wordle |
| `/connections` | Playable Connections |

```bash
pnpm test     # unit tests (Wordle + Connections + theme)
pnpm build    # production → dist/
pnpm preview  # serve production build
```

## Connections

Official-like rules: 16 words, 4 groups, select 4 → Submit, 4 mistakes, difficulty colors, shuffle/deselect, share grid.

### Switch NYT vs Tonni custom

Default source is **Tonni custom packs** (`src/data/connections/` + registry in `src/lib/connections/packs.ts`).

| How | Example |
| --- | --- |
| In-game picker | Source dropdown: **Tonni (custom)** or **NYT (personal use)** |
| Query | `/connections?source=tonni&puzzle=tonni-starter-2` |
| Query (NYT) | `/connections?source=nyt&date=2024-06-01` |
| Env | `VITE_CONNECTIONS_SOURCE=nyt` |

NYT uses same-origin `/api/connections-nyt/{YYYY-MM-DD}` (Vite proxy in dev; Vercel serverless in prod). Soft fallback to Tonni if the fetch fails. Personal/family non‑monetized use only (ADR 0009 / 0013) — not affiliated with The New York Times.

Add more custom packs by appending to `CONNECTION_PACKS` in `src/lib/connections/packs.ts`.

## Wordle — personal NYT spike

Default puzzle source is the **local Tonni list**. For personal/family testing:

```bash
VITE_WORDLE_SOURCE=nyt pnpm dev
# or /wordle?source=nyt&date=2022-01-01
```

Browser CORS blocks direct `nytimes.com` calls, so the client hits same-origin `/api/wordle-nyt/{YYYY-MM-DD}` (Vite proxy in dev; Vercel serverless in prod). If the fetch fails, the game falls back to the local list and shows a toast.

## Themes

Open **Themes** from home (`/themes`) or the palette icon in game headers. Built-ins:

| Id | Name | Notes |
| --- | --- | --- |
| `system` | System | Classic by day, Midnight by night (`prefers-color-scheme`) |
| `classic` | Classic | Tonni default light |
| `midnight` | Midnight | Tonni dark |
| `high-contrast` | High Contrast | Near-black / white chrome |
| `meadow` | Meadow | Warm parchment + moss/ochre |

Selection is stored in `localStorage` under `tonni-theme-v2` (migrates legacy `tonni-theme-v1`). Games read CSS variables (`--background`, `--tile-correct`, `--conn-yellow`, …) — not hardcoded colors. Connections difficulty colors are `--conn-*` tokens in the theme registry.

### Extending themes

Add a `ThemeDefinition` in `src/themes/registry.ts` (or call `registerTheme()` at runtime). Board/keyboard/Connections already consume tokens; no game rewrites needed.

## Testing

Vitest unit tests (`pnpm test`) cover Wordle evaluation, theme registry / resolve / persist / apply, and Connections grouping/validation/share. Full Playwright PR matrix follows ADR 0008 — not required to ship playable games.

## Where things live

| Path | Role |
| --- | --- |
| `src/pages/home.tsx` | Home (`/`) |
| `src/pages/themes.tsx` | Theme picker (`/themes`) |
| `src/pages/wordle.tsx` | Wordle (`/wordle`) |
| `src/pages/connections.tsx` | Connections (`/connections`) |
| `src/components/wordle/` | Wordle UI |
| `src/components/connections/` | Connections UI |
| `src/lib/connections/` | Logic, NYT parse, packs loader, share |
| `src/data/connections/` | Tonni-authored puzzle packs |
| `api/connections-nyt/[date].ts` | Vercel proxy for NYT Connections |
| `api/wordle-nyt/[date].ts` | Vercel proxy for NYT Wordle |
| `src/themes/registry.ts` | Built-in theme tokens + extension point |
| `src/components/theme-*` | Theme provider + palette link |
| `src/lib/theme.ts` | Selection resolve / persist / apply |
| `src/App.tsx` | React Router routes |

## Deploy

See `.github/workflows/deploy-vercel.yml`. Optional GitHub secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`. Supports `workflow_dispatch` on `main`. Avoid thrashing Vercel Hobby quota.
