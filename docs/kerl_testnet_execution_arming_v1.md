# KERL Testnet Execution Arming v1

**Mission:** KERL Economic Activation — Phase T1 `TESTNET_EXECUTION_ONLY` Arming  
**Repository:** MelegaSwapV2 (`design-system-foundation`)  
**Date:** 2026-07-03  
**Prior state:** `KERL_DEX_READY_FOR_TESTNET_EXECUTION_MODE` (preparation v1)  
**Constraint:** Arming only — **no execution activated**, **no on-chain transactions**

---

## Executive summary

Phase T1 completes the **final activation architecture** before TESTNET execution. After this mission, enabling execution requires **only explicit Civilization authorization** plus lifecycle progression — not code redesign.

| Constraint | Status after T1 arming |
|------------|------------------------|
| No on-chain execution | ✅ Enforced |
| No wallet submission via KERL path | ✅ Enforced (default) |
| No UI activation | ✅ Enforced |
| No env-only activation | ✅ Config does not read `process.env` |
| Civilization authorization mandatory | ✅ `kerlLiveExecutionAuthorized: false` default |
| MAINNET forbidden | ✅ Constitutionally blocked |
| No Treasury mutation | ✅ Boundary preserved |
| No Settlement Event emission | ✅ `settlement_event_production` not implemented |
| No fabricated receipts | ✅ Rollback returns to DRY_RUN only |

---

## 1. Activation state machine

Canonical lifecycle (`activation-lifecycle.ts`):

```
OFF
 ↓
DRY_RUN
 ↓
TESTNET_ARMED
 ↓
TESTNET_EXECUTION_ENABLED    ← wallet submission permitted from here
 ↓
TESTNET_EXECUTION_ACTIVE
 ↓
TESTNET_RECEIPT_CAPTURE
 ↓
EXECUTION_EVIDENCE
 ↓
SETTLEMENT_EVENT_READY
```

| State | Wallet submission | Notes |
|-------|-------------------|-------|
| `OFF` | ❌ | Default at process start |
| `DRY_RUN` | ❌ | Suppression manifest only |
| `TESTNET_ARMED` | ❌ | Arming complete — not execution |
| `TESTNET_EXECUTION_ENABLED` | ✅ (if all gates pass) | Requires Civilization authorization |
| `TESTNET_EXECUTION_ACTIVE` | ✅ (if all gates pass) | In-flight execution |
| `TESTNET_RECEIPT_CAPTURE` | N/A | Post-submission observation |
| `EXECUTION_EVIDENCE` | N/A | Tracker evidence evolution |
| `SETTLEMENT_EVENT_READY` | N/A | Future Treasury — not active |

**MAINNET** remains constitutionally disabled. `MAINNET_EXECUTION` mode always fails `mainnet_forbidden` gate.

Transitions are **ordered** — no skipping (`canTransitionLifecycle`).

---

## 2. Activation gates

All gates are **explicit** in `evaluateLiveExecutionGates()`. No implicit execution path.

| Gate ID | Requirement |
|---------|-------------|
| `execution_mode_configured` | Mode === `TESTNET_EXECUTION_ONLY` |
| `environment_authorized` | `environmentAuthorized === true` |
| `supported_environment` | TESTNET mode + environment authorized |
| `dry_run_disabled` | Mode not `OFF` or `DRY_RUN` |
| `civilization_authorization` | `kerlLiveExecutionAuthorized === true` |
| `kerl_live_execution_authorized` | Same civilization lock (duplicate guard) |
| `lifecycle_permits_execution` | Lifecycle `TESTNET_EXECUTION_ENABLED` or `ACTIVE` |
| `gateway_enabled` | `isExecutionGatewayEnabled()` |
| `ingress_enabled` | `isInternalIngressEnabled()` |
| `certified_handoff` | `certifiedHandoff === true` |
| `handoff_compatible` | Compatibility certification verified |
| `valid_instruction` | Instruction passes contract validation |
| `supported_execution_type` | `SmartSwap` \| `V2Swap` \| `BridgeBurn` |
| `supported_chain` | Testnet chainId in policy |
| `testnet_only` | chainId in testnet allowlist (`97`) |
| `testnet_armed` | `testnetExecutionArmed === true` |
| `wallet_available` | Account present |
| `mainnet_forbidden` | Mode !== `MAINNET_EXECUTION` |
| `registry_published` | KERL registry publication persisted |
| `registry_compatibility_verified` | Cross-repository compatibility certified |
| `treasury_observation_available` | Treasury observes KERL registry |
| `mission_director_observation_available` | Mission Director observed |
| `kcis_observation_available` | KCIS observed |
| `economic_memory_observation_available` | Economic Memory observed |

Dry-run gates (`evaluateDryRunGates`) additionally require `DRY_RUN` mode + gateway + registry published.

---

## 3. Civilization authorization model

| Field | Default | Setter | Env-driven |
|-------|---------|--------|------------|
| `kerlLiveExecutionAuthorized` | `false` | `setCivilizationAuthorizationForHarness()` only | ❌ Not in T1 |

**No environment variable alone may activate execution.** `config.ts` explicitly does not read `process.env`.

Future activation mission may wire `KERL_LIVE_EXECUTION_AUTHORIZED` env → civilization setter — that is a **separate explicit mission**, not T1.

Civilization observations (`civilization-observations.ts`) reflect verified swarm state:

| Observation | T1 default |
|-------------|------------|
| KERL Registry ACTIVE | ✅ |
| Registry Publication persisted | ✅ |
| Cross-repository compatibility certified | ✅ |
| Mission Director OBSERVED | ✅ |
| KCIS OBSERVED | ✅ |
| Economic Memory OBSERVED | ✅ |
| Treasury OBSERVES_KERL_REGISTRY | ✅ |
| Treasury READY_FOR_SETTLEMENT_INGESTION | ✅ |
| Signal OBSERVED | ✅ |
| Labs OBSERVED | ✅ |
| Space OBSERVED | ✅ |

Observations gate ingress but **do not** substitute for Civilization authorization.

---

## 4. Rollback model

`rollbackActivationToDryRun()` (`rollback.ts`):

| Action | Effect |
|--------|--------|
| Lifecycle → `DRY_RUN` | Wallet submission impossible |
| `testnetExecutionArmed` → `false` | Disarm |
| `kerlLiveExecutionAuthorized` → `false` | Revoke civilization auth |
| Gateway → disabled | No dry-run/live gateway |
| Ingress → disabled | No dispatch |

**Before wallet submission:** immediate safe return to `DRY_RUN`.

**After wallet submission:** normal receipt lifecycle — no fabricated receipts or settlement events.

---

## 5. Safety guarantees

| Rule | Enforcement |
|------|-------------|
| Execution impossible while `OFF` | `resolveKerlIngressRoute` → `off` |
| Execution impossible while `DRY_RUN` | `lifecyclePermitsWalletSubmission` false |
| Execution impossible while `TESTNET_ARMED` | Lifecycle gate blocks until `ENABLED` |
| Execution begins only after explicit activation | Civilization auth + lifecycle `ENABLED` + all gates |
| No UI activation | Boundary tests — UI does not import `dispatchExecutionInstruction` |
| No accidental activation | 22+ explicit gates, all default false |
| No env-only activation | No `process.env` reads in config |
| MAINNET forbidden | Permanent gate + `MAINNET_EXECUTION` blocked |
| No Treasury mutation | Ownership guards + handoff validators |
| No Settlement Event | `settlement_event_production` `implemented: false` |

KERL ingress routing unchanged:

```
OFF                    → reject
DRY_RUN                → dry-run gateway
TESTNET_EXECUTION_ONLY → live_blocked → evaluateLiveExecutionGates() → reject (until future activation)
```

---

## 6. Remaining work before first execution

| # | Item | Owner |
|---|------|-------|
| 1 | Explicit Civilization authorization (`setCivilizationAuthorizationForHarness` / future env) | Civilization ops |
| 2 | Advance lifecycle to `TESTNET_EXECUTION_ENABLED` | Activation mission |
| 3 | Set `KERL_EXECUTION_MODE=TESTNET_EXECUTION_ONLY` (future env wiring) | Config mission |
| 4 | Set `KERL_ENVIRONMENT_AUTHORIZED=true` | Config mission |
| 5 | Enable gateway + ingress (server/harness only) | Ops |
| 6 | Load testnet-certified handoff (chainId 97, `handoffMode: testnet_execution`) | Swarm + registry |
| 7 | Wire `kerl-gateway` live branch when gates pass | Activation mission |
| 8 | Receipt sync hook for KERL harness (not UI) | E2E mission |
| 9 | Constitutional re-authorization artifact | Governance |
| 10 | First funded BSC testnet wallet execution | Operator QA |

---

## 7. Validation results

**Command:**

```bash
cd apps/web && yarn test execution-modes execution-gateway execution-ingress \
  execution-handoff-consumer execution-handoff-intake execution-tracker execution-boundary
```

| Suite | Tests | Result |
|-------|-------|--------|
| execution-modes | 7 | ✅ |
| testnet-arming (T1) | 13 | ✅ |
| execution-gateway | 21 | ✅ |
| execution-ingress | 19 | ✅ |
| execution-handoff-consumer | 52 | ✅ |
| execution-handoff-intake | 24 | ✅ |
| execution-tracker | 10 | ✅ |
| execution-boundary | 17 | ✅ |
| **Total** | **163** | **✅ PASS** |

`runTestnetArmingValidation()` programmatic checks: **✅ PASS** (all gates exist, default execution impossible, observations satisfied, MAINNET forbidden).

### Validated safety properties

| Property | Verified |
|----------|----------|
| All activation gates exist | ✅ `listRequiredLiveGateIds()` — 22 gates |
| No implicit execution path | ✅ Gateway/ingress disabled by default |
| Execution impossible without Civilization authorization | ✅ Test |
| Execution impossible with registry unavailable | ✅ Test |
| Execution impossible with incompatible certification | ✅ Test |
| Execution impossible with unsupported chain | ✅ Test |
| Execution impossible with unsupported instruction | ✅ Test |
| Execution impossible from UI | ✅ Boundary tests |
| MAINNET remains forbidden | ✅ Test |
| No Treasury mutation | ✅ Handoff + ownership guards |
| No Settlement Event emitted | ✅ Pipeline stage not implemented |
| No wallet submission at default | ✅ Ingress + KERL gateway tests |

---

## 8. Files added / modified (T1)

### New
- `apps/web/src/lib/execution-modes/activation-lifecycle.ts`
- `apps/web/src/lib/execution-modes/civilization-observations.ts`
- `apps/web/src/lib/execution-modes/rollback.ts`
- `apps/web/src/lib/execution-modes/testnet-arming-validator.ts`
- `apps/web/src/lib/execution-modes/__tests__/testnet-arming.test.ts`
- `docs/kerl_testnet_execution_arming_v1.md`

### Modified
- `activation-gates.ts` — 22 explicit live gates + observation gates
- `config.ts` — lifecycle state, civilization setter
- `harness.ts` — `armTestnetLifecycleForHarness()`, observation reset
- `index.ts` — exports
- `dispatch.ts`, `kerl-gateway.ts` — handoff + instruction type in gate context
- `execution-modes.test.ts` — lifecycle + civilization gate tests

---

## 9. Final verdict

**KERL_TESTNET_EXECUTION_ARMED**

Execution architecture is complete. All activation gates are explicit. Civilization authorization remains mandatory. Default state is fail-closed. TESTNET execution requires only explicit Civilization authorization and lifecycle progression — no further architectural work.

**No on-chain transaction occurred during this mission.**
