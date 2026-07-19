# LB013 — External Dependency Closure Matrix

**Verdict:** `LB013_DEPENDENCY_MATRIX_COMPLETE`
**Baseline:** `359966e96e64080df1e990e0bb4fe936b2846f71`
**Assessed:** `2026-07-19T18:14:00Z`
**Machine-readable:** `deployments/liquidity-building/chain-56/external-dependency-closure-matrix.v1.json`
**Activation authorized:** **false**
**Mainnet cycle:** **not executed** (forbidden in LB013)

Implementation path for LB005–LB007 and LB009 architecture is **frozen**. This mission converts blockers into executable external closure actions.

---

## 1. Executive Status

Liquidity Building V1 is complete up to the production activation boundary and correctly fail-closed (`activationAuthorized = false`).

Remaining work is **not** another generic implementation cycle. It is external provisioning, ratification, and verification with named owners and repositories.

| Category | Count |
| --- | --- |
| OPEN blockers with matrix rows | 9 (G03B, G03C, G04B, G04C, G08, G09, G10, G11, G12) |
| Implementation gaps confused as infra | Separated — G11 code ready; needs prod verification |
| Unknown repository names invented | **None** (relay repo explicitly `NOT_IDENTIFIED_AS_GIT_REPO`) |

---

## 2. Activation Blockers

| Blocker | Dependency | Required artifact | Repository | Owner | Status | Verification |
| --- | --- | --- | --- | --- | --- | --- |
| LB-G03B | Non-exportable KMS/HSM secp256k1 authority | Public address + non-exportability + service policy | KMS account + MelegaSwapV2 Authorizer inputs; kerl-signing-gate adapter | Infra / signing | OPEN | Inputs `AUTONOMOUS_AUTHORITY_PRODUCTION_READY`; Authorizer address match |
| LB-G11 | Prod KMS DER→65-byte → Authorizer | Signature validation report (non-executable Intent) | MelegaSwapV2 + KMS signer | Signing + protocol | OPEN | `signatureNormalization.status=VERIFIED` |
| LB-G03C | Permissionless relay | Relay health + capability matrix | **NOT_IDENTIFIED_AS_GIT_REPO** (do not invent) | Execution infra / ops | OPEN | Dual-relayer identical economics; tamper fails |
| LB-G04B | Canonical Treasury LB receiver | Address + bytecode + role + custody | Treasury Runtime / D99 contracts (not DEX app) | Treasury architecture | OPEN | `PRODUCTION_BINDING_IDENTIFIED`; Sink binds receiver |
| LB-G04C | Runtime LB fee ingestion | Schema + JSON API + tests | `meleganza/melega-kiri-treasury-runtime` | Treasury Runtime eng | OPEN | `runtimeIngestion.status=OPERATIONAL` on chain 56 |
| LB-G12 | Reconciliation → ACCOUNTED | Three IDs + idempotency key | same Treasury Runtime | Treasury Runtime eng | OPEN | Finalized settlement → ACCOUNTED; duplicate reject |
| LB-G08 | Ratified quote floors | `quotePolicies[]` RATIFIED/DEPLOYED | MelegaSwapV2 + Founder record | Founder + protocol | OPEN | Validator PASS on floors; no CALCULATED-as-RATIFIED |
| LB-G09 | Stable gas path or NotActive | Pinned source bounds **or** explicit NOT_ACTIVE | MelegaSwapV2 policy + markets | Markets / Treasury | OPEN | Per-asset Active only with on-chain path |
| LB-G10 | Finality evidence for depth 15 | Ops evidence pack | Indexer + Treasury + ops | Infra / ops | OPEN | `FINALITY_15_CONFIRMED` or increase proposal |

Derived (not separate IDs but still FAIL until deps close): Authorizer/Sink/Factory deploy, deployment validator PASS, BscScan verification, runtime health READY.

---

## 3. KMS Closure

**Goals:** close LB-G03B + LB-G11 → `AUTONOMOUS_AUTHORITY_PRODUCTION_READY` + normalization `VERIFIED`.

**Path:** ExecutionIntent digest → KMS DIGEST sign → DER → r/s → low-s → recovery ID → 65-byte → `LiquidityBuildingExecutionAuthorizerV1.validateExecutionIntent`.

**Already in MelegaSwapV2:** `kms-signature-normalization.ts` (unit-tested). **Not evidence:** test-only keys.

**Reject:** HOT_SIGNER, local wallet, operator wallet, imported private key.

**Actions:**

1. Provision KMS/HSM (infra).
2. Publish Ethereum address into deployment inputs.
3. Produce non-executable production signature validation report.
4. Deploy Authorizer with that authority (after inputs VALID).

---

## 4. Relay Closure

**Goal:** LB-G03C → `RELAY_READY`.

**Must:** submit, monitor, retry, replace, dedupe, health.
**Must not:** sign, modify intent, calculate economics, choose recipients/fees.

**Proof:** different relayers, same signed intent → identical economic result.

**Note:** No verified git origin for a relay service was found under Projects/. Owner must provision service and **then** record exact origin before code lands. MelegaSwapV2 currently exposes `DisabledLiquidityBuildingRelay` only.

---

## 5. Treasury Closure

**Goal:** LB-G04B → `PRODUCTION_BINDING_IDENTIFIED`.

**Reject (evidence retained):** Vault `0xb2d57B…`, EIP-7702 `0xb6436E…`, EOA `0xb5a870…`.

**Owner:** Treasury / D99 — implement receiver **outside** MelegaSwapV2 DEX authority. Then bind immutable Sink constructor input.

---

## 6. Runtime Closure

**Goals:** LB-G04C + LB-G12.

**Repository:** `https://github.com/meleganza/melega-kiri-treasury-runtime.git` (verified).

**Current live:** development / chain none / smartdrop.v1 — not LB-ready.

**Required:** Fee Sink + receiver + Program events → validate → RECONCILED → ACCOUNTED; idempotency `chainId+sink+settlementKey+txHash+logIndex`.

Do **not** duplicate Treasury logic into MelegaSwapV2.

---

## 7. Quote Policy Closure

**Goal:** LB-G08.

WBNB floors exist as **PROPOSED_FOR_RATIFICATION** in `quote-policy-calculation.v1.json`. Production `quotePolicies` array is empty until Founder ratifies.

States: CALCULATED → PROPOSED_FOR_RATIFICATION → RATIFIED → DEPLOYED. Never skip ratification.

---

## 8. Gas Path Closure

| Asset | Path | Closure |
| --- | --- | --- |
| WBNB | NativeEquivalent | Ready after LB-G08 ratification + other gates |
| USDT | NotActive | LB-G09 — pin Melega/on-chain source or remain inactive |
| USDC | NotActive | same |

WBNB-only activation is allowed architecturally once its gates pass; stables need not block WBNB.

---

## 9. Finality Closure

**Goal:** LB-G10. Depth **15** retained.

Indexer `REORG_SAFETY_BLOCKS=12` ≠ certification. Need ops pack → `FINALITY_15_CONFIRMED` or increase proposal. Do not silently reduce.

---

## 10. Activation Gate Status

`activation-gate-final.v1.json` remains **`activationAuthorized: false`**.

Gates PASS today: canonical Melega Factory, Router, stale router closure.
All other blocking gates FAIL pending matrix actions above.

LB013 does **not** set `activationAuthorized=true`.

---

## 11. Remaining Actions

Ordered for LB014 eligibility:

1. **LB-G03B** provision KMS authority address
2. **LB-G11** production signature → Authorizer verify
3. **LB-G04B** canonical Treasury receiver
4. **LB-G04C/G12** Treasury Runtime LB ingestion + ACCOUNTED
5. **LB-G08** Founder ratify WBNB (minimum)
6. **LB-G10** finality certification
7. **LB-G03C** relay READY
8. Populate deployment inputs → validator **DEPLOYMENT_INPUTS_VALID**
9. Autonomous deploy + BscScan verify (not LB013)
10. Runtime health **READY**
11. Re-run activation-gate-final → all PASS
12. **LB014** first controlled mainnet cycle only

**LB-G09:** optional for WBNB-only; required before USDT/USDC activation.

### Security (LB013)

NO HUMAN SIGNER · NO PRIVATE KEY FALLBACK · NO FUNDED EXECUTION WALLET · NO EOA TREASURY RECEIVER · NO MANUAL FEE SETTLEMENT · NO MOCK PRODUCTION DEPENDENCY · NO TEST AUTHORITY FOR ACTIVATION · NO TEST TREASURY FOR ACTIVATION · NO CENTRALIZED PRICE API · NO UNVERIFIED GAS PATH
