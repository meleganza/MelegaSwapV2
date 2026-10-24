# NG008 — shadow transaction readiness

Non-executing diagnostic. This beta does not sign, approve, broadcast, collect a fee, or build swap calldata.

## Adapter boundary

| Piece | Where it lives | This beta |
| --- | --- | --- |
| Factual BNB quote | `apps/next-gen` `previewBnbQuote` | Reused. `executable: false` |
| Unsigned approval and swap | `prepareV2UserTransactions` in `apps/web/src/lib/smartswap-universal-engine/v2ExecutionBinding.ts` | Not imported and not copied |
| Calldata encoders | `encodeApproveCalldata`, `encodeExecuteCalldata` in that file, via `@ethersproject/abi` | Not imported |
| Planner | `buildV2UserExecutionPlan` in `v2UserExecutionPlan.ts` | Not imported |
| Executor address | `BSC_SMARTSWAP_EXECUTOR_V2_ADDRESS` `0x7c07082839edd5797737640bba6af47992b9861e` | Copied as a read-only allowance spender |
| Activation | A later mission must call the existing planner. It must not add a second encoder | Blocked |

Copying `prepareV2UserTransactions` would pull the live ABI coder into the beta bundle and create a second executor. The shadow check stops at that boundary. `unsignedTx` is always null. `gasUnits` is always null because `eth_estimateGas` needs that payload.

`productionExecutionCapable` inside the live helper is already false. Public fee collection remains not certified, so this diagnostic shows no fee amount.

## Readiness matrix

Permanent blockers, even when the reads succeed:

- `WALLET_NOT_CONNECTED` — no connector, no signature
- `UNSIGNED_TX_BLOCKED` — payload stays in the live adapter
- `FEE_NOT_CERTIFIED` — no fee amount
- `GAS_NOT_ESTIMATED` — no estimate without the payload
- `TRANSACTIONS_DISABLED`

Conditional blockers:

| Check | Before RPC | Result |
| --- | --- | --- |
| Chain is not 56 | Yes | `CHAIN_MISMATCH` |
| Address is not 20 bytes | Yes | `ADDRESS_REJECTED` |
| Quote missing, mismatched, or not on an allowlisted venue | Yes | `QUOTE_REQUIRED` or `QUOTE_REJECTED` |
| Quote older than 15 seconds | Yes | `QUOTE_STALE` |
| Balance read fails or times out | After the call | `RPC_FAILED`, no invented number |
| Token balance below the quoted input | After a factual read | `INSUFFICIENT_BALANCE` |
| Allowance below the quoted input for the executor or the quoted router | After a factual read | `EXECUTOR_ALLOWANCE_SHORT` or `ROUTER_ALLOWANCE_SHORT` |

The route is `POST /api/shadow-readiness`. It runs only after a quote preview and an explicit read. Home does not call it.
