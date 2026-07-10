# R507.1 — Staging Deploy

**Status:** `R5071_STAGING_READY`

## Commit

| Field | Value |
|-------|-------|
| SHA | `d7ed2e8e99cdd5bbbcda4830dead4910892d62be` |
| Short | `d7ed2e8` |
| Branch | `design-system-foundation` |
| Message | R507 PREMIUM POLISH READY |

## Staging

| Field | Value |
|-------|-------|
| URL | https://v2.melega.finance |
| Deploy SHA | `d7ed2e8` (Preview, 2026-07-05T16:38:16Z) |
| Trigger | `git push origin design-system-foundation` → Vercel (`vercel.json` branch enabled) |

## Untouched

| Target | SHA / state |
|--------|-------------|
| `main` | `5d4818fc` — **untouched** |
| Production | **untouched** |
| dex.melega.ai | **untouched** |

## Validation (pre-commit)

| Check | Result |
|-------|--------|
| `yarn build` | Pass |
| Impacted tests | 29/29 pass |
| Route smoke | 9/9 pass |

## Files committed (42)

- `apps/web/scripts/capture-r507-premium-polish-screenshots.mjs`
- `apps/web/src/lib/trade-market/resolveTradeMarketContext.ts`
- `apps/web/src/design-system/melega/components/CtaCard/MelegaCtaCard.tsx`
- `apps/web/src/views/BuildStudio/BuildStudioScreen.tsx`
- `apps/web/src/views/BuildStudio/components/BuildStudioImportWorkflow.tsx`
- `apps/web/src/views/BuildStudio/components/CreateTokenPanel.tsx`
- `apps/web/src/views/BuildStudio/components/ImportTokenPanel.tsx`
- `apps/web/src/views/BuildStudio/components/SecondRowCards.tsx`
- `apps/web/src/views/CollectiblesStudio/components/FeaturedCollectionPanel.tsx`
- `apps/web/src/views/FarmsStudio/farmsRuntime/formatFarmsRuntime.ts`
- `apps/web/src/views/FarmsStudio/farmsRuntime/useFarmsStakingRuntime.ts`
- `apps/web/src/views/FarmsStudio/farmsStudioData.ts`
- `apps/web/src/views/HomeTrade/GrowInsideMelegaPanel.tsx`
- `apps/web/src/views/HomeTrade/ListProjectCta.tsx`
- `apps/web/src/views/HomeTrade/MarketPulsePanel.tsx`
- `apps/web/src/views/HomeTrade/useHomeTradeData.ts`
- `apps/web/src/views/HomeTrade/useMarketPulseData.ts`
- `apps/web/src/views/ImportExistingToken/components/ContractInputHero.tsx`
- `apps/web/src/views/PoolsStudio/poolsRuntime/formatPoolsRuntime.ts`
- `apps/web/src/views/PoolsStudio/poolsRuntime/usePoolsStakingRuntime.ts`
- `apps/web/src/views/PoolsStudio/poolsStudioData.ts`
- `apps/web/src/views/ProjectsStudio/components/AIProjectAdvisorPanel.tsx`
- `apps/web/src/views/ProjectsStudio/projectsRuntime/buildFeaturedProjectIntelligence.ts`
- `apps/web/src/views/ProjectsStudio/projectsRuntime/useProjectsIntelligenceRuntime.ts`
- `apps/web/src/views/Trade/components/TradeChartPanel.tsx`
- `apps/web/src/views/Trade/components/TradePriceChart.tsx`
- `apps/web/src/views/Trade/components/TradeRecentSwaps.tsx`
- `apps/web/src/views/Trade/useTradeTerminalData.ts`
- `apps/web/src/views/TrendingStudio/components/TrendingKpiRow.tsx`
- `apps/web/src/views/TrendingStudio/components/TrendingProjectCard.tsx`
- `docs/screenshots/r507-premium-polish/*` (11 files)

## Files excluded (left dirty / untracked)

- `apps/web/public/registry/kerl/**` (KERL)
- `apps/web/scripts/kerl-first-testnet-execution.ts`
- `apps/web/src/lib/execution-modes/**` (testnet execution)
- `apps/web/src/lib/treasury-handoff/types.ts`
- `yarn.lock`
- `apps/web/tsconfig.tsbuildinfo`
- `docs/DEX_IMPLEMENTATION_MATRIX.md`
- `.cursor/`
- Unrelated screenshot dirs (`r107-*`, `r400-*`, `r502-*`, etc.)
- Unrelated capture scripts and docs reports
