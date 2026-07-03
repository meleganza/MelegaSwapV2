# KERL DEX Execution Tracker v1

**Mission:** KERL DEX Phase 4 — Execution Tracker and Evidence Persistence  
**Repository:** MelegaSwapV2  
**Scope:** Internal execution lifecycle tracking only — no KERL runtime, no public API, no behaviour change  
**Prior verdict:** `KERL_DEX_EXECUTION_CONTRACT_HARDENED` (Phase 3)

---

## Executive Summary

Phase 4 introduces an internal **Execution Tracker** that records execution lifecycle events, correlates instructions to transaction hashes, observes receipt references from existing Redux transaction state, and finalizes lifecycle-only `ExecutionReport` objects.

The tracker is DEX-owned and execution-only. It does not imply settlement, does not normalize settlement, and does not decide routing.

New module:

| Module | Path | Role |
|--------|------|------|
| **Execution Tracker** | `apps/web/src/lib/execution-tracker/` | Lifecycle events, correlation index, evidence persistence |

Wired into existing execution-layer hooks only:

- `useSmartSwapExecution` / `useV2SwapExecution` — wraps swap callback submission
- `useBridgeExecution` — wraps bridge execute submission
- `useExecutionTrackerReceiptSync` — read-only sync from `state/transactions`

---

## 1. Tracker Purpose

The tracker answers internal execution questions:

| Question | Tracker field / event |
|----------|----------------------|
| Which instruction was executed? | `instructionId`, `correlationId` |
| Which execution attempt? | `executionId` |
| Was wallet submission started? | `wallet_submission_started` |
| Was a transaction submitted? | `transaction_submitted` |
| What is the transaction hash? | `txHash`, `transaction_hash_captured` |
| Is receipt still unknown? | `receipt_pending`, status `pending` |
| Was receipt observed? | `receipt_confirmed` / `receipt_failed`, `receiptReference` |
| What is the final lifecycle report? | `report`, `execution_report_finalized` |

The tracker does **not** answer settlement, treasury, or mission outcome questions.

---

## 2. Lifecycle Model

```
instruction_received (ready)
        │
        ▼
wallet_submission_started (ready)
        │
        ▼
transaction_submitted (submitted)
        │
        ▼
transaction_hash_captured (pending)
        │
        ▼
receipt_pending (pending) ──► unknown until Redux tx receipt observed
        │
        ├──► receipt_confirmed (confirmed) ──► execution_report_finalized
        └──► receipt_failed (reverted | failed) ──► execution_report_finalized
```

Status transitions obey Phase 3 contract `isValidStatusTransition()`.

**Truth rule:** If no transaction hash exists, none is recorded. If no receipt exists, `receiptReference` remains undefined. Pending bridge executions without Redux transaction entries remain `pending` until a receipt can be observed elsewhere.

---

## 3. Storage Model

### Mechanism

The tracker uses the **account + chain scoped `localStorage` pattern** already established by `utils/localStorageOrders.ts`:

- Key: `kerl_exec_tracker_{account}{chainId}`
- Package: `local-storage` npm wrapper
- In-memory singleton per scope with write-through persistence
- Retention: latest **50** execution records per scope

### Why not a new Redux slice in Phase 4

Redux `transactions` already persists tx hash + receipt via `redux-persist`. Adding a second persisted Redux slice would touch root reducer wiring and global reset paths in this pass.

The tracker **composes** with persisted Redux transactions for receipt observation instead of duplicating receipt polling.

### Memory-only fallback

When wallet account or chain id is unavailable, tracker scope falls back to `__memory__` (no localStorage write). This preserves hook safety without fabricating scope.

---

## 4. Correlation Model

| Identifier | Producer | Purpose |
|------------|----------|---------|
| `instructionId` | Routing layer | Stable instruction identity |
| `correlationId` | Routing layer | Links routing decision to execution attempts |
| `executionId` | Execution tracker (`exec:{instructionId}:{seed}`) | Per wallet submission attempt |
| `txHash` | Observed from adapter response | Links to Redux `state/transactions` |

Lookup APIs (internal):

- `getRecord(executionId)`
- `getByInstructionId(instructionId)` — latest attempt
- `getByTxHash(txHash)`
- `getExecutionReport(executionId)`

---

## 5. Evidence Persistence Model

Tracker records store:

- Instruction identity (`instructionId`, `correlationId`, `version`, `source`)
- Adapter identity (`adapter`, `adapterIdentity`)
- Chain id when known
- Status lifecycle + timestamps
- Structured `ExecutionError` when failed
- `ReceiptReference` only when observed (hash required; block/status when receipt exists)
- Append-only `events[]` audit trail
- Final `ExecutionReport` on terminal status

### Integrity rules

- `assertEvidenceIntegrity()` before report finalization
- `buildExecutionReport()` — lifecycle only, no embedded raw receipt
- `SETTLEMENT_FORBIDDEN_FIELDS` blocked on reports and records
- No fake receipts, no fake transaction hashes, no fabricated success

---

## 6. Forbidden Responsibilities

### Tracker must never

- Select routes or quotes
- Emit settlement events
- Normalize settlement
- Submit to Treasury Runtime
- Run mission logic
- Produce execution instructions
- Poll receipts (reads existing Redux transaction state only)
- Change swap / bridge / wallet / UI behaviour

### Import guards

Tracker source must not import routing engines or treasury modules (enforced by unit tests).

Manifest: `EXECUTION_TRACKER_OWNERSHIP`.

---

## 7. Validation Results

| Check | Result |
|-------|--------|
| `yarn build` | PASS |
| `yarn test src/lib/execution-tracker` | PASS |
| `yarn test src/lib/execution-boundary` | PASS |
| `yarn test src/design-system` | PASS |
| `yarn test src/lib/homepage-live` | PASS |

### Regression proofs

| Requirement | Test |
|-------------|------|
| Tracker does not import routing engines | Forbidden routing import scan |
| Tracker does not import Treasury modules | Forbidden treasury import scan |
| Tracker cannot create Settlement Events | Forbidden settlement field assertions |
| Tracker cannot fabricate receipts | Empty hash rejection + pending-without-receipt |
| Tracker preserves unknown state | Hash-only tx stays `pending` without report |
| Tracker correlates instruction id → tx hash | `getByInstructionId` / `getByTxHash` |
| Status lifecycle obeys Phase 3 contract | `isValidStatusTransition` + tracker flow |
| Swap / bridge execution unchanged | Hooks delegate to same underlying callbacks |

### Explicit non-changes

- No routing-layer output changes
- No UI behaviour changes
- No transaction submission changes
- No receipt polling changes (`state/transactions/updater` untouched)
- No Treasury Runtime modification
- No KERL runtime integration
- No public API surface

---

## 8. Remaining Work

| Item | Status |
|------|--------|
| Swap instruction ↔ Redux receipt sync | **Done** (read-only sync hook) |
| Bridge receipt sync via Redux | **Deferred** — bridge path does not write Redux transactions today; tracker records hash and remains `pending` until receipt source exists |
| Redux slice for tracker index | **Deferred** — localStorage scope pattern used to avoid root reducer churn |
| CI forbidden-import lint | Future |
| Headless KERL execution entry | Future |
| Cross-session execution report export API | Future (internal only) |
| `clearUserStates` tracker key cleanup | Future — mirror `localStorageOrders` cleanup |

---

## 9. Final Verdict

The internal Execution Tracker is established. It records lifecycle events, correlates instructions to transaction hashes when available, persists evidence using the repository's existing localStorage scope pattern, observes receipts from Redux without altering polling, and finalizes lifecycle-only reports without settlement implication.

Swap and bridge execution behaviour remains unchanged — execution hooks still delegate to the same underlying callbacks.

**KERL_DEX_EXECUTION_TRACKER_ESTABLISHED**
