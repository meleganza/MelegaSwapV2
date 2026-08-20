# FUNDING_REQUIREMENT

Wallet: `0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0`

Read-only at BSC block `117066237`. Gas price observed: `50000000` wei (0.05 gwei).

## Current balances

| | wei | approx |
|--|-----|--------|
| BNB | `18462459335635472` | 0.01846 BNB |
| WBNB | `15000000000000000` | **0.015 WBNB** |

M6 preflight earlier today had 0 WBNB. WBNB is now above the 0.01 canary input. This mission did not transfer or wrap.

## Required vs recommended (canary still not authorized to broadcast)

| | required minimum | recommended |
|--|------------------|-------------|
| WBNB | `10000000000000000` (0.01) | 0.01 (do not increase notional) |
| BNB gas | ~0.001 at observed price; ~0.007 at 3 gwei stress for ~2.1M combined gas | **0.01 BNB** left after any wrap |

Gas unit planning (from M5 dry-run / fork, not a new broadcast):

| step | units (order of magnitude) |
|------|----------------------------|
| Deploy constructor | ~1,706,190 |
| `setRouter` | ~50,000 |
| WBNB approve | ~46,000 |
| `execute` | ~200,000 |

At 0.05 gwei that is ≪ 0.001 BNB. Current BNB covers gas **without wrapping**.

## Founder instruction

Canary input can come from the existing **0.015 WBNB**. Do not wrap unless WBNB later falls below 0.01. Do not send more than 0.01 WBNB into the canary.

No wrap/approve/swap in this mission.
