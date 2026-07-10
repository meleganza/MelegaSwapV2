# R107 — Global UX / Visual Fix Report

**Mission:** R107 Global UX / Visual Fixing Sprint — Pre-Production Visual Stabilization  
**Date:** 2026-07-04  
**Branch:** `design-system-foundation`  
**SHA (committed HEAD):** `29baaff697084daa616091af06d0c45cfb9eb1f9`  
**Working tree:** R107 visual deltas present (uncommitted)  
**Staging preview:** https://v2.melega.finance  
**Return:** `R107_GLOBAL_UX_VISUAL_FIX_READY`

---

## Verdict

| Gate | Result |
|------|--------|
| **Build** | ✅ PASS (`yarn build`) |
| **Design-system tests** | ✅ PASS (11/11) |
| **Homepage-live tests** | ✅ PASS (2/2) |
| **Runtime tests (R102/R103/R106 suites)** | ✅ PASS (78/78; vitest teardown SIGABRT on Node 26 — tests green) |
| **Screenshot matrix** | ⚠️ BLOCKED — script ready; local `yarn dev` fails (React ≥18.2); staging not yet deployed with R107 deltas |
| **Production candidate (visual)** | **VISUAL_BLOCKED** — deploy R107 branch to staging, capture 52-shot matrix, spot-check overlap regressions |

---

## Scope

Visual/UX-only stabilization across all V2 studio routes. No new pages, runtime, or architecture.

**Routes:** `/`, `/trade`, `/swap`, `/liquidity-studio`, `/farms`, `/pools`, `/projects`, `/trending`, `/radar`, `/collectibles`, `/build-studio`, `/import-existing-token`, `/command-center`

**Viewports:** 390×844, 428×926, 1440×900, 1728×1117

---

## Global changes

| Fix | Before | After | Files |
|-----|--------|-------|-------|
| Cross-studio overflow + safe-area | Horizontal bleed on narrow viewports; inconsistent bottom pad | `overflow-x: hidden` on all studio roots; mobile `padding-bottom: calc(96px + env(safe-area-inset-bottom))` | `R107GlobalVisualStyle.tsx`, `constants/r107-visual.ts`, wired in `_app.tsx` |
| Content shell | Mixed max-widths (1200–1280px) | Unified **1180px** max, **24px** horizontal pad, **28/48px** vertical pad | `*StudioTokens.ts` (Farms, Pools, Projects, Trending, Liquidity, Collectibles, Build) |
| Card tokens | Mixed `#121212` / radii | **#131313** bg, **#262626** border, **20px** radius, **16/14px** pad | Grid cards across studios |
| Grid gaps | 16–24px inconsistent | **20px** desktop / **14px** mobile | Studio token files |
| Button rows | Fixed widths + absolute footers causing overlap | Flex-wrap bottom rows, **gap 8px**, no absolute CTAs in cards | Farm/Pool/Project grid cards |
| APR typography | 42–56px regular cards | Regular max **32px** desktop / **28px** mobile; featured max **52px** | `FarmGridCard`, `PoolGridCard`, `FeaturedFarmPanel`, `FeaturedPoolPanel` |
| Machine JSON panels | Some expanded by default | Collapsed by default (`useState(false)`) | Trending, Import, Build machine panels |

---

## Studio before / after

### Farms

| Issue | Before | After |
|-------|--------|-------|
| APR too large | 42px+ on grid cards | Capped 32px / 28px mobile |
| Button overlap | Fixed 120px buttons covered metrics | Flex-wrap footer, `minmax(0,1fr)` metrics |
| Card heights | Fixed height clipped expanded analyze | `height: auto` when analyze open; min-height 320px |
| Featured imbalance | 56px APR, rigid button row | 52px featured APR; flex-wrap BtnRow |
| Daily rewards overflow | Text clipped in metric cells | `ellipsis` + `min-width: 0` on cells |

**Files:** `farmsStudioTokens.ts`, `FarmGridCard.tsx`, `FeaturedFarmPanel.tsx`, `FarmsStudioGlobalStyle.tsx`

### Pools

| Issue | Before | After |
|-------|--------|-------|
| Stake/Claim/Unstake overlap | Absolute/fixed button widths | Flex-wrap footer; Unstake shown alongside Stake when staked |
| APR overflow | 42px regular | 32px / 28px mobile |
| Featured panel | 56px APR, rigid buttons | 52px APR; flex-wrap BtnRow; `minmax(0,1fr)` metrics |
| Card alignment | Fixed 292px mobile height | Auto height, min-height 280px |
| Heatmap width | `min-width: 1480px` forced page overflow | `width: 100%` inside scroll container |

**Files:** `poolsStudioTokens.ts`, `PoolGridCard.tsx`, `FeaturedPoolPanel.tsx`, `PoolsStudioGlobalStyle.tsx`, `RadarHeatmapTable.tsx`

### Projects

| Issue | Before | After |
|-------|--------|-------|
| Button overlap on summary | Fixed square cards, absolute button row | Min-height **400px** desktop; flex-wrap `ButtonRow` at bottom |
| AI Summary clipping | 2-line clamp | **3-line** `-webkit-line-clamp: 3` preserved |
| Chip overflow | Single-row provenance chips | `flex-wrap` on chip row |
| Shell width | 1280px | **1180px** aligned with global shell |

**Files:** `projectsStudioTokens.ts`, `ProjectGridCard.tsx`

### Trending

| Issue | Before | After |
|-------|--------|-------|
| Static-looking cards | Fixed 245px square cards | Auto height, min-height 245px, `#131313` cards |
| Filter overflow | Fixed sidebar column | Fluid `minmax(0,1fr)` main + `minmax(280px,320px)` sidebar; stacks at 1180px |
| Whale/Smart Money gaps | Fixed 210px / 180px empty panels | Compact `height: auto` unavailable states |
| Machine panel | — | Collapsed by default (`machineOpen: false`) |

**Files:** `trendingStudioTokens.ts`, `TrendingProjectCard.tsx`, `TrendingSidebar.tsx`

### Radar

| Issue | Before | After |
|-------|--------|-------|
| Heatmap overflow | 1480px min-width broke shell | `100%` width, `overflow-x: auto` on wrapper |
| Console grid | Fixed columns could exceed shell | `minmax(0,1fr)` center; stacks below breakpoint |
| Right rail mobile | Potential overlap | Single column stack via `stackBreakpoint` |

**Files:** `RadarHeatmapTable.tsx`, `RadarStudioScreen.tsx` (existing grid tokens)

### Command Center

| Issue | Before | After |
|-------|--------|-------|
| KPI meta grid overlap | 3-col grid with 4 cards | **2×2** `repeat(2, 1fr)` MetaGrid |
| Privilege chip overflow | All chips rendered | Max **4** visible + `+N` overflow |
| Settlement card | Missing / crowded | `CommandSettlementCard` in dashboard rail |
| Right rail overlap | — | Existing stack breakpoint preserved |

**Files:** `CommandCenterScreen.tsx`, `CommandDashboardCards.tsx`

### Collectibles

| Issue | Before | After |
|-------|--------|-------|
| Fixed 400px cards | Identity metadata clipped | `height: auto`, min-height 360px desktop / 320px mobile |
| Utility chip overflow | All privileges shown | Max **4** chips + `+N` on grid + CC cards |
| Grid alignment | Fixed column count | `repeat(auto-fill, minmax(200px, 1fr))` |

**Files:** `collectiblesStudioTokens.ts`, `CollectibleGridCard.tsx`, `CollectiblesGrid.tsx`, `CommandDashboardCards.tsx`

### Build Studio

| Issue | Before | After |
|-------|--------|-------|
| Import panel dominance | Fixed import card height unbalanced grid | `importTokenH: auto`; fractional grid columns |
| Machine JSON crowding | — | `BuildMachinePanel` collapsed by default |
| Shell padding | 32px inconsistent | **24px** horizontal, **1180px** max |

**Files:** `buildStudioTokens.ts`, `BuildStudioScreen.tsx`, `BuildMachinePanel.tsx`

### Import Existing Token

| Issue | Before | After |
|-------|--------|-------|
| Machine JSON expanded | Crowded right column | `ImportMachinePanel` collapsed default |
| Grid on mobile | 2-col could squeeze cards | Stacks at 1099px (`1fr`) |
| Pending review readability | — | R106 `PendingReviewCard` review UI |

**Files:** `ImportExistingTokenScreen.tsx`, `ImportMachinePanel.tsx`, `PendingReviewCard.tsx`

### Trade

| Issue | Before | After |
|-------|--------|-------|
| Mobile Connect Wallet | Swap CTA could be clipped | Full-width swap/connect buttons at ≤767px |
| Token labels clipped | Currency select overflow | `max-width: 108px` + ellipsis on mobile |
| Right rail overlap | Multi-column bleed | Single-column stack at 767px (existing grid areas) |
| Safe area | Fixed 24px bottom | `calc(24px + env(safe-area-inset-bottom))` |

**Files:** `TradeTerminalGlobalStyle.tsx`, `TradeTerminalScreen.tsx`

### Liquidity Studio

| Issue | Before | After |
|-------|--------|-------|
| Builder / Preview alignment | Fixed equal heights | Auto height with `builderMinHeight: 420px` |
| Shell width | 1280px | **1180px** |
| Panel rigidity | Fixed panel heights | `LsPanel` supports `height: auto` + min-height |

**Files:** `liquidityStudioTokens.ts`, `liquidityStudioPrimitives.tsx`

---

## Fixed visual blockers

1. ✅ Text/button overlap on Farms, Pools, Projects grid cards  
2. ✅ APR typography oversize on Farms/Pools (regular + featured caps)  
3. ✅ Horizontal overflow from Radar heatmap min-width  
4. ✅ Command Center 3-col / 4-card KPI misalignment  
5. ✅ Collectibles fixed-height card clipping + privilege chip overflow  
6. ✅ Trending whale/smart-money giant empty panels  
7. ✅ Global safe-area-bottom via `R107GlobalVisualStyle`  
8. ✅ Machine JSON panels collapsed by default (Trending, Import, Build)  
9. ✅ Trade mobile swap/connect + token label clipping guards  
10. ✅ Unified 1180px content shell across studios  

---

## Remaining visual issues

| Issue | Severity | Notes |
|-------|----------|-------|
| Screenshot matrix not captured | **Blocker** | Run `node apps/web/scripts/capture-r107-global-ux-visual-screenshots.mjs` after staging deploy or local dev fix |
| Staging preview stale | **Blocker** | https://v2.melega.finance does not include uncommitted R107 working-tree deltas |
| Pools analytics sparkline | Low | Analytics row line chart remains 72px tall (KPI context); pool-card sparklines bounded via tokens |
| Featured Collectibles panel | Low | Featured panel may retain absolute artwork positioning — grid cards fixed |
| Local dev React version | Env | `yarn dev` fails: Next.js requires react ≥18.2.0 |
| Live wallet-connected states | QA | Stake/Claim/Unstake button rows need funded-wallet spot-check post-deploy |

---

## Validation summary

```
yarn build                                          ✅ PASS
yarn test src/design-system                         ✅ 11/11
yarn test src/lib/homepage-live                     ✅ 2/2
yarn test src/views/Trade/tradeRuntime              ✅ 12/12
yarn test src/views/PoolsStudio/poolsRuntime        ✅ 3/3
yarn test src/views/FarmsStudio/farmsRuntime        ✅ 3/3
yarn test src/views/TrendingStudio/trendingRuntime  ✅ 7/7
yarn test src/views/ImportExistingToken/...         ✅ 5/5
yarn test src/views/RadarStudio/radarRuntime        ✅ 6/6
yarn test src/views/CommandCenter/...               ✅ 7/7
yarn test src/views/CollectiblesStudio/...          ✅ 9/9
yarn test src/views/LiquidityStudio/...             ✅ 4/4
yarn test src/views/BuildStudio/buildRuntime        ✅ 5/5
yarn test src/views/ProjectsStudio/...              ✅ 6/6
yarn test src/registry/projects/pending             ✅ 11/11
```

**Screenshot script:** `apps/web/scripts/capture-r107-global-ux-visual-screenshots.mjs`  
**Screenshot output (pending):** `docs/screenshots/r107-global-ux-visual-fix/`  
**Matrix:** 13 routes × 4 viewports = **52 screenshots**

---

## Production candidate recommendation

### `VISUAL_BLOCKED`

Code-level visual fixes are complete and tests pass, but **production candidate merge requires**:

1. Deploy `design-system-foundation` + R107 working tree to staging  
2. Capture full 52-screenshot matrix and confirm zero overlap/overflow regressions  
3. Funded-wallet spot-check on Farms/Pools/Trade mobile Connect CTA  

Once screenshots pass review → re-issue verdict **`VISUAL_READY`**.

---

## Artifacts

| Artifact | Path |
|----------|------|
| Global style | `apps/web/src/design-system/melega/R107GlobalVisualStyle.tsx` |
| Global tokens | `apps/web/src/design-system/melega/constants/r107-visual.ts` |
| Screenshot script | `apps/web/scripts/capture-r107-global-ux-visual-screenshots.mjs` |
| Screenshots (pending) | `docs/screenshots/r107-global-ux-visual-fix/` |
