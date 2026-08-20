# CANARY_ECONOMICS

Not broadcast.

Policy: `SMARTSWAP_REVENUE_POLICY_V1` / `1.0.0`  
Structural route cost: **25 bps** (Pancake V2 LP, embedded in `getAmountsOut`)  
Selected band: **20 bps** (policy, not manual)  
Fee asset: WBNB (INPUT-ASSET FEE)  
Beneficiary: `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b`

| item | raw | display |
|------|-----|---------|
| Input | `10000000000000000` | 0.01 WBNB |
| SmartSwap fee | `20000000000000` | 0.00002 WBNB |
| Venue input | `9980000000000000` | 0.00998 WBNB |
| Snapshot gross quote (0.01 in) | `6392498053241215113` | ~6.392 USDT |
| Snapshot net quote (0.00998 in) | `6378955984843176435` | ~6.379 USDT |
| Planning min (50 bps of snapshot net) | `6347062205918958552` | ~6.347 USDT |
| Fork live user output (same-block min=quoted) | `6401086816907500952` | ~6.401 USDT |

Quotes move. A live canary must re-quote immediately before seal. Fork execution used `getAmountsOut` in the same fork block, so minOut = quoted out.

## Gas (BNB mainnet fork, paired comparison)

| | gas units |
|--|-----------|
| Direct Pancake `swapExactTokensForTokens` 0.01 WBNB | 76,576 |
| `SmartSwapExecutorV1.execute` | 194,194 |
| Incremental | 117,618 |
| Overhead | 153.6% of direct swap gas |

Observed fork RPC gas price: `50000000` wei (0.05 gwei).  
Incremental BNB at that price: `117618 * 50e6 = 5880900000000` wei ≈ 0.00000588 BNB.

## Maximum expected economic exposure

Success: 0.01 WBNB converted + wrap/approve/execute gas.  
Atomic failure: input returns; only gas is spent.  
No mainnet funds were used.

Fee band is **not** changed because of gas.
