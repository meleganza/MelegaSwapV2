# FEE_ENFORCEMENT_STATUS

After successful fork proof:

| path | state |
|------|--------|
| Pancake BSC WBNB→USDT canary package | `FEE_ENFORCEABLE` |
| Any path | **not** `FEE_VERIFIED` |

`FEE_VERIFIED` requires a mainnet receipt with proven Treasury delta. M5 had no mainnet transaction.

Enforced in:

- `classifyM5FeeState({ forkSucceeded: true, mainnetTxHash: null }) → FEE_ENFORCEABLE`
- `classifyM5FeeState({ mainnetTxHash: '0x…' })` throws `V2_M5_FEE_VERIFIED_FORBIDDEN`
- `verifyForkEconomics` sets `collectionProven: false`, `txStatus: 'fork'`
- `markFeeCollected` still throws unless already `FEE_VERIFIED`
- Foundry success log `FEE_VERIFIED 0`
