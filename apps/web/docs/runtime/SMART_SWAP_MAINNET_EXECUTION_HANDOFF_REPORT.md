# Smart Swap — Mainnet Execution Handoff

## Final verdict

**SMART_SWAP_MAINNET_EXECUTION_HANDOFF_CERTIFIED**

## Certified base

| Item | Value |
| --- | --- |
| Prior | `SMART_SWAP_MAINNET_EXECUTION_READY` tip `3ab555e8` |
| Branch | `smart-swap-mainnet-execution-handoff` |
| Architecture | `47892a9d` |

## Current blocker (resolved)

UI/architecture gap: transparency stack was ready, but there was no certified handoff gate between Execution Preview and wallet confirmation, and Instant vs Smart were presented as confusing separate CTAs.

## Handoff architecture

```
Execution Preview → Readiness Validation → Certified Handoff → Wallet Signature (user) → Broadcast → Receipt
```

Library: `apps/web/src/lib/smart-swap-execution-handoff/`

- Pure evaluation (`evaluateSmartSwapExecutionHandoff`)
- Explicit failures (no silent fallback)
- `autoSignForbidden` / `autoBroadcastForbidden`
- SmartSwapForm remains the execution engine

## Mode selector change

`TradeModeSelector`: **Instant | Smart** (44px, keyboard, SR labels).

Both modes mount the same `SmartSwapForm`.

- Smart: route box + preview + fee + AI + handoff  
- Instant: form only (simpler path)

Home Smart CTA → `/trade?experience=smart`.

## Wallet flow

Handoff checks: wallet, chain 56, route, freshness, min received, gas, allowance (`ApprovalState`), balance, simulation path, calldata presence, deadline model.

User must confirm in the existing form to request a signature.

## Transaction lifecycle

Pending / success / failure lifecycle states are modeled on the handoff certificate. Broadcast remains wallet-driven via SmartSwapForm.

## Receipt handling

No second history store — Module 005 continues to read wallet swap txs. Fee path remains Module 004 display-only.

## Economic visibility

Display-only: Swap → Protocol Fee → Treasury Runtime → FSC-01 → KERL status. No allocation changes.

## Security boundaries

No SmartSwapForm core edits · No Router/fee/D87/FSC/Treasury/KERL edits · No auto-sign · No auto-broadcast · No private keys.

## Tests / build

- Vitest handoff suite — pass  
- Freeze guards — pass  
- `yarn build` — see build-summary.json  

## Evidence

`apps/web/docs/runtime/smart-swap-mainnet-execution-handoff/`

## Limitations

- Live mainnet broadcast is not performed by this mission (user wallet confirmation only).  
- Gas simulation at confirm remains inside SmartSwapForm `estimateGas` / `callStatic`.

## Delivery

Push only. No merge. No deploy. No automatic mainnet transactions.

---

**SMART_SWAP_MAINNET_EXECUTION_HANDOFF_CERTIFIED**
