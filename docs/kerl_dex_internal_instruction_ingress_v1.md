# KERL DEX Internal Instruction Ingress v1

Phase 5 — Melega DEX Execution Layer

## 1. Ingress purpose

The internal instruction ingress (`lib/execution-ingress`) accepts a routing-produced `ExecutionInstruction`, validates its integrity, selects the correct execution adapter, and dispatches submission through existing execution-layer tracker helpers.

It prepares Melega DEX to later consume KERL-generated instructions without integrating KERL runtime today.

The ingress is **inactive by default** and is not wired to public routes, UI commit buttons, or external clients.

## 2. Supported instruction types

Only instruction types already produced internally by the routing layer:

| Type | Adapter | Routing plan domain |
|------|---------|---------------------|
| **SmartSwap** | `smart-router` | `swap-smart` |
| **V2Swap** | `v2-router` | `swap-v2` |
| **BridgeBurn** | `kronoswap-bridge` | `bridge` |

Liquidity, wrap, and other domains are **not** implemented. Unsupported types fail with structured `INGRESS_UNSUPPORTED_TYPE` errors.

## 3. Dispatch model

```
ExecutionInstruction
  → activation gate (inactive by default)
  → validateExecutionInstruction()
  → adapter selection (by instruction type)
  → trackExecutionSubmission()  // existing execution-tracker helper
  → injected adapter handler submit()
  → ExecutionReport (when available)
```

Adapter handlers are **injected** at dispatch time. The ingress does not import React hooks or wallet providers directly.

Public API surface:

- `dispatchExecutionInstruction(instruction, context)`
- `validateExecutionInstruction(instruction)`
- `isInternalIngressEnabled()` / `setInternalIngressEnabled()` (internal harness only)

## 4. Validation model

Validation checks:

- Instruction identity (`id`, `correlationId`, `version`, `source`, `createdAt`)
- Schema version matches `EXECUTION_INSTRUCTION_SCHEMA_VERSION`
- Domain / adapter / routing-plan consistency
- Swap fields: `allowedSlippageBps`, `recipient`, `routingPlan`
- Bridge fields: `pid`, `isNative`, `amount`, routing-plan field parity

Validation does **not** choose routes, assets, chains, or slippage.

## 5. Activation boundaries

| Boundary | Rule |
|----------|------|
| Default state | **Inactive** — dispatch returns `INGRESS_INACTIVE` |
| Public routes | Not reachable |
| External clients | Not callable |
| UI commit buttons | Unchanged — no ingress imports |
| Internal testing | `setInternalIngressEnabled(true)` in harness/tests only |

## 6. Forbidden responsibilities

The ingress must never:

- Choose routes, assets, chains, or slippage
- Optimize trades or normalize settlement
- Submit to Treasury or emit Settlement Events
- Call KERL runtime
- Import routing engines or instruction factories
- Import treasury / economic-runtime modules
- Expose public APIs

Ownership constants: `INGRESS_OWNERSHIP`, `INGRESS_FORBIDDEN_*` in `lib/execution-ingress/ownership.ts`.

## 7. Test results

```
yarn test src/lib/execution-ingress
✓ 17/17 pass

yarn test src/lib/execution-boundary
✓ pass

yarn test src/lib/execution-tracker
✓ pass
```

Tests prove:

- Ingress validates instructions
- Ingress dispatches only SmartSwap, V2Swap, BridgeBurn
- Ingress rejects unsupported instruction types
- Ingress does not import routing engines
- Ingress does not import Treasury modules
- Ingress does not call KERL runtime
- Ingress cannot emit Settlement Events on reports
- Ingress preserves tracker state when inactive
- Existing UI commit buttons remain free of ingress wiring

## 8. Future KERL integration path

1. KERL runtime produces `ExecutionInstruction` payloads (preview source: `kerl-preview`).
2. Internal orchestration enables ingress via harness flag (never UI-default).
3. Ingress validates and dispatches to the same adapter handlers used by execution-layer hooks.
4. Execution Tracker records lifecycle identically to current DEX flows.
5. Settlement and Treasury remain outside ingress scope.

---

KERL_DEX_INTERNAL_INGRESS_ESTABLISHED
