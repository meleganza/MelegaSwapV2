# R702 — Pools Pixel-Perfect Validation

**Status:** Local implementation complete — not committed  
**Base:** `1d61a80` (R601 + R701)

## Build

| Check | Result |
|-------|--------|
| `yarn build` | Pass |
| `poolsAprRules.test.ts` | 5/5 pass |

## Screenshots

Path: `docs/screenshots/r702-pools-pixel/`

| File | Description |
|------|-------------|
| `pools-desktop-1440-before.png` | R701 baseline |
| `pools-desktop-1440-after.png` | R702 desktop |
| `pools-mobile-390-before.png` | R701 mobile baseline |
| `pools-mobile-390-after.png` | R702 mobile |
| `pools-featured-expanded-before.png` | R701 expanded |
| `pools-featured-expanded-after.png` | R702 expanded |

## R702 Checklist

| Requirement | Status |
|-------------|--------|
| Grid 1440 / 1280 / 80px margins | Yes |
| Header POOLS 72px Orbitron 700 | Yes |
| Subtitle 18px / 32px line-height | Yes |
| KPI row 5×136px, 20px gap | Yes |
| KPI: Total Rewards Distributed Today | Yes |
| Featured 460px, 65/35 | Yes |
| Featured right: info stack (not donut) | Yes |
| Featured buttons Stake 220×56, Analyze 180×56 | Yes |
| Filters 48px height, 12px gap, no wrap | Yes |
| Pool cards 420×420 → 620 expanded | Yes |
| APR 56px grid cards, 72px featured | Yes |
| APR normalization by pool type | Yes |
| LIVE: budget >$1, enabled, remaining >0 | Yes |
| Analyze → Hide Analysis, 250ms height | Yes |
| Mobile sticky featured Stake | Yes |
| Machine JSON `melega.pool.v2` preserved | Yes |

## Modified Files

- `poolsStudioTokens.ts`
- `poolsStudioData.ts`
- `poolsRuntime/poolsAprRules.ts` (new)
- `poolsRuntime/formatPoolPresentation.ts`
- `poolsRuntime/formatPoolsRuntime.ts`
- `poolsRuntime/usePoolsStakingRuntime.ts`
- `poolsRuntime/__tests__/poolsAprRules.test.ts` (new)
- `components/PoolsStudioPageHeader.tsx`
- `components/PoolsKpiRow.tsx`
- `components/FeaturedPoolPanel.tsx`
- `components/FeaturedPoolInfoStack.tsx` (new)
- `components/PoolGridCard.tsx`
- `components/PoolsFilterRow.tsx`
- `components/PoolsGrid.tsx`
- `PoolsStudioScreen.tsx`
- `PoolsStudioGlobalStyle.tsx`
- `scripts/capture-r702-pools-screenshots.mjs` (new)

## Unchanged (per spec)

Global layout shell, sidebar, header, ticker, design system tokens, on-chain stake/claim flows.
