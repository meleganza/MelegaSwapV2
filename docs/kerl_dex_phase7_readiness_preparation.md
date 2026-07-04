# KERL DEX Phase 7 Readiness Preparation

**Mission:** KERL Parallel Track — DEX Phase 7 Readiness Preparation  
**Repository:** MelegaSwapV2 (`design-system-foundation`)  
**HEAD at audit:** `a8ca4cd` (2026-07-03)  
**Mode:** Read-only audit — no implementation, no live communication, no execution  
**Constraint:** Melega DEX only. No Swarm, Treasury, Signal, Labs, or Space changes.

---

## Executive summary

Phases 1–6 of the KERL Live Integration track are **committed, tested, and isolated** on `design-system-foundation`. The DEX can validate certified dry-run handoff packages offline through a complete internal pipeline ending in a suppressed `ExecutionReport`. **No repository handoff intake exists yet** — all packages today are TypeScript fixtures under `__fixtures__/`. **No KERL registry manifests exist** under `public/registry/`.

The exact next safe step for repository-aware communication is **Phase 7A: Registry Handoff Intake (read-only, DRY_RUN_ONLY)** — a DEX-internal loader that reads versioned certified handoff JSON from `public/registry/kerl/`, validates schema and certification locally, and forwards to `performCertifiedDryRunHandshake()` without Swarm runtime imports, network calls to Swarm, wallet submission, or adapter dispatch.

Swarm CI stabilization remains a **co-requisite for authoritative artifact publication**, not a blocker for starting DEX-side intake scaffolding.

---

## 1. Current DEX KERL state

### 1.1 Live Integration track (Phases 1–6)

| Phase | Component | Module path | Verdict | Mode |
|-------|-----------|-------------|---------|------|
| **1** | Dry-Run Gateway | `lib/execution-gateway/` | `KERL_EXECUTION_GATEWAY_DRY_RUN_ESTABLISHED` | `DRY_RUN_ONLY`, inactive by default |
| **2** | Execution Boundary | `lib/routing-layer/` + `lib/execution-layer/` + `lib/execution-boundary/` | `KERL_DEX_EXECUTION_BOUNDARY_ESTABLISHED` | UI commit buttons cross boundary |
| **3** | Dry-Run Handoff Consumer | `lib/execution-handoff-consumer/consume.ts` | `KERL_DEX_DRY_RUN_HANDOFF_CONSUMER_ESTABLISHED` | Internal only |
| **4** | Offline E2E Fixture | `__fixtures__/rc1-offline-dry-run-handoff.fixture.ts` | `KERL_OFFLINE_E2E_DRY_RUN_FIXTURE_VALIDATED` | Test-only static |
| **5** | Internal Instruction Ingress | `lib/execution-ingress/` | Ingress established (inactive default) | Harness-only live dispatch path |
| **6** | Certified Dry-Run Handshake | `lib/execution-handoff-consumer/certified-handshake.ts` | `KERL_CERTIFIED_DRY_RUN_HANDSHAKE_ESTABLISHED` | Certification gate + consumer |

### 1.2 Foundation modules (preserved in `501e360`)

| Component | Module path | Role |
|-----------|-------------|------|
| Execution Contract | `lib/execution-contract/` | `ExecutionInstruction`, `ExecutionReport`, `ExecutionEvidence`, lifecycle |
| Execution Tracker | `lib/execution-tracker/` | Instruction ↔ txHash correlation, dry-run completion |
| KERL Ingress entry | `lib/execution-ingress/kerl-gateway.ts` | `acceptKerlExecutionInstruction()` → gateway only |

### 1.3 Certified dry-run pipeline (current terminal path)

```
Registry JSON (NOT YET — Phase 7)
  OR TypeScript fixture (Phases 4–6 today)
        │
        ▼
performCertifiedDryRunHandshake()     ← Phase 6
        │
        ├── validateCertifiedDryRunHandshake()
        ▼
consumeKerlDryRunHandoffPackage()     ← Phase 3
        │
        ├── validateDryRunHandoffPackage()
        ▼
acceptKerlExecutionInstruction()      ← Phase 1 ingress
        │
        ▼
dryRunExecutionInstruction()          ← Phase 1 gateway (DRY_RUN_ONLY)
        │
        ▼
ExecutionTracker.completeDryRun()
        │
        ▼
ExecutionReport + DryRunSuppressionManifest
```

### 1.4 Activation and isolation state (verified on HEAD)

| Surface | State |
|---------|-------|
| `setExecutionGatewayEnabled()` | `false` by default |
| `setInternalIngressEnabled()` | `false` by default |
| UI routes (`views/`, `pages/`) | **Zero** imports of handoff consumer, gateway, or certified handshake |
| Public APIs (`pages/api/`) | **Zero** KERL handoff exposure |
| Swarm runtime imports | **Forbidden** by ownership constants |
| Wallet submission via KERL path | **Suppressed** — manifest enforces `walletInteraction: none` |
| Adapter dispatch via KERL path | **Blocked** — gateway dry-run only |
| Settlement / Treasury | **Forbidden** — field scans + ownership rules |

### 1.5 Test and build status (HEAD `a8ca4cd`)

```bash
yarn test src/lib/execution-handoff-consumer \
         src/lib/execution-gateway \
         src/lib/execution-ingress \
         src/lib/execution-tracker \
         src/lib/execution-boundary
```

**Result:** 118 / 118 pass

| Suite | Tests |
|-------|-------|
| execution-handoff-consumer (incl. certified + offline e2e) | 52 |
| execution-gateway | 21 |
| execution-ingress | 18 |
| execution-tracker | 10 |
| execution-boundary | 17 |

`yarn build` — pass (verified during R018 on same branch).

### 1.6 What does NOT exist yet

| Gap | Impact on Phase 7 |
|-----|-------------------|
| `public/registry/kerl/` manifests | No repository artifact surface |
| Registry handoff loader module | Packages cannot be consumed from repo JSON |
| Swarm-published handoff artifacts in repo | No authoritative cross-repo packages |
| Live network handoff channel | Correctly absent — out of Phase 7 scope |
| KERL path wired to UI commit buttons | Correctly absent — must remain so |
| Live adapter dispatch from KERL ingress | Correctly gated — Phase 7 must not enable |

### 1.7 Parallel DEX runtime work (R015–R018)

Trade, Liquidity, Pools, and Farms Studio runtime activations use **legacy DEX execution hooks only**. They do not import KERL gateway, handoff consumer, or ingress. Constitutional constraint preserved: **DEX executes; KERL does not decide in studio paths.**

### 1.8 Phase numbering note

Two numbering schemes coexist in docs:

| Track | Phases |
|-------|--------|
| **Live Integration** (gateway → handshake) | Phases 1–6 complete; Phase 7 = repository intake |
| **Execution layer hardening** (boundary → tracker) | Phases 2–4 in `kerl_dex_execution_*_v1.md` |

This document uses **Live Integration** numbering for Phase 7.

---

## 2. Confirmed preserved commits

All KERL work is on `design-system-foundation` and is an ancestor of current HEAD.

| Commit | Short | Mission | Verdict preserved |
|--------|-------|---------|-------------------|
| `501e360e8a6081492385a99383c2024808479f8c` | `501e360` | Execution Layer foundation | `KERL_EXECUTION_LAYER_SAFELY_PERSISTED` |
| `d90783bcfc4cda8a8a89103d859167073dc665c6` | `d90783b` | Phase 3–4 handoff consumer + offline fixture | `KERL_DEX_PHASE3_4_SAFELY_PERSISTED` |
| `403d5c31b86d154e21170ce5d75dffe2771e8830` | `403d5c3` | Phase 6 certified handshake | `KERL_CERTIFIED_DRY_RUN_HANDSHAKE_SAFELY_PERSISTED` |

**Verification:** `git merge-base --is-ancestor 403d5c3 HEAD` → true.

Subsequent commits (`501e360..a8ca4cd`) are unrelated DEX studio runtime missions and do not modify KERL modules.

---

## 3. Required Swarm inputs for Phase 7

Phase 7 is **repository-aware**, not live-runtime-aware. Swarm must publish artifacts into the shared repository (or a documented path Melega DEX reads) without requiring DEX to import Swarm code.

| Input | Description | Required before |
|-------|-------------|-----------------|
| **RC1 certified handoff package JSON** | `CertifiedDryRunHandoffPackage` matching DEX `types.ts` + RC1 envelope | End-to-end validation against registry loader |
| **Compatibility certification block** | `KerlCompatibilityCertification` with verdict `KERL_REMOTE_CONTRACT_COMPATIBILITY_CERTIFIED`, outcome `compatible` | Handshake acceptance |
| **Registry index manifest** | e.g. `/registry/kerl/index.json` listing package URIs, versions, `dexCompatibilityVersion`, `executionInstructionContractVersion` | Discovery without hardcoded paths |
| **Routing decision snapshot reference** | Opaque ref string matching envelope `routingDecisionSnapshotRef` | RC1 envelope validation |
| **Schema version lock** | Alignment on `packageVersion: 1.0.0`, instruction schema `1.0`, contract `1.0` | Version mismatch rejection tests |
| **Swarm session correlation ref** | `swarmSessionRef` in `correlationIdentity` | Traceability only — no live session required |
| **Publication process** | Documented commit/PR workflow for Swarm → MelegaSwapV2 registry artifacts | Authoritative artifacts (blocked today by Swarm CI) |
| **Negative fixture variants** | Invalid packages (live mode, tx hash, wallet data) for rejection regression | Cross-repo validation suite |

**Explicitly NOT required for Phase 7 start:**

- Swarm runtime npm/package import into DEX
- Live HTTP/WebSocket to Swarm
- Wallet-connected dry-runs
- Settlement Events or Treasury writes

---

## 4. Required DEX changes for Phase 7

**Do not implement in this mission.** Scoped for the next implementation pass:

### 4.1 Phase 7A — Registry handoff intake (recommended first step)

| Deliverable | Path (proposed) | Behaviour |
|-------------|-----------------|-----------|
| Registry index type + validator | `lib/execution-handoff-intake/` or extend `execution-handoff-consumer/` | Parse `/registry/kerl/index.json` |
| Package loader | same | `fetch` or static import of registry JSON at known URI |
| Schema gate | reuse `validateCertifiedDryRunHandshake` | No duplicate validation logic |
| Intake entry | `intakeRegistryHandoffPackage(uri)` | Load → validate → `performCertifiedDryRunHandshake()` |
| Harness tests | `__tests__/registry-handoff-intake.test.ts` | Positive + negative registry fixtures |
| Registry artifacts | `public/registry/kerl/handoffs/*.json` + `index.json` | Versioned, read-only, no secrets |

### 4.2 Phase 7B — Cross-artifact validation (after Swarm publishes)

| Deliverable | Behaviour |
|-------------|-----------|
| CI test loading Swarm-published JSON | Proves repo-to-repo contract |
| Version drift guard | Fail if registry `dexCompatibilityVersion` ≠ `HANDOFF_PACKAGE_VERSION` |
| Preservation commit + doc | `kerl_dex_phase7_preservation_commit.md` |

### 4.3 Explicit non-changes (Phase 7 must NOT)

- Enable `setExecutionGatewayEnabled(true)` in production paths
- Wire handoff intake to UI routes or `pages/api/`
- Import Swarm runtime
- Add live `handoffMode` support
- Call `dispatchExecutionInstruction` from KERL path
- Emit Settlement Events or Treasury mutations
- Change SmartSwap / bridge commit button behaviour

---

## 5. Risks before repository-aware communication

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Swarm CI blocked** — no authoritative published packages | High | DEX can scaffold with local registry copies of RC1 fixture; defer cross-repo validation until Swarm publishes |
| **Registry JSON treated as settlement truth** | Critical | Registry artifacts are proposals only; `dryRunManifest.executionPerformed: false` must remain enforced |
| **Accidental public API exposure** | Critical | Ownership scans + no `pages/api/` wiring; internal harness only |
| **Version drift** between Swarm publish and DEX contract | High | Strict `HANDSHAKE_VERSION_MISMATCH` + CI version lock test |
| **Uncertified packages in registry** | High | Phase 6 handshake gate must run before any consumption |
| **Live-mode packages committed to registry** | Critical | `HANDOFF_LIVE_MODE_REJECTED` + registry lint rejecting `handoffMode !== dry_run` |
| **Confusion: repository read vs network communication** | Medium | Document `networkCommunication: false` in all registry manifests |
| **UI commit path still couples routing + execution** | Medium (pre-existing) | Phase 7 must not wire KERL intake to UI; separate concern for later live phase |
| **Stale fixture vs registry artifact divergence** | Medium | Single schema validator for both paths |
| **R015–R018 studio runtime scope creep into KERL** | Low | Continue forbidding KERL imports in studio runtime modules |

---

## 6. Recommended Phase 7 scope

### In scope

1. **Registry manifest surface** — `public/registry/kerl/index.json` + at least one certified dry-run handoff JSON (initially DEX-authored mirror of RC1 fixture until Swarm publishes)
2. **Registry intake module** — load JSON → `performCertifiedDryRunHandshake()` → suppressed report
3. **Tests** — loader acceptance, certification rejection, live-mode rejection, forbidden-field scan, surface isolation
4. **Documentation** — `kerl_dex_phase7_registry_handoff_intake_v1.md` + preservation commit
5. **DRY_RUN_ONLY enforcement** — unchanged suppression manifest guarantees

### Out of scope

- Live Swarm network communication
- Wallet submission or adapter dispatch
- Settlement Events / Treasury
- UI exposure
- Enabling live `handoffMode`
- Farms/pools/liquidity KERL execution
- Fixing Phase 1 audit blockers for full live KERL execution layer

### Success criteria for Phase 7 completion

| Criterion | Measure |
|-----------|---------|
| Registry package loads without TypeScript fixture import | Test passes |
| Certified handshake accepts registry-sourced package | `dry_run_completed` report |
| Invalid registry packages rejected before gateway | Error codes preserved |
| No new imports in `views/` or `pages/api/` | Grep isolation test |
| Swarm-published package (when available) passes same validator | Cross-repo CI test |
| 118+ tests pass; build pass | CI green |

---

## 7. Exact next safe step

**Implement Phase 7A only:** add a DEX-internal **Registry Handoff Intake** that reads certified `DryRunHandoffPackage` JSON from `public/registry/kerl/`, validates through the existing Phase 6 certified handshake, and terminates in the existing dry-run gateway — with **no Swarm runtime, no network to Swarm, no wallet, no adapter dispatch, no UI, no public API**.

Until Swarm CI stabilizes, seed the registry with a **JSON serialization of the existing RC1 offline fixture** (not a new semantic package) to prove the loader path without waiting for Swarm publication.

Do **not** proceed to live communication, live handoff mode, or adapter dispatch in Phase 7.

---

## 8. Final verdict

**DEX prerequisites for Phase 7 are satisfied:**

- Phases 1–6 committed (`403d5c3` ⊂ HEAD)
- 118/118 KERL execution tests pass on HEAD
- Certified handshake pipeline complete and isolated
- Gateway and ingress inactive by default
- No UI or public API contamination
- Next step is well-bounded and does not require Swarm runtime

**Swarm co-requisite (artifact publication) is not yet available** due to CI stabilization — this blocks Phase 7 **validation against authoritative Swarm artifacts**, not the **start of DEX-side registry intake scaffolding**.

---

**KERL_DEX_PHASE7_READY_TO_START**
