# Farms Runtime Inventory — R018 Phase A

**Route:** `/farms` (`FarmsStudioScreen`)  
**Date:** 2026-07-03  
**Mission:** Eliminate mock layers; wire real farm infrastructure.

---

## Route composition

```
pages/farms/index.tsx
  └── FarmsStudioScreen
        ├── FarmsRuntimeProvider (NEW — R018)
        ├── FarmsActionHost (deposit/withdraw/claim modals)
        ├── TrendingRibbon (live)
        ├── FarmsKpiRow (runtime — was FARMS_KPIS mock)
        ├── FeaturedFarmPanel (runtime — was hardcoded MARCO/BNB 36.08%)
        ├── AIYieldAdvisorPanel (runtime heuristics — was AI_ADVISOR_ROWS)
        ├── FarmsFilterRow (runtime filter — was local-only chips)
        ├── FarmsGrid / FarmGridCard (runtime — was FARM_PREVIEW_CARDS)
        └── FarmsActivityTable (wallet txs — was FARMS_ACTIVITY mock)

pages/farms/history.tsx → legacy FarmCard (unchanged)
```

---

## Component inventory

| Component | Prior source | Real source (R018) | Replacement | Dependencies | Risk |
|-----------|--------------|-------------------|-------------|--------------|------|
| `farmsStudioData.ts` | All mock arrays | **Types + filter chips only** | Mock exports removed | — | None |
| `farmsRuntime/useFarmsStakingRuntime.ts` | — | `usePollFarmsWithUserData` + `useFarms` | New orchestrator | Redux farms state | Low |
| `farmsRuntime/FarmsRuntimeContext.tsx` | — | Context provider | New | orchestrator | Low |
| `farmsRuntime/FarmsActionHost.tsx` | — | `DepositModal`, `WithdrawModal`, harvest | Reuse legacy modals | on-chain txs | Medium |
| `farmsRuntime/formatFarmsRuntime.ts` | — | `getFarmApr`, `getDisplayApr` | Map to card shape | `utils/apr` | Low |
| `farmsRuntime/farmsRuntimeErrors.ts` | — | Machine + human error codes | Phase K | — | Low |
| `farmsRuntime/useFarmsTerminalData.ts` | — | Wallet transaction history | Activity rows | redux transactions | Low |
| `FarmsKpiRow` | `FARMS_KPIS` | `aggregateKpis()` | Sum TVL, emissions, APR | live farms | Low |
| `FeaturedFarmPanel` | Hardcoded MARCO/BNB | Highest-APR or weighted farm | `featured` metrics | `mapFarmToPreviewCard` | Low |
| `AIYieldAdvisorPanel` | `AI_ADVISOR_ROWS` | Heuristics from live farms | APR, utilization, budget | terminal | Low |
| `FarmsFilterRow` | Local state only | `setFilter` on live list | Chip → farm filter | runtime | Low |
| `FarmsGrid` | `FARM_PREVIEW_CARDS` | `useFarmsRuntime().farms` | Filtered live cards | — | Low |
| `FarmGridCard` | Inert Stake btn | `requestModal(stake/claim)` | Opens legacy modals | FarmsActionHost | Medium |
| `FarmsActivityTable` | `FARMS_ACTIVITY` | `useFarmsTerminalData` | Wallet tx history | redux transactions | Low |
| `FarmsStudioPageHeader` | PREVIEW LAYOUT | LIVE RUNTIME badge | — | — | None |

---

## Mock elimination checklist

| Mock artifact | Status |
|---------------|--------|
| `FARMS_KPIS` | ✅ Aggregated from live farms |
| `FARM_PREVIEW_CARDS` | ✅ `useFarms` + `getFarmApr` |
| `FARMS_ACTIVITY_ROWS` | ✅ Wallet transaction history |
| `AI_ADVISOR_ROWS` | ✅ Live heuristics |
| Featured 36.08% APR | ✅ Highest live APR / weighted |
| PREVIEW badges | ✅ LIVE RUNTIME / LIVE |

---

## Error codes (Phase K)

| Code | Message |
|------|---------|
| `FARM_NOT_FOUND` | Farm not found on this network. |
| `NO_LP_AVAILABLE` | No LP tokens available in your wallet. |
| `INSUFFICIENT_LP` | Insufficient LP balance for this action. |
| `APPROVAL_REQUIRED` | Approve your LP token to continue. |
| `FARM_ENDED` | This farm has ended. |
| `REWARD_UNAVAILABLE` | No rewards available to claim. |
| `NETWORK_UNAVAILABLE` | Switch to a supported network. |
| `INVALID_MULTIPLIER` | Farm multiplier is not valid for staking. |

---

## Execution path

Deposit / withdraw / claim reuse legacy `views/Farms` hooks:

- `useStakeFarms` → `stakeFarm` (MasterChef)
- `useUnstakeFarms` → `unstakeFarm`
- `useHarvestFarm` → `harvestFarm`
- `useApproveFarm` → LP approval
- `FarmUI.DepositModal` / `FarmUI.WithdrawModal`

No KERL execution. DEX executes only.
