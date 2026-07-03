# KERL Live DEX Dry-Run Handoff Consumer v1

**Mission:** KERL Live Integration Phase 3  
**Swarm reference:** `KERL_LIVE_INTEGRATION_RC1_REMOTE_CERTIFIED`  
**DEX prerequisite:** `KERL_EXECUTION_GATEWAY_DRY_RUN_ESTABLISHED`  
**Date:** 2026-07-03  
**Mode:** Internal only — `DRY_RUN_ONLY`

---

## 1. Consumer architecture

The DEX Dry-Run Handoff Consumer is the first DEX-side consumer for KERL Dry-Run Handoff Packages. It validates the documented RC1 handoff shape locally — **without importing Swarm code or calling Swarm runtime**.

```
KERL Swarm (remote, RC1 certified)
        │
        │  DryRunHandoffPackage (documented shape only)
        ▼
consumeKerlDryRunHandoffPackage()     ← execution-handoff-consumer/consume.ts
        │
        ├── validateDryRunHandoffPackage()
        ├── extract proposedInstruction
        ▼
acceptKerlExecutionInstruction()      ← execution-ingress/kerl-gateway.ts
        │
        ▼
dryRunExecutionInstruction()          ← execution-gateway/dry-run.ts
        │
        ▼
HandoffConsumerResult + ExecutionReport + DryRunSuppressionManifest
```

### Module layout

| Path | Role |
|------|------|
| `lib/execution-handoff-consumer/types.ts` | `DryRunHandoffPackage`, `DryRunHandoffManifest` |
| `lib/execution-handoff-consumer/validate-handoff.ts` | Handoff + manifest validation |
| `lib/execution-handoff-consumer/consume.ts` | Internal consumer entry |
| `lib/execution-handoff-consumer/constants.ts` | Error codes, forbidden fields |
| `lib/execution-handoff-consumer/ownership.ts` | Boundary declarations |

### Isolation guarantees

| Surface | Reachable? |
|---------|------------|
| UI routes (`views/`, `pages/`) | **No** |
| Public APIs (`pages/api/`) | **No** |
| Live adapter dispatch | **No** |
| Wallet submission | **No** |
| Treasury mutation | **No** |
| Swarm runtime | **No** |

---

## 2. Handoff validation rules

### Required package shape

```typescript
interface DryRunHandoffPackage {
  packageVersion: '1.0.0'
  packageId: string
  correlationId: string
  handoffMode: 'dry_run'
  createdAt: string
  dryRunManifest: DryRunHandoffManifest
  proposedInstruction: ExecutionInstruction
}
```

### Required manifest fields

```typescript
interface DryRunHandoffManifest {
  executionMode: 'DRY_RUN_ONLY'
  executionPerformed: false
  walletInteraction: 'none'
  networkCommunication: false
  transmitted: false | 'internal-test'
  transactionHash: null
  receipt: null
  settlement: null
}
```

### Validation sequence

1. Package is a well-formed object with `packageId`
2. `packageVersion` === `1.0.0`
3. `handoffMode` === `dry_run` (reject `live` / `LIVE` / any other mode)
4. `dryRunManifest` present and satisfies manifest rules
5. `proposedInstruction` present
6. Deep scan rejects forbidden execution-implying fields anywhere in the package
7. Instruction contract validation (via gateway) after handoff acceptance

---

## 3. Dry-run execution path

```
Valid handoff package
        │
        ▼
validateDryRunHandoffPackage() ──fail──► HandoffConsumerFailure
        │
       pass
        │
        ▼
acceptKerlExecutionInstruction(proposedInstruction)
        │
        ▼
dryRunExecutionInstruction()  [DRY_RUN_ONLY]
        │
        ├── validateExecutionInstruction()
        ├── ExecutionTracker.registerInstruction()
        ├── ExecutionTracker.completeDryRun()
        ├── buildDryRunExecutionEvidence()
        └── buildExecutionReport()
        │
        ▼
HandoffConsumerSuccess {
  report: ExecutionReport
  dryRun: DryRunSuppressionManifest
}
```

Terminal tracker status: `dry_run_completed`

---

## 4. Rejection rules

| Condition | Error code |
|-----------|------------|
| Non-object package | `HANDOFF_INVALID_PACKAGE` |
| Unsupported `packageVersion` | `HANDOFF_UNSUPPORTED_PACKAGE_VERSION` |
| `handoffMode` = live | `HANDOFF_LIVE_MODE_REJECTED` |
| Missing manifest | `HANDOFF_MISSING_DRY_RUN_MANIFEST` |
| Missing instruction | `HANDOFF_MISSING_PROPOSED_INSTRUCTION` |
| Manifest field violation | `HANDOFF_MANIFEST_VIOLATION` |
| `executionPerformed` = true | `HANDOFF_EXECUTION_IMPLIED` |
| `walletInteraction` ≠ none | `HANDOFF_WALLET_INTERACTION_IMPLIED` |
| Non-null `transactionHash` | `HANDOFF_TRANSACTION_HASH_IMPLIED` |
| Non-null `receipt` | `HANDOFF_RECEIPT_IMPLIED` |
| Non-null `settlement` | `HANDOFF_SETTLEMENT_IMPLIED` |
| Non-null `treasurySubmission` | `HANDOFF_TREASURY_IMPLIED` |
| Unsupported instruction type | `INGRESS_UNSUPPORTED_TYPE` (gateway) |
| Invalid instruction identity | `INGRESS_VALIDATION_FAILED` (gateway) |
| Gateway inactive | `GATEWAY_INACTIVE` (gateway) |

Live handoff packages are rejected **before** gateway invocation.

---

## 5. Suppression guarantees

Every successful consumer response preserves:

| Field | Value |
|-------|-------|
| `executionMode` | `DRY_RUN_ONLY` |
| `executionStatus` | `dry_run_completed` |
| `executionAuthority` | `dex` |
| `executionPerformed` | `false` |
| `walletInteraction` | `none` |
| `transactionHash` | `null` |
| `receipt` | `null` |
| `settlement` | `null` |
| `executionSuppressed` | `true` |

**Never performed:**

- Adapter dispatch (`dispatchExecutionInstruction`)
- Wallet submission (`trackExecutionSubmission`)
- Transaction creation
- Receipt polling
- Settlement Events
- Treasury mutations

---

## 6. Test results

```bash
yarn test src/lib/execution-handoff-consumer   # 25/25 pass
yarn test src/lib/execution-gateway            # regression pass
yarn test src/design-system                    # 11/11 pass
yarn test src/lib/homepage-live                # 2/2 pass
yarn build                                     # pass
```

### Test coverage summary

| Requirement | Test |
|-------------|------|
| Valid KERL handoff accepted | ✓ |
| Invalid package rejected | ✓ |
| Live mode rejected | ✓ |
| Wallet interaction implied → rejected | ✓ |
| Transaction hash implied → rejected | ✓ |
| Receipt implied → rejected | ✓ |
| Settlement implied → rejected | ✓ |
| Treasury implied → rejected | ✓ |
| Unsupported instruction type → rejected | ✓ |
| Consumer calls only dry-run gateway | ✓ |
| Never reaches execution adapters | ✓ |
| Never mutates Treasury | ✓ |
| No UI imports in consumer | ✓ |
| No public API exposure | ✓ |
| UI swap/bridge commit buttons unchanged | ✓ |

---

## 7. Future live activation path

Phase 3 establishes **handoff validation + dry-run routing only**. Future phases (not in scope):

1. **Phase 4+** — Separate live handoff mode with explicit constitutional gate, human approval, and adapter dispatch boundary audit
2. **Gateway activation** — `setExecutionGatewayEnabled(true)` remains harness-only until governance approves
3. **Swarm integration** — Handoff packages may arrive from KERL runtime; DEX validates shape locally without runtime coupling
4. **Live execution** — Requires new mission, new verdict, and explicit separation from dry-run consumer

The dry-run consumer must remain available as the non-executing reference path even after live activation is explored.

---

## 8. Authoritative inputs consumed

| Verdict / module | Status |
|------------------|--------|
| `KERL_DEX_EXECUTION_BOUNDARY_ESTABLISHED` | Used |
| `KERL_DEX_EXECUTION_CONTRACT_HARDENED` | Used |
| `KERL_DEX_EXECUTION_TRACKER_ESTABLISHED` | Used |
| `KERL_DEX_INTERNAL_INGRESS_ESTABLISHED` | Used |
| `KERL_EXECUTION_GATEWAY_DRY_RUN_ESTABLISHED` | Used |
| `KERL_LIVE_INTEGRATION_RC1_REMOTE_CERTIFIED` | Shape reference only |

---

## Final verdict

**KERL_DEX_DRY_RUN_HANDOFF_CONSUMER_ESTABLISHED**
