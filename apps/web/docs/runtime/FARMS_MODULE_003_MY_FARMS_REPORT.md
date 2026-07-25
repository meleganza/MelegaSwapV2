# FARMS_MODULE_003_MY_FARMS_REPORT

## 1. Final verdict

**FARMS_MODULE_003_MY_FARMS_CERTIFIED**

## 2. Branch

`farms-module-003-my-farms`

## 3. Mission commit

_(stamped after commit)_

## 4. Certified base

| | |
| --- | --- |
| Module 002 | `FARMS_MODULE_002_OVERVIEW_KPIS_CERTIFIED` |
| Branch | `farms-module-002-overview-kpis` |
| Tip | `69207266` |
| Mission commit | `1159984f` |
| Module 001 tip | `21c2c0bb` |
| Architecture | `8edd68d4` |

## 5. Worktree

`/Users/marcomelega/Projects/MelegaSwapV2-farms-m003`

## 6–9. Freeze integrity

| Freeze | Pass |
| --- | --- |
| Architecture 000 / Founder mockup SHA `a19e506f…848a` | yes |
| Module 001 Hero sources (byte SHA) | yes |
| Module 002 Overview KPIs sources (byte SHA) | yes |

## 10. Files changed

- `modules/FarmsMyFarmsModule.tsx`
- `modules/FarmsMyFarmCard.tsx`
- `modules/farmsMyFarmsTokens.ts`
- `modules/farmsMyFarmsTypes.ts`
- `modules/buildFarmsWalletPositions.ts`
- `modules/useFarmsWalletPositions.ts`
- `FarmsStudioScreen.tsx` (mount after KPIs; supersede `YourFarmsSection`)
- `__tests__/farmsModule003.myFarms.test.ts`
- Prior freeze tests updated for Module 003 mount allowance
- `FARMS_MODULE_OWNERSHIP_MAP.md`
- `farmsArchitecture000Contracts.ts` (003 phase)
- `docs/runtime/farms-module-003-my-farms/*`
- `FARMS_MODULE_003_MY_FARMS_REPORT.md`

## 11. Module 003 ownership

Wallet-scoped My Farms left surface (936×360) + reserved Yield Advisor slot (424). Consumes `portfolioFarms` + `FarmsActionHost` only.

## 12–15. Domain / inclusion / sources / wallet scope

- LP farming positions only from `portfolioFarms`.
- Include when `userStaked > 0` OR `pendingReward > 0`.
- Exclude config-only farms, pid-0 token-only, Pools, unstaked wallet LP.
- No second MasterChef scan.

## 16–17. Status + ordering

Architecture vocabulary: ACTIVE / ENDED / WITHDRAW_ONLY / EMERGENCY / PARTIAL / UNAVAILABLE / LOADING.  
Order: EMERGENCY → WITHDRAW_ONLY → ACTIVE(+pending) → … stable pid.

## 18–22. Metrics / decimals / logos

- Staked LP + Harvestable normalized (no raw uint256).
- Fiat supporting values only when factual.
- APR only when factual on live farms.
- Address-based `MelegaTokenAvatar` for token0 / token1 / reward.

## 23–26. Actions

Max 2 actions via `requestModal` → `FarmsActionHost` (`claim` / `unstake` / `stake`).  
Harvest / Manage / Withdraw / Emergency Withdraw. No duplicate Manage/Open.

## 27–31. States + stability

Disconnected / loading (3 skeletons) / empty / partial / unavailable / stale last-good retention.  
Wallet/chain change clears prior positions. Failed refresh does not become false zero.

## 32–35. Geometry

| Metric | Target | Measured |
| --- | --- | --- |
| Row | 1376 | pass |
| My Farms | 936×360 | pass |
| Advisor slot | 424 | pass |
| Gap after KPIs | 16 | pass |
| Cards | 288×276 | contract + UI |

Mobile 390/430 one-column; tablet stacks above reserved slot.

## 36–40. A11y / tests / build / evidence

Semantic section + heading + list; polite live region; focus rings; ≥44px targets.  
Vitest 34/34. `yarn build` passed. Evidence under `farms-module-003-my-farms/` (default runtime capture = disconnected; fixture-labeled copies documented).

## 41–43. Deviations / limitations / blockers

- Default production evidence is wallet-disconnected (no mock wallet injection).
- View all / Explore Farms temporarily use `#explore-farms` until Module 004.
- Emergency maps to ActionHost `unstake` (same as Pools pattern) when `enableEmergencyWithdraw` is present.

No factual blockers.

## 44. Working-tree status

Clean after push.

## 45. Exact next mission

`FARMS_MODULE_004_EXPLORE_FARMS`
