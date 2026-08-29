# NEXT_CANARY_TARGET

Status: **UNSIGNED_PACKAGE_PREPARED_NOT_SIGNED**

Founder authorized **preparation only**. Not funding. Not signing. Not broadcast. Not activation.

| Field | Value |
|-------|--------|
| Chain | BNB Smart Chain (56) |
| Venue | pancakeswap (already allowlisted) |
| Router | `0x10ED43C718714eb63d5aA57B78B54704E256024E` |
| Path | WBNB → USDC |
| Pair | `0xd99c7f6c65857ac913a8f880a4cb84032ab2fc5b` |
| Input | `10000000000000000` WBNB (unchanged; not reduced to fit balance) |
| Intent nonce | 2 |
| Executor | `0x296015b106F4b2FB94249cf398cbF05d4CcE0391` |
| Treasury | `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` |
| Approve package | `deployments/mainnet/m7-unsigned-approve-tx.json` nonce **3206** |
| Execute package | `deployments/mainnet/m7-unsigned-canary-execute.json` nonce **3207** |
| Production | `ACTIVE_V2_ROLLOUT=LEGACY_PRODUCTION` |

## Funding shortfall (Founder-only)

Observed deployer WBNB `5000000000000000`. Required `10000000000000000`. Shortfall `5000000000000000`. Allowance `0`. Amount was not reduced.

Package remains unsigned-ready. Broadcast is blocked until funded and nonce/deadline still match.

`UNAUTHORIZED_UI_CHANGE=0`
