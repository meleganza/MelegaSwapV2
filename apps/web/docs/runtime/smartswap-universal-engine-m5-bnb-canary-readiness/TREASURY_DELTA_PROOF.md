# TREASURY_DELTA_PROOF

Canonical Treasury: `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b`

Evidence: `IERC20(WBNB).balanceOf(TREASURY)` before and after `execute` on the BNB fork.

| | WBNB raw |
|--|----------|
| Expected fee | `20000000000000` |
| Observed delta | `20000000000000` |
| Rounding | floor `(amount * 20) / 10000` — exact at this notional |

Collection is **not** inferred from `SmartSwapExecuted` alone.

This is fork state. It does **not** prove a mainnet collection. Status remains `FEE_ENFORCEABLE`, never `FEE_VERIFIED`.
