# R102 — DEX Functional Completion Sprint 1 Report

**Mission:** Close critical functional gaps from R101 (Trending mock, Import mock, dead CTAs, fake AI claims).  
**Branch:** `design-system-foundation`  
**Date:** 2026-07-04

---

## Summary

R102 replaces static fiction with live runtimes on Trending and Import Existing Token, wires or honestly disables primary dead CTAs across Trade/Pools/Farms/Projects/Radar/Build/Collectibles, and adds collapsed machine JSON exports where missing.

**Estimated completeness:** **72/100** (up from R101 **61/100**).

---

## Features fixed

### Part 1 — Trending runtime
- Added `apps/web/src/views/TrendingStudio/trendingRuntime/` (Projects + Radar + registry sources).
- Removed static `TRENDING_KPIS`, whale/smart-money fiction, fixed “Strong Buy”.
- Whale / smart money → **Unavailable**; scores use **Runtime Signal**, **Indexed**, **Insufficient Data**.
- Cards link to `/projects`, `/radar?contract=…`, `/swap?outputCurrency=…` when available.
- Filters apply to live data; machine JSON collapsed by default (`TrendingMachinePanel`).
- Tests: `yarn test trendingRuntime` — 7 passed.

### Part 2 — Import Existing Token runtime
- Added `importExistingTokenRuntime/` using `runImportAnalysis()`, pending registry, manifest, advisor.
- Removed Golden Lion / GLION mock; `analyzed` starts `false`.
- Unknown contract → pending review profile; known → canonical project.
- Machine JSON via `ImportMachinePanel` (collapsed default).
- Tests: `yarn test importExistingTokenRuntime` — 5 passed.

### Part 3 — Dead CTA cleanup
| Area | Fix |
|------|-----|
| Trade | View All Routes, Manage Assets, Router Analytics, How it works → disabled “Coming soon”; disabled tabs labeled |
| Pools | Create Pool / Reward MARCO → `/build-studio?intent=…`; Featured Analyze expands; Unstake when staked |
| Farms | Featured Analyze expands; Withdraw when staked |
| Projects | Follow persists via localStorage; Trade/Radar/Project links from runtime |
| Radar | Trade/Open Project routed; View Complete Analysis opens machine panel |
| Build Studio | Import CTA → `/import-existing-token`; SmartDrop without href disabled |
| Collectibles | View All Insights expands machine panel; `CollectiblesMachinePanel` added |

### Part 4 — Machine readability
- Trending, Import, Collectibles: collapsed machine JSON toggles on screen.

---

## Remaining gaps from R101

| Gap | Status after R102 |
|-----|-------------------|
| Trade Router / Limit / History tabs | UI only — labeled Coming soon |
| Trade route analytics, manage assets, how-it-works docs | Disabled honestly |
| Real whale / smart-money feeds | Unavailable (not fabricated) |
| On-chain holder growth / momentum time series | Insufficient Data where feeds missing |
| Build Studio AI Infrastructure Guide CTA | Still no doc panel (outline only) |
| Production domain on `main` | Unchanged |
| `src/design-system` components.test.tsx | Pre-existing `react-dom/client` env failure |

---

## Validation

| Check | Result |
|-------|--------|
| `yarn build` | ✅ Pass |
| `yarn test trendingRuntime` | ✅ 7/7 |
| `yarn test importExistingTokenRuntime` | ✅ 5/5 |
| `yarn test projectsRuntime` | ✅ 5/5 |
| `yarn test radarRuntime` | ✅ 6/6 |
| `yarn test buildRuntime` | ✅ 5/5 |
| `yarn test commandCenterRuntime` | ✅ 6/6 |
| `yarn test collectiblesRuntime` | ✅ 9/9 |
| `yarn test src/lib/homepage-live` | ✅ 2/2 |
| `yarn test src/design-system` | ⚠️ 8/8 unit tests pass; `components.test.tsx` suite fails (pre-existing env) |

Route smoke (staging): `/`, `/trade`, `/trending`, `/import-existing-token`, `/projects`, `/radar`, `/build-studio`, `/command-center`.

---

## Acceptance checklist

1. ✅ `/trending` — no static fake whale/smart-money/strong-buy data  
2. ✅ `/trending` consumes Projects/Radar/runtime sources  
3. ✅ `/import-existing-token` — no Golden Lion mock  
4. ✅ Unknown contract → pending registry profile  
5. ✅ Known contract → canonical project  
6. ✅ No primary CTA silently dead (wired or disabled)  
7. ✅ No fake AI strong-buy claims on Trending  
8. ✅ Machine JSON for Trending, Import, Collectibles  
9. ✅ Build passes  
10. ✅ Runtime tests pass  

---

## Matrix updates

See [`DEX_IMPLEMENTATION_MATRIX.md`](./DEX_IMPLEMENTATION_MATRIX.md): Trending Runtime 🟨→🟩; Import page explicitly R102-wired.
