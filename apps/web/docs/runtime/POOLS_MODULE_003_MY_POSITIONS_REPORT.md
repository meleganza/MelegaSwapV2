# POOLS_MODULE_003_MY_POSITIONS_REPORT

## 1. Final verdict

**POOLS_MODULE_003_MY_POSITIONS_CERTIFIED**

## 2. Branch

`pools-module-003-my-positions`

## 3. Mission commit

`9084ea86c8bfaaf9b5cb45c032ba3aa9b0fcecfb`

## 4. Certified base

| | |
| --- | --- |
| Module 002 | `POOLS_MODULE_002_OVERVIEW_KPIS_CERTIFIED` |
| Branch | `pools-module-002-overview-kpis` |
| Tip | `c9b4a725` |
| Implementation | `9a0751e2` |
| Module 001 tip | `4cff101d` |
| Architecture | `f1d1fd11` |

## 5. Worktree

`/Users/marcomelega/Projects/MelegaSwapV2-pools-m003`

## 6. Architecture freeze

Architecture 000 ancestry preserved (`f1d1fd11` ⊂ HEAD). Mockup SHA unchanged. No shell cutover. Modules 004–010 not mounted.

## 7. Founder mockup integrity

SHA-256 `549ca3bb663315730945de4ada9bc36559399cf3e9ce72a59de4d10f89558d4f` — **pass**.

## 8. Module 001 freeze

Hero sources byte-locked (`POOLS_MODULE_001_FREEZE_SHA256`). Live Hero height re-measured **260px**.

## 9. Module 002 freeze

Overview KPI sources byte-locked (`POOLS_MODULE_002_FREEZE_SHA256`). Live KPI strip **1376×112**, top gap Hero→KPIs **16px**.

## 10. Files changed

- `modules/PoolsMyPositionsModule.tsx`
- `modules/PoolsMyPositionCard.tsx`
- `modules/usePoolsWalletPositions.ts`
- `modules/buildPoolsWalletPositions.ts`
- `modules/poolsMyPositionsTokens.ts`
- `modules/poolsMyPositionsTypes.ts`
- `PoolsStudioScreen.tsx` (mount Module 003; supersede legacy `YourPoolsSection` for My Positions surface)
- `__tests__/poolsModule003.myPositions.test.ts`
- `__tests__/poolsModule001.hero.test.ts` / `poolsModule002.overviewKpis.test.ts` (unlock assertions only)
- `POOLS_MODULE_OWNERSHIP_MAP.md` (Module 003 ownership record)
- evidence under `docs/runtime/pools-module-003-my-positions/`
- this report

## 11. Module 003 ownership

Wallet-scoped Pools staking positions after Overview KPIs. Left surface 936×360; right 424px reserved for Module 006 (not implemented). Consumes `portfolioPools` + `PoolsActionHost`.

## 12. Position-domain definition

SmartChef / SousChef / vault staking only. Excludes Farms LP, Liquidity LP, Factory pairs, ordinary balances, config-only pools.

## 13. Position inclusion policy

Include when `userStaked > 0` **or** `pendingReward > 0`. Exclude zero principal + zero claimable.

## 14. Authoritative position sources

`runtime.portfolioPools` (producer inventory with `userData`) via `buildPoolsWalletPositions` / `usePoolsWalletPositions`.

## 15. Wallet scoping

`positionId` embeds `chainId` + wallet + sousId. Wallet/chain change clears last-good and bumps generation.

## 16. Position status mapping

| Position | Rule |
| --- | --- |
| ACTIVE | Live/indexing pool with economic position |
| WITHDRAW_ONLY | Ended pool + principal > 0 |
| EMERGENCY | Ended + `enableEmergencyWithdraw` + principal |
| ENDED | Ended + claimable-only |
| PARTIAL | Confirmed position with missing fields |
| UNAVAILABLE | Sources failed without last-good |
| LOADING | Wallet query in flight |

## 17. Ordering policy

EMERGENCY → WITHDRAW_ONLY → ACTIVE (claimable first) → ENDED → PARTIAL → UNAVAILABLE; then claimable USD bucket → staked USD bucket → `positionId`.

## 18. Principal handling

Normalized via verified decimals (`getBalanceNumber`). USD omitted when price missing (never `$0.00` fallback).

## 19. Claimable-reward handling

Factual zero after successful read → `0 SYMBOL`. Unavailable → `—` + “Reward data unavailable”. Not labeled as error.

## 20. Decimals normalization

Uses `stakingToken.decimals` / `earningToken.decimals`. Raw uint256 never shown in formatted fields.

## 21. Token-logo behavior

`PoolTokenIcon` with address + chainId (canonical resolver). Same-token title collapses to single symbol.

## 22. Action capability mapping

Max 2 actions. Requires `rawPool` + wallet. Unsupported actions omitted (no dead buttons).

## 23. Claim behavior

`requestModal(card, 'claim')` → `PoolsActionHost` / `CollectModalContainer`. Busy label `Claiming…`.

## 24. Withdraw behavior

`requestModal(card, 'unstake')` for WITHDRAW_ONLY / ended principal. Busy label `Withdrawing…`.

## 25. Emergency behavior

Primary Emergency Withdraw when `enableEmergencyWithdraw` + ended principal; confirmation remains in operational StakeModal layer.

## 26. Loading behavior

Exactly 3 skeleton cards (288×276 desktop). No temporary zero-position state while loading.

## 27. Empty state

936×360 retained. “No pool positions yet” + Explore Pools → existing explorer (`data-ps-pool-explorer`).

## 28. Partial state

Confirmed positions shown; module disclosure + per-card reasons (Reward / Valuation unavailable).

## 29. Unavailable state

“Pool positions are temporarily unavailable” — funds not represented as zero; no count `0`.

## 30. Position stability

Last-good retention on public-data wipe / refresh failure. Authoritative empty only when `userData` present and economic residue zero. Stable sort tie-breaker.

## 31. Refresh and polling behavior

Generation bump on wallet/chain change. Failed refresh does not become factual zero. Stale disclosure during temporary failure.

## 32. Desktop geometry

Primary 1440: row **1376**, surface **936×360**, slot **424**, gaps **16**, header **60**, content **900**, cards **288×276** (± tolerances). Pass.

## 33. Tablet behavior

≤1199: My Positions full width; Advisor slot hidden (reserved mount strategy). Cards auto-fit ≥250px.

## 34. Mobile geometry

390: module **358px**. 430: module **398px**. One column; touch targets ≥44px.

## 35. Accessibility

`section` + heading + list; status text; polite live region; gold focus ring 2px/2px offset; contextual action names.

## 36. Tests

47 focused tests passed (000/001/002/003).

## 37. Typecheck

Covered by `next build` compilation.

## 38. Build

`yarn build` passed.

## 39. Evidence

`apps/web/docs/runtime/pools-module-003-my-positions/` — geometry, freezes, policy maps, screenshots (see `state-screenshot-labels.json` for TEST_ONLY stand-ins).

## 40. Deviations

- Wallet-dependent position-grid screenshots are TEST_ONLY stand-ins (disconnected baseline) — labeled in evidence.
- Narrower desktop (1280) scales the 936:424 ratio rather than forcing overflow.

## 41. Remaining honest limitations

- Emergency confirmation UX owned by existing StakeModal, not reimplemented in Module 003.
- Explore Pools content remains Module 004; empty CTA only scrolls to legacy explorer.
- `YourPoolsSection` file retained for legacy unit tests but unmounted from screen.

## 42. Factual blockers

None for certification scope.

## 43. Working-tree status

Clean after mission commit/push.

## 44. Exact next mission

`POOLS_MODULE_004_EXPLORE_POOLS` from tip of `pools-module-003-my-positions`.
