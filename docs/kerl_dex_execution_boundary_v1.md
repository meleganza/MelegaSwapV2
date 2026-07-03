# KERL DEX Execution Boundary v1

**Mission:** KERL DEX Phase 2 — Execution Boundary Extraction  
**Repository:** MelegaSwapV2 (`design-system-foundation` branch)  
**Scope:** Architectural separation only — no routing implementation, no KERL runtime, no behaviour change  
**Prior audit:** `docs/kerl_dex_execution_layer_readiness_audit_v1.md` — verdict `KERL_DEX_EXECUTION_LAYER_NOT_READY`

---

## Executive Summary

Phase 2 extracts a **pure internal execution boundary** from the coupled swap/bridge stack. Routing behaviour is unchanged. Execution behaviour is unchanged. The only change is **ownership separation**: routing produces an execution instruction; execution consumes it and never re-decides routes.

New modules:

| Module | Path | Role |
|--------|------|------|
| **Routing Layer** | `apps/web/src/lib/routing-layer/` | Packages routing output as `ExecutionInstruction` |
| **Execution Layer** | `apps/web/src/lib/execution-layer/` | Wallet submit, adapter dispatch, evidence mapping |

Live UI commit paths now cross the boundary explicitly:

- `SmartSwapCommitButton` → `createSmartSwapExecutionInstruction` → `useSmartSwapExecution`
- `SwapCommitButton` (V2) → `createV2SwapExecutionInstruction` → `useV2SwapExecution`
- `BridgeCommitButton` → `createBridgeExecutionInstruction` → `useBridgeExecution`

Underlying hooks (`useSwapCallback`, `useSwapCallArguments`, `useBurnToken`) are **unchanged** — execution layer delegates to them.

---

## 1. Architecture Before

```
┌─────────────────────────────────────────────────────────────────┐
│                     SmartSwapCommitButton                        │
│  ┌──────────────┐   ┌────────────────────┐   ┌──────────────┐ │
│  │ useBestTrade │ → │ useTradeInfo       │ → │ useSwapCall  │ │
│  │ (routing)    │   │ (route selection)  │   │ Arguments    │ │
│  └──────────────┘   └────────────────────┘   └──────┬───────┘ │
│                                                      │         │
│                              ┌───────────────────────▼───────┐ │
│                              │ useSwapCallback (execution) │ │
│                              │ gas · submit · addTransaction│ │
│                              └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Problems identified in Phase 1 audit:**

- Routing and execution lived in the same component chain with no instruction boundary
- `useSwapCallArguments` consumed a resolved trade (routing artifact) inside the commit button
- No structured correlation between routing decision and execution evidence
- Bridge followed the same pattern (`useBurnToken` called directly from UI)

---

## 2. Architecture After

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           ROUTING LAYER                                   │
│  packages/smart-router · useBestTrade · useTradeInfo · useIsSmartRouter  │
│                              │                                            │
│                              ▼                                            │
│              createSmartSwapExecutionInstruction(routing output)          │
│              createV2SwapExecutionInstruction(routing output)              │
│              createBridgeExecutionInstruction(routing output)             │
└──────────────────────────────┬───────────────────────────────────────────┘
                               │ ExecutionInstruction (internal)
                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         EXECUTION LAYER                                   │
│  useSmartSwapExecution · useV2SwapExecution · useBridgeExecution         │
│       │                    │                         │                    │
│       ▼                    ▼                         ▼                    │
│  useSwapCallArguments   useSwapCallArguments    useBurnToken             │
│  useSwapCallback        useSwapCallback         utils/calls/bridge       │
│       │                    │                         │                    │
│       └────────────────────┴─────────────────────────┘                    │
│                              ▼                                            │
│              state/transactions (evidence) · mapTransactionToEvidence     │
└──────────────────────────────────────────────────────────────────────────┘
```

**Invariant:** Execution layer source files **must not import** routing packages (`@pancakeswap/smart-router`, `useBestTrade`, etc.). Enforced by unit test.

---

## 3. Boundary Extraction

### 3.1 Execution Instruction (internal)

```typescript
interface SwapExecutionInstruction {
  id: string
  domain: 'swap'
  adapter: 'smart-router' | 'v2-router'
  routingPlan: SmartSwapRoutingPlan | V2SwapRoutingPlan
  allowedSlippageBps: number
  recipient: string | null
  createdAt: string
}

interface BridgeExecutionInstruction {
  id: string
  domain: 'bridge'
  adapter: 'kronoswap-bridge'
  routingPlan: BridgeRoutingPlan
  pid: number
  isNative: boolean
  amount: string
  createdAt: string
}
```

- Produced **only** by routing layer factories today
- Not exposed as a public API
- Not wired to KERL runtime or Swarm
- Future KERL may supply equivalent payloads; execution layer shape is the compatibility target

### 3.2 Adapter Dispatch

| Instruction adapter | Delegates to | Behaviour |
|---------------------|--------------|-----------|
| `smart-router` | `views/Swap/SmartSwap/hooks/useSwapCallArguments` + `useSwapCallback` | Identical smart swap path |
| `v2-router` | `hooks/useSwapCallArguments` + `hooks/useSwapCallback` | Identical V2/stable path |
| `kronoswap-bridge` | `views/Bridge/hooks/useBurnToken` | Identical burn/burnETH |

### 3.3 Evidence Boundary

`mapTransactionToExecutionEvidence()` maps Redux `TransactionDetails` → `ExecutionEvidence`:

- DEX-owned raw receipt surface
- Instruction correlation via `instructionId`
- **No** settlement normalization
- **No** treasury fields

Existing receipt polling (`state/transactions/updater.tsx`) is unchanged.

---

## 4. Ownership Matrix

| Responsibility | Routing Layer | Execution Layer | Unchanged legacy |
|----------------|:-------------:|:---------------:|------------------|
| Route discovery | **Owns** | — | `packages/smart-router`, `useBestTrade` |
| Quote selection | **Owns** | — | `useIsSmartRouterBetter`, `useTradeInfo` |
| Slippage user setting | **Inputs** | Applies to calldata | `state/user/hooks` |
| Instruction production | **Owns** | Consumes | `routing-layer/createSwapExecutionInstruction` |
| Calldata encoding | — | **Owns** (via adapters) | `useSwapCallArguments` |
| Gas estimation | — | **Owns** | Inside `useSwapCallback` |
| Wallet submission | — | **Owns** | wagmi + contract calls |
| Tx hash / receipt | — | **Owns** | `state/transactions` |
| Execution evidence | — | **Owns** | `execution-layer/evidence.ts` |
| Settlement events | — | **Must never** | Treasury Runtime (external) |
| Asset/chain policy | — | **Must never** | `state/lists`, `wagmi.ts` |
| KERL routing | — | **Must never** | Future external owner |

---

## 5. Behaviour Regression Validation

### 5.1 Automated

| Test suite | Result | Coverage |
|------------|--------|----------|
| `yarn test src/lib/execution-boundary` | **PASS** | Instruction factories, evidence mapping, forbidden-import guard |
| `yarn test src/design-system` | **PASS** | UI tokens unchanged |
| `yarn test src/lib/homepage-live` | **PASS** | Homepage contracts unchanged |
| `yarn build` (Next.js production) | **PASS** | TypeScript compile |

### 5.2 Behavioural equivalence (by design)

| Surface | Validation method | Expected |
|---------|-------------------|----------|
| Identical quotes | Routing hooks untouched | Same `useBestTrade` output |
| Identical routes | `useTradeInfo` untouched | Same path selection |
| Identical swap execution | Execution delegates to same `useSwapCallback` | Same calldata + gas + submit |
| Identical bridge execution | `useBridgeExecution` → `useBurnToken` | Same burn/burnETH |
| Identical wallet interaction | No wagmi changes | Same connect/sign flow |
| Identical gas estimation | Inside unchanged `useSwapCallback` | Same estimateGas path |
| Identical receipts | `state/transactions/updater` untouched | Same polling |
| Identical UI | Commit buttons same props/flow | Same modals, approvals, confirms |

### 5.3 Explicit non-changes

- No changes to `packages/smart-router/**`
- No changes to `useBestTrade`, `useTradeInfo`, `useIsSmartRouterBetter`
- No changes to swap Redux form state
- No changes to presentation shells (Home/Trade/Liquidity/Farms Studio)
- No changes to `lib/smart-execution/` (illustrative only)
- No KERL runtime, no public API, no Swarm dependency

---

## 6. Future KERL Compatibility

Phase 2 establishes the **internal contract** KERL will eventually feed:

```
KERL (future) ──► ExecutionInstruction ──► Execution Layer ──► ExecutionEvidence
```

| Ready now | Still required for KERL runtime |
|-----------|-------------------------------|
| Instruction type shape | External KERL instruction validator |
| Adapter dispatch table | Chain/asset mismatch rejection |
| Evidence mapper | Instruction ↔ tx correlation persistence |
| Forbidden-import guard | CI lint rule in build pipeline |
| UI boundary wiring (swap/bridge commit) | Headless KERL entry point (no UI routing) |
| | Idempotency on instructionId |
| | Liquidity instruction adapters |
| | Structured ExecutionReport export API |

The routing pipeline can later be **replaced or bypassed** by KERL-supplied instructions without modifying execution adapters, as long as instructions conform to the internal shape.

---

## 7. Remaining Work

### Phase 2 complete (this mission)

- [x] `lib/routing-layer/` — instruction factories from routing output
- [x] `lib/execution-layer/` — swap + bridge execution hooks
- [x] Evidence mapper (`mapTransactionToExecutionEvidence`)
- [x] Commit button boundary wiring (smart swap, V2 swap, bridge)
- [x] Forbidden-import unit test
- [x] Boundary documentation

### Phase 3+ (not in scope)

1. **Liquidity boundary** — extract Add/Remove LP execution tails behind instruction adapters
2. **Wrap boundary** — `useWrapCallback` behind execution layer
3. **ExecutionTracker** — persistent instructionId ↔ txHash store beyond Redux
4. **Headless KERL entry** — internal-only execution path without `useBestTrade`
5. **CI lint** — fail build if execution-layer imports routing packages
6. **Chain mismatch guard** — reject instruction when wallet chain ≠ instruction chain
7. **Liquidity + farms** — remain DEX-only unless KERL scope expands

---

## 8. Final Verdict

The execution boundary is **architecturally established**. Routing and execution are separated by an explicit internal instruction. Live swap and bridge commit paths cross the boundary. Execution delegates to proven unchanged hooks. Evidence ownership is defined. Routing behaviour is preserved.

Boundary extraction succeeded. KERL runtime integration is **not** claimed — that remains future work per Phase 1 audit blockers.

**KERL_DEX_EXECUTION_BOUNDARY_ESTABLISHED**
