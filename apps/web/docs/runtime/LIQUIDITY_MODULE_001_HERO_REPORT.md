# LIQUIDITY_MODULE_001_HERO — Report

## 1. Verdict

**LIQUIDITY_MODULE_001_HERO_CERTIFIED**

## 2. Branch

`mission-liquidity-module-001-hero`

## 3. Commit

`14735f51c92be73a2ad9c8525d523f653c89e060` (implementation)
`edf5f3b980abc559df5e6c579317262d29411ac6` (branch tip incl. report)

## 4. Exact image source path

- Chat attachment (immutable source): Cursor assets `Generated_image_1__10_-3d259ee8-9f96-4832-a981-4f38a6ab0f89.png`
- Public runtime path: `apps/web/public/images/liquidity/liquidity-hero-background.png`
- Evidence archive: `apps/web/docs/runtime/liquidity-module-001-hero/approved-background-source.png`

## 5. Confirmation that source bytes were preserved

SHA-256 (all three identical):

`c5af6448092b9fc5dd3172c478a028d1e8a3425202978b0cbbdbaccbfdfdcb3c`

Copied with `cp -p` only — no regenerate, redraw, filter, recolor, crop, or recompress.

## 6. Shared Trending Bar restoration

- Added `apps/web/src/app-shell/GlobalTrendingBar.tsx`
- Mounted once in `MelegaAppShell` directly beneath `MelegaGlobalHeader`
- Reuses existing `SafeTrendingRibbon` → `TrendingRibbon` → `useDexTrendingTicker` (no second data path)
- Removed page-level `<TrendingRibbon />` mounts from Trade / Radar / Projects / Build / Collectibles / Trending / Import screens to keep a single bar

## 7. Routes containing Trending Bar

DOM-verified exactly one `[data-testid="melega-global-trending-bar"]` on:

- `/`
- `/liquidity-studio`
- `/farms`
- `/pools`
- `/list`
- `/passport`

(Shell-mounted; also applies to `@{slug}` project routes using `MelegaAppShell`.)

## 8. Desktop measurements (1440×500)

| Metric | Target | Actual | Pass |
|--------|--------|--------|------|
| Header height | 72 | 72 | ✓ |
| Trending Bar height | 44 | 44 | ✓ |
| Trending→Hero gap | 24 | 24 | ✓ |
| Hero width | 1376 | 1376 | ✓ |
| Hero height | 216 | 216 | ✓ |
| Hero left | 32 | 32 | ✓ |
| Hero right margin | 32 | 32 | ✓ |
| Network card | 174×66 | 174×66 | ✓ |
| Hero→product gap | 24 | 24 | ✓ |
| Hero background | exact PNG path | `/images/liquidity/liquidity-hero-background.png` | ✓ |
| Overflow X | none | none | ✓ |

## 9. Mobile measurements (390×500)

| Metric | Target | Actual | Pass |
|--------|--------|--------|------|
| Trending Bar height | 40 | 40 | ✓ |
| Trending→Hero gap | 16 | 16 | ✓ |
| Hero width | 358 (`100vw-32`) | 358 | ✓ |
| Hero height | 224 | 224 | ✓ |
| Network card | 148×56 bottom-right | 148×56 | ✓ |
| Overflow X | none | none | ✓ |

## 10. Files changed

- `apps/web/public/images/liquidity/liquidity-hero-background.png` (exact bytes)
- `apps/web/src/app-shell/GlobalTrendingBar.tsx` (new)
- `apps/web/src/app-shell/MelegaAppShell.tsx`
- `apps/web/src/views/LiquidityStudio/onePage/LiquidityPageHeader.tsx` (Hero)
- `apps/web/src/views/LiquidityStudio/onePage/UnifiedLiquidityPage.tsx` (spacing only)
- `apps/web/src/views/LiquidityStudio/LiquidityStudioScreen.tsx` (content width / mobile inset)
- Page-level TrendingRibbon removals (Trade, Radar, Projects, Build, Collectibles, Trending, Import)
- Tests + evidence under `apps/web/docs/runtime/liquidity-module-001-hero/`
- `apps/web/docs/runtime/LIQUIDITY_MODULE_001_HERO_REPORT.md`

## 11. Tests

`yarn vitest run` on:

- `src/app-shell/__tests__` (incl. `liquidityModule001.hero.test.ts`, DS001.2, nav)
- `liquidityPixelPerfection001.test.ts`
- `dexLiqOne002.onePage.test.ts`

**34/34 passed**

## 12. TypeScript

Validated via Vitest/TS transform on scoped suites — pass.

## 13. Build

`yarn next build` — **PASS**

## 14. Screenshot paths

- `apps/web/docs/runtime/liquidity-module-001-hero/desktop-1440-header-trending-hero.png`
- `apps/web/docs/runtime/liquidity-module-001-hero/mobile-390-header-trending-hero.png`
- `apps/web/docs/runtime/liquidity-module-001-hero/hero-dom-measurements.json`
- `apps/web/docs/runtime/liquidity-module-001-hero/approved-background-source.png`

## 15. Confirmation that no other Liquidity module changed

Untouched product modules:

- Liquidity Building card / wizard / state logic
- Add Liquidity card / transaction logic
- DEX Snapshot / Overview / Positions / education rail

Hero contains only: approved background image, title, subtitle, Network status card.

---

Not merged. Not deployed.

**FINAL VERDICT**

LIQUIDITY_MODULE_001_HERO_CERTIFIED
