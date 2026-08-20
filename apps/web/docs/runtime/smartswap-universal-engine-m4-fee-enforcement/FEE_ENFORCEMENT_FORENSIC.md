# FEE_ENFORCEMENT_FORENSIC

Mission: `MELEGASWAP_V2_SMARTSWAP_UNIVERSAL_ENGINE_M4_EVM_PROTOCOL_FEE_ENFORCEMENT`  
No mainnet deploy. No production routing change.

## Treasury

| Source | Address |
|--------|---------|
| `fee-schedule.json` treasury | `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` |
| `MELEGA_TREASURY_FEE_DESTINATION` | same |
| `CANONICAL_SMARTSWAP_FEE_BENEFICIARY` | same |
| `MELEGA_TREASURY_BSC` / dex economic authority | same |
| Chains listed | 56, 8453, 137, 1, 42161, 43114 |

`MELEGA_FEE_COLLECTOR_BSC` (`0xb5a8707F…`) is a **pair-fee collector**, not the SmartSwap protocol-fee beneficiary. SmartSwap destination is unambiguous: **`0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b`**. Not `SMARTSWAP_M4_BLOCKED_TREASURY_AMBIGUITY`.

## Existing components

| Component | Classification | Reuse for M2 policy? |
|-----------|----------------|----------------------|
| Melega V2 routers (`ROUTER_ADDRESS`) | EXISTING_ROUTER_NATIVE | No integrator fee |
| Pancake V2 `0x10ED43C7…` | EXISTING_ROUTER_NATIVE | No integrator fee |
| Uniswap V2 `0x7a250d56…` | EXISTING_ROUTER_NATIVE | No integrator fee |
| `MelegaSmartRouterWrapper` | WRAPPER_EXECUTOR / EXISTING_SETTLEMENT | **No** — hardcoded D87 20/30 bps, single underlying router, not M2 bands, max 30 > 25 |
| `MelegaGasFeeSmartRouterWrapper` | WRAPPER_EXECUTOR | **No** — 25% of gas quote, different product |
| `V2ExecutionAdapter` | venue adapter | Translates to V2; **does not collect protocol fee** |
| `settleGasProtocolFeeOnChain` | non-atomic native transfer | **Forbidden** as SmartSwap collection (second tx) |
| Permit2 | unused | Not in this repo’s swap path |
| Multicall | not used for swap+fee | Not selected |
| Liquidity-building treasury sink | unrelated product | No |

## Selected architecture

**WRAPPER_EXECUTOR** — new `SmartSwapExecutorV1`:

- venue-independent allowlisted V2 routers
- INPUT-ASSET FEE (same family as D87 wrapper, different policy)
- sealed intent (keccak + engine ECDSA on-chain)
- atomic swap + fee
- `EXECUTE = false` in production adapters

Not `EXISTING_ROUTER_NATIVE` (cannot enforce fee).  
Not D87 wrapper (would violate `SMARTSWAP_REVENUE_POLICY_V1`).  
Not `INPUT_SPLIT` as a second user tx.  
Not `OUTPUT_SETTLEMENT` for the first canary (see strategy doc).

## Trust boundary

Executor encodes `swapExactTokensForTokens` / `swapExactETHForTokens` / `swapExactTokensForETH` only. No arbitrary `call`. Router must be allowlisted. Recipient is `intent.user`. Beneficiary is immutable treasury. Route is `routeHash` of path + native flags.
