# Pools Runtime Inventory — R017 Phase A

**Route:** `/pools` (`PoolsStudioScreen`)  
**Date:** 2026-07-03  
**Mission:** Eliminate mock layers; wire real staking infrastructure.

---

## Route composition

```
pages/pools/index.tsx
  └── PoolsStudioScreen
        ├── PoolsRuntimeProvider (NEW — R017)
        ├── PoolsActionHost (stake/unstake/claim modals)
        ├── TrendingRibbon (live)
        ├── PoolsKpiRow (runtime — was POOLS_KPIS mock)
        ├── FeaturedPoolPanel (runtime — was hardcoded 36.08%)
        ├── AIRewardAdvisorPanel (runtime heuristics — was AI_REWARD_ROWS)
        ├── PoolsFilterRow (runtime filter — was local-only chips)
        ├── PoolsGrid / PoolGridCard (runtime — was POOL_PREVIEW_CARDS)
        ├── PoolsAnalyticsRow (runtime — was ANALYTICS_REWARDS_BARS)
        └── PoolsActivityTable (wallet txs — was POOLS_ACTIVITY mock)

pages/pools/history.tsx → legacy views/Pools (unchanged)
_mp/pools → legacy views/Pools (unchanged)
```

---

## Component inventory

| Component | Prior source | Real source (R017) | Replacement | Dependencies | Risk |
|-----------|--------------|-------------------|-------------|--------------|------|
| `poolsStudioData.ts` | All mock arrays | **Types + filter chips only** | Mock exports removed | — | None |
| `poolsRuntime/usePoolsStakingRuntime.ts` | — | `usePoolsPageFetch` + `usePoolsWithVault` | New orchestrator | Redux pools state | Low |
| `poolsRuntime/PoolsRuntimeContext.tsx` | — | Context provider | New | orchestrator | Low |
| `poolsRuntime/PoolsActionHost.tsx` | — | `StakeModal`, `VaultStakeModal`, `CollectModal` | Reuse legacy modals | on-chain txs | Medium |
| `poolsRuntime/formatPoolsRuntime.ts` | — | `getAprData`, pool config | Map to card shape | `views/Pools/helpers` | Low |
| `PoolsKpiRow` | `POOLS_KPIS` | `aggregateKpis()` | Sum TVL, active pools | live pools | Low |
| `FeaturedPoolPanel` | Hardcoded MARCO 36.08% | Highest-APR live pool | `featured` metrics | `mapPoolToPreviewCard` | Low |
| `AIRewardAdvisorPanel` | `AI_REWARD_ROWS` | Heuristics from live pools | Max APR, flexible, partner | terminal | Low |
| `StakeDonutChart` | `DONUT_SEGMENTS` | `buildDonutSegments()` | TVL tier buckets | pool totalStaked | Low |
| `PoolsFilterRow` | Local state only | `setFilter` on live list | Chip → pool type filter | runtime | Low |
| `PoolsGrid` | `POOL_PREVIEW_CARDS` | `usePoolsRuntime().pools` | Filtered live cards | — | Low |
| `PoolGridCard` | Inert Stake btn | `requestModal(stake/claim)` | Opens legacy modals | PoolsActionHost | Medium |
| `PoolsAnalyticsRow` | Static bars/68.3% | `analytics` from emission + TVL | Live-derived charts | tokenPerBlock | Low |
| `PoolsActivityTable` | `POOLS_ACTIVITY` | `usePoolsTerminalData` | Wallet tx history | redux transactions | Low |
| `PoolsStudioPageHeader` | PREVIEW LAYOUT | LIVE RUNTIME badge | — | — | None |

---

## Pool type mapping (Phase G)

| Studio label | Derivation |
|--------------|------------|
| Locked Pool | `vaultKey === CakeVault` |
| Flexible Pool | `vaultKey === CakeFlexibleSideVault` or manual sousId 0 |
| Reward MARCO Holders | Stake MARCO → earn non-MARCO |
| Community Pool | `poolCategory === COMMUNITY` |
| Institutional Pool | `poolCategory === BINANCE` |
| Private Pool | `profileRequirement.required` |

---

## Mock elimination checklist

| Mock artifact | Status |
|---------------|--------|
| `POOLS_KPIS` | ✅ Aggregated from live pools |
| `POOL_PREVIEW_CARDS` | ✅ `usePoolsWithVault` |
| `POOLS_ACTIVITY` | ✅ Wallet transaction history |
| `ANALYTICS_REWARDS_BARS` | ✅ Emission-derived bars |
| `DONUT_SEGMENTS` | ✅ TVL tier distribution |
| `AI_REWARD_ROWS` | ✅ Live heuristics |
| Featured 36.08% APR | ✅ Highest live APR |
| PREVIEW badges | ✅ LIVE RUNTIME / LIVE |

---

## Error model

Codes in `poolsRuntimeErrors.ts`: `POOL_NOT_FOUND`, `STAKE_TOO_LOW`, `INSUFFICIENT_BALANCE`, `POOL_LOCKED`, `POOL_ENDED`, `APPROVAL_REQUIRED`, `NETWORK_UNAVAILABLE`, `REWARD_NOT_AVAILABLE`, `WALLET_DISCONNECTED`, `CALCULATING`.

---

## Known gaps (non-blocking)

- Sparse pool count on BSC (~2 visible) vs mock 6 cards
- Activity table requires wallet-connected tx history (no subgraph for syrup events)
- AI advisor is heuristic, not ML (matrix AI ⬜)
- Create Pool CTA remains non-functional (governance scope)
