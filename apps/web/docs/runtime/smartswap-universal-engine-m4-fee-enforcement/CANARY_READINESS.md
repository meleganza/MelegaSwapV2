# CANARY_READINESS

Status: **CANARY_PREPARED**. `executed: false`.

| Field | Value |
|-------|--------|
| Chain | BNB Smart Chain (56) |
| Venue | PancakeSwap V2 (M3 factual `getAmountsOut` succeeded) |
| Pair | WBNB → USDC |
| Input | `10000000000000000` (0.01 WBNB) |
| Expected fee band | 20 bps (Pancake LP 25 bps structural) |
| Expected Treasury | `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` |
| Router | `0x10ED43C718714eb63d5aA57B78B54704E256024E` |
| Gas ceiling | 400,000 units (planning bound, not a mainnet measurement) |
| Quote expiry | 30 seconds |
| Disable | Pause `SmartSwapExecutorV1`; keep `ACTIVE_V2_ROLLOUT = LEGACY_PRODUCTION` |

Pre/post state would be recorded at canary time. **M4 does not broadcast.**
