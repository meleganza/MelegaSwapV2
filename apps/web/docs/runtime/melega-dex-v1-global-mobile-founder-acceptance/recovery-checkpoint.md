# Recovery Checkpoint — Global Mobile Founder Acceptance

**Recovered at:** 2026-07-29T22:20:00Z  
**Branch:** `melega-dex-v1-global-mobile-founder-acceptance`  
**Pre-recovery HEAD:** `e4390845` (Liquidity Builder mainnet activation tip)  
**Base confirmed:** `melega-dex-v1-liquidity-builder-mainnet-activation` @ `e4390845`  
**Staged:** none  
**Stash used:** none (legacy stashes left untouched)  
**Evidence dir before recovery:** absent  
**LB addresses:** still all `null` — untouched

## Recovered files

| Path | Changes already implemented | Mission part | Validation | Remaining |
| --- | --- | --- | --- | --- |
| `apps/web/src/design-system/melega/tokens/mobileDensity.ts` (untracked) | Shared mobile density tokens | A/B | source only | wire consumers where useful |
| `apps/web/src/app-shell/MelegaAppShell.tsx` | Header 56px; page pad 16px; bottom clear 64px; `100dvh`/`100svh` | C/D/S | source only | align ticker header constant |
| `apps/web/src/app-shell/GlobalTrendingBar.tsx` | Ticker mobile 36px | C | source only | sync `MOBILE_HEADER_H` to 56px |
| `packages/uikit/.../ScrollToTopButtonV2.tsx` | 48px FAB; above nav; hide on scroll-down; passive listener; a11y label | E | source only | route capture |
| `FarmsHeroArtwork.tsx` | Local `/images/56/tokens/...` logos; initials onError fallback | F/R | source only | live broken-image audit |
| `farmsHeroTokens.ts` | Compact mobile title/artwork/hero max height | F | source only | — |
| `FarmsHeroModule.tsx` | Compact mobile gaps/desc | F | source only | Featured/Top Farms rows |
| `LiquidityInsightsModule.tsx` | 2×2 at ≤767; 1-col only ≤359; compact card/value | G | source only | capture 390/430 |

## Not yet started (resume priority)

| Area | Status |
| --- | --- |
| Bottom navigation height/tokens | incomplete |
| AI Liquidity Builder mobile density | not started |
| Add Liquidity mobile density | not started |
| Wallet modal wrap/height | not started |
| Home KPI compact height | not started |
| Featured carousel clipping | not started |
| Ecosystem cards (430 1-col → keep 2-col) | not started |
| Top Farms compact rows | not started |
| Pools / Passport / List / Project verify | not started |
| Tests + evidence pack + screenshots | not started |

## Freeze confirmation

No edits to contracts, deployment scripts, `liquidityBuildingDeployment.ts` addresses, indexing, or wallet signing.
