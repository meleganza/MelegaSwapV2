# Command Center Runtime Inventory — R022 Phase A

**Route:** `/command-center` (`CommandCenterScreen`)  
**Date:** 2026-07-03  
**Mission:** Activate Command Center as personal operational hub. No UI/CSS/layout changes.

---

## Route composition

```
pages/command-center/index.tsx
  └── CommandCenterRuntimeBoundary
        └── CommandCenterScreen
              ├── CommandRuntimeProvider (NEW — R022)
              ├── CommandCenterPageHeader (unchanged)
              ├── SafeTrendingRibbon (unchanged)
              ├── AIDailyBriefing (runtime — was AI_BRIEFING mock)
              ├── CommandKpiCluster (runtime — was KPI_* mocks)
              ├── CommandDashboardCards (runtime — was ASSETS/LIQUIDITY/POOLS/FARMS mocks)
              ├── CommandRightSidebar (runtime — was AI_RECOMMENDATIONS/NOTIFICATIONS/REPORTS)
              ├── CommandRecentActivityCard (runtime — was RECENT_ACTIVITY)
              ├── MachineSummaryCard (runtime — was MACHINE_SUMMARY)
              └── CommandQuickActions (unchanged — static links)
```

---

## Component inventory

| Component | Prior source | Canonical runtime | Replacement | Dependencies |
|-----------|--------------|-------------------|-------------|--------------|
| `commandCenterData.ts` | All mock arrays | **Types + QUICK_ACTIONS only** | Mocks removed | — |
| `commandCenterRuntime/useCommandCenterOrchestrationRuntime.ts` | — | Orchestrator | New | All studio runtimes |
| `commandCenterRuntime/CommandRuntimeContext.tsx` | — | Context provider | New | orchestrator |
| `commandCenterRuntime/formatCommandCenterRuntime.ts` | — | Map runtime → UI shapes | Formatter only | Trade, Pools, Farms |
| `commandCenterRuntime/buildAiBriefing.ts` | `AI_BRIEFING` | Rule-based from runtimes | Operational only | All runtimes |
| `commandCenterRuntime/buildNotifications.ts` | `NOTIFICATIONS` | Trade/Pools/Farms/Radar/Build txs | Chronological | Transaction store |
| `commandCenterRuntime/buildActivityTimeline.ts` | `RECENT_ACTIVITY` | Multi-runtime events | Timeline only | Terminals |
| `commandCenterRuntime/buildMachineSummary.ts` | `MACHINE_SUMMARY` | Aggregated machine JSON | Copy/download | All runtimes |
| `commandCenterRuntime/useCollectiblesWalletOwnership.ts` | `COLLECTIBLES` mock | DNFT `walletOfOwner` | Display only | Wallet hook |
| `AIDailyBriefing` | Static bullets | `briefing` | Runtime | orchestrator |
| `CommandKpiCluster` | 6 KPI mocks | `kpis` | Runtime | orchestrator |
| `CommandAssetsCard` | `ASSETS` | Trade runtime `assets` | No duplicate calc | Trade |
| `CommandLiquidityCard` | `LIQUIDITY` | `useLiquidityPositions` | Positions only | Liquidity |
| `CommandPoolsCard` | `POOLS` | Pools runtime user stakes | Filter staked | Pools |
| `CommandFarmsCard` | `FARMS` | Farms runtime user stakes | Filter staked | Farms |
| `CommandCollectiblesCard` | `COLLECTIBLES` | Registry + wallet ownership | No ownership logic | Collectibles registry |
| `CommandInfrastructureCard` | `INFRASTRUCTURE_SUMMARY` | Build + Projects + Pools/Farms counts | Score from Build | Build |
| `CommandBuilderStatusCard` | `BUILDER_STATUS` | Projects + infrastructure score | Derived | Projects, Build |
| `CommandRightSidebar` | 3 mock sections | recommendations/notifications/reports | Runtime | Projects, Radar, Build |
| `CommandRecentActivityCard` | `RECENT_ACTIVITY` | `recentActivity` | Timeline | Terminals |
| `MachineSummaryCard` | Static JSON | `machine` | Timestamped | orchestrator |

---

## Runtime integration map

| Runtime module | Consumed data |
|----------------|---------------|
| **Trade** (`useTradeSwapRuntime`) | Assets, machine payload, swap transactions |
| **Liquidity** (`useLiquidityPositions`) | LP positions |
| **Pools** (`usePoolsStakingRuntime`) | Staked pools, pending rewards, terminal activity |
| **Farms** (`useFarmsStakingRuntime`) | Staked farms, pending rewards, terminal activity |
| **Projects** (`useProjectsIntelligenceRuntime`) | Indexed projects, recommendations, index coverage |
| **Radar** (`useRadarIntelligenceRuntime`) | Alerts, discoveries, AI recommendation, machine |
| **Build** (`useBuildOrchestrationRuntime`) | Infrastructure score, suggestions, extensions, recent builds |

---

## Mock elimination checklist

| Mock artifact | Status |
|---------------|--------|
| `AI_BRIEFING` (fake greeting + bullets) | ✅ `buildAiBriefing()` |
| `KPI_NET_WORTH` / `KPI_*` (fake $24k) | ✅ Aggregated from runtimes |
| `ASSETS` (5 fake tokens) | ✅ Trade runtime assets |
| `LIQUIDITY` (fake pairs) | ✅ Liquidity positions |
| `POOLS` / `FARMS` (fake stakes) | ✅ User staked positions |
| `AI_RECOMMENDATIONS` | ✅ Projects + Radar + Build |
| `NOTIFICATIONS` | ✅ Runtime transaction events |
| `REPORTS` | ✅ Build extensions (audit/space) |
| `COLLECTIBLES` | ✅ Registry + wallet NFT count |
| `INFRASTRUCTURE_SUMMARY` | ✅ Build score + capability counts |
| `BUILDER_STATUS` | ✅ Projects + positions |
| `RECENT_ACTIVITY` | ✅ Multi-runtime timeline |
| `MACHINE_SUMMARY` | ✅ `buildMachineSummary()` |

---

## Error codes (Phase N)

| Code | Message |
|------|---------|
| `NO_WALLET` | Connect a wallet to view personal positions and balances. |
| `NO_RUNTIME` | Command Center runtime is unavailable on this network. |
| `NO_ASSETS` | No wallet assets detected from Trade runtime. |
| `NO_LIQUIDITY` | No liquidity positions found. |
| `NO_POOLS` | No staking pool positions found. |
| `NO_FARMS` | No farm positions found. |
| `NO_RADAR` | Radar runtime is unavailable. |
| `NO_PROJECTS` | No indexed projects in Projects runtime. |
| `NO_BUILD` | Build Studio infrastructure data is unavailable. |

---

## Known limitations

- Net worth displays asset count or Unavailable — no fabricated USD totals.
- Liquidity APR/IL shows Unavailable when not provided by Liquidity runtime position hook.
- Collectibles display registry records; wallet ownership via DNFT contract count only.
- Professional reports derived from Build extensions with audit/space keywords only.
- Command Center does not own data — all values originate from canonical runtime organs.
