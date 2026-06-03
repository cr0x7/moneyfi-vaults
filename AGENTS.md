<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Repo

Single-package Next.js 16 (App Router) frontend mockup. **This is a UI mockup only** — no backend, no API routes, no env files, no tests, no CI. All vault/positions data is hardcoded mock data in `src/data/`; `generateAPYHistory` and `generateTVLHistory` use `Math.random()`, so values change on every module load — not deterministic.

## Commands

Package manager: **npm** (`package-lock.json` present; no pnpm/yarn lockfile).

```bash
npm run dev      # next dev
npm run build    # next build
npm run start    # next start
npm run lint     # eslint flat config (next/core-web-vitals + next/typescript)
```

No typecheck, test, or format script is configured. Type-checking is embedded in `next build` only. If you need standalone type-checking, run `npx tsc --noEmit`.

## Conventions

- Path alias: `@/*` → `./src/*` (used everywhere — prefer `@/components/...`, `@/data/...`, `@/lib/...`).
- Tailwind CSS **v4**: globals.css uses `@import "tailwindcss"` and an `@theme inline { ... }` block with CSS custom properties. There is no `tailwind.config.{js,ts}`. Do not add one.
- App Router rule: every interactive page/component needs `'use client'` at the top. Layout and non-interactive pages do not.
- Styling mix: global classes live in `src/app/globals.css`; most components use inline `style={{ ... }}` objects instead of utility classes. Match the existing pattern rather than "cleaning up" to Tailwind utilities.
- Color palette is hardcoded dark theme (`#0a0a0a` base, `#00e676` green accent). Do not introduce new palette sources.

## Structure (entrypoints)

```
src/
  app/
    layout.tsx          ← root layout (Geist fonts, Navbar, CustomCursor, footer)
    page.tsx            ← home: vault list + filters + user positions
    ranking/page.tsx    ← ranking view
    events/page.tsx     ← events view
    create/page.tsx     ← create-vault wizard
    vault/[id]/page.tsx ← vault detail
    globals.css         ← theme vars, @theme inline, layout helpers
  components/           ← VaultCard, APYChart, TVLChart, DepositPanel, etc.
  data/
    vaults.ts           ← VAULTS, USER_POSITIONS, helpers (randomized history)
    strategyStats.ts    ← TRADING_STATS, DELTA_STATS (randomized)
  lib/
    types.ts            ← shared TypeScript types (Vault, UserPosition, etc.)
    utils.ts            ← cn, formatCurrency, formatAPY, riskColor, …
```

## Quirks / Gotchas

- `next.config.ts` is intentionally empty; do not add redirects/rewrites/headers unless asked.
- `eslint.config.mjs` uses flat config extending `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript` with explicit `globalIgnores`. Lint only fails on staged/committed files matching the rules.
- No environment loading — there are no `.env*` files and no `process.env` usage. If runtime config is needed, ask before adding env plumbing.
- `public/` contains only static assets (logo, next/vercel/window SVGs, favicons).
- `CLAUDE.md` is a one-line redirect to this file (`@AGENTS.md`). Edit here, not there.

## Playwright MCP

* Playwright MCP is available and should be preferred for browser interactions, UI validation, screenshots, navigation testing, and checking rendered page behavior.
* Before implementing UI changes, inspect the current page with Playwright MCP when the task depends on visual layout, styling, or user interactions.
* After modifying UI-related code, use Playwright MCP to verify the affected flow whenever possible.
* Use Playwright MCP instead of reasoning about browser behavior from source code alone when verification is feasible.
* For Next.js pages running locally, assume the development server is available at `http://localhost:3000` unless otherwise specified.

### Common Playwright Tasks

* Open pages and inspect rendered output.
* Validate responsive layouts and visual regressions.
* Test navigation, forms, dialogs, dropdowns, and interactive components.
* Capture screenshots when useful for debugging.
* Check browser console errors and failed network requests.
* Verify App Router navigation behavior.

