# NEXT_CANARY_TARGET

Status: **UNSIGNED_PACKAGE_PREPARED_NOT_SIGNED**

Founder authorized **preparation only**. Not signing by the agent. Not broadcast. Not activation.

| Field | Value |
|-------|--------|
| Chain | BNB Smart Chain (56) |
| Venue | pancakeswap (already allowlisted) |
| Router | `0x10ED43C718714eb63d5aA57B78B54704E256024E` |
| Path | WBNB → USDC |
| Pair | `0xd99c7f6c65857ac913a8f880a4cb84032ab2fc5b` |
| Input | `10000000000000000` WBNB (unchanged; not reduced) |
| Intent nonce | 2 |
| Executor | `0x296015b106F4b2FB94249cf398cbF05d4CcE0391` |
| Treasury | `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` |
| Approve package | `deployments/mainnet/m7-unsigned-approve-tx.json` nonce **3207** |
| Execute package | `deployments/mainnet/m7-unsigned-canary-execute.json` nonce **3208** |
| Founder helper | `deployments/mainnet/m7-founder-helper.html` |
| Production | `ACTIVE_V2_ROLLOUT=LEGACY_PRODUCTION` |

Observed deployer WBNB `12000000000000000`. Required `10000000000000000`. Shortfall `0`. Allowance `0`.

`UNAUTHORIZED_UI_CHANGE=0`
