# R736 — Melega Smart Router Wrapper Gas Report

**Date:** 2026-07-08  
**Scope:** `contracts/MelegaSmartRouterWrapper.sol` v1 scaffold (Foundry mocks)  
**Method:** `forge test --gas-report` + dedicated `test_gas_*` harness tests  
**Optimizer:** 200 runs, `via_ir = true`, Solidity 0.8.20

## Summary

Wrapper v1 adds constitutional fee routing overhead on top of the underlying Pancake Smart Router call. Overhead is dominated by an extra ERC20 `transferFrom`, fee `transfer` to treasury, per-swap `forceApprove`/`reset`, event emission, and `ReentrancyGuard`/`Pausable` checks. No unsafe optimizations were applied in this review pass.

## Measured Gas (test harness, mock underlying router)

| Scenario | Total tx gas (test) | Wrapper fn median (`--gas-report`) | Direct router baseline | Estimated wrapper overhead |
|---|---:|---:|---:|---:|
| Standard ERC20 swap | 231,529 | 226,284 | 182,159 | ~49,370 (~27%) |
| BUY MARCO ERC20 swap | 214,351 | — | — | ~32k vs direct (lower fee path) |
| SELL MARCO ERC20 swap | 214,473 | — | — | ~32k vs direct |
| Native BNB swap | 210,439 | 143,412* | n/a (mock) | fee `call` + routing logic |
| Pause | 27,755 | 27,755 | n/a | owner-only |
| Unpause | 27,509 | 27,509 | n/a | owner-only |
| Pause + unpause (combined test) | 11,398** | — | n/a | amortized admin op |

\* Native median includes revert-path calls in the gas-report aggregate; successful native swaps measured ~210k in harness tests.  
\** Combined test reuses warm storage slots after first pause in the same tx context.

## Wrapper contract deployment

| Metric | Value |
|---|---:|
| Deployment gas | 1,147,185 |
| Deployed bytecode size | 5,679 bytes |

## Unavoidable overhead (by design)

1. **User → wrapper pull** — `safeTransferFrom` for gross `amountIn` (constitutional custody boundary).
2. **Protocol fee transfer** — `safeTransfer` (ERC20) or low-level `call` (native) to immutable `treasuryCollector`.
3. **Router allowance lifecycle** — `forceApprove(netAmountIn)` before call, `forceApprove(0)` after (stale-allowance prevention per `spec.ts`).
4. **Guards** — `nonReentrant` + `whenNotPaused` on swap entrypoints.
5. **Observability** — three events (`ProtocolFeeCollected`, `SmartRouterSwapRouted`, `TreasuryHandoffPrepared`) including policy ref hashes for Treasury Runtime handoff.
6. **Fee math** — BUY MARCO detection + bps floor division (minimal, but on hot path).

## Expected overhead vs production Pancake Smart Router

Against a direct Smart Router exact-input swap on BNB Chain (~150k–200k typical depending on path hops and token types), wrapper overhead is expected in the **+40k–55k gas** range for ERC20 paths on the scaffold mocks.

Native paths add a treasury ETH `call` before forwarding `netAmountIn` to the router. Production WBNB path validation is delegated to the underlying router in v1.

## Optimization opportunities (not implemented — review only)

| Opportunity | Savings estimate | Risk / notes |
|---|---|---|
| Permit2 single-pull (v2) | ~15k–25k | Requires certified Permit2 integration; out of v1 scope |
| Event packing / fewer storage reads | ~2k–5k | Must preserve Treasury Runtime index fields |
| Immutable collector as EOA vs contract | Variable | Contract collectors with reverting `receive` are a DoS vector (documented) |
| Batch fee + router via multicall-style internal helper | ~1k–3k | Marginal; increases audit surface |
| `via_ir` tuning / optimizer runs | Variable | Already enabled for correctness; re-profile before mainnet |

## Test references

Gas harness tests in `test/MelegaSmartRouterWrapper.t.sol`:

- `test_gas_standardErc20Swap`
- `test_gas_buyMarcoErc20Swap`
- `test_gas_sellMarcoErc20Swap`
- `test_gas_nativeBnbSwap`
- `test_gas_pauseUnpause`
- `test_gas_directRouterBaselineErc20` (mock router only, no wrapper)

## Validation commands

```bash
forge test --gas-report
forge test --match-test test_gas_
```

**Result:** 38/38 tests passing at time of report.
