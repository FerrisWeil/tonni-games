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
| --- | --- |
| `system` | System | Classic by day, Midnight by night (`prefers-color-scheme`) |
| `classic` | Classic | Tonni default light |
| `midnight` | Midnight | Tonni dark |
| `high-contrast` | High Contrast | Near-black / white chrome |
| `meadow` | Meadow | Warm parchment + moss/ochre |

Selection is stored in `localStorage` under `tonni-theme-v2` (migrates legacy `tonni-theme-v1`). Games read CSS variables (`--background`, `--tile-correct`, `--conn-yellow`, …) — not hardcoded colors. Connections difficulty colors are `--conn-*` tokens in the theme registry.

Theme rows use **static sizes** (no layout shift when selecting). Shared **`AppShell`** anchors headers (and Wordle’s keyboard footer); only the body pane scrolls.

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
| `src/lib/daily.ts` | Deterministic day → solution (default) |
| `src/lib/nyt-wordle.ts` | Opt-in NYT JSON parse + fetch (spike) |
| `src/lib/evaluate.ts` | Official-style tile colors (incl. doubles) |
| `src/lib/storage.ts` | localStorage board + stats |
| `src/data/` | Solutions + allowed guesses |
| `src/App.tsx` | React Router routes |

## Deploy

Workflow: `.github/workflows/deploy-vercel.yml`.

| Job | When | What |
| --- | --- |
| `build` | PRs + `main` | `pnpm test` + `pnpm build` |
| **Verify Vercel build** (`vercel-build`) | PRs + `main` | Gates merges: validates `vercel.json`, runs the same install/build commands Vercel uses, asserts `dist/`, typechecks `api/**` serverless routes. **Does not** call `vercel pull` / `vercel build` or promote production. |
| **Deploy production (hook)** | `push` to `main` or `workflow_dispatch` | Triggers the Vercel **Deploy Hook** (build+promote on Vercel). Skipped on PRs. |

### Secrets

| Secret | Required? | Notes |
| --- | --- |
| `VERCEL_DEPLOY_HOOK_URL` | Optional | Overrides the hardcoded production Deploy Hook. Prefer this if the hook is rotated. |
| `VERCEL_TOKEN` | **Not used by current GHA** | Past tokens authenticate but **404 / cannot read project settings** for `tonni-games` (`vercel pull` → “Could not retrieve Project Settings”). Do **not** rely on CLI deploy until rotated. |
| `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` | Optional (CLI only) | Team `team_xNSXW3QfytHiY0cKnRgj222W` (`ferrisweils-projects`), project `prj_xpylCQ0S9SSuj8DYmOsctzSp3emH`. |

To restore CLI `vercel pull` + `vercel build` verification later: create a Vercel token that can **read** team **ferrisweils-projects** / project **tonni-games** (account-level token owned by a member of that team, or a token scoped to that project), set `VERCEL_TOKEN` (+ org/project IDs), then switch the verify job to `vercel pull --yes --environment=preview` + `vercel build`. Until then, the local parity job is the merge gate; production promote stays on the Deploy Hook.

### Hobby rate limits / previews

Vercel Hobby caps daily deployments. Preview builds on every PR commit burned that quota and left a red **Vercel** Git status (`Deployment rate limited`) even when GHA **Verify Vercel build** was green.

**Mitigation (in repo + project):**

- Preview deployments are **disabled** on the Vercel project (`previewDeploymentsDisabled`).
- `vercel.json` `ignoreCommand` skips non-`main` Git builds so PR branches do not consume quota.
- Production promote is **Deploy Hook only** from GHA on `main` / `workflow_dispatch` (never `vercel` CLI — `VERCEL_TOKEN` still cannot read this project).

Merge gate = GHA `build` + **Verify Vercel build**. Do not treat the Vercel Git status as the merge gate while on Hobby.

Avoid thrashing Vercel Hobby daily deploy quota (prefer Deploy Hook + disabled previews over CLI/`vercel deploy`).
