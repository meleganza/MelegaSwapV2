# Pool data provenance

Shared Explore builder: `buildPoolsExplorePools.ts` → `cardToExploreModel`.  
Display dash helper: `truthDash` / `—` when uncertified. No second TVL/APR formula.

## TVL

| | |
|--|--|
| **Source** | Certified pool TVL via `resolvePoolTvlUsd` + preview `tvl` display |
| **Selector** | `resolveTvl(card)` in `buildPoolsExplorePools.ts` |
| **Certification** | Requires finite positive USD from existing Data Truth helpers; never invent `$0` |
| **Fallback** | `—` (+ support note when unavailable) |

Home Top Pools continues to use the same canonical helpers (`homeTopPoolsCanonical` suite).

## APR

| | |
|--|--|
| **Source** | `sustainableAprDisplay` / certified APR fields on `PoolPreviewCard` |
| **Selector** | `resolveApr(card)` |
| **Certification** | `isForbiddenAprDisplay` rejects Unavailable / NaN / fake zeros |
| **Fallback** | `—` |

## Rewards (emission / claimable)

| | |
|--|--|
| **Source** | `dailyRewards` / `estimatedDailyReward` / analyze preview emission |
| **Selector** | `resolveEmission(card)` → `emissionDisplay` |
| **Certification** | Truth label strips Unavailable / NaN |
| **Fallback** | `—` |

Wallet claimable rewards on My Positions use position `claimableFormatted` from runtime userData (not fabricated).

## Participants

| | |
|--|--|
| **Source** | None certified today (no unique-staker wallet census in indexer) |
| **Selector** | `resolveParticipants(card)` always returns `—` |
| **Certification** | Explicitly **must not** derive from `totalStaked`, supply, budget, emission, or raw bigint |
| **Fallback** | `—` |

Card `participants` strings from legacy preview are ignored for Explore display.

## Remaining

| | |
|--|--|
| **Meaning** | Remaining **reward duration** only (not inventory) |
| **Source** | `estimatedDuration` or analyze `emissionEndEstimate` |
| **Selector** | `resolveRemaining(card)` → `remainingDisplay` |
| **Certification** | Duration-like facts only |
| **Fallback** | `—` |

Separate inventory field:

| | |
|--|--|
| **Meaning** | Rewards left (inventory) |
| **Source** | `remainingRewards` / analyze preview |
| **Selector** | `resolveRewardsLeft(card)` → `rewardsLeftDisplay` |
| **UI** | Shown as **Rewards left** only when factual |

## Duration

| | |
|--|--|
| **Meaning** | Lock / schedule model (Flexible, 30 Days, Ends date, …) |
| **Source** | Explore lock type + optional end estimate |
| **Selector** | `resolveDurationDisplay(card, lockType)` → `durationDisplay` |
| **Certification** | Flexible only when lock model is flexible; no guessed day counts |
| **Fallback** | `—` |
