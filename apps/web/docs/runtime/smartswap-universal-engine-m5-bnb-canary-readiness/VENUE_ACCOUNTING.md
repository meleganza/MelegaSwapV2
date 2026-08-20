# VENUE_ACCOUNTING

INPUT-ASSET FEE:

`inputAmount - SmartSwapFee = venueInput`

| | raw WBNB |
|--|----------|
| Input | `10000000000000000` |
| Fee | `20000000000000` |
| Venue input | `9980000000000000` |

`10000000000000000 - 20000000000000 = 9980000000000000` (exact).

Executor approves the Pancake router for **net only**, then `forceApprove(router, 0)`. No unexplained asset delta on the executor after success or revert.
