# KERL DEX Execution Contract v1

**Mission:** KERL DEX Phase 3 — Execution Contract Hardening  
**Repository:** MelegaSwapV2  
**Scope:** Internal contract formalization only — no KERL runtime, no headless execution, no public API, no behaviour change  
**Prior verdict:** `KERL_DEX_EXECUTION_BOUNDARY_ESTABLISHED` (Phase 2)

---

## Executive Summary

Phase 3 hardens the **internal execution contract** introduced in Phase 2. Routing and execution remain separated. Swap, bridge, wallet, and treasury runtime behaviour are **unchanged**. The contract is typed, documented, and regression-tested so future KERL-generated instructions can be consumed safely.

New canonical module:

| Module | Path | Role |
|--------|------|------|
| **Execution Contract** | `apps/web/src/lib/execution-contract/` | Types, identity, evidence, reports, errors, lifecycle, ownership rules |

Phase 2 modules remain:

| Module | Path | Role |
|--------|------|------|
| **Routing Layer** | `apps/web/src/lib/routing-layer/` | Produces `ExecutionInstruction` (outside execution layer) |
| **Execution Layer** | `apps/web/src/lib/execution-layer/` | Consumes instructions, dispatches adapters, maps evidence |

---

## 1. Contract Definitions

### 1.1 ExecutionInstruction

An instruction is the **only** input the execution layer accepts. It is produced **outside** the execution layer (routing layer today; KERL in future).

```typescript
interface InstructionIdentity {
  id: string                    // stable content-derived id
  correlationId: string         // links routing → execution → evidence
  version: '1.0'                // schema version
  source: 'dex-routing' | 'kerl-preview' | 'manual'
}

interface ExecutionInstructionBase extends InstructionIdentity {
  domain: 'swap' | 'bridge' | 'liquidity' | 'wrap'
  adapter: ExecutionAdapter
  createdAt: string
  chainId?: number              // unknown remains undefined
}
```

Swap and bridge variants extend the base with routing plan payloads (unchanged from Phase 2).

### 1.2 ExecutionReport

Lifecycle summary for internal consumers. **Not settlement.**

```typescript
interface ExecutionReport {
  reportVersion: '1.0'
  instructionId: string
  executionId: string
  correlationId: string
  domain: ExecutionDomain
  adapter: ExecutionAdapter
  adapterIdentity: string
  status: ExecutionStatus
  chainId?: number
  txHash?: string
  blockNumber?: number
  submittedAt?: string
  finalizedAt?: string
  error?: ExecutionError
  receiptReference?: ReceiptReference  // reference only — no embedded receipt body
}
```

Built via `buildExecutionReport(evidence)`. Raw EVM receipts are **not** embedded in reports.

### 1.3 ExecutionEvidence

Observed submission surface. **Not treasury-normalized.**

```typescript
interface ExecutionEvidence {
  instructionId: string
  executionId: string
  correlationId: string
  instructionVersion: '1.0'
  instructionSource: InstructionSource
  domain: ExecutionDomain
  adapter: ExecutionAdapter
  adapterIdentity: string
  status: ExecutionStatus
  chainId?: number
  txHash?: string
  blockNumber?: number
  submittedAt?: string
  finalizedAt?: string
  error?: ExecutionError
  receiptReference?: ReceiptReference
  summary?: string
  receipt?: SerializableTransactionReceipt  // only when actually observed
}
```

Mapped via `mapTransactionToExecutionEvidence(instruction, tx, executionId, chainId?)`.

### 1.4 ExecutionStatus

Client-side lifecycle — not settlement state:

`invalid` → `loading` → `awaiting_wallet` → `awaiting_approval` → `simulating` → `ready` → `submitted` → `pending` → `confirmed` | `reverted` | `failed`

Terminal states: `confirmed`, `reverted`, `failed`. Valid transitions enforced by `isValidStatusTransition()`.

### 1.5 ExecutionError

Structured error — not settlement failure:

```typescript
interface ExecutionError {
  code: string
  category: 'wallet_rejected' | 'simulation_failed' | 'submission_failed' |
            'reverted' | 'timeout' | 'adapter_error' | 'unknown'
  message: string
  revertReason?: string
}
```

Classified via `classifyExecutionError()`.

### 1.6 Instruction identity fields

| Field | Owner | Purpose |
|-------|-------|---------|
| `id` | Routing / KERL | Stable instruction identity |
| `correlationId` | Routing / KERL | Correlates routing decision with execution attempts |
| `version` | Contract | Schema compatibility (`1.0`) |
| `source` | Routing / KERL | Provenance (`dex-routing` for DEX-produced instructions) |
| `executionId` | Execution layer | Per-attempt identity (`exec:{instructionId}:{seed}`) |

---

## 2. Ownership Rules

### Execution layer may own

- Wallet submission
- Adapter dispatch
- Transaction hash capture
- Receipt observation
- Execution evidence
- Execution status
- Execution errors
- Execution reports (lifecycle only)

### Execution layer must never own

- Route selection
- Asset policy
- Chain policy
- Slippage selection
- Trade optimization
- Settlement normalization
- Treasury submission
- Mission logic
- **Instruction production**

Manifests: `EXECUTION_CONTRACT_OWNERSHIP`, `EXECUTION_LAYER_OWNERSHIP`, `ROUTING_LAYER_OWNERSHIP`.

---

## 3. Evidence Model

Evidence supports:

| Requirement | Field |
|-------------|-------|
| Instruction identity | `instructionId`, `correlationId`, `instructionVersion`, `instructionSource` |
| Transaction identity | `executionId`, `txHash` |
| Chain identity | `chainId` |
| Adapter identity | `adapter`, `adapterIdentity` |
| Status lifecycle | `status`, `submittedAt`, `finalizedAt` |
| Error classification | `error` |
| Receipt reference | `receiptReference` (when hash observed); `receipt` only when Redux tx has receipt |

### Integrity rules

- **No fake receipts** — `assertEvidenceIntegrity()` rejects receipt without `txHash`
- **No fake settlement** — `SETTLEMENT_FORBIDDEN_FIELDS` blocked on evidence and reports
- **Unknown remains unknown** — pending txs have no receipt reference; `chainId` optional

---

## 4. Status Lifecycle

```
ready ──► submitted ──► pending ──► confirmed
                          │
                          ├──► reverted
                          └──► failed
```

Pre-submit states (`loading`, `awaiting_wallet`, `awaiting_approval`, `simulating`) transition toward `ready` or `failed`. Terminal states do not transition without a new execution attempt.

---

## 5. Error Model

| Category | Typical trigger |
|----------|-----------------|
| `wallet_rejected` | User denied signature |
| `simulation_failed` | estimateGas / simulation failure |
| `submission_failed` | Broadcast failure |
| `reverted` | On-chain revert (receipt status 0) |
| `timeout` | Polling timeout |
| `adapter_error` | Adapter-level failure |
| `unknown` | Unclassified string errors |

Errors describe **execution attempt** outcomes only — not treasury settlement or mission results.

---

## 6. Forbidden Responsibilities

### Import guards (execution layer source scan)

**Routing engines forbidden:**

`@pancakeswap/smart-router`, `useBestTrade`, `useTradeInfo`, `getBestTrade`, `hooks/Trades`, `fetchBestPriceWithRouter`, `lib/smart-execution`, instruction factory symbols.

**Treasury modules forbidden:**

`lib/economic-runtime`, `economic-runtime`, `treasury`, `TreasuryRuntime`, `economic-activation`.

### Settlement fields forbidden on evidence and reports

`settlement`, `settlementEvent`, `settlementStatus`, `settlementAmount`, `treasury`, `treasurySku`, `treasurySubmission`, `normalizedProceeds`, `missionLogic`.

### Production boundary

- Instruction factories live in `routing-layer/` only
- Execution layer exports **do not** include `create*ExecutionInstruction` or `createInstructionIdentity`

---

## 7. Validation Results

| Check | Result |
|-------|--------|
| `yarn build` | PASS |
| `yarn test src/lib/execution-boundary` | PASS (contract + boundary regression) |
| `yarn test src/design-system` | PASS |
| `yarn test src/lib/homepage-live` | PASS |

### Regression proofs

| Requirement | Test |
|-------------|------|
| Execution layer does not import routing engines | Forbidden routing import scan |
| Execution layer does not import treasury modules | Forbidden treasury import scan |
| ExecutionInstruction produced outside execution layer | Factory export boundary test |
| Execution layer consumes instructions only | Routing layer does not import execution hooks |
| Reports cannot imply settlement | `assertReportDoesNotImplySettlement` |
| Evidence cannot fabricate receipts | `assertEvidenceIntegrity` |
| Swap/bridge adapter mapping preserved | Adapter dispatch regression test |
| Smart-execution module isolated | Boundary wiring regression test |

### Explicit non-changes

- No swap behaviour change (`useSwapCallback` delegation unchanged)
- No bridge behaviour change (`useBurnToken` delegation unchanged)
- No routing behaviour change (`useBestTrade`, `useTradeInfo` untouched)
- No wallet behaviour change
- No Treasury Runtime modification
- No KERL runtime integration
- No headless execution path
- No public API surface

---

## 8. Future KERL Compatibility

```
KERL (future) ──► ExecutionInstruction (source: kerl-preview)
                         │
                         ▼
                  Execution Layer ──► ExecutionEvidence ──► ExecutionReport
```

| Ready now | Still required for KERL runtime |
|-----------|--------------------------------|
| Typed instruction identity (`id`, `correlationId`, `version`, `source`) | External KERL instruction validator |
| Structured `ExecutionError` | Chain/asset mismatch rejection at ingress |
| `ExecutionReport` lifecycle surface | Persistent instruction ↔ tx correlation store |
| Evidence integrity guards | CI build-time forbidden-import lint |
| Receipt reference model (no fabrication) | Idempotency on `instructionId` |
| Forbidden settlement fields | Headless KERL entry (no UI routing) |
| Status lifecycle model | Liquidity instruction adapters |

KERL may supply instructions conforming to `ExecutionInstruction` + `InstructionIdentity`. Execution adapters remain unchanged as long as the contract is satisfied.

---

## 9. Final Verdict

The internal execution contract is **typed, documented, and regression-safe**. Instruction identity, source, version, and correlation are formalized. Evidence and reports cannot fabricate receipts or imply settlement. Execution layer import boundaries include routing engines and treasury modules. Swap and bridge behaviour remain unchanged.

**KERL_DEX_EXECUTION_CONTRACT_HARDENED**
