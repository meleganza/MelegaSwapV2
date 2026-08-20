# SEALED_CANARY_INTENT

Unsigned schema for the first canary. **No founder signature. No live private key.**

| field | value |
|-------|--------|
| version | 1 |
| policyVersion | `SMARTSWAP_REVENUE_POLICY_V1` / `1.0.0` |
| chainId | 56 |
| user | `SET_AT_AUTHORIZED_BROADCAST` |
| input asset | WBNB `0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c` |
| output asset | USDT `0x55d398326f99059fF775485246999027B3197955` |
| input amount | `10000000000000000` |
| minimum output | re-quote at broadcast; planning 50 bps of snapshot net = `6347062205918958552` |
| venue | pancakeswap |
| router | `0x10ED43C718714eb63d5aA57B78B54704E256024E` |
| route | `[WBNB, USDT]`, nativeIn=false, nativeOut=false |
| fee bps | 20 (policy) |
| fee amount | `20000000000000` |
| fee asset | WBNB |
| Treasury | `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` |
| deadline | `SET_AT_AUTHORIZED_BROADCAST` |
| nonce | `SET_AT_AUTHORIZED_BROADCAST` |
| signed | false |

Engine seal is repository keccak of the ABI-encoded fields. On-chain digest is eth_sign of that hash. Founder/mainnet signing is a later mission.
