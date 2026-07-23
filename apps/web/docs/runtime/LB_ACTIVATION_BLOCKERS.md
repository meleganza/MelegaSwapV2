# LB Activation Blockers — Ranked Checklist

**Mission:** Liquidity Building V1 Activation  
**Assessed (UTC):** 2026-07-22T21:15:00Z  
**Production commit under test:** `fdee5588` / prior UX tip `68613b8c`  
**Live API:** `GET https://www.melega.finance/api/liquidity-building/activation-status/`  
**Live result:** `activationAuthorized=false`

---

## Exact condition for `activationAuthorized=true`

Source: `apps/web/src/lib/liquidity-building-runtime/activationGateConsumer.ts` → `consumeActivationGates` / `loadAndConsumeActivationGates`.

```text
activationAuthorized =
  FounderActivationApproved === true          // gateDoc.founderActivationApproved (legacy alias: gateDoc.activationAuthorized)
  AND executionCriticalGatesReady === true    // EXECUTION_CRITICAL gates only
  AND deploymentInputsValid === true
  AND manualActivationAttempt === false
  AND privateKeyConfigViolation === false
  AND manualOverrideForbidden !== false

where deploymentInputsValid =
  validatorResult ∈ { VALID, DEPLOYMENT_INPUTS_VALID, PASS }
  AND deploymentReadinessState ∈ { VALID, DEPLOYED }
  AND contractsDeployed === true              // lbFactory ∧ lbAuthorizer ∧ lbFeeSink nonzero addresses
  AND feeReceiverValid === true
  // intentionally does NOT require FounderActivationApproved or accounting readiness

executionCriticalGatesReady gates =
  LB-G03B, LB-G11, LB-G03C, LB-G04B, LB-G08, LB-G10

accountingReadiness (async; does not block activation) =
  LB-G04C/G12
```

**Supersession note (LB-ACT-003 / LB-ACT-004):** Prefer this formula and `LIQUIDITY_BUILDING_PRODUCTION_CONVERGENCE_REPORT.md`. Older checklist rows below may still mention pre-simplification blockers.

Artifact load paths (server cwd / repo root):

- `deployments/liquidity-building/chain-56/activation-gate-final.v1.json`
- `deployments/liquidity-building/chain-56/LiquidityBuildingV1.inputs.json`

**Forbidden by design:** flipping JSON to PASS without evidence; hot private keys; manual override (`manualOverrideForbidden: true`).  
Security matrix: `NO_MOCK_PRODUCTION_DEPENDENCY`, `NO_TEST_AUTHORITY_USED_FOR_ACTIVATION`, `NO_PRIVATE_KEY_FALLBACK`.

---

## Verification matrix (items 1–17)

| # | Check | Live / repo evidence | Status |
|---|-------|----------------------|--------|
| 1 | LB contracts chain 56 deployed? | `factory.address`, `authorizer.address`, `treasury.feeSinkAddress` all `null`; `deploymentReadinessState=BLOCKED` | **NO — not deployed** |
| 2 | Registry correctly bound? | Binding artifact `lb018-deployment-binding.v1.json` + inputs unresolved; no on-chain program registry populated | **NO** |
| 3 | Factory (Melega DEX) correct? | `0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C` — on-chain code ~10852 bytes; gate PASS | **YES** |
| 4 | Router correct? | `0xc25033218D181b27D4a2944Fbb04FC055da4EAB3` — on-chain code ~17845 bytes; gate PASS | **YES** |
| 5 | MasterBuilder / MasterChef correct? | Canonical MasterChef `0x41D5487836452d23f2c467070244E5842B412794` — code ~7309 bytes. There is **no MasterBuilder** in LB V1 inputs; farms MasterChef is the named dependency | **YES (MasterChef)** |
| 6 | Vault correct for LB fees? | Vault `0xb2d57B1A40E61AAb3F88361228E1188E0fB6A21C` **rejected** as LB fee receiver (role unproven). Not used | **N/A — rejected candidate** |
| 7 | Treasury Runtime reachable? | `https://treasury.melega.ai/api/v1/health` → HTTP 200, `status=CONNECTED`, but `environment=development`, `chain=none`, `chainId=null`, `compatibleWith=["smartdrop.v1"]` only — **no LB settlement** | **PARTIAL (reachable, wrong mode)** |
| 8 | KMS CONNECTED? | `productionAuthority.address=null`, `verdict=AUTONOMOUS_AUTHORITY_NOT_READY`; env `AWS_KMS_KEY_ID` UNSET; `productionKmsVerified=false` | **NO** |
| 9 | Execution relay CONNECTED? | `relay.status=DISABLED`, blocker `LB-G03C`; `LB_RELAY_URL` UNSET; matrix: `NOT_IDENTIFIED_AS_GIT_REPO` | **NO** |
| 10 | Quote policy loaded? | `quotePolicies=[]`; WBNB floors only `PROPOSED_FOR_FOUNDER_RATIFICATION` in `quote-policy-calculation.v1.json` | **NO (calculated ≠ ratified)** |
| 11 | Workers running? | No LB worker/cron API beyond health/readiness; relay disabled; no LB cron in `apps/web/vercel.json` | **NO** |
| 12 | Cron running? | Vercel crons are indexer-only (`/api/indexer/run`, registry refresh) — not LB epoch executor | **NO (LB)** |
| 13 | Executor authority configured? | Same as KMS — null authority; hot keys forbidden and unset | **NO** |
| 14 | Program registry configured? | Requires deployed Factory `_programById`; addresses null | **NO** |
| 15 | Treasury fee settlement reachable? | Runtime has no `lbSettlementSupport`; receiver/sink null; schema not implemented | **NO** |
| 16 | Event Fabric CONNECTED for LB? | Civilization Event Fabric exists in DEX app; **no LB subscription/wiring** | **NOT_CONFIGURED** |
| 17 | Why `activationAuthorized=false`? | See exact condition above + live blockers list below | **Documented** |

Live blockers array (production API):

```text
LB-G03B, LB-G11, LB-G03C, LB-G04B, LB-G04C/G12, LB-G08, LB-G10,
DEPLOYMENT_INPUTS_BLOCKED, CONTRACTS_NOT_DEPLOYED
```

---

## P0 — blocks deploy and `activationAuthorized`

### P0-1 — LB-G03B Production KMS/HSM authority

| Field | Value |
|-------|--------|
| Exact failure | `productionAuthority.address === null` · `verdict === AUTONOMOUS_AUTHORITY_NOT_READY` · gate “Production authority” / “Authorizer binding” status FAIL |
| Responsible | **Infrastructure / KMS account** + binding into `LiquidityBuildingV1.inputs.json#productionAuthority` and Authorizer constructor |
| Artifact / env | Env: `AWS_KMS_KEY_ID` (or equivalent HSM) — currently **UNSET**. Deployment field: `productionAuthority.*`. Contract: `LiquidityBuildingExecutionAuthorizerV1` not deployed |
| Exact fix | Provision non-exportable secp256k1 key; publish address + providerClass + nonExportable=true; forbid HOT_SIGNER; bind Authorizer `signingAuthority` |
| Effort | 1–3 days (infra) + 0.5 day bind/verify |
| Dependency | Cloud KMS/HSM access; security review |
| Owner | Infrastructure / signing service |

### P0-2 — LB-G11 KMS→Authorizer signature verification

| Field | Value |
|-------|--------|
| Exact failure | `signatureNormalization.productionKmsVerified === false` · gate “Signature normalization” FAIL |
| Responsible | **Runtime verification** against production authority + Authorizer (`kms-signature-normalization.ts` already implemented) |
| Exact fix | Sign non-executable Intent digest with production KMS; normalize DER→65-byte; `eth_call` Authorizer validate; set `productionKmsVerified=true` with evidence |
| Effort | 0.5–1 day after P0-1 |
| Dependency | P0-1 |
| Owner | Signing service + protocol eng |

### P0-3 — LB-G04B Canonical Treasury LB fee receiver

| Field | Value |
|-------|--------|
| Exact failure | `treasury.receiverAddress === null` · `receiverVerdict === PRODUCTION_BINDING_NOT_FOUND` |
| Responsible | **Treasury / D99 contracts** (repo `melega-kiri-treasury-runtime` / Treasury contracts) — **not** MelegaSwapV2 Vault |
| Rejected | Vault `0xb2d57B…`, EIP-7702 `0xb6436E…`, EOA `0xb5a870…` |
| Exact fix | Deploy `TreasuryLiquidityBuildingReceiverV1` (or equivalent non-EOA custody); publish address for FeeSink constructor |
| Effort | 2–5 days |
| Dependency | Treasury custody design approval |
| Owner | Treasury architecture |

### P0-4 — CONTRACTS_NOT_DEPLOYED (Authorizer + FeeSink + Factory)

| Field | Value |
|-------|--------|
| Exact failure | `contractsDeployed === false` because addresses null / not `0x[a-f0-9]{40}` nonzero |
| Responsible | **On-chain deployment** via Foundry broadcast **after** P0-1 and P0-3 inputs green; script `DryRunDeployLiquidityBuildingV1.s.sol` currently **rejects broadcast** |
| Exact fix | Fill inputs; run production deploy (not dry-run); verify bytecode; write addresses into `LiquidityBuildingV1.inputs.json`; set `deploymentReadinessState=DEPLOYED`; re-run `validate-lb-v1-inputs.mjs` → PASS |
| Effort | 0.5–1 day once P0-1/P0-3 ready |
| Dependency | P0-1, P0-3, deployer funding (Founder-approved) |
| Owner | Protocol eng + Founder for gas |

### P0-5 — LB-G03C Permissionless execution relay

| Field | Value |
|-------|--------|
| Exact failure | `relay.status === DISABLED` · matrix origin `NOT_IDENTIFIED_AS_GIT_REPO` · env `LB_RELAY_URL` **UNSET** |
| Responsible | **Execution infrastructure** (new/ops service — must not invent a fake repo) |
| Exact fix | Provision gas-funded relay that submits opaque signed calldata only; expose health READY; wire runtime adapter replacing `DisabledLiquidityBuildingRelay` |
| Effort | 3–7 days |
| Dependency | P0-1 (signed intents) |
| Owner | Execution infra / ops |

### P0-6 — LB-G04C / LB-G12 Treasury Runtime LB ingestion

| Field | Value |
|-------|--------|
| Exact failure | Health: `chain=none`, `compatibleWith` lacks LB; `runtimeIngestion.status=NOT_IMPLEMENTED`; `lbSettlementSupport=false` |
| Responsible | **Treasury Runtime codebase** `meleganza/melega-kiri-treasury-runtime` (handoff: `docs/handoffs/LB008_TREASURY_RUNTIME_LB_INGESTION.md`) + production deploy with `chainId=56` |
| Database | Runtime Supabase (health shows PostgREST CONNECTED) needs LB settlement schema/tables — not in MelegaSwapV2 |
| Exact fix | Implement `melega.treasury.liquidity-building-settlement.v1` ingestion + reconciliation to ACCOUNTED; production env chainId 56; health advertises LB capability |
| Effort | 3–7 days |
| Dependency | P0-3, P0-4 |
| Owner | Treasury Runtime eng |

### P0-7 — LB-G08 Founder-ratified quote policy

| Field | Value |
|-------|--------|
| Exact failure | `quotePolicies=[]` · WBNB `ratificationStatus=PROPOSED_FOR_FOUNDER_RATIFICATION` |
| Responsible | **Founder ratification record** + publish into `LiquidityBuildingV1.inputs.json#quotePolicies` |
| Exact fix | Founder ratifies WBNB floors from `quote-policy-calculation.v1.json`; set `ratificationStatus=RATIFIED` (never mark CALCULATED as RATIFIED); leave USDT/USDC NOT_ACTIVE (LB-G09 open is OK for WBNB-only) |
| Effort | <1 day once Founder decides |
| Dependency | Founder decision |
| Owner | Founder + protocol eng (artifact publish) |

### P0-8 — DEPLOYMENT_INPUTS_BLOCKED / validatorResult

| Field | Value |
|-------|--------|
| Exact failure | `validatorResult=DEPLOYMENT_INPUTS_BLOCKED` · `deploymentReadinessState=BLOCKED` · `validate-lb-v1-inputs.mjs` |
| Responsible | **Aggregate** of null authority, null contracts, empty quotePolicies, treasury unbound |
| Exact fix | Close P0-1…P0-7 fields then re-run validator until `VALID` / `DEPLOYMENT_INPUTS_VALID` |
| Effort | Mechanical after P0s |
| Dependency | P0-1…P0-7 |
| Owner | Protocol eng |

### P0-9 — activation-gate-final.v1.json still FAIL rows

| Field | Value |
|-------|--------|
| Exact failure | File still has `activationAuthorized:false` and gate statuses FAIL |
| Responsible | **Evidence update** only after real closure — not a code toggle |
| Exact fix | After P0s pass verification methods in matrix, rewrite gate rows to PASS with evidence pointers; set `activationAuthorized:true` |
| Effort | 0.5 day |
| Dependency | All P0 |
| Owner | Protocol eng |

---

## P1 — required for safe finalized operation (still blocks gate set)

### P1-1 — LB-G10 Finality evidence (15 confirmations)

| Field | Value |
|-------|--------|
| Exact failure | `finality.verdict=FINALITY_EVIDENCE_INSUFFICIENT` · indexer `REORG_SAFETY_BLOCKS=12` vs LB depth 15 · Treasury `chainId=null` |
| Responsible | **Indexer config** in MelegaSwapV2 + Treasury Runtime finality policy + ops evidence pack |
| Exact fix | Align indexer/Treasury to depth ≥15 **or** publish `FINALITY_15_CONFIRMED` ops report; do not silently reduce LB depth below 15 |
| Effort | 1–2 days |
| Dependency | Ops + indexer change + Treasury prod chain |
| Owner | Infra / indexer / Treasury ops |

### P1-2 — Workers / cron for epoch execution

| Field | Value |
|-------|--------|
| Exact failure | No Vercel cron for LB loop; relay DISABLED |
| Responsible | **Deployment/runtime** (Vercel cron or dedicated worker) + relay |
| Exact fix | After P0-5, schedule observe/decide/submit loop against production health READY |
| Effort | 1–2 days |
| Dependency | P0-5, P0-1 |
| Owner | Ops + protocol eng |

### P1-3 — Event Fabric LB subscription

| Field | Value |
|-------|--------|
| Exact failure | No LB import/wiring to civilization Event Fabric; LB uses injected observer path |
| Responsible | **Optional for V1 activate** if observer path certified; fabric is NOT_CONFIGURED for LB |
| Exact fix | Either document observer-only as accepted V1 path, or wire Fabric consumer for swap eligibility |
| Effort | 2–4 days if required |
| Dependency | Product decision |
| Owner | Protocol eng |

---

## P2 — non-blocking for WBNB-only activation

### P2-1 — LB-G09 USDT/USDC gas conversion

| Field | Value |
|-------|--------|
| Exact failure | Melega WBNB/stable pairs insufficient for pinned gas conversion |
| Exact fix | Keep NOT_ACTIVE (allowed) or provision reserves + pin path later |
| Effort | Markets-dependent |
| Dependency | Liquidity |
| Owner | Markets / Treasury |

### P2-2 — Program registry empty until first program

| Field | Value |
|-------|--------|
| Note | Factory registry is empty until first createProgram — OK after Factory deploy |
| Owner | Protocol eng |

---

## What this agent cannot do inside MelegaSwapV2 alone

1. Provision AWS/GCP KMS/HSM and publish a production authority address  
2. Deploy Treasury LB receiver in the Treasury custody boundary  
3. Invent / stand up a permissionless relay service  
4. Implement LB settlement ingestion inside Treasury Runtime (wrong repo)  
5. Founder-ratify quote floors  
6. Broadcast mainnet deploys without Founder-funded deployer and green gates (`DryRunDeploy…` explicitly blocks broadcast)  
7. Set `activationAuthorized=true` without violating `NO_MOCK_PRODUCTION_DEPENDENCY`

---

## Ordered activation checklist (human + infra)

1. Provision KMS → fill `productionAuthority` (P0-1)  
2. Verify KMS signatures vs Authorizer module (P0-2)  
3. Deploy Treasury LB receiver → publish address (P0-3)  
4. Founder ratify WBNB quote policy → fill `quotePolicies` (P0-7)  
5. Deploy Authorizer + FeeSink + Factory on chain 56 → bind addresses (P0-4)  
6. Provision relay + health URL (P0-5)  
7. Ship Treasury Runtime LB ingestion on chainId 56 (P0-6)  
8. Close finality evidence (P1-1)  
9. Run `validate-lb-v1-inputs.mjs` → VALID  
10. Update `activation-gate-final.v1.json` gates to PASS + `activationAuthorized:true`  
11. Deploy artifact to production; confirm API `activationAuthorized=true`  
12. Read-only READY validation only — no swaps / no LP mint  

**Estimated critical path:** ~2–3 weeks calendar with parallel Treasury + KMS + relay owners; not closable in a single DEX-repo coding session.
