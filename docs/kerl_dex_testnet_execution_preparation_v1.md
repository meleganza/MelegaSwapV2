# KERL DEX Testnet Execution Preparation v1

**Mission:** KERL Live Integration — `TESTNET_EXECUTION_ONLY` Preparation  
**Repository:** MelegaSwapV2 (`design-system-foundation`)  
**Date:** 2026-07-03  
**KERL status:** `KERL_LIVE_INTEGRATION_RC1_REMOTE_CERTIFIED`  
**Mode:** Preparation only — **no testnet execution activated**

---

## Executive summary

Phases 1–7A of KERL Live Integration are established. This mission adds the **execution mode architecture** and **explicit activation gates** required so that future `TESTNET_EXECUTION_ONLY` activation becomes a **configuration change**, not a redesign.

| Constraint | Status after preparation |
|------------|-------------------------|
| No on-chain execution | ✅ Enforced |
| No wallet submission via KERL path | ✅ Enforced |
| No swaps / bridges via KERL ingress | ✅ Enforced |
| No transaction creation via KERL path | ✅ Enforced |
| No receipt polling via KERL path | ✅ Enforced |
| No Settlement Events | ✅ Enforced |
| No Treasury mutations | ✅ Enforced |
| No UI activation | ✅ Enforced |
| TESTNET accidentally activatable | ✅ Blocked (`kerlLiveExecutionAuthorized: false`) |
| MAINNET execution | ✅ Forbidden |

---

## 1. Execution mode architecture

### 1.1 Mode enum

New module: `apps/web/src/lib/execution-modes/`

| Mode | Constant | Purpose | Active after this mission |
|------|----------|---------|---------------------------|
| **OFF** | `EXECUTION_MODE_OFF` | Default — all KERL ingress rejected | ✅ Default |
| **DRY_RUN** | `EXECUTION_MODE_DRY_RUN` | Suppression manifest only | ✅ Harness only |
| **TESTNET_EXECUTION_ONLY** | `EXECUTION_MODE_TESTNET_EXECUTION_ONLY` | Scoped testnet on-chain path | ❌ Architecture only |
| **MAINNET_EXECUTION** | `EXECUTION_MODE_MAINNET_EXECUTION` | Future mainnet path | ❌ Permanently forbidden |

Legacy manifest value `DRY_RUN_ONLY` is preserved in gateway output for handoff compatibility (`EXECUTION_MODE_DRY_RUN_ONLY_LEGACY`).

### 1.2 Separation of concerns

| Layer | Module | Responsibility |
|-------|--------|----------------|
| **Configuration** | `execution-modes/config.ts` | Mode, environment flags, chain policy |
| **Activation** | `execution-gateway/activation.ts`, `execution-ingress/activation.ts` | Harness toggles (inactive by default) |
| **Gates** | `execution-modes/activation-gates.ts` | Explicit all-or-nothing gate evaluation |
| **Dry-run execution** | `execution-gateway/dry-run.ts` | Validation + tracker + suppression manifest |
| **Live execution** | `execution-ingress/dispatch.ts` | Adapter dispatch (gated — never passes in production) |
| **Tracking** | `execution-tracker/` | Lifecycle + evidence (dry-run terminal today) |
| **Receipt observation** | `useExecutionTrackerReceiptSync.ts` | Read-only Redux sync — not wired from KERL |

### 1.3 Routing by mode (`kerl-gateway.ts`)

```
OFF                    → reject (MODE_OFF)
DRY_RUN                → dryRunExecutionInstruction()
TESTNET_EXECUTION_ONLY → live_blocked → evaluateLiveExecutionGates() → reject
MAINNET_EXECUTION      → live_blocked → evaluateLiveExecutionGates() → reject (MAINNET_FORBIDDEN)
```

### 1.4 Chain policy

| Policy | Chain IDs |
|--------|-----------|
| Testnet allowlist | `97` (BSC Testnet) |
| Mainnet denylist | `56`, `1`, `137`, `8453` |

`TESTNET_EXECUTION_ONLY` requires `isTestnetChainId(chainId)`.

---

## 2. Activation gates

### 2.1 Dry-run gates (`evaluateDryRunGates`)

| Gate ID | Requirement |
|---------|-------------|
| `execution_mode_configured` | Mode === `DRY_RUN` |
| `gateway_enabled` | `isExecutionGatewayEnabled()` |
| `valid_instruction` | Instruction passes contract validation |
| `certified_handoff` | Certified handoff when invoked from KERL pipeline |

### 2.2 Live execution gates (`evaluateLiveExecutionGates`)

**All gates must pass.** No implicit activation.

| Gate ID | Requirement |
|---------|-------------|
| `execution_mode_configured` | Mode === `TESTNET_EXECUTION_ONLY` or `MAINNET_EXECUTION` |
| `environment_authorized` | `environmentAuthorized === true` |
| `dry_run_disabled` | Mode is not `DRY_RUN` or `OFF` |
| `ingress_enabled` | `isInternalIngressEnabled()` |
| `wallet_available` | Account present |
| `valid_instruction` | Instruction valid |
| `certified_handoff` | `certifiedHandoff === true` |
| `mainnet_forbidden` | Mode !== `MAINNET_EXECUTION` |
| `testnet_armed` | `testnetExecutionArmed === true` (when testnet mode) |
| `testnet_only` | ChainId in testnet allowlist (when testnet mode) |
| `supported_chain` | ChainId defined and policy-compliant |
| `gateway_enabled` | Gateway enabled |
| **`kerl_live_execution_authorized`** | **`kerlLiveExecutionAuthorized === true`** |

### 2.3 Civilization gate (preparation lock)

`kerlLiveExecutionAuthorized` defaults to **`false`** and has **no production setter** in this mission.

This gate ensures `TESTNET_EXECUTION_ONLY` cannot activate accidentally even if harness flags are toggled in tests. Future activation mission must introduce env-driven authorization for this field only.

---

## 3. Execution component review

### 3.1 Execution Gateway (`lib/execution-gateway/`)

| Aspect | Current | Change for testnet prep |
|--------|---------|-------------------------|
| Mode | `DRY_RUN_ONLY` manifest | + `canPerformDryRun()` gate |
| Activation | Inactive default | Unchanged |
| Wallet | Never | Unchanged |
| Adapter dispatch | Never | Unchanged |
| Future testnet | N/A | Live path routes to ingress (gated) |

**Verdict:** Suppression evolves naturally — dry-run path unchanged; live branch prepared in ingress.

### 3.2 Certified Handshake (`lib/execution-handoff-consumer/certified-handshake.ts`)

| Aspect | Current | Testnet prep |
|--------|---------|--------------|
| Pipeline | Validate → consume → dry-run | Unchanged |
| `handoffMode` | Must be `dry_run` | Unchanged — live handoffs still rejected |
| Network | None | Unchanged |

**Future:** Testnet-certified handoff packages will require new schema version + `handoffMode: testnet_execution` — not in this mission.

### 3.3 Registry Intake (`lib/execution-handoff-intake/`)

| Aspect | Current | Testnet prep |
|--------|---------|--------------|
| Source | `public/registry/kerl/` | Unchanged |
| Validation | DRY_RUN_ONLY manifest scan | Unchanged |
| Seed chainId | `56` (mainnet fixture) | Future testnet fixtures needed at activation |

### 3.4 Execution Tracker (`lib/execution-tracker/`)

| Aspect | Current | Testnet prep |
|--------|---------|--------------|
| Dry-run terminal | `dry_run_completed` | Unchanged |
| Live lifecycle | `submitted` → `pending` → `confirmed` | Exists but unreachable from KERL |
| Settlement fields | Forbidden | Unchanged |

### 3.5 Execution Contract (`lib/execution-contract/`)

| Aspect | Current | Testnet prep |
|--------|---------|--------------|
| `ExecutionReport` | Lifecycle evidence only | Unchanged |
| Settlement guard | `assertReportDoesNotImplySettlement` | Unchanged |

### 3.6 Execution Boundary (`routing-layer` / `execution-layer`)

| Aspect | Current | Testnet prep |
|--------|---------|--------------|
| UI commit buttons | Legacy live hooks | **Not wired to KERL** — constitutional |
| KERL path | Dry-run only | Gates block live ingress |
| Enforcement | Import-scan tests | Unchanged — no runtime middleware |

### 3.7 Internal Ingress (`lib/execution-ingress/`)

| Aspect | Current | Testnet prep |
|--------|---------|--------------|
| `dispatchExecutionInstruction` | Inactive default | + `evaluateLiveExecutionGates()` before submit |
| KERL entry | `acceptKerlExecutionInstruction` | Mode-based routing |
| Adapter wiring | Tested via mocked gates | Preserved for future activation |

---

## 4. Receipt lifecycle preparation

**Not implemented in this mission.** Documented surface: `execution-modes/receipt-pipeline.ts`

| Stage | Module | Implemented | KERL path today |
|-------|--------|-------------|-----------------|
| `transaction_submitted` | `trackExecution.ts` | ✅ | ❌ Not reached |
| `receipt_observation_begins` | `state/transactions/` + wagmi | ✅ (DEX UI) | ❌ Not KERL |
| `tracker_receipt_sync` | `useExecutionTrackerReceiptSync.ts` | ✅ | ❌ Not KERL UI |
| `evidence_evolution` | `tracker.syncReceiptFromTransaction` | ✅ | ❌ Not reached |
| `execution_report_finalized` | `execution-contract/report.ts` | ✅ | Dry-run only |
| `settlement_event_production` | **FUTURE / Treasury** | ❌ | ❌ Forbidden |

### 4.1 Future receipt flow (testnet activation)

```
dispatchExecutionInstruction()
  → trackExecutionSubmission()           [transaction_submitted]
  → Redux/wagmi pending tx               [receipt_observation_begins]
  → useExecutionTrackerReceiptSync()       [tracker_receipt_sync]
  → syncReceiptFromTransaction()           [evidence_evolution]
  → finalizeIfTerminal()                   [execution_report_finalized]
  → (FUTURE) Settlement Events             [settlement_event_production — OUT OF SCOPE]
```

Treasury remains outside this pipeline until a dedicated civilization milestone.

---

## 5. Configuration model

### 5.1 Runtime config (`ExecutionModeConfig`)

```typescript
{
  mode: 'OFF',                        // default
  environmentAuthorized: false,
  testnetExecutionArmed: false,
  mainnetExecutionArmed: false,       // typed false — immutable
  kerlLiveExecutionAuthorized: false  // civilization lock
}
```

### 5.2 Harness helpers (test/internal only)

| Helper | Purpose |
|--------|---------|
| `enableKerlDryRunHarness()` | Sets `DRY_RUN` + gateway enabled |
| `resetKerlExecutionHarness()` | Resets all activation state |
| `setExecutionModeForHarness()` | Mode override (tests) |
| `setExecutionGatewayEnabled(true)` | Auto-promotes `OFF` → `DRY_RUN` for backward compat |

### 5.3 Future env surface (not wired in this mission)

| Variable (proposed) | Purpose |
|---------------------|---------|
| `KERL_EXECUTION_MODE` | `OFF` \| `DRY_RUN` \| `TESTNET_EXECUTION_ONLY` |
| `KERL_ENVIRONMENT_AUTHORIZED` | Constitutional env gate |
| `KERL_TESTNET_EXECUTION_ARMED` | Explicit testnet arm |
| `KERL_LIVE_EXECUTION_AUTHORIZED` | Civilization gate — flips `kerlLiveExecutionAuthorized` |

**No `process.env` reads exist today.** Activation remains impossible without a future mission wiring env → config.

---

## 6. Remaining work before activation

| # | Work item | Blocker level |
|---|-----------|---------------|
| 1 | Wire `KERL_LIVE_EXECUTION_AUTHORIZED` env → `kerlLiveExecutionAuthorized` | Required |
| 2 | Testnet-certified handoff schema (`handoffMode: testnet_execution`) | Required |
| 3 | Swarm-published testnet handoff artifacts (chainId 97) | Required |
| 4 | `acceptKerlExecutionInstruction` live branch → `dispatchExecutionInstruction` when gates pass | Required |
| 5 | Testnet adapter harness with headless wallet (no UI) | Required |
| 6 | Idempotency / instruction dedup before submit | Recommended |
| 7 | Unified mode controller shared with UI execution-layer (prevent dual-path drift) | Recommended |
| 8 | Runtime boundary middleware (not only import-scan tests) | Recommended |
| 9 | Tracker mode segregation in localStorage | Low |
| 10 | Receipt sync hook wiring for KERL harness (not UI) | Required for testnet E2E |
| 11 | Constitutional re-authorization document | Required |
| 12 | Settlement Events — explicit out of scope until Treasury milestone | Policy |

**Activation checklist (future mission):**

1. Set `KERL_EXECUTION_MODE=TESTNET_EXECUTION_ONLY`
2. Set `KERL_LIVE_EXECUTION_AUTHORIZED=true`
3. Set `KERL_TESTNET_EXECUTION_ARMED=true`
4. Set `KERL_ENVIRONMENT_AUTHORIZED=true`
5. Enable gateway + ingress (harness or server-side only)
6. Load testnet-certified handoff from Swarm registry
7. Verify chainId 97 only
8. Run internal harness — **not UI**

---

## 7. Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Dual execution paths (UI hooks vs KERL stack) | High | Gates on KERL path; UI not wired; future unified mode controller |
| In-memory activation flags | Medium | Civilization gate + future env-only authorization |
| `execution-boundary` is test-only enforcement | Medium | Document; add runtime middleware in activation mission |
| Two independent activation switches (gateway + ingress) | Medium | `evaluateLiveExecutionGates` requires both |
| Registry seed uses mainnet chainId 56 | Low | Testnet fixtures at activation |
| No idempotency before submit | Medium | Defer to activation mission |
| Build Studio "Dry Run" labels cosmetic | Low | Unrelated to KERL gateway — operator docs |
| Swarm cross-repo validation blocked | Medium | Co-requisite for authoritative artifacts |

### 7.1 Execution suppression review

Current suppression **evolves naturally**:

- `DRY_RUN` → existing `dryRunExecutionInstruction` + suppression manifest
- `TESTNET_EXECUTION_ONLY` → `evaluateLiveExecutionGates` fail-closed
- `MAINNET_EXECUTION` → `mainnet_forbidden` gate always fails
- `kerlLiveExecutionAuthorized: false` → permanent preparation lock

No redesign required. Weakness: live dispatch code exists in `dispatch.ts` but is **gated**, not removed — correct for preparation.

---

## 8. Validation

### 8.1 Test results

```bash
cd apps/web && yarn test execution-modes execution-gateway execution-ingress \
  execution-handoff-consumer execution-handoff-intake execution-tracker execution-boundary
```

**Result:** 150 / 150 pass

| Suite | Tests |
|-------|-------|
| execution-modes | 7 |
| execution-gateway | 21 |
| execution-ingress | 19 |
| execution-handoff-consumer | 52 |
| execution-handoff-intake | 24 |
| execution-tracker | 10 |
| execution-boundary | 17 |

`yarn build` — pass

### 8.2 Suppression validation matrix

| Scenario | Expected | Verified |
|----------|----------|----------|
| Default mode OFF | KERL ingress rejected | Test ✅ |
| DRY_RUN + gateway | Suppression manifest | Existing tests ✅ |
| TESTNET mode set | Live gates fail | Test ✅ |
| Ingress enabled, no gates | Dispatch blocked | Test ✅ |
| MAINNET mode | `MAINNET_FORBIDDEN` | Test ✅ |
| All harness flags except civilization gate | Still blocked | Test ✅ |
| UI imports KERL gateway | Zero | Boundary tests ✅ |
| Settlement in report | Throws | Contract tests ✅ |

---

## 9. Files added / modified

### New
- `apps/web/src/lib/execution-modes/constants.ts`
- `apps/web/src/lib/execution-modes/config.ts`
- `apps/web/src/lib/execution-modes/activation-gates.ts`
- `apps/web/src/lib/execution-modes/receipt-pipeline.ts`
- `apps/web/src/lib/execution-modes/harness.ts`
- `apps/web/src/lib/execution-modes/index.ts`
- `apps/web/src/lib/execution-modes/__tests__/execution-modes.test.ts`
- `docs/kerl_dex_testnet_execution_preparation_v1.md`

### Modified
- `execution-gateway/dry-run.ts` — dry-run gate evaluation
- `execution-gateway/activation.ts` — auto DRY_RUN on gateway enable
- `execution-gateway/types.ts` — `certifiedHandoff` context
- `execution-ingress/kerl-gateway.ts` — mode routing
- `execution-ingress/dispatch.ts` — live gate evaluation
- `execution-ingress/constants.ts` — `GATES_NOT_SATISFIED`
- `execution-ingress/types.ts` — `certifiedHandoff` context
- `execution-ingress/__tests__/execution-ingress.test.ts` — gate blocking tests

---

## 10. Final recommendation

The DEX execution stack is **architecturally prepared** for `TESTNET_EXECUTION_ONLY`. Explicit modes, chain policy, activation gates, and a civilization lock (`kerlLiveExecutionAuthorized`) are in place. Dry-run behavior is preserved. Live execution paths exist but are **fail-closed**. Enabling testnet later requires configuration changes and a dedicated activation mission — not code redesign.

**KERL_DEX_READY_FOR_TESTNET_EXECUTION_MODE**
