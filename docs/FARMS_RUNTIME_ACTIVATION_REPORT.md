# Farms Runtime Activation Report — R018

**Mission:** R018 Farms Runtime Activation (Phase 2 — Real Farm Infrastructure)  
**Date:** 2026-07-03  
**Branch:** `design-system-foundation`  
**Staging:** https://v2.melega.finance/farms

---

## Summary

Farms Studio mock layers have been removed and replaced with live farm infrastructure (`usePollFarmsWithUserData`, `useFarms`, `getFarmApr`, legacy deposit/withdraw/harvest modals). **No UI layout, typography, or spacing changes.**

| Layer | Before | After |
|-------|--------|-------|
| UI | 🟩 | 🟩 (unchanged) |
| Runtime | 🟨 | 🟩 |
| Production domain | ⬜ | ⬜ (unchanged) |

---

## Phases completed

| Phase | Deliverable | Status |
|-------|-------------|--------|
| A | `docs/FARMS_RUNTIME_INVENTORY.md` | ✅ |
| B | Wallet LP farming positions in cards + KPIs | ✅ |
| C | Deposit via `DepositModal` + approval | ✅ |
| D | Withdraw via `WithdrawModal` (partial/full) | ✅ |
| E | Claim via `useHarvestFarm` harvest | ✅ |
| F | Real APR, TVL, emissions in KPIs + cards | ✅ |
| G | Farm analytics in analyze panel + advisor | ✅ |
| H | Featured farm = highest live APR / weighted | ✅ |
| I | Activity from wallet farm transactions | ✅ |
| J | AI advisor heuristics (no model) | ✅ |
| K | `farmsRuntimeErrors.ts` error codes | ✅ |
| L | Loading farms / reading wallet skeletons | ✅ |
| M | Collapsed machine JSON in advisor panel | ✅ |

---

## Files changed

### New
- `apps/web/src/views/FarmsStudio/farmsRuntime/farmsRuntimeErrors.ts`
- `apps/web/src/views/FarmsStudio/farmsRuntime/formatFarmsRuntime.ts`
- `apps/web/src/views/FarmsStudio/farmsRuntime/useFarmsStakingRuntime.ts`
- `apps/web/src/views/FarmsStudio/farmsRuntime/useFarmsTerminalData.ts`
- `apps/web/src/views/FarmsStudio/farmsRuntime/FarmsRuntimeContext.tsx`
- `apps/web/src/views/FarmsStudio/farmsRuntime/FarmsActionHost.tsx`
- `docs/FARMS_RUNTIME_INVENTORY.md`
- `docs/FARMS_RUNTIME_ACTIVATION_REPORT.md`

### Modified
- `farmsStudioData.ts` — types only; mocks removed
- `farmsStudioTokens.ts` — LIVE RUNTIME / LIVE labels
- `FarmsStudioScreen.tsx` — provider + action host
- All 8 studio components — runtime wiring
- `docs/DEX_IMPLEMENTATION_MATRIX.md` — Farms Runtime 🟩

---

## Validation

| Check | Result |
|-------|--------|
| `yarn build` | ✅ Pass |
| `yarn test src/design-system` | ✅ 11/11 |
| `yarn test src/lib/homepage-live` | ✅ 2/2 |

### Runtime QA matrix

| Scenario | Expected behavior | Verified |
|----------|-------------------|----------|
| Wallet disconnected | Connect Wallet on featured stake | Code path ✅ |
| Wallet connected | User staked + pending in cards | Code path ✅ |
| Deposit | Opens `DepositModal` | Code path ✅ |
| Withdraw | Opens `WithdrawModal` | Code path ✅ |
| Approval | Auto-approve when needed | Code path ✅ |
| Claim | Direct harvest when pending > 0 | Code path ✅ |
| Receipt | Global toast + tx link | Existing infra ✅ |
| Featured Farm | Highest live APR or weighted | Code path ✅ |
| LP detection | `tokenBalance` in deposit modal | Code path ✅ |
| Activity | Wallet farm tx history | Code path ✅ |

---

## Known limitations

- Live farm count on BSC may be fewer than the original 6 mock cards; empty/loading states handle sparse data.
- Finished farms retain existing card status rendering (no layout change).
- Matrix AI remains ⬜ — advisor uses heuristics only.

---

## Deliverable

**R018_FARMS_RUNTIME_READY**
