# LIQUIDITY_MODULE_007 — Visual Polish

**Mission:** `LIQUIDITY_MODULE_007_VISUAL_POLISH`  
**Verdict:** `LIQUIDITY_MODULE_007_VISUAL_POLISH_CERTIFIED`  
**Branch:** `mission-liquidity-module-007-visual-polish`  
**Commit:** `67ab4674`  
**Base:** `origin/mission-liquidity-module-006-positions` @ `91921879`

---

## Scope

Visual quality only. No layout, geometry, height, width, features, business logic, or data changes.

| Surface | Change |
| --- | --- |
| Card surfaces | `#101010` + ≤6% radial overlays (top-right brighter / bottom-left darker) |
| Borders | Outer `rgba(255,255,255,.05)` + inset highlight `rgba(255,255,255,.03)` — 1px width preserved |
| Shadows | `0 16px 40px rgba(0,0,0,.35)` — no glow |
| Gold | Desaturated `#C9A84A` / hover `#D4B45C`; card chrome borders de-golded |
| Buttons | Hover / active / focus only — no size change |
| Inputs | Softer fill + sharper focus ring — no geometry |
| Table | Subtle row hover — no zebra |
| Donut | Antialiasing via GPU layer |
| Scrollbar | Desktop thin / dark / rounded |
| Transitions | Opacity + transform `120ms` / `ease` only |

---

## Frozen geometry (asserted)

| Token | Value |
| --- | --- |
| `col` | 672px |
| `mainRowH` | 860px |
| `addH` | 520px |
| `snapH` | 324px |
| `overviewH` | 180px |
| `positionsHeadH` | 64px |
| `positionsTableHeadH` | 52px |
| `positionsRowH` | 68px |
| `lbHeaderExpanded` | 210px |
| `lbFooterH` | 160px |
| `contentMax` | 1376px |

Header, Trending Bar, Hero, LB / Add / Snapshot / Overview / Positions geometry, Footer, mobile + desktop layout: **untouched**.

---

## Files

| File | Role |
| --- | --- |
| `onePage/LiquidityOnePagePolishStyle.tsx` | Scoped global polish (`[data-liquidity-one-page]`) |
| `onePage/onePageTokens.ts` | Color / polish tokens only — geometry locks unchanged |
| `onePage/UnifiedLiquidityPage.tsx` | Mount polish style |
| `onePage/index.ts` | Re-export |
| `__tests__/liquidityModule007.visualPolish.test.ts` | Freeze + polish guards |

---

## Validation

| Check | Result |
| --- | --- |
| Vitest MODULE_003–007 | **21/21 passed** |
| `yarn next build` | **passed** |
| Geometry tokens frozen | **pass** |
| Forbidden DEX core files | **untouched** |
| Layout / geometry CSS in polish (excl. scrollbar chrome) | **none** |

---

## Certification

`LIQUIDITY_MODULE_007_VISUAL_POLISH_CERTIFIED`
