# R507 — Final Premium Polish

**Status:** `R507_PREMIUM_POLISH_READY`

## Validation

| Check | Result |
|-------|--------|
| `yarn build` | Pass |
| Impacted unit tests | 29/29 pass |
| Route smoke (`r506-route-smoke.mjs`) | 9/9 pass |
| Visual regression | 10 screenshots (desktop + mobile) |

## Deploy

| Target | Status |
|--------|--------|
| Branch `design-system-foundation` | Pending commit + push |
| Staging https://v2.melega.finance | Pending deploy |
| Production / `main` / dex.melega.ai | **Untouched** |

## Screenshots

`docs/screenshots/r507-premium-polish/`

- home-desktop-1440.png
- home-mobile-390.png
- build-studio-desktop-1440.png
- build-studio-mobile-390.png
- collectibles-desktop-1440.png
- collectibles-mobile-390.png
- trade-desktop-1440.png
- pools-desktop-1440.png
- trending-desktop-1440.png
- projects-desktop-1440.png

## Files changed (R507 scope)

### P0 — Home
- `useHomeTradeData.ts` — Top Pool APR via `getAprData` fallback
- `useMarketPulseData.ts` / `MarketPulsePanel.tsx` — compact Latest Block (no ellipsis)
- `ListProjectCta.tsx` / `MelegaCtaCard.tsx` — Build with Melega, wider buttons
- `GrowInsideMelegaPanel.tsx` — SMARTDROP → `/build-studio#build-import`

### P1 — Trade
- `useTradeTerminalData.ts` / `TradeRecentSwaps.tsx` — honest swap indexing state
- `resolveTradeMarketContext.ts` (new) — public MARCO chart sources
- `TradeChartPanel.tsx` / `TradePriceChart.tsx` — DexScreener, GeckoTerminal, CoinGecko links

### P2 — Farms
- `formatFarmsRuntime.ts` — Featured Farm rename, `0 MARCO` when zero emissions

### P3 — Pools
- `formatPoolsRuntime.ts` — deposit/claimable-aware live detection, rewards today honesty

### P4 — Trending
- `TrendingKpiRow.tsx` / `TrendingProjectCard.tsx` — sparkline clearance (16px+)

### P5 — Projects
- `buildFeaturedProjectIntelligence.ts` (new) — Age, Liquidity, Market presence recovery
- `useProjectsIntelligenceRuntime.ts` / `AIProjectAdvisorPanel.tsx`

### P6 — Build Studio
- `BuildStudioImportWorkflow.tsx` (new) — embedded import hero
- `BuildStudioScreen.tsx` — `ImportRuntimeProvider`
- `ImportTokenPanel.tsx` — workflow replaces link-out stub
- `CreateTokenPanel.tsx` — Builder Templates inside Create Token
- `SecondRowCards.tsx` — Create Pool + Create Farm CTAs restored
- `ContractInputHero.tsx` — `embedded` mode

### P7 — Identity Hub
- `FeaturedCollectionPanel.tsx` — BabyMARCO Pinata IPFS artwork

### Tooling
- `capture-r507-premium-polish-screenshots.mjs` (new)

## Remaining blockers

1. **Staging deploy** — commit + push to `design-system-foundation` required before v2.melega.finance updates
2. **On-chain pool count** — live pool eligibility uses runtime deposit/claimable heuristics; full SousChef enumeration depends on configured pool list from hooks (not a new module)
3. **MARCO chart candles** — subgraph still primary; public source links shown when indexed data unavailable (TradingView may still skeleton for unlisted pairs)
4. **Create Token / Farm / Pool CTAs** — visible and enabled in preparation mode; on-chain deployment routes remain future (by design)
