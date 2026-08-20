# FEE_COLLECTION_STRATEGY

Canonical first-canary strategy: **INPUT_ASSET_FEE** + **EXACT_IN**.

## INPUT example

User input 1,000,000 units. 20 bps fee = 2,000. Venue receives 998,000. User receives 100% of venue output. `minimumReceived` = venue `amountOutMin` on the post-fee input.

## OUTPUT example (not selected)

Would skim the output token after the swap. Requires the executor as recipient then a second transfer; fee-on-transfer output tokens break accounting; min-received semantics split between venue min and user min.

## Why INPUT for M4

| Criterion | INPUT | OUTPUT |
|-----------|-------|--------|
| Exact-in compatibility | Venue input is known net | Venue input is full gross; fee after |
| Minimum received | Equals user output | Must subtract fee from venue out |
| Allowance | User → executor; executor → router (net) | Same, plus executor holds output |
| Native | Wrap fee to WBNB/WETH, forward leftover native to router | Native out must land on executor first |
| Fee-on-transfer | Already **UNSUPPORTED** | Worse on output skim |
| Receipt | Treasury delta in input asset | Treasury delta in output asset |
| Precedent in repo | `MelegaSmartRouterWrapper` | none for SmartSwap |

Rounding: **floor** `(amount * bps) / 10_000`. Remainder stays in venue input. User is never charged above the sealed bps.
