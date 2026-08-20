# ROUTE_ECONOMIC_REPLAY

Replay after measured executor gas. **Fee band unchanged.**

| component | bps |
|-----------|-----|
| Structural (Pancake V2 LP) | 25 |
| SmartSwap protocol fee | 20 (policy) |
| Incremental gas vs 0.01 WBNB at 0.05 gwei | ≈ 6 |
| Total execution (incl. incremental gas) | ≈ 51 |

`SMARTSWAP_REVENUE_POLICY_V1` still selects 20 bps from structural 25. Gas is excluded from band selection.

Still rational vs a direct Pancake swap of the same notional: the user receives ~6.40 USDT on 0.01 WBNB after the 20 bps input fee; incremental gas at the observed price is far smaller than the protocol fee (0.00002 WBNB). A 0.01 WBNB canary is a proof size, not a profit-max size.
