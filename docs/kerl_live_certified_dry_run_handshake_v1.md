# KERL Live Certified Dry-Run Handshake v1

**Mission:** KERL Live Integration Phase 6  
**Prerequisite verdict:** `KERL_REMOTE_CONTRACT_COMPATIBILITY_CERTIFIED`  
**DEX prerequisites:** `KERL_EXECUTION_GATEWAY_DRY_RUN_ESTABLISHED`, `KERL_DEX_DRY_RUN_HANDOFF_CONSUMER_ESTABLISHED`  
**Date:** 2026-07-03  
**Mode:** Internal only — `DRY_RUN_ONLY`

---

## 1. Handshake architecture

The Certified Dry-Run Handshake is the first DEX-side gate that accepts only `DryRunHandoffPackage` values carrying a valid **KERL Remote Contract Compatibility Certification**. It validates certification locally — **without importing Swarm runtime, performing network communication, or executing transactions**.

```
Certified DryRunHandoffPackage
        │
        ▼
performCertifiedDryRunHandshake()     ← execution-handoff-consumer/certified-handshake.ts
        │
        ├── validateCertifiedDryRunHandshake()
        ▼
consumeKerlDryRunHandoffPackage()     ← existing Phase 3 consumer
        │
        ├── validateDryRunHandoffPackage()
        ▼
acceptKerlExecutionInstruction()      ← execution-ingress/kerl-gateway.ts
        │
        ▼
dryRunExecutionInstruction()          ← execution-gateway/dry-run.ts
        │
        ▼
CertifiedHandshakeResult + ExecutionReport + DryRunSuppressionManifest
```

### Module layout

| Path | Role |
|------|------|
| `lib/execution-handoff-consumer/certification.ts` | Certification verdict constants, handshake error codes |
| `lib/execution-handoff-consumer/types.ts` | `KerlCompatibilityCertification`, `CertifiedDryRunHandoffPackage` |
| `lib/execution-handoff-consumer/validate-certified-handshake.ts` | Certification + envelope validation |
| `lib/execution-handoff-consumer/certified-handshake.ts` | `performCertifiedDryRunHandshake()` entry |
| `lib/execution-handoff-consumer/__fixtures__/certified-dry-run-handoff.fixture.ts` | Certified + invalid fixture variants |

### Isolation guarantees

| Surface | Reachable? |
|---------|------------|
| UI routes (`views/`, `pages/`) | **No** |
| Public APIs (`pages/api/`) | **No** |
| Live adapter dispatch | **No** |
| Wallet submission | **No** |
| Treasury mutation | **No** |
| Swarm runtime | **No** |
| Network communication | **No** |

The handshake performs **no execution itself**. It only validates and forwards to the existing dry-run consumer.

---

## 2. Certification verification

Certified packages must include `compatibilityCertification`:

```typescript
interface KerlCompatibilityCertification {
  certificationVerdict: 'KERL_REMOTE_CONTRACT_COMPATIBILITY_CERTIFIED'
  outcome: 'compatible' | 'unknown' | 'incompatible'
  executionContractVersion: string   // must match EXECUTION_INSTRUCTION_SCHEMA_VERSION ('1.0')
  dexCompatibilityVersion: string    // must match HANDOFF_PACKAGE_VERSION ('1.0.0')
  certifiedAt: string
}
```

### Verified fields

| Field | Requirement |
|-------|-------------|
| `certificationVerdict` | Must equal `KERL_REMOTE_CONTRACT_COMPATIBILITY_CERTIFIED` |
| `outcome` | Must be `compatible` |
| `executionContractVersion` | Must match package `executionInstructionContractVersion` and DEX schema `1.0` |
| `dexCompatibilityVersion` | Must match package `dexCompatibilityVersion` and DEX version `1.0.0` |
| `instructionIdentity` | Must match `proposedInstruction.id` and `correlationId` |
| `correlationIdentity` | `handoffCorrelationId` must match package and instruction correlation |
| `proposalEligibility` | `eligible: true`, `dexDryRunOnly: true`, `executionPermitted: false` |
| `dryRunManifest` | Full suppression guarantees (DRY_RUN_ONLY, no wallet, no tx/receipt/settlement) |

---

## 3. Acceptance rules

A package is accepted for handshake when **all** of the following hold:

1. Base handoff validation passes (`validateDryRunHandoffPackage`)
2. RC1 envelope fields are present and valid (`validateRc1OfflineHandoffFixture`)
3. `compatibilityCertification` is present
4. `certificationVerdict === KERL_REMOTE_CONTRACT_COMPATIBILITY_CERTIFIED`
5. `outcome === compatible`
6. Package version, DEX compatibility version, and execution contract version align
7. Instruction identity and correlation identity match proposed instruction
8. Proposal eligibility is `eligible: true` with dry-run suppression flags
9. Dry-run manifest integrity is intact

On acceptance, the package is forwarded to `consumeKerlDryRunHandoffPackage()` unchanged.

---

## 4. Rejection rules

| Condition | Error code |
|-----------|------------|
| Certification missing | `HANDSHAKE_MISSING_CERTIFICATION` |
| Outcome `unknown` | `HANDSHAKE_CERTIFICATION_UNKNOWN` |
| Outcome `incompatible` | `HANDSHAKE_CERTIFICATION_INCOMPATIBLE` |
| Invalid certification verdict | `HANDSHAKE_INVALID_CERTIFICATION_VERDICT` |
| Version mismatch (package, DEX, or contract) | `HANDSHAKE_VERSION_MISMATCH` |
| Instruction or correlation identity mismatch | `HANDSHAKE_IDENTITY_MISMATCH` |
| Missing suppression fields on eligibility | `HANDSHAKE_MISSING_SUPPRESSION_FIELDS` |
| Invalid dry-run manifest | `HANDSHAKE_INVALID_MANIFEST` |
| `proposalEligibility.eligible === false` | `HANDSHAKE_PROPOSAL_INELIGIBLE` |
| Missing RC1 envelope fields | `HANDSHAKE_MISSING_RC1_ENVELOPE` |

Rejection occurs **before** gateway invocation. No adapter dispatch, wallet interaction, or transaction creation on rejection.

---

## 5. Pipeline

```
Certified DryRunHandoffPackage
        ↓
Certified Handshake (validateCertifiedDryRunHandshake)
        ↓
Dry-Run Handoff Consumer (consumeKerlDryRunHandoffPackage)
        ↓
Execution Gateway (dryRunExecutionInstruction — DRY_RUN_ONLY)
        ↓
DryRun ExecutionReport
```

No adapter dispatch. No wallet interaction. No transaction hash. No receipt. No settlement.

---

## 6. Dry-run guarantees

| Guarantee | Enforced by |
|-----------|-------------|
| `executionMode: DRY_RUN_ONLY` | Manifest + gateway |
| `executionPerformed: false` | Manifest + gateway result |
| `walletInteraction: none` | Manifest + gateway result |
| `networkCommunication: false` | Manifest |
| `transactionHash: null` | Manifest + gateway result |
| `receipt: null` | Manifest + gateway result |
| `settlement: null` | Manifest + gateway result |
| `executionPermitted: false` | Proposal eligibility |
| `dexDryRunOnly: true` | Proposal eligibility |
| No adapter dispatch | Gateway boundary + tests |
| No treasury mutation | Forbidden field scan + ownership |

---

## 7. Test results

**Command:** `yarn test src/lib/execution-handoff-consumer`

| Suite | Tests | Result |
|-------|-------|--------|
| `certified-dry-run-handshake.test.ts` | 16 | pass |
| `execution-handoff-consumer.test.ts` | 25 | pass |
| `offline-e2e-dry-run-fixture.test.ts` | 11 | pass |
| **Total** | **52** | **pass** |

### Certified handshake coverage

| Scenario | Result |
|----------|--------|
| Certified package accepted | pass |
| Missing certification rejected | pass |
| Unknown certification rejected | pass |
| Incompatible certification rejected | pass |
| Version mismatch rejected | pass |
| Identity mismatch rejected | pass |
| Proposal ineligible rejected | pass |
| Invalid manifest rejected | pass |
| Invalid certification verdict rejected | pass |
| Dry-run suppression preserved | pass |
| Gateway remains dry-run only | pass |
| No adapter dispatch / wallet submission | pass |
| UI surface isolation | pass |
| Existing UI behaviour unchanged | pass |

---

## 8. Final verdict

**KERL_CERTIFIED_DRY_RUN_HANDSHAKE_ESTABLISHED**
