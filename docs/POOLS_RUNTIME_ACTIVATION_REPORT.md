# Pools Runtime Activation Report — R017

**Mission:** R017 Pools Runtime Activation (Phase 2 — Real Staking Infrastructure)  
**Date:** 2026-07-03  
**Branch:** `design-system-foundation`  
**Staging:** https://v2.melega.finance/pools

---

## Summary

Pools Studio mock layers have been removed and replaced with live staking infrastructure (`usePoolsPageFetch`, `usePoolsWithVault`, legacy stake/unstake/claim modals). **No UI layout, typography, or spacing changes.**

| Layer | Before | After |
|-------|--------|-------|
| UI | 🟩 | 🟩 (unchanged) |
| Runtime | 🟨 | 🟩 |
| Production domain | ⬜ | ⬜ (unchanged) |

---

## Phases completed

| Phase | Deliverable | Status |
|-------|-------------|--------|
| A | `docs/POOLS_RUNTIME_INVENTORY.md` | ✅ |
| B | Wallet staking positions in KPIs + card user data | ✅ |
| C | Stake via `StakeModal` / `VaultStakeModal` | ✅ |
| D | Unstake via same modals (`isRemovingStake`) | ✅ |
| E | Live APR, TVL, emission metrics | ✅ |
| F | Pool analytics row from live data | ✅ |
| G | Pool types from config (`vaultKey`, `poolCategory`) | ✅ |
| H | Tx status via confirmation modals + global toast | ✅ |
| I | `poolsRuntimeErrors.ts` | ✅ |
| J | Loading pools / reading wallet labels | ✅ |
| K | Claim via `CollectModal` on cards with pending rewards | ✅ |
| L | Collapsed machine JSON in advisor panel | ✅ |

---

## Files changed

### New
- `apps/web/src/views/PoolsStudio/poolsRuntime/poolsRuntimeErrors.ts`
- `apps/web/src/views/PoolsStudio/poolsRuntime/formatPoolsRuntime.ts`
- `apps/web/src/views/PoolsStudio/poolsRuntime/usePoolsStakingRuntime.ts`
- `apps/web/src/views/PoolsStudio/poolsRuntime/usePoolsTerminalData.ts`
- `apps/web/src/views/PoolsStudio/poolsRuntime/PoolsRuntimeContext.tsx`
- `apps/web/src/views/PoolsStudio/poolsRuntime/PoolsActionHost.tsx`
- `docs/POOLS_RUNTIME_INVENTORY.md`
- `docs/POOLS_RUNTIME_ACTIVATION_REPORT.md`

### Modified
- `poolsStudioData.ts` — types only; mocks removed
- `PoolsStudioScreen.tsx` — provider + action host
- All 10 studio components — runtime wiring
- `docs/DEX_IMPLEMENTATION_MATRIX.md` — Pools Runtime 🟩

---

## Validation

| Check | Result |
|-------|--------|
| `yarn build` | ✅ Pass |
| `yarn test src/design-system` | ✅ 11/11 |
| `yarn test src/lib/homepage-live` | ✅ 2/2 |

### Runtime simulation matrix

| Scenario | Expected behavior | Verified |
|----------|-------------------|----------|
| Wallet disconnected | Connect Wallet on featured stake | Code path ✅ |
| Wallet connected | User positions in KPIs | Code path ✅ |
| Stake | Opens StakeModal / VaultStakeModal | Code path ✅ |
| Unstake | Modal with `isRemovingStake` | Code path ✅ |
| Approval | Legacy approve in modal | Code path ✅ |
| Claim | CollectModal when pending > 0 | Code path ✅ |
| Receipt | Global tx modal + toast | Existing infra ✅ |
| Locked / Flexible pool types | Derived from `vaultKey` | Code path ✅ |
| Reward MARCO Holders | Partner pool type label | Code path ✅ |

*On-chain stake/unstake/claim requires manual MetaMask on staging.*

---

## Known limitations (non-blocking)

- BSC shows ~2 live pools (not 6 mock cards) — studio handles sparse data
- Activity table uses wallet tx history, not on-chain event indexer
- AI advisor is data-driven heuristic (not ML)
- Create Pool CTA unchanged (out of R017 scope)
- KERL not integrated (by design)

---

## DEX matrix update

**POOLS → Runtime: 🟨 → 🟩**

---

## Next priority

Per matrix: **Farms Runtime** (Priority 4).
