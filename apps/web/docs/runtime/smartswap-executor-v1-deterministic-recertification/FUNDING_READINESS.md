# FUNDING_READINESS

Wallet: `0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0`

Read-only at BSC block `117072549`. Gas price `50000000` wei (0.05 gwei). No wrap, transfer, or approve.

| | wei | approx |
|--|--|--|
| BNB | `18462459335635472` | 0.01846 BNB |
| WBNB | `15000000000000000` | 0.015 WBNB |

## Adequacy for a later authorized canary

| need | requirement | status |
|--|--|--|
| Canary input | 0.01 WBNB | 0.015 WBNB is enough; do not wrap unless WBNB later falls below 0.01 |
| Deploy gas | ~1.86M units | ≪ 0.001 BNB at 0.05 gwei; still small at 3 gwei stress |
| `setRouter` + approve + execute | ~300k combined order of magnitude | covered by remaining BNB |
| Safety margin | leave ~0.01 BNB after gas | current BNB is ~0.018; adequate at observed price; founder should re-check before M6 |

Do not fund automatically.
