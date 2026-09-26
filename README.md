# Tonni Games

A free, Tonni-dedicated collection of NYT-style puzzle games — no play limits, no paywall. Deployed on Vercel with Supabase Postgres.

## Wordle (first game)

Daily 5-letter Wordle with classic rules: six guesses, green / yellow / gray feedback, on-screen + physical keyboard, flip animations, and localStorage stats. Plays without Supabase; the client is ready when env vars are set.

### Stack

- Vite + React + TypeScript
- Tailwind CSS
- pnpm
- Supabase Postgres (`@supabase/supabase-js`)
- GitHub Actions → Vercel

### Run locally

```bash
pnpm install
cp .env.example .env   # optional — fill in Supabase keys when ready
pnpm dev
```

Open [http://127.0.0.1:43127](http://127.0.0.1:43127).

```bash
pnpm test
pnpm build
pnpm preview
```

### Environment variables

| Variable | Where | Required |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Vercel + local `.env` | Optional (Wordle works offline via localStorage) |
| `VITE_SUPABASE_ANON_KEY` | Vercel + local `.env` | Optional |

### Deploy (Vercel + GitHub Actions)

Workflow: [`.github/workflows/deploy-vercel.yml`](.github/workflows/deploy-vercel.yml)

**GitHub Actions secrets** (Settings → Secrets and variables → Actions):

| Secret | Purpose |
| --- | --- |
| `VERCEL_TOKEN` | Deploy token from [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Team/org id from `.vercel/project.json` or dashboard |
| `VERCEL_PROJECT_ID` | Project id after `pnpm dlx vercel link` |

**Vercel project env vars** (Project → Settings → Environment Variables):

| Variable | Notes |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon / publishable key |

Framework preset: Vite · Build: `pnpm build` · Output: `dist` · Install: `pnpm install`

### Word lists

Community-shared five-letter English word lists (not NYT proprietary assets). Branding is Tonni Games only.
