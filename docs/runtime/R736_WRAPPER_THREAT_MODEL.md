# R736 — Melega Smart Router Wrapper Threat Model

**Date:** 2026-07-08  
**Component:** `MelegaSmartRouterWrapper.sol` v1 scaffold  
**Status:** Pre-commit internal review — **not deployed**, **not audit-complete**

## Purpose

The wrapper is the on-chain constitutional economic entrypoint for Melega DEX swaps. It deducts D87 protocol fees, forwards net input to the underlying Pancake Smart Router, and emits treasury handoff metadata. It explicitly does **not** execute FSC-01 splits or referral settlement.

## Trusted assumptions

| Assumption | Rationale |
|---|---|
| `owner` is a Melega-controlled multisig or governance timelock | Controls `pause`/`unpause` only in v1 |
| `underlyingRouter` is the verified Pancake Smart Router for the chain | Immutable at deploy; no runtime upgrade in v1 |
| `treasuryCollector` is a Melega-operated address that accepts fee token (ERC20 + native) | Non-zero enforced at constructor |
| `marcoToken` matches KERL/registry attestation for the chain | BUY MARCO fee tier depends on this immutable |
| `pricingRefHash` and `treasuryPolicyRefHash` match ratified off-chain policy | Emitted for Treasury Runtime reconciliation |
| Users understand exact-input semantics and slippage is quoted on **net** routed amount | UX/integration responsibility |
| Underlying router correctly executes LP swaps and honors `amountOutMin` | Wrapper delegates execution |
| OpenZeppelin `SafeERC20`, `ReentrancyGuard`, `Pausable` behave as documented | Dependency trust |

## Untrusted actors

| Actor | Capability |
|---|---|
| Swappers (EOAs/contracts) | Call public swap entrypoints with arbitrary paths/recipients/deadlines |
| Malicious ERC20 tokens | Non-standard returns, blocked recipients, fee-on-transfer (blocked in v1) |
| Compromised `treasuryCollector` | Reject inbound transfers → DoS all swaps for that token/native path |
| Compromised `owner` | Pause all swaps; cannot redirect immutables or steal approved funds post-reset |
| Underlying router (if malicious/upgraded off-chain) | Could mis-route net input; outside wrapper bytecode control in v1 |
| Block producers / MEV searchers | Standard sandwich/frontrun exposure on public mempool swaps |

## Assets at risk

1. **User input funds per transaction** — gross `amountIn` (ERC20 or native) during atomic swap execution.
2. **Protocol fees per swap** — fee slice destined for `treasuryCollector`.
3. **Wrapper reputation / liveness** — pause or collector DoS blocks Melega routing.
4. **Economic policy integrity** — incorrect MARCO detection or bps would mis-price protocol fees.

LP reserves and LP fee accrual remain in underlying pools; wrapper does not custody LP positions.

## Attack surface

| Surface | Entry | Mitigation (v1) |
|---|---|---|
| `swapExactTokensForTokens` | Public, exact-input ERC20 | `nonReentrant`, `whenNotPaused`, fee math, allowance reset |
| `swapExactETHForTokens` | Public, payable native | Same guards; treasury ETH `call` success required |
| `quoteProtocolFee` | Public view | No state change |
| `pause` / `unpause` | Owner only | `onlyOwner` |
| Blocked v1 paths | `swapTokensForExactTokens`, FoT variant | Hard revert |
| Constructor | Deploy-time | Zero-address checks on router, collector, MARCO, owner, ref hashes |

**Out of scope / not present in v1:** permit2, router pointer updates, rescue functions, on-chain registry reads, referral hooks, FSC-01 splitter.

## Security boundaries

```
User
  │ gross amountIn
  ▼
MelegaSmartRouterWrapper  ── protocol fee ──► treasuryCollector
  │ net amountIn
  ▼
Underlying Smart Router ── LP fees untouched ──► AMM pools
  │
  ▼
Recipient (user/designated)
```

Off-chain boundary: Treasury Runtime consumes events and executes FSC-01 **after** confirmation — never inside wrapper bytecode.

## Economic invariants

Proven in `test/MelegaSmartRouterWrapper.invariants.t.sol`:

1. `grossAmountIn = netAmountIn + protocolFee` for standard, BUY MARCO, SELL MARCO, native, min amount, large amount, rounding edge.
2. Protocol fee always credited to `treasuryCollector` (ERC20 balance delta or native balance delta).
3. Underlying router receives exactly `netAmountIn` (mock-recorded).
4. LP/router pool input equals net only — protocol fee never forwarded to router.
5. FSC-01 destinations (civilization treasury, buyback, referral) remain at zero balance locally.
6. Referral settlement is not invoked (no code path).

Fee rounding: `(gross * bps) / 10_000` floors fee; dust favors user via higher `netAmountIn`.

## Pause procedure

1. Incident detected (exploit suspicion, collector compromise, router anomaly).
2. `owner` calls `pause()`.
3. All swap entrypoints revert via `whenNotPaused`.
4. DEX frontend remains on **Adapter** mode (per production closure plan) — no forced wrapper routing in v1 deploy state.
5. Root cause remediated off-chain (collector rotation requires **redeploy** in v1 — immutables).
6. `owner` calls `unpause()` only after checklist sign-off.

## Emergency procedure

| Situation | v1 response | Limitation |
|---|---|---|
| Active exploit on wrapper | `pause()` | Owner must be available |
| Collector rejecting fees | Swaps revert atomically | Redeploy with new collector address |
| Wrong MARCO immutable | Incorrect fee tier | Redeploy — no runtime patch |
| Tokens accidentally sent to wrapper | No `rescue` function | Requires v2 owner rescue or manual governance |
| Underlying router deprecated | Routing failure | Redeploy wrapper with new router immutable |

**No emergency bypass** of wrapper once canonical — incident response is pause-only per `spec.ts`.

## Governance assumptions

- Deploy parameters are ratified via registry snapshot (router, MARCO, collector, ref hashes).
- Owner key material is segregated from day-to-day operators.
- Treasury Runtime is authoritative for post-swap FSC-01 — wrapper only prepares handoff events.

## Upgrade assumptions

**v1 is non-upgradeable.** Immutables:

- `underlyingRouter`
- `treasuryCollector`
- `marcoToken`
- `pricingRefHash`
- `treasuryPolicyRefHash`

Any policy or infrastructure change requires new wrapper deployment + registry update + audit delta. Future v2 may add Permit2, allowlisted FoT tokens, router pointer timelock — not in this scaffold.

## Audit prerequisites (before mainnet)

- [ ] External Solidity audit firm engagement
- [ ] Collector acceptance tests on mainnet fork (ERC20 + native for all fee tokens)
- [ ] Pancake Smart Router interface conformance test on fork
- [ ] MARCO address attestation vs KERL hash
- [ ] Slippage/deadline UX review (net vs gross quoting)
- [ ] Event indexer schema sign-off with Treasury Runtime
- [ ] Incident runbook with pause owners and redeploy playbook
- [ ] MEV/sandwich disclosure in user-facing docs

## Residual risks (post internal review)

| Risk | Severity | Notes |
|---|---|---|
| Collector DoS via reverting receive | Medium | Atomic revert protects user funds; liveness blocked |
| No WBNB path[0] validation on native entry | Low | Underlying router should revert; UX confusion possible |
| No stuck-token rescue | Low | Operational |
| BUY MARCO keyed only on `path[path.length-1]` | Low | Multi-hop with MARCO intermediate uses standard fee — intended |
| `executionId` uses `block.timestamp` | Info | Observability only; not a replay guard |
| Production router gas higher than mock | Info | Overhead ratio may shrink on mainnet |

## Related artifacts

- Gas report: `docs/runtime/R736_WRAPPER_GAS_REPORT.md`
- TypeScript spec: `apps/web/src/lib/melega-smart-router/wrapper/spec.ts`
- Tests: `test/MelegaSmartRouterWrapper.t.sol`, `test/MelegaSmartRouterWrapper.invariants.t.sol`
