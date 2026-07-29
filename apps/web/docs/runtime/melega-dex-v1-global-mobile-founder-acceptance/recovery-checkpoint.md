# Recovery Checkpoint — Global Mobile Founder Acceptance

**Recovered at:** 2026-07-29T22:20:00Z  
**Completed at:** 2026-07-29T22:40:00Z  
**Branch:** `melega-dex-v1-global-mobile-founder-acceptance`  
**Pre-recovery HEAD:** `e4390845` (Liquidity Builder mainnet activation tip)  
**Recovery checkpoint commit:** `5b692f5f`  
**Base confirmed:** `melega-dex-v1-liquidity-builder-mainnet-activation` @ `e4390845`  
**Staged at recovery:** none  
**Stash used:** none (legacy stashes left untouched)  
**LB addresses:** still all `null` — untouched

## Recovered files (pre-crash checkpoint)

| Path | Changes already implemented | Mission part | Validation | Remaining |
| --- | --- | --- | --- | --- |
| `apps/web/src/design-system/melega/tokens/mobileDensity.ts` | Shared mobile density tokens | A/B | PASS (unit + build) | none |
| `apps/web/src/app-shell/MelegaAppShell.tsx` | Header 56px; page pad 16px; bottom clear 64px; `100dvh`/`100svh` | C/D/S | PASS | none |
| `apps/web/src/app-shell/GlobalTrendingBar.tsx` | Ticker 36px; header sync 56px | C | PASS | none |
| `packages/uikit/.../ScrollToTopButtonV2.tsx` | 48px FAB; above nav; hide on scroll-down; passive; a11y | E | PASS (capture) | none |
| `FarmsHeroArtwork.tsx` | Local `/images/56/tokens/...`; initials onError | F/R | PASS (0 broken) | none |
| `farmsHeroTokens.ts` | Compact mobile title/artwork/hero max | F | PASS | none |
| `FarmsHeroModule.tsx` | Compact mobile gaps/desc | F | PASS | none |
| `LiquidityInsightsModule.tsx` | 2×2 ≤767; 1-col ≤359; compact cards | G | PASS (390/430) | none |

## Post-recovery completion

| Path | Mission part | Validation |
| --- | --- | --- |
| `MelegaBottomNavigation.tsx` | bottom nav 64px + safe-area | PASS |
| `DexHomeScreen.tsx` | KPI / Top Farms compact | PASS |
| `ExploreMelegaEcosystem.tsx` | 2-col @430, 68px | PASS |
| `FeaturedProjectsRail.tsx` | snap + contain | PASS |
| `LiquidityBuildingCard.tsx` | mobile densify | PASS (source + build) |
| `LiquidityAddModule.tsx` | mobile densify | PASS (source + build) |
| `WalletModal.tsx` | compact wrap | PASS |
| Farms freeze SHA cascade | keep farms suites green | PASS |
| `globalMobileFounderAcceptance.test.ts` | locks | 15/15 PASS |
| Evidence pack under `docs/runtime/...` | Part I | complete |

## Freeze confirmation

No edits to contracts, deployment scripts, `liquidityBuildingDeployment.ts` addresses, indexing semantics, or wallet signing.
