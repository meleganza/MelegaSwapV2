# FARMS_MODULE_005_FINISHED_FARMS_REPORT

## 1. Final verdict

**FARMS_MODULE_005_FINISHED_FARMS_CERTIFIED**

## 2. Branch

`farms-module-005-finished-farms`

## 3. Mission commit

`dfbd93e3fd2712fccf988ae6af4ceec876df07a6`

## 4. Certified base

| | |
| --- | --- |
| Module 004 | `FARMS_MODULE_004_EXPLORE_FARMS_CERTIFIED` |
| Branch | `farms-module-004-explore-farms` |
| Tip | `11574861` |
| Mission commit | `eba74be3` |
| Module 003 tip | `509e7119` |
| Module 002 tip | `69207266` |
| Module 001 tip | `21c2c0bb` |
| Architecture | `8edd68d4` |

## 5. Worktree

`/Users/marcomelega/Projects/MelegaSwapV2-farms-m005`

## 6–8. Freeze integrity

| Freeze | Pass |
| --- | --- |
| Architecture 000 / Founder mockup | yes |
| Modules 001–004 source SHAs | yes (byte-identical) |

## 9. Files changed

- `modules/FarmsFinishedFarmsModule.tsx`
- `modules/FarmsFinishedFarmCard.tsx`
- `modules/farmsFinishedFarmsTokens.ts`
- `modules/farmsFinishedFarmsTypes.ts`
- `modules/buildFarmsFinishedFarms.ts`
- `modules/useFarmsFinishedFarms.ts`
- `FarmsStudioScreen.tsx` (mount after Explore)
- `__tests__/farmsModule005.finishedFarms.test.ts`
- `__tests__/farmsModule004.exploreFarms.test.ts` (mount allowance 006–008)
- `FARMS_MODULE_OWNERSHIP_MAP.md`
- `farmsArchitecture000Contracts.ts` (005 phase)
- `docs/runtime/farms-module-005-finished-farms/*`
- `FARMS_MODULE_005_FINISHED_FARMS_REPORT.md`

## 10. Module 005 ownership

Wallet-scoped Finished Farms recovery surface. Consumes `portfolioFarms` + `FarmsActionHost` only.

## 11–14. Domain / inclusion / sources / wallet scope

- Recovery-relevant finished / disabled-deposit positions with `staked > 0` or `pending > 0`.
- Excludes active stakeable farms, config-only history, closed zeros, Pools.
- Canonical `portfolioFarms` only — no second runtime.

## 15–16. Status + ordering

ENDED / WITHDRAW_ONLY / EMERGENCY / PARTIAL / UNAVAILABLE / LOADING. Never ACTIVE.  
Order: EMERGENCY → WITHDRAW+reward → WITHDRAW → ENDED reward → PARTIAL → UNAVAILABLE; quantized value ties; pid/positionId.

## 17–21. Ended date / LP / rewards / decimals / logos

- Ended date: honest `Ended date unavailable` when no factual end provenance.
- LP to Withdraw / Rewards to Claim with verified decimals; no raw uint256; no `$0.00` failure fallback.
- Address-based logos; reward token visually distinct.

## 22–25. Actions + transactions

Withdraw LP / Emergency Withdraw / Harvest via `requestModal` → `FarmsActionHost`.  
Emergency never exposes normal Withdraw. Connect Wallet / Switch Network when required.

## 26–27. Retention + refresh

Last-good positions retained on failed refresh with stale disclosure. Wallet/chain change clears. Failed refresh never becomes false zero.

## 28–31. States

Loading: 3×446×250 skeletons. Empty: no recovery positions + Explore Active Farms. Partial/stale disclosures. Unavailable: not represented as zero.

## 32. Legacy supersession

Supersedes Finished-chip / legacy grid presentation of wallet recovery positions. `/farms/history` remains via Show closed history. Activity/Featured retained.

## 33–35. Geometry

Desktop 1440 measured: module 1376, cards 446×250, gaps 19/18, top gap 16 after Explore — pass. Tablet 2-col / mobile 1-col.

## 36–40. A11y / tests / typecheck / build / evidence

Accessibility: semantic landmarks, contextual action names, polite live region, gold focus, 44px targets.  
Tests: 9/9 focused. Typecheck clean for Module 005. `yarn build` exit 0.  
Evidence under `apps/web/docs/runtime/farms-module-005-finished-farms/` (fixture-labeled screenshots documented).

## 41. Deviations

- Default evidence is wallet-disconnected (no mock wallet injection).
- Withdraw/emergency/mixed state screenshots are labeled when runtime has no finished wallet positions.
- Ended date unavailable until a factual end provenance exists on the preview model.

## 42. Remaining honest limitations

- `/farms/history` is the closed-history destination (legacy page), not a new Module 005 archive UI.
- FeaturedFarmPanel / Activity remain until later missions.

## 43. Factual blockers

None for Module 005 certification.

## 44. Working-tree status

Clean after commit on `farms-module-005-finished-farms`.

## 45. Exact next mission

`FARMS_MODULE_006_YIELD_ADVISOR`
