# R730A Index Source Inventory

Generated for the DEX Runtime Indexing Foundation gate. Documents every runtime data source by surface without changing product behavior beyond R730A indexing fixes.

## Summary

| Surface | Primary sources | Dominant blocker |
|---------|-----------------|------------------|
| Home | Melega subgraph, on-chain farms/pools, CoinGecko | Subgraph empty → permanent loading states |
| Trade | Melega subgraph, BscScan holders, CoinGecko MARCO | Subgraph + explorer API gaps |
| Liquidity Studio | Melega subgraph, pool datas SWR | Mint/burn events not indexed |
| Farms | Redux MasterChef / farms hooks | Chain hydration |
| Pools | On-chain pool config + visibility gates | Strict `listUsablePools` filters |
| Trending | `buildDexAssetIndex` → enriched projects | Static registry had only 1 project |
| Projects | Registry + DEX asset index synthetics | Explorer holder counts |
| DEX Intelligence (`/radar`) | DEX asset index + registry intelligence | Whale indexer not configured |
| Identity Hub (`/collectibles`) | Collectibles registry | Static MVP collections |

Legend for **Kind**: `real` = live network/API, `registry` = static JSON/TS registry, `heuristic` = computed score/label, `fixture` = env-gated fake data, `static` = hardcoded fallback, `unavailable` = explicit not configured.

---

## Home

| Source name | File path | Data type | Runtime status | Blocker | Fallback | Kind |
|-------------|-----------|-----------|----------------|---------|----------|------|
| Protocol transactions | `state/info/hooks.ts` → `useProtocolTransactionsSWR` | Swaps/mints/burns | loading/empty/error | Subgraph returns no payload | R730A indexer diagnostics | real |
| Protocol transactions (R730A) | `lib/runtime-indexing/useProtocolTransactionsIndexer.ts` | Indexer state + txs | ready/error/loading | Same subgraph endpoint | Explicit diagnostic lines | real |
| Top farms APR | `views/Home/hooks/useGetTopFarmsByApr.tsx` | Farm APR/TVL | ready when chain hydrated | Farms fetch idle | Empty earn rows | real |
| Top pools APR | `views/Home/hooks/useGetTopPoolsByApr.tsx` | Pool APR/TVL | ready when chain hydrated | Pools fetch idle | Empty earn rows | real |
| Live Activity UI | `views/HomeTrade/LiveActivityFeed.tsx` | Activity slots | diagnostic/ready | Was generic "Indexing activity" | Structured Source/Indexer/Reason | runtime |
| Market Pulse CoinGecko | `views/HomeTrade/useMarketPulseData.ts` | Global mcap/volume | ready/error/loading | External API rate limits | Per-metric unavailable reason | real |
| Market Pulse chain | `views/HomeTrade/useMarketPulseData.ts` | BNB price/gas/block | partial | RPC/gas unavailable | Explicit unavailable label | real |
| DEX project count (R730A) | `lib/dex-asset-index/buildDexAssetIndex.ts` | Asset/project count | ready | N/A | Expanded index vs static registry | registry |
| Home machine | `views/HomeTrade/buildHomeMachine.ts` | Machine JSON | partial | `NO_EVENTS_INDEXED` when empty | Reason codes | runtime |

---

## Trade

| Source name | File path | Data type | Runtime status | Blocker | Fallback | Kind |
|-------------|-----------|-----------|----------------|---------|----------|------|
| Terminal data | `views/Trade/useTradeTerminalData.ts` | Stats/swaps/chart context | loading/ready | Subgraph + token route | Reason codes + diagnostics | runtime |
| Token metrics | `state/info/hooks.ts` → `useTokenDataSWR` | Volume/liquidity/price | loading/ready/missing | Pair not in subgraph | CoinGecko for MARCO volume | real |
| Holder count | `lib/holder-count/fetchHolderCount.ts` | Holder count | ready/unavailable | `NEXT_PUBLIC_BSCSCAN_API_KEY` | Explicit diagnostic label | real |
| MARCO market | `lib/trade-market/fetchPublicTokenMarket.ts` | MCap/FDV/supply | ready/unavailable | CoinGecko | Subgraph-only stats | real |
| Pair prices / chart | `state/swap/hooks` → `useFetchPairPrices` | OHLC candles | empty/ready | No indexed candles | TradingView external / subgraph overlay | real |
| Chart panel | `views/Trade/components/TradeChartPanel.tsx` | Chart render | unavailable/ready | No symbol or TV no-data | "Chart unavailable" + Source/Reason | runtime |
| Recent swaps | `views/Trade/components/TradeRecentSwaps.tsx` | Swap timeline | diagnostic/ready | No indexed swaps | Structured empty state | runtime |

---

## Liquidity Studio

| Source name | File path | Data type | Runtime status | Blocker | Fallback | Kind |
|-------------|-----------|-----------|----------------|---------|----------|------|
| Terminal data | `views/LiquidityStudio/liquidityRuntime/useLiquidityTerminalData.ts` | Activity + metrics | loading/empty/ready | Subgraph mint/burn empty | Indexer diagnostic | runtime |
| Top pools | `state/info/queries/pools/topPools.ts` | Pool addresses | ready | Subgraph pool list empty | Limited top pool set | real |
| Pool datas | `state/info/hooks.ts` → `usePoolDatasSWR` | TVL/volume/APR | loading/ready | Blocks timestamp fetch | Empty metrics | real |
| Activity table | `views/LiquidityStudio/components/LiquidityActivityTable.tsx` | Mint/burn rows | diagnostic/ready | Was generic "Indexing liquidity" | Source/Indexer/Reason lines | runtime |
| Positions | `views/LiquidityStudio/liquidityRuntime/useLiquidityPositions.ts` | Wallet LP | wallet-dependent | Wallet not connected | Empty positions | real |

---

## Farms

| Source name | File path | Data type | Runtime status | Blocker | Fallback | Kind |
|-------------|-----------|-----------|----------------|---------|----------|------|
| Staking runtime | `views/FarmsStudio/farmsRuntime/useFarmsStakingRuntime.ts` | Farm cards/KPIs | loading/ready | Redux farms not hydrated | Loading label | real |
| Farm config | `@pancakeswap/farms` + chain config | LP farms | ready | Wrong chain | Empty farm grid | registry |
| APR emission | `views/FarmsStudio/farmsRuntime/formatFarmsRuntime.ts` | On-chain emission | ready | Zero emission farms hidden | Diagnostic APR missing | real |

---

## Pools

| Source name | File path | Data type | Runtime status | Blocker | Fallback | Kind |
|-------------|-----------|-----------|----------------|---------|----------|------|
| Pool config | `config/constants/pools.tsx` | Serialized pools | static registry | Many pools ended/unfunded | On-chain fetch | registry |
| Page fetch | `state/pools/hooks.ts` → `usePoolsPageFetch` | Hydrated pools | loading/ready | Chain/block gating | `loading_pools` phase | real |
| Visibility | `views/PoolsStudio/poolsRuntime/formatPoolsRuntime.ts` | Displayable subset | filtered | `hiddenReason` gates | Integrity counts | heuristic |
| Integrity (R730A) | `views/PoolsStudio/poolsRuntime/usePoolsStakingRuntime.ts` | discovered/indexed/live/ended/hidden/displayable | ready | Zero displayable | `poolsIndexingDiagnostic` | runtime |
| UX fixture | `views/PoolsStudio/poolsRuntime/poolsUxFixture.ts` | Fake pools | fixture | `NEXT_PUBLIC_POOLS_UX_FIXTURE=1` | Must stay off in prod gate | fixture |

---

## Trending

| Source name | File path | Data type | Runtime status | Blocker | Fallback | Kind |
|-------------|-----------|-----------|----------------|---------|----------|------|
| DEX asset index (R730A) | `lib/dex-asset-index/buildDexAssetIndex.ts` | Canonical assets | ready | N/A | Machine payload export | registry |
| Token index | `views/RadarStudio/radarRuntime/buildDexTokenIndex.ts` | Token union | ready | Previously ~3 hardcoded tokens | Asset index merge | registry |
| Intelligence runtime | `views/TrendingStudio/trendingRuntime/useTrendingIntelligenceRuntime.ts` | Cards/KPIs | ready | Subgraph metrics empty per token | "Unavailable" labels | runtime |
| Format runtime | `views/TrendingStudio/trendingRuntime/formatTrendingRuntime.ts` | Heatmap/cards | partial | Sparklines intentionally empty | No fake sparklines | heuristic |

---

## Projects

| Source name | File path | Data type | Runtime status | Blocker | Fallback | Kind |
|-------------|-----------|-----------|----------------|---------|----------|------|
| Static registry | `registry/projects/projects.data.ts` | 1 canonical project | static | MVP static phase | DEX synthetics | registry |
| Live metrics | `lib/projects-data/projectLiveMetrics.ts` | Subgraph metrics | ready/empty | Holders need BscScan | Explicit holder diagnostic | runtime |
| Intelligence runtime | `views/ProjectsStudio/projectsRuntime/useProjectsIntelligenceRuntime.ts` | Cards/KPIs | ready | Holder explorer | Waiting for explorer | runtime |
| Contract discovery | `views/ProjectsStudio/projectsRuntime/discoverProjectFromContract.ts` | DEX index lookup | ready | Unknown contracts → pending | Pending registry | runtime |

---

## DEX Intelligence (`/radar`)

| Source name | File path | Data type | Runtime status | Blocker | Fallback | Kind |
|-------------|-----------|-----------|----------------|---------|----------|------|
| DEX asset index | `lib/dex-asset-index/buildDexAssetIndex.ts` | Asset corpus | ready | N/A | Expanded radar feed inputs | registry |
| Radar runtime | `views/RadarStudio/radarRuntime/useRadarIntelligenceRuntime.ts` | Projects/signals | ready | Whale feed | "Source not configured" | runtime |
| Whale KPI | `views/RadarStudio/radarRuntime/formatRadarRuntime.ts` | Whale alerts | unavailable | No whale indexer | Never simulate `0` | unavailable |
| Heatmap | `views/RadarStudio/radarRuntime/buildHeatmap.ts` | Scores | heuristic | Social/github partial | UNAVAILABLE scores | heuristic |

---

## Shared infrastructure

| Source name | File path | Data type | Runtime status | Blocker | Fallback | Kind |
|-------------|-----------|-----------|----------------|---------|----------|------|
| Melega subgraph | `config/constants/endpoints.ts` + `utils/graphql` | Indexed DEX events | real | Endpoint/index lag | Error diagnostic (R730A) | real |
| Global search | `lib/global-search/buildGlobalSearchIndex.ts` | Search corpus | ready | Static index at boot | Contract → radar shortcut | registry |
| Runtime diagnostics | `lib/runtime-integrity/diagnostics.ts` | Diagnostic schema | ready | N/A | IndexerActivityDiagnostic | runtime |
| Social header (R730A) | `design-system/melega/components/SocialIcons/MelegaSocialIcons.tsx` | External links | ready | N/A | Telegram/X/Instagram only | static |

---

## R730A changes (indexing only)

1. Header social URLs corrected; Discord removed; Instagram added.
2. `lib/dex-asset-index/` canonical asset index replaces hardcoded 3-token cap for Trending/Projects/Radar/Global Search.
3. `lib/runtime-indexing/useProtocolTransactionsIndexer.ts` distinguishes loading vs error vs empty subgraph responses.
4. Home Live Activity, Market Pulse, Trade swaps/chart, Liquidity activity, and Pools empty grid expose explicit diagnostics.
5. No CSS/layout changes to Pools, Farms, Smart Router, or Treasury surfaces.
