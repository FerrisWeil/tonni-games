# Tonni Games

A free, Tonni-dedicated collection of NYT-style puzzle games — no play limits, no paywall. Deployed on Vercel.

## Wordle (first game)

Daily 5-letter Wordle with classic rules: six guesses, green / yellow / gray feedback, on-screen + physical keyboard, flip animations, and localStorage stats.

### Stack

- Vite + React + TypeScript
- Tailwind CSS
- pnpm

### Run locally

```bash
pnpm install
pnpm dev
```

Open [http://127.0.0.1:43127](http://127.0.0.1:43127).

```bash
pnpm test    # unit tests
pnpm build   # production build → dist/
pnpm preview # serve the production build
```

### Deploy (Vercel)

This repo includes [`.github/workflows/deploy-vercel.yml`](.github/workflows/deploy-vercel.yml).

**GitHub Actions secrets** (Settings → Secrets and variables → Actions):

| Secret | Where to get it |
| --- | --- |
| `VERCEL_TOKEN` | [Vercel → Account → Tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | `.vercel/project.json` → `orgId` (or team id from Vercel dashboard) |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` → `projectId` after linking |

Link once locally (optional):

```bash
pnpm dlx vercel link
```

Or connect the GitHub repo in the Vercel dashboard (Framework: Vite, Build: `pnpm build`, Output: `dist`).

### Word lists

Community-shared five-letter English word lists (not NYT proprietary assets). Branding is Tonni Games only.
