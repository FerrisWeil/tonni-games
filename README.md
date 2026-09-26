# Tonni Games

Free NYT-style puzzle games for Tonni. No paywall, no play limits.

Games are built independently; a multi-game shell comes later. **Sign-in** uses Supabase Auth (Google + email magic link) at `/account`. Play progress still uses **localStorage** until packs land; without Supabase env vars, Account shows “Sign-in unavailable” and games keep working.

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
| `/` | Home — Wordle, Builder, Connections, Themes + Account |
| `/account` | Sign in (Google / magic link) or account + sign out |
| `/themes` | Built-in theme picker (persists) |
| `/wordle` | Daily Wordle |
| `/wordle/builder` | Create a custom Wordle + share link |
| `/w/:code` | Play a custom Wordle from an encoded share code |
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

## Wordle Builder

Create a custom solution at `/wordle/builder` (3–10 letters, A–Z). The app encodes **version + length + obfuscated letters + checksum** as a base64url code and shares `/w/:code`. No database — anyone with the link can play. Length 5 guesses use the daily dictionary; other lengths accept any A–Z guess of the correct length. Guess budget: 6 (≤5 letters), 7 (6–7), or 8 (8–10).

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

## Sign-in (Supabase Auth)

Account UI: **`/account`** (home header → Sign in / Account). Providers: **Google** + **email magic link**. Uses shared **`AppShell`** (ADR 0021). Missing env → “Sign-in unavailable”; games still work.

```bash
cp .env.example .env.local
# set VITE_SUPABASE_ANON_KEY from Supabase → Project Settings → API
pnpm dev
```

### Taylor setup (live OAuth)

1. **Vercel env** — `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (Production + Preview), redeploy.
2. **Supabase → Authentication → URL Configuration** — Site URL `https://tonni-games.vercel.app`; Redirect URLs:
   - `http://127.0.0.1:43127/account`
   - `http://localhost:43127/account`
   - `https://tonni-games.vercel.app/account`
   - preview hosts as needed
3. **Google Cloud** — OAuth Web client; JS origins for local + production; redirect URI `https://vycergkxkrpsbxoglrws.supabase.co/auth/v1/callback`.
4. **Supabase → Providers → Google** — enable; paste Client ID + Secret.
5. **Email** — Providers → Email enabled for magic links.
6. **Profiles** — apply `supabase/migrations/20260926170000_profiles.sql` (safe to re-run).

Wordle Builder stays on separate routes (`/wordle/builder`, `/w/:code`).

## Testing

Vitest unit tests (`pnpm test`) cover Wordle evaluation, theme registry / resolve / persist / apply, and Connections grouping/validation/share. Full Playwright PR matrix follows ADR 0008 — not required to ship playable games.

## Where things live

| Path | Role |
| --- | --- |
| `src/pages/home.tsx` | Home (`/`) |
| `src/pages/account.tsx` | Sign-in / account (`/account`) |
| `src/pages/themes.tsx` | Theme picker (`/themes`) |
| `src/pages/wordle.tsx` | Wordle (`/wordle`) |
| `src/pages/wordle-builder.tsx` | Custom Wordle builder |
| `src/pages/wordle-custom-play.tsx` | Play encoded share codes |
| `src/pages/connections.tsx` | Connections (`/connections`) |
| `src/components/app-shell.tsx` | Anchored header + body scroll |
| `src/components/auth-context.tsx` | Supabase session provider |
| `src/lib/supabase.ts` | Supabase client (null if env missing) |
| `supabase/migrations/` | Profiles (+ later packs) SQL |
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

Default branch: **`master`**. Two Vercel projects share this repo:

| Project (human) | Platform name | Project id | Purpose |
| --- | --- | --- | --- |
| **tonni-games** (prod) | `tonni-games` | `prj_xpylCQ0S9SSuj8DYmOsctzSp3emH` | Live site — thrifty (ADR 0025) |
| **Tonni-games-dev** | `tonni-games-dev` (Vercel requires lowercase names) | `prj_RJRUctklGEubeVOWxSOUhdfWa4tO` | On-demand / dev only (ADR 0026) |

Team: `ferrisweils-projects` (`team_xNSXW3QfytHiY0cKnRgj222W`).

Both use the **same Supabase backend/login** for now (`VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`).

### Production — `.github/workflows/deploy-vercel.yml` (ADR 0025)

| Job | When | What |
| --- | --- | --- |
| `build` | PRs + `master` | `pnpm test` + `pnpm build` |
| **Verify Vercel build** (`vercel-build`) | PRs + `master` | Gates merges: validates `vercel.json`, runs the same install/build commands Vercel uses, asserts `dist/`, typechecks `api/**` serverless routes. **Does not** call `vercel pull` / `vercel build` or promote production. |
| **Deploy production (hook)** | `push` to `master` or `workflow_dispatch` | Triggers the Vercel **Deploy Hook** (build+promote on Vercel). **Never** on `pull_request`. |

#### Manual prod deploy (Taylor)

1. Open [Actions → Deploy to Vercel](https://github.com/FerrisWeil/tonni-games/actions/workflows/deploy-vercel.yml).
2. Click **Run workflow**.
3. Choose branch **`master`**, then **Run workflow**.
4. Wait for `build` + **Verify Vercel build** + **Deploy production (hook)**. The hook only queues the Vercel job; check the [Vercel dashboard](https://vercel.com/ferrisweils-projects/tonni-games) for READY.

Merging a PR into **`master`** also runs the Deploy Hook once (same as above). PR branches do **not** deploy production.

After the `main` → `master` rename: recreate the Deploy Hook for branch **`master`** under Vercel → Project → Settings → Git → Deploy Hooks, then set repo secret `VERCEL_DEPLOY_HOOK_URL` to the new URL.

### Deploy to Dev — `.github/workflows/deploy-dev.yml` (ADR 0026)

On-demand only (`workflow_dispatch`). Does **not** run on push or PR. Targets **Tonni-games-dev** only.

1. Open [Actions → Deploy to Dev](https://github.com/FerrisWeil/tonni-games/actions/workflows/deploy-dev.yml).
2. Click **Run workflow** (branch: usually **`master`**).
3. Optional input `ref` to deploy another git ref.
4. After READY: [https://tonni-games-dev.vercel.app](https://tonni-games-dev.vercel.app) · [Vercel dashboard](https://vercel.com/ferrisweils-projects/tonni-games-dev)

Requires secret **`VERCEL_DEV_DEPLOY_HOOK_URL`**. Create the hook: Vercel → **Tonni-games-dev** → Settings → Git → Deploy Hooks → name `on-demand-dev`, branch **`master`**. Automatic Git builds on Tonni-games-dev are skipped via the project Ignored Build Step.

### Secrets

| Secret | Required? | Notes |
| --- | --- | --- |
| `VERCEL_DEPLOY_HOOK_URL` | Optional (prod) | Overrides the hardcoded production Deploy Hook. Prefer this if the hook is rotated (required after `master` rename if the old hook targeted `main`). |
| `VERCEL_DEV_DEPLOY_HOOK_URL` | **Required for Deploy to Dev** | Deploy Hook on **Tonni-games-dev** (`tonni-games-dev`) for branch **`master`**. |
| `VERCEL_DEV_PROJECT_ID` | Optional (docs / future CLI) | `prj_RJRUctklGEubeVOWxSOUhdfWa4tO` |
| `VERCEL_TOKEN` | **Not used by current GHA** | Past tokens authenticate but **404 / cannot read project settings** for `tonni-games` (`vercel pull` → “Could not retrieve Project Settings”). Do **not** rely on CLI deploy until rotated. |
| `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` | Optional (CLI only) | Team `team_xNSXW3QfytHiY0cKnRgj222W` (`ferrisweils-projects`), prod project `prj_xpylCQ0S9SSuj8DYmOsctzSp3emH`. |

### Env on Vercel (both projects)

| Variable | Notes |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://vycergkxkrpsbxoglrws.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Same anon key on prod and Tonni-games-dev (Supabase → Project Settings → API). |

If a project is missing these, paste from Supabase or copy from the other Vercel project’s Environment Variables.

To restore CLI `vercel pull` + `vercel build` verification later: create a Vercel token that can **read** team **ferrisweils-projects** / project **tonni-games** (account-level token owned by a member of that team, or a token scoped to that project), set `VERCEL_TOKEN` (+ org/project IDs), then switch the verify job to `vercel pull --yes --environment=preview` + `vercel build`. Until then, the local parity job is the merge gate; production promote stays on the Deploy Hook.

### Hobby rate limits / previews

Vercel Hobby caps daily deployments. Preview builds on every PR commit burned that quota and left a red **Vercel** Git status (`Deployment rate limited`) even when GHA **Verify Vercel build** was green.

**Mitigation (in repo + project) — ADR 0025 / 0026:**

- Preview deployments are **disabled** on both projects (`previewDeploymentsDisabled`).
- `vercel.json` `git.deploymentEnabled: false` — no automatic Git deploys (PRs/forks/`master` pushes do not create Vercel builds by themselves).
- `ignoreCommand` still skips non-`master` if Git deploys are re-enabled (Deploy Hooks for `master` still build).
- Tonni-games-dev Ignored Build Step always skips automatic Git builds (hook / **Deploy to Dev** only).
- Production promote is **Deploy Hook only** from GHA on `master` / `workflow_dispatch` (never `vercel` CLI — `VERCEL_TOKEN` still cannot read this project).
- Use **Tonni-games-dev** + **Deploy to Dev** for on-demand deploys so production stays thrifty.

Merge gate = GHA `build` + **Verify Vercel build**. Do not treat the Vercel Git status as the merge gate while on Hobby.

Avoid thrashing Vercel Hobby daily deploy quota (prefer Deploy Hook + disabled Git auto-deploys over CLI/`vercel deploy`).
