# FARMS_MODULE_004_EXPLORE_FARMS_REPORT

## 1. Final verdict

**FARMS_MODULE_004_EXPLORE_FARMS_CERTIFIED**

## 2. Branch

`farms-module-004-explore-farms`

## 3. Mission commit

`eba74be36238de6851dd06c6358a5e54b1547404`

## 4. Certified base

| | |
| --- | --- |
| Module 003 | `FARMS_MODULE_003_MY_FARMS_CERTIFIED` |
| Branch | `farms-module-003-my-farms` |
| Tip | `509e7119` |
| Mission commit | `f0a30f6b` |
| Module 002 tip | `69207266` |
| Module 001 tip | `21c2c0bb` |
| Architecture | `8edd68d4` |

## 5. Worktree

`/Users/marcomelega/Projects/MelegaSwapV2-farms-m004`

## 6. Architecture freeze

Architecture tip `8edd68d4` retained. Contracts phase for Module 004 updated to `certified-by-module-004` only.

## 7. Founder mockup integrity

SHA-256 `a19e506f7d7a5194050d52481f0b220bad30e4a774e3fde2529b37e830db848a` — byte-identical.

## 8–10. Module 001–003 freeze

| Module | Pass |
| --- | --- |
| 001 Hero sources | yes (byte SHA) |
| 002 Overview KPIs sources | yes (byte SHA) |
| 003 My Farms sources | yes (byte SHA at `509e7119`) |

## 11. Files changed

- `modules/FarmsExploreFarmsModule.tsx`
- `modules/FarmsExploreFarmCard.tsx`
- `modules/farmsExploreFarmsTokens.ts`
- `modules/farmsExploreFarmsTypes.ts`
- `modules/buildFarmsExploreFarms.ts`
- `modules/useFarmsExploreFarms.ts`
- `FarmsStudioScreen.tsx` (mount after My Farms; supersede FilterRow + Grid; `#explore-farms` owned by Module 004)
- `__tests__/farmsModule004.exploreFarms.test.ts`
- `FARMS_MODULE_OWNERSHIP_MAP.md`
- `farmsArchitecture000Contracts.ts` (004 phase)
- `docs/runtime/farms-module-004-explore-farms/*`
- `FARMS_MODULE_004_EXPLORE_FARMS_REPORT.md`

## 12. Module 004 ownership

Public ACTIVE stakeable LP farm browser. Consumes `portfolioFarms` + `FarmsActionHost` only. Does not own Finished Farms, Yield Advisor, or Analytics.

## 13. Explore Farms domain

Answers which LP farms are active, which LP to stake, which reward is emitted, factual APR/TVL/multiplier, wallet stake readiness, and search/filter match.

## 14. Active-farm inclusion policy

`isActiveStakeableExploreFarm`: valid LP + MasterChef mapping, live/indexing, deposit CTA, non-zero multiplier, not finished/emergency-only, not zero/paused allocation. Pid 0 / token-only excluded.

## 15. Authoritative source

Canonical Farms runtime `portfolioFarms` / preview cards. No second indexer.

## 16. Masterbuilder mapping

`getMasterChefAddress(chainId)` + farm `pid` on each card model.

## 17–18. LP pair + reward identity

Distinct token0 / token1 / rewardToken refs with address-based logos. Title `TOKEN0 / TOKEN1 LP`, earn line `Earn REWARD`. Reward logo marked `data-reward-token`.

## 19. APR policy

Canonical `displayApr`/`apr`. Label **Sustainable APR** only when live + emission active; otherwise **APR**. Unavailable → `—` + support text. Never invent or zero-fill.

## 20. TVL policy

Farm `rawFarm.liquidity` (staked LP USD). Not wallet LP. Unavailable → `—` / Partial valuation.

## 21. Reward emission

Reward symbol always; rate from factual `dailyRewards` only.

## 22. Multiplier

Shown only when factual and non-zero; omitted without shifting unstable geometry.

## 23–24. Wallet LP + allowance

Independent wallet reads. Disconnected / zero / unavailable / approval states compact. Public registry not gated on allowance.

## 25–27. Search / filters / sort

Search across pair, reward, addresses (exact), farm id/pid. Filters: All, Stable/Volatile, Native Pair, High APR/TVL, Wallet Has LP, Approved, Stakeable Now. Sorts: Sustainable APR, TVL, Newest (start seconds or pid), Alphabetical, Wallet LP. Unavailable metrics sort after available; `farmId` tie-break.

## 28. Pagination

Initial 9 + Load More (+9). Preserves filter/search/sort. No infinite scroll.

## 29. Stable ordering

Dedupe pid/LP; retain last good registry on failed refresh (stale disclosure); wallet fields update independently; chain change drops retained set.

## 30. Stake action

`requestModal(sourceCard, 'stake')` → `FarmsActionHost`. Connect Wallet / Switch Network / Approve LP / Stake LP. Details omitted (no canonical `/farms/[id]`).

## 31–34. States

Loading: 3×446×268 skeletons. Empty: factual zero active. Partial: farms remain with disclosure. Unavailable: discovery failed (no false zero count).

## 35. Legacy supersession

Superseded mount of `FarmsFilterRow` + `FarmsGrid`. Files retained. Activity / Featured / Advisor panels remain. Single `#explore-farms` on Module 004.

## 36–38. Geometry

| Viewport | Result |
| --- | --- |
| Desktop 1440 | module 1376; cards 446×268; gaps 19 / 18; top gap 16 — measured pass |
| Tablet 1024 | 2-column responsive |
| Mobile 430 / 390 | single column; module ~398 / 358 |

## 39. Accessibility

Semantic section/heading/search/list/article; polite live region; gold focus ring; 44px targets; reduced motion.

## 40. Tests

`farmsModule004.exploreFarms.test.ts` — 11 passed. Module 003 suite still passes.

## 41. Typecheck

No Explore Farms module TypeScript errors.

## 42. Build

`yarn build` (apps/web) exit 0.

## 43. Evidence

`apps/web/docs/runtime/farms-module-004-explore-farms/` — screenshots + JSON integrity/validation artifacts. Empty/unavailable screenshots labeled (search-empty / test-only) in `screenshot-labels.json`.

## 44. Deviations

- Details secondary action omitted (no factual detail route).
- Unavailable discovery screenshot is test-only (cannot force runtime failure without sabotage).
- Filter-empty screenshot used for `desktop-empty.png` when universe is non-zero.

## 45. Remaining honest limitations

- Newest sort uses `auctionHostingStartSeconds` when present, else MasterChef pid (listing index), never source-array order.
- High TVL filter uses median cutoff of available TVLs in the active set.
- FeaturedFarmPanel remains below Explore until a later mission owns it.

## 46. Factual blockers

None for Module 004 certification.

## 47. Working-tree status

Clean after commit on `farms-module-004-explore-farms`.

## 48. Exact next mission

`FARMS_MODULE_005_FINISHED_FARMS`
