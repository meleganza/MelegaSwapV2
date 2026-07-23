# LIQUIDITY_PIXEL_PERFECTION_001 — Report

**Mission:** Pixel-perfect rebuild of the Liquidity page  
**Branch:** `mission-liquidity-pixel-perfection-001`  
**Approved mockup:** `apps/web/docs/runtime/liquidity-pixel-perfection-001/approved-mockup.png`

## Layout locks (desktop ≥1376)

| Region | Spec | Implementation |
|--------|------|----------------|
| Content width | 1376 | `liqOne.contentMax` |
| Margins | 32 | Screen `width: calc(100% - 64px)` |
| Top pad | 32 | `mainTopPad` |
| Col A / gap / Col B | 672 / 32 / 672 | Product grid |
| Main row height | 860 | Fixed left + right |
| LB header | 120 → 72 collapsed | Fixed heights |
| Wizard | 48 | Fixed |
| LB body | 540 | Fixed + overflow auto |
| LB footer | 80 | Fixed |
| Add Liquidity | 520 (120/300/100) | Fixed |
| DEX Snapshot | 324 | Fixed |
| Below gap | 24 | `belowMainGap` |
| Overview | 150 · 5×20% | Fixed |
| Position row | 72 | Fixed |
| Education | 96 | Fixed |

## Behavior

- Wizard replaces **body only**; card height never grows.
- No “Back to Liquidity Studio”, Explore tabs, View Pools, or old-program CTAs.
- Manage / Setup / Budget / Strategy / Review / Activate stay in-card.
- Snapshot uses compact unavailable message — no empty black rectangles.
- DEX TVL never fabricated.

## Tests

82 related Liquidity tests passed including `liquidityPixelPerfection001.test.ts`.

## Verdict

`LIQUIDITY_PIXEL_PERFECTION_001_COMPLETE`
