# DATA_PROVENANCE — Founder Review V4

Pipeline: `GLOBAL_DATA_TRUTH_PIPELINE=melega-global-data-truth-v1`

Missing uncertified metrics render `—` (never `Unavailable`, never invented `0`).

## Home Top Pools

| Field | Source | Selector | Chain | Certification rule | Fallback | Render when unavailable |
|---|---|---|---|---|---|---|
| chainId | Active wallet / studio chain | `useActiveChainId` + pool token chain | active | On-chain pool config | — | — |
| pool contract | SmartChef / sous config | `pool.contractAddress` / sousId | pool chain | Registry + runtime | — | hide row if no identity |
| stake token | `pool.stakingToken` | Redux pool public data | pool chain | Token metadata | — | — |
| reward token | `pool.earningToken` | Redux pool public data | pool chain | Token metadata | — | — |
| totalStaked | SmartChef `totalStaked` | `fetchPoolsPublicDataAsync` | pool chain | On-chain balance | — | economics excluded from Home rank |
| stakeTokenPriceUsd | Farm pair prices | `getTokenPricesFromFarm` via WBNB/MARCO helpers | pool chain | Farm mid price > 0 | optional `marcoUsd` hint | TVL → — |
| rewardTokenPriceUsd | Farm pair prices | same price map | pool chain | Farm mid price > 0 | — | APR may → — |
| reward emission | `tokenPerBlock` | pool public data | pool chain | `tokenPerBlock > 0` | — | — |
| TVL USD | `totalStaked × stake price` | `resolvePoolTvlUsd(pool, hints)` | pool chain | staked > 0 AND price > 0 | — | — |
| APR | runtime `pool.apr` / emission math | `resolvePoolAprPercent` / display APR | pool chain | finite APR > 0 | — | — |

**Home membership:** ranked Redux pools with certified `tvlUsd > 0 || apr > 0` only. No inventory-name padding (`listLivePoolInventoryPreview` removed).

**Shared helpers with Pools Studio:** `lib/data-truth/yieldMetricHelpers.ts` (`resolvePoolTvlUsd`, `resolvePoolAprPercent`).

## Pools Explore cards

| Field | Source | Selector | Chain | Certification rule | Fallback | Render when unavailable |
|---|---|---|---|---|---|---|
| Stake / Reward | config + runtime tokens | `card.stakeToken` / `rewardToken` | card.chainId | symbol present | TOKEN/REWARD label | — |
| TVL | `resolvePoolTvlUsd` via `resolveTvl` | `buildPoolsExplorePools.ts` | card.chainId | staked>0 & price>0 | preview `tvl` label if certified | — |
| APR | `sustainableAprDisplay` / `apr` | `resolveApr` | card.chainId | not forbidden / not estimated-from-type | — | — |
| Remaining | `remainingRewards` / duration helpers | `resolveRemaining` | card.chainId | finite runway or reward budget label | — | — |
| Emission | `dailyRewards` / `tokenPerBlock×28800` | `resolveEmission` | card.chainId | per-block > 0 | — | — |
| Duration (lock) | visual/lock metadata | `resolveExploreLockType` | card.chainId | lock type known | Flexible | — |
| Participants | wallet census | **none today** | — | requires indexer | never use totalStaked | **always —** |

**Price helper parity:** `state/pools/hooks.ts` `getActiveFarms` now includes `MARCO/WBNB`, `WBNB/BUSD`, and earn-token farm expansion — same family as Home `resolvePriceHelperFarmPids`.

## Inventory stubs

Global inventory rows without `totalStaked` / prices remain identity-only. Metrics stay `—` until runtime public data certifies them. No synthetic estimates.
