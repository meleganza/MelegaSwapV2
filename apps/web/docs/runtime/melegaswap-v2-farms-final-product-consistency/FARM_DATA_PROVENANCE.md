# FARM_DATA_PROVENANCE

| Metric | Source | Selector | Identity key | Certification rule | Fallback |
|--------|--------|----------|--------------|--------------------|----------|
| APR | Farm runtime `displayApr` / `apr` on `FarmPreviewCard` | `resolveApr` in `buildFarmsExploreFarms.ts` | `chainId + masterChef + pid` | Finite % from certified farm emission path | `—` |
| TVL | `resolveFarmLiquidityUsd(rawFarm)` then card labels | `resolveTvl` | LP / farm liquidity USD | Liquidity USD > 0 | `—` (never `$0` invention) |
| Multiplier | `card.multiplier` / raw | `resolveMultiplier` | farm config multiplier | Non-zero, not unavailable | omit / `—` in UI slot |
| Volume 24H | Pair market only (not yet on FarmPreviewCard) | `resolveFarmVolume24h` | `chainId + lpAddress` | Certified pair 24H volume | `—` (no TVL/emission derivation) |
| Fees 24H | Pair/Data Truth fee path only | `resolveFarmFees24h` | `chainId + lpAddress` | Existing certified fee display | `—` (no new formula) |
| Participants | Unique wallet census only | `resolveFarmParticipants` | farm identity | Census index / API | Always `—` on Explore cards today |
| Duration | Live schedule / lifecycle | `resolveFarmDuration` | farm status + multiplier | Live + multiplier → `Ongoing`; finished → `Ended` | `—` |
| Remaining | Time remaining (separate from rewards left) | `resolveFarmRemaining` / `rewardsRemaining` | farm schedule | Certified remaining clock | `—` |
| Rewards | Pending user rewards / daily emissions | wallet builder + `rewardRate` | wallet + pid | On-chain pending / daily label | `—` |

Never fabricate participants from LP supply, emissions, TVL, or raw bigint.
