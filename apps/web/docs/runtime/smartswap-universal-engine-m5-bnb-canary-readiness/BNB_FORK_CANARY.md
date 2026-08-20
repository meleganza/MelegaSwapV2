# BNB_FORK_CANARY

RPC: `BNB_MAINNET_RPC_URL` or fallback `https://bsc.publicnode.com`  
Fork chainId: **56**  
Broadcast: **false**

## Deploy on fork

`new SmartSwapExecutorV1(canonicalTreasury, testSigner, WBNB, testOwner)`  
`setRouter(PancakeV2, keccak256("pancakeswap"), true)`  
Melega router allowlist remains empty.

Test signer key `0xA11CE` is a Foundry fixture, not a founder key.

## Sequence (success)

1. Fund test EOA with 1 BNB
2. Wrap 0.01 WBNB (`deposit`)
3. Approve **executor** (not the Pancake router) for exact 0.01 WBNB
4. Seal intent (policy 20 bps, Treasury canonical, path WBNB→USDT)
5. `execute`
6. Protocol fee to Treasury
7. Pancake `swapExactTokensForTokens` of net input
8. User receives USDT ≥ min
9. Executor WBNB/USDT/BNB residual = 0
10. Nonce consumed

## Observed success (fork)

| | |
|--|--|
| `FORK_CANARY_OK` | yes |
| Treasury fee | `20000000000000` WBNB |
| Venue input | `9980000000000000` WBNB |
| User output | `6401086816907500952` USDT (live pool; same-block quote) |
| FEE_VERIFIED | 0 |

If the RPC/fork is unavailable the Foundry suite skips rather than fabricating balances. This run **did not skip**.
