# KERL Live Execution Gateway — Dry Run v1

**Mission:** KERL Live Integration Phase 1  
**Mode:** `DRY_RUN_ONLY`  
**Date:** 2026-07-03  
**Constitutional verdict:** `KERL_READY_FOR_LIVE_INTEGRATION`

---

## 1. Gateway architecture

The Execution Gateway is the single internal ingress for KERL-originated `ExecutionInstruction` payloads entering the Melega DEX Execution Layer.

```
KERL Runtime (future)
        │
        ▼
acceptKerlExecutionInstruction()     ← execution-ingress/kerl-gateway.ts
        │
        ▼
dryRunExecutionInstruction()         ← execution-gateway/dry-run.ts
        │
        ├── validateExecutionInstruction()   (ingress validator)
        ├── ExecutionTracker.registerInstruction()
        ├── ExecutionTracker.completeDryRun()
        ├── buildDryRunExecutionEvidence()
        └── buildExecutionReport()
        │
        ▼
DryRunGatewayResult + DryRunSuppressionManifest
```

### Module layout

| Path | Role |
|------|------|
| `lib/execution-gateway/dry-run.ts` | Core gateway — dry-run termination |
| `lib/execution-gateway/activation.ts` | Inactive by default; harness enable only |
| `lib/execution-gateway/types.ts` | `DryRunGatewayResult`, `DryRunSuppressionManifest` |
| `lib/execution-gateway/ownership.ts` | Forbidden imports and ownership boundaries |
| `lib/execution-ingress/kerl-gateway.ts` | Ingress entry — routes KERL instructions to gateway |
| `lib/execution-contract/evidence.ts` | `buildDryRunExecutionEvidence()` |
| `lib/execution-tracker/tracker.ts` | `completeDryRun()` lifecycle |

### Separation from live dispatch

| Surface | Path | Wallet | Adapters |
|---------|------|--------|----------|
| UI commit buttons | routing-layer → execution-layer hooks | Yes (existing) | Yes (existing) |
| Internal ingress (live) | `dispatchExecutionInstruction` | Yes (injected adapters) | Yes |
| **Execution gateway (Phase 1)** | `dryRunExecutionInstruction` | **No** | **No** |

The gateway is **not** wired to commit buttons, public routes, or external APIs.

---

## 2. Dry-run lifecycle

Every accepted instruction follows this tracker event sequence:

1. `instruction_received` → status `ready`
2. `dry_run_validated` → status `simulating`
3. `execution_suppressed` → status `dry_run_completed`
4. `dry_run_completed` → status `dry_run_completed`
5. `execution_report_finalized` → terminal report stored

Terminal status: `dry_run_completed`

### Dry-run result manifest

Every successful gateway response includes:

```json
{
  "executionMode": "DRY_RUN_ONLY",
  "executionStatus": "dry_run_completed",
  "executionAuthority": "dex",
  "executionPerformed": false,
  "walletInteraction": "none",
  "transactionHash": null,
  "receipt": null,
  "settlement": null,
  "executionSuppressed": true,
  "suppressionReason": "KERL Live Integration Phase 1 — execution intentionally suppressed (DRY_RUN_ONLY)"
}
```

---

## 3. Validation flow

```
Instruction received
        │
        ▼
Gateway enabled? ──no──► GATEWAY_INACTIVE
        │
       yes
        │
        ▼
validateExecutionInstruction()
        │
        ├── identity (id, correlationId, version, source, createdAt)
        ├── supported type (SmartSwap | V2Swap | BridgeBurn)
        └── domain-specific fields (slippage, routingPlan, bridge fields)
        │
        ▼
Tracker.registerInstruction()
        │
        ▼
Tracker.completeDryRun()
        │
        ▼
Evidence + Report + Suppression manifest
```

Rejected instructions return structured `ExecutionError` without tracker mutation (when gateway inactive) or with partial registration only on internal failures.

---

## 4. Suppression guarantees

The gateway **terminates before**:

| Stage | Guarantee |
|-------|-----------|
| Adapter dispatch | `dispatchExecutionInstruction` never called |
| Wallet interaction | `trackExecutionSubmission` never called |
| Transaction creation | No `txHash` on evidence or report |
| Receipt polling | No `receipt_pending` / `receipt_confirmed` events |
| Settlement | No settlement fields on report or evidence |
| Treasury | No treasury module imports |

Enforced by:

- Gateway code path contains no adapter or wallet calls
- `completeDryRun()` uses dedicated tracker events only
- `buildDryRunExecutionEvidence()` omits `txHash`, `receipt`, `receiptReference`
- Ownership scans forbid routing engines, treasury, and KERL runtime imports
- Automated tests verify suppression at each boundary

---

## 5. Tracker integration

`ExecutionTracker.completeDryRun()`:

- Transitions `ready` → `simulating` → `dry_run_completed`
- Records suppression events
- Builds `ExecutionEvidence` via `buildDryRunExecutionEvidence()`
- Builds `ExecutionReport` via `buildExecutionReport()`
- Persists to scoped `localStorage` (`kerl_exec_tracker_*`)
- Marks `dry_run_completed` as terminal

New tracker event types: `dry_run_validated`, `execution_suppressed`, `dry_run_completed`

New execution status: `dry_run_completed` (terminal)

---

## 6. Future live activation path

Phase 1 locks execution mode to `DRY_RUN_ONLY`. Future live activation requires:

1. **Constitutional re-authorization** — explicit mission enabling live execution
2. **Mode gate** — replace `acceptKerlExecutionInstruction` dry-run-only routing with mode switch
3. **Adapter injection** — wire `dispatchExecutionInstruction` with headless adapters mirroring execution-layer behaviour
4. **Source policy** — restrict live dispatch to `kerl-preview` instructions with additional KERL attestation
5. **Idempotency** — instruction-level deduplication before wallet submission
6. **Settlement boundary** — execution reports remain lifecycle-only; settlement stays in treasury layer

The gateway module remains the ingress façade; live mode would branch after validation:

```
validate → [DRY_RUN] → completeDryRun()
         → [LIVE]     → dispatchExecutionInstruction()  (future, gated)
```

---

## 7. Validation results

| Check | Result |
|-------|--------|
| Gateway accepts valid SmartSwap instructions | pass |
| Gateway accepts valid V2Swap instructions | pass |
| Gateway accepts valid BridgeBurn instructions | pass |
| Gateway rejects invalid identity / version | pass |
| Gateway rejects unsupported instruction types | pass |
| Gateway inactive by default | pass |
| Gateway never reaches adapter dispatch | pass |
| Gateway never reaches wallet submission | pass |
| Gateway never creates transaction hash | pass |
| Gateway never reaches receipt polling | pass |
| Gateway records full tracker lifecycle | pass |
| Gateway creates deterministic ExecutionReport | pass |
| Gateway does not emit settlement fields on report/evidence | pass |
| Gateway cannot mutate treasury (import scan) | pass |
| Ingress `acceptKerlExecutionInstruction` wired | pass |
| Commit buttons unchanged (no gateway imports) | pass |
| Execution layer unchanged (no gateway imports) | pass |

### Test command

```bash
yarn test src/lib/execution-gateway src/lib/execution-ingress src/lib/execution-tracker src/lib/execution-boundary
```

### Test summary

**65 / 65 pass**

| Suite | Tests |
|-------|-------|
| execution-gateway | 21 |
| execution-ingress | 18 |
| execution-tracker | 10 |
| execution-boundary | 17 |

---

## 8. Final verdict

KERL_EXECUTION_GATEWAY_DRY_RUN_ESTABLISHED
