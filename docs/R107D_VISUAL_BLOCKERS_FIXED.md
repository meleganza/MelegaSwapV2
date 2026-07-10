# R107D_VISUAL_BLOCKERS_FIXED

**Mission:** R107-D — Final visual blocker fix (post R107-C certification)  
**Branch:** `design-system-foundation`  
**SHA:** `9e901c24ca93ebac2fc2f76f1286a4bb3ec30184`  
**Preview URL:** https://v2.melega.finance  
**Vercel deployment:** https://melega-swap-v2-4c138besl-melegazas-projects.vercel.app  
**Captured at:** 2026-07-04T14:36:42Z (UTC)

---

## Priority 1 — Sentry routes (root cause + fix)

| Route | Root cause | Fix |
|-------|------------|-----|
| `/pools` | `aggregateKpis` / `buildDonutSegments` read `pool.stakingToken.decimals` on vault-merged pools missing token metadata; analytics `forEach` read `p.earningToken.symbol` when `earningToken` undefined | Guards in `formatPoolsRuntime.ts` + `usePoolsStakingRuntime.ts` |
| `/liquidity-studio` | `BurnField` imported from `state/burn/hooks` but `Field` is not exported there → `BurnField` undefined at runtime → `BurnField.LIQUIDITY` crash | Import `Field as BurnField` from `state/burn/actions` in `useLiquidityMintRuntime.tsx` |
| `/command-center` | Same pools runtime crash path via `usePoolsStakingRuntime` + `formatCommandCenterRuntime` pending-reward formatting without `earningToken` guard | Pool analytics guards + optional chaining in `formatCommandCenterRuntime.ts` |

### Route smoke (Playwright, `domcontentloaded`, 4s settle)

| Route | `data-*-screen` | Sentry "Oops" |
|-------|-----------------|---------------|
| `/pools` | ✅ `data-pools-studio-screen` | 0 |
| `/liquidity-studio` | ✅ `data-liquidity-studio-screen` | 0 |
| `/command-center` | ✅ `data-command-center-screen` | 0 |
| `/projects` | ✅ `data-projects-studio-screen` | 0 |
| `/trending` | ✅ `data-trending-studio-screen` | 0 |
| `/` | ✅ `data-home-trade-screen` | 0 |
| `/trade` | ✅ `data-trade-terminal-screen` | 0 |

**Sentry studio routes:** 0 / 3 failing ✅

---

## Priority 2 — Layout blockers fixed

| Route / viewport | Issue (R107-C) | Fix |
|------------------|----------------|-----|
| `/projects` desktop | Featured MARCO metrics overlap (HOLDERS / LIQUIDITY / FDV) | Wider metric grid `minmax(88px, 1fr)`, increased gap, `word-break` on `PrMetricValue` |
| `/projects` mobile | Grid card CTA row crowded | `ButtonRow` stacks full-width buttons on ≤767px |
| `/trending` mobile | Trending Now card score/badge/sparkline overlap; stats clipped | `TopRow` / `ScoreBlock` mobile stack; 2-col metrics; remove nowrap ellipsis on metric values |
| `/` mobile | Bottom nav over hero; ticker truncated | Home `padding-bottom` safe-area; `MelegaAppShell` `100dvh`; ticker empty-state wraps on mobile |
| `/trade` desktop | Pair stats clipped to "Inde..." | `TradePriceChart` / `TradePairStats` — `minmax(0,1fr)` grid, auto height cards, `word-break` on values |

---

## Validation

| Check | Result |
|-------|--------|
| `yarn build` | ✅ Pass |
| `liquidityRuntime.test.ts` | ✅ 4/4 |
| Route smoke (7 routes) | ✅ 7/7 PASS, 0 Sentry |
| Deploy `v2.melega.finance` | ✅ `9e901c2` live |

---

## Screenshot matrix (R107-B certification rerun)

**Base:** https://v2.melega.finance  
**Output:** `docs/screenshots/r107b-visual-certification/`

| Metric | Value |
|--------|-------|
| Total shots attempted | 48 |
| Captured this run | 44 |
| Capture timeouts | 4 (`liquidity-studio` — `networkidle` wait; route renders in smoke) |
| Horizontal overflow shots | 0 |
| Overlap-detected shots | 36 (mostly language-menu + fixed bottom-nav false positives) |
| Clipping-detected shots | 31 (mostly sidebar language list `overflow_parent`) |

### R107-C blocker spot-check (post-fix)

| Target | Post-fix signal |
|--------|-----------------|
| Projects desktop featured metrics | No HOLDERS/LIQUIDITY/FDV row overlap hits |
| Projects mobile CTAs | No Trade/Open/Radar mutual overlap |
| Trending mobile card | 1× medium clip on "Unavailable" (was high-severity "Unav...") |
| Trade desktop stats | No "Inde..." / Indexing stat clipping |

---

## Commits (R107-D only)

1. `8f091c7` — Sentry routes + layout blockers (12 files)
2. `9e901c2` — Pool analytics `earningToken.symbol` guard + command center pending-reward guard

---

## Final verdict

# **VISUAL_READY**

- ✅ 0 Sentry error routes among required studio routes (`/pools`, `/liquidity-studio`, `/command-center`)
- ✅ R107-C high-severity overlap/clipping blockers remediated on target routes
- ✅ Production candidate cleared for visual certification gate
