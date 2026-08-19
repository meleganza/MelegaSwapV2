# VENUE_FEE_ENFORCEMENT_MATRIX

Prerequisite for M4. **Not implemented in M3.** No collection. No wrapper deploy.

Canonical beneficiary (unchanged): `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b`

M3 fee state for every V2 candidate: `FEE_PREVIEW_ONLY` (or `FEE_UNAVAILABLE` if structural cost cannot be certified). Never `FEE_ENFORCEABLE`.

| Venue | Current M3 state | Possible future mechanisms | Implemented |
|-------|------------------|----------------------------|-------------|
| Melega DEX | FEE_PREVIEW_ONLY | venue-native integrator fee; wrapper executor; settlement contract | false |
| PancakeSwap V2 | FEE_PREVIEW_ONLY | wrapper executor; input split; output settlement | false |
| Uniswap V2 | FEE_PREVIEW_ONLY | wrapper executor; input split | false |
| Uniswap Universal Router (future) | not used | aggregator-supported fee; Permit2-based settlement | false |
| Pancake V3 / Infinity (future) | not used | aggregator-supported fee; wrapper executor | false |

## PancakeSwap V2 — execution readiness (documented only)

| Topic | Fact |
|-------|------|
| Router target | `0x10ED43C718714eb63d5aA57B78B54704E256024E` (BSC) |
| Spender | Same router for ERC-20 `approve` |
| Approval model | Standard ERC-20 allowance to the V2 router. No Permit2 |
| Native / wrapped | `swapExactETHForTokens` / `swapExactTokensForETH`; path uses WBNB `0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c` |
| Permit | V2 router has no Permit2. Token `permit` would be token-specific, not used here |
| Future tx construction | Exact-in `swapExactTokensForTokens` / ETH variants. Recipient = user. Deadline required |
| Receipt verification | Standard Swap logs. Not implemented |
| Fee enforcement | V2 router has no integrator fee parameter. Would need a wrapper or split. **Not built.** |

## Uniswap — execution readiness (documented only)

| Topic | Fact |
|-------|------|
| Router used in M3 quotes | V2 `0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D` (Ethereum) |
| Universal Router / SwapRouter | **Not used.** Future path only |
| Permit2 | Universal Router dependency. **Not used** for V2 quotes |
| Native wrapping | Path uses WETH `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2` |
| Recipient semantics | V2 `to` argument. Would be the user, not a fee sink, unless a wrapper exists |
| Fee enforcement | V2: wrapper / split. Universal Router: possible command-level fee in a later mission. **Not built.** |

M3 adapters `execute` / `prepareExecution` always throw `V2_SHADOW_EXECUTION_FORBIDDEN`.
