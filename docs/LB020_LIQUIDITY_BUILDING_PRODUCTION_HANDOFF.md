# LB020 — Liquidity Building Production Handoff

**Mission:** LB020  
**Assessed:** `2026-07-20T11:15:00Z`  
**Baseline:** LB019 `d757bedf` (`LB019_MELEGA_DEX_READY_PENDING_EXTERNAL_ACTIVATION`)  
**Verdict:** `LB020_PRODUCTION_HANDOFF_COMPLETE`

**Scope boundary (permanent):** Melega DEX → Liquidity Studio → Liquidity Building V1 only.  
**Out of scope (do not implement in MelegaSwapV2):** Civilization / BC003S / Genesis Gas / Treasury Runtime / KMS providers / external deployment orchestration.

This package freezes the Melega DEX implementation boundary and tells external activation teams exactly what to connect. It does **not** reopen architecture, contracts, UX, or runtime design.

---

## Product Status

### Liquidity Building V1: READY IN MELEGA DEX

| Area | Status |
| --- | --- |
| Architecture | Complete and frozen |
| Smart contracts (source) | Complete — **NOT_DEPLOYED** until external gates close |
| Execution engine | Complete (LB007) |
| Runtime decision layer | Complete (LB009+) |
| UX | Frozen (LB016) |
| Live data / Program read model | Complete, fail-closed (LB017) |
| Deployment binding | Fail-closed, all null until verified CREATE (LB018) |
| Production validation | Passed Melega DEX-side (LB019) |
| Activation | `activationAuthorized: false` — correct |

External systems remain the only blockers to the first controlled mainnet cycle.

Authoritative inventory: [`docs/LB019_FINAL_PRODUCT_READINESS.md`](LB019_FINAL_PRODUCT_READINESS.md)  
First-cycle checklist (no execution): [`docs/LB019_FIRST_CYCLE_READINESS_CHECKLIST.md`](LB019_FIRST_CYCLE_READINESS_CHECKLIST.md)  
Activation sequence: [`docs/LB020_ACTIVATION_CHECKLIST.md`](LB020_ACTIVATION_CHECKLIST.md)

---

## Architecture Summary

| Layer | What it is | Freeze evidence |
| --- | --- | --- |
| **Factory** | `LiquidityBuildingFactoryV1` — program CREATE / binding | `contracts/liquidity-building/LiquidityBuildingFactoryV1.sol` |
| **Program** | `LiquidityBuildingProgramV1` — deposit, activate, execute accounting | `contracts/liquidity-building/LiquidityBuildingProgramV1.sol` |
| **Authorizer** | `LiquidityBuildingExecutionAuthorizerV1` — intent signature gate | `contracts/liquidity-building/...AuthorizerV1.sol` |
| **Fee Sink** | `LiquidityBuildingTreasuryFeeSinkV1` — success fee → Treasury receiver | Fee sink contract + LB006 boundaries |
| **Execution Engine** | Atomic swap → fee → addLiquidity path | LB007 forge suite |
| **Runtime** | Observation → Decision → Intent → Execution → Receipt | `deployments/liquidity-building/schemas/*.schema.json` |
| **UX** | Liquidity Studio Liquidity Building panel | LB016 `uxCopy.ts` + panel |
| **Read Model** | On-chain Program view → metrics / activity | LB017 live wiring |

Canonical Melega DEX (chain **56**):

| Component | Address |
| --- | --- |
| Melega Factory | `0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C` |
| Melega Router | `0xc25033218D181b27D4a2944Fbb04FC055da4EAB3` |
| MasterChef | `0x41D5487836452d23f2c467070244E5842B412794` |

LB contract addresses remain **null** until production CREATE after gates PASS.

---

## External Activation Requirements

| Requirement | Owner | Required Evidence |
| --- | --- | --- |
| **Signer / production authority** (LB-G03B) | Infra / KERL signing (external) | Non-exportable KMS/HSM secp256k1 identity; Ethereum address published; `productionAuthority.verdict=PRODUCTION_READY`; `nonExportable=true` |
| **Signature verification** (LB-G11) | Same + Authorizer on chain 56 | Production DER signature over Intent → Authorizer `validateExecutionIntent` PASS |
| **Treasury receiver** (LB-G04B) | Treasury architecture (external) | Non-EOA LB fee receiver on chain 56 under Treasury/D99 custody; published into deployment inputs |
| **Treasury Runtime** (LB-G04C / LB-G12) | `melega-kiri-treasury-runtime` (external repo) | `melega.treasury.liquidity-building-settlement.v1` OPERATIONAL for chainId 56 |
| **Relay** (LB-G03C) | Execution infra (external) | Permissionless gas-funded submit-only relay identified and live (no sign / no economics) |
| **Quote policy** (LB-G08) | Founder economic policy | Founder-ratified quote policies in deployment inputs (non-empty, RATIFIED) |
| **Finality** (LB-G10) | Infra / indexer / Treasury | Finality certification ≥ configured depth (15) for observer + ingestion |
| **Deployment** | Melega ops after gates close | `validate-lb-v1-inputs.mjs` → PASS; autonomous CREATE; BscScan verify; bind via `resolveProductionBinding` only |

Companion matrices:

- `deployments/liquidity-building/chain-56/activation-gate-final.v1.json`
- `deployments/liquidity-building/chain-56/production-dependency-closure.v1.json`
- `docs/handoffs/LB012_EXTERNAL_DEPENDENCIES.md`

---

## Frozen Production Interfaces

### Smart Contracts

| Interface / contract | Role | Status |
| --- | --- | --- |
| `LiquidityBuildingFactoryV1` | Program factory | Frozen source — NOT_DEPLOYED |
| `LiquidityBuildingProgramV1` | Program lifecycle + execution | Frozen source — NOT_DEPLOYED |
| `LiquidityBuildingExecutionAuthorizerV1` | Intent authorization | Frozen source — NOT_DEPLOYED |
| `LiquidityBuildingTreasuryFeeSinkV1` | Fee settlement to Treasury | Frozen source — NOT_DEPLOYED |
| Interfaces under `contracts/liquidity-building/interfaces/` | ABI boundary | Frozen |

Compiler freeze: solc `0.8.20`, optimizer `200`, `viaIR=true` (`foundry.toml` ↔ `LiquidityBuildingV1.inputs.json`).  
**NO CONTRACT REWORK** required for activation.

### Runtime

| Artifact | Schema / role |
| --- | --- |
| Observation | `deployments/liquidity-building/schemas/observation.v1.schema.json` |
| Decision | `deployments/liquidity-building/schemas/decision.v1.schema.json` |
| Intent | `LIQUIDITY_BUILDING_EXECUTION_INTENT_V1` (Authorizer) |
| Execution | `deployments/liquidity-building/schemas/execution.v1.schema.json` |
| Receipt / reconciliation | `reconciliation.v1.schema.json` + on-chain events |

No new runtime shapes in LB020. No simulation substituted for production evidence.

### Frontend

| Surface | Frozen behavior |
| --- | --- |
| Setup | Token · budget · strategy · decision frequency — draft only until activation |
| Dashboard (Active) | Real metrics only; Unavailable / None yet when unbound |
| Activity | Real executions / skips only — translated reasons, no infra dump |
| Activation states | **Liquidity Building Ready** · **Activation Pending** — prepared, waiting |

Binding helper: `apps/web/src/views/LiquidityStudio/liquidityBuilding/addresses.ts`  
- `LB_DEPLOYED_ADDRESSES` all null  
- `resolveProductionBinding` reject unless chain 56 + VALID/DEPLOYED + `activationAuthorized` + real Factory/Authorizer/Sink  

**No interface redesign** in LB020.

---

## Security Confirmations (handoff)

| Rule | Status |
| --- | --- |
| NO HUMAN EXECUTION WALLET | Confirmed — rejected models include HOT_SIGNER |
| NO PRIVATE KEY FALLBACK | Confirmed — local key / `vm.sign` rejected by validator |
| NO MOCK PRODUCTION ADDRESS | Confirmed — bindings null; placeholders forbidden |
| NO ACTIVATION OVERRIDE | Confirmed — `manualOverrideForbidden` |
| NO FAKE METRICS | Confirmed — Unavailable / None yet |
| NO SIMULATED LIQUIDITY | Confirmed — no production cycle run |
| NO TREASURY BYPASS | Confirmed — fee sink / receiver null until published |
| NO CONTRACT REWORK | Confirmed — LB020 docs/handoff only |

---

## Technical Debt Review (LB020)

| Check | Result |
| --- | --- |
| TODOs in Liquidity Building UI path | None actionable |
| Placeholders as production addresses | None — fail-closed |
| Dead / “Coming soon” CTAs | None (covered by LB016 UI tests) |
| Mock / fake metrics in product path | None |
| Unused activation override paths | None found |
| Dead UI / misleading placeholders removed | N/A — none present |

Architecture untouched.

---

## What external teams do next

1. Close external gates in the matrix above (evidence into deployment inputs / gate JSON).  
2. Follow [`LB020_ACTIVATION_CHECKLIST.md`](LB020_ACTIVATION_CHECKLIST.md) in order.  
3. Do **not** open Melega DEX architecture, UX, or contract economic/security logic.  
4. After CREATE + verify, update frontend binding **only** through `resolveProductionBinding`.  
5. Run first controlled mainnet cycle per LB019 first-cycle checklist.

---

## Machine evidence index

| Artifact | Role |
| --- | --- |
| `docs/LB019_FINAL_PRODUCT_READINESS.md` | Melega DEX readiness freeze |
| `docs/LB019_FIRST_CYCLE_READINESS_CHECKLIST.md` | Before / during / after cycle |
| `docs/LB018_CONTRACT_DEPLOYMENT_BINDING.md` | Binding rules |
| `docs/LB020_ACTIVATION_CHECKLIST.md` | Ordered activation steps |
| `deployments/liquidity-building/chain-56/LiquidityBuildingV1.inputs.json` | Deployment inputs (BLOCKED) |
| `deployments/liquidity-building/validate-lb-v1-inputs.mjs` | Validator |
| `deployments/liquidity-building/chain-56/activation-gate-final.v1.json` | Gate truth |
| `deployments/liquidity-building/chain-56/lb018-deployment-binding.v1.json` | LB018 machine verdict |

---

## LB020 validation evidence

| Suite | Result |
| --- | --- |
| Frontend LB016 / LB017 / LB018 (+ UI) | **29/29** (LB019 had no separate suite — same freeze coverage) |
| Forge LB003 / LB005 / LB006 / LB007 | **144/144** |
| `forge build` | Pass |
| `next build` | Pass |
| Validator | `DEPLOYMENT_INPUTS_BLOCKED` (expected — external gates) |
| Architecture / contracts / UX code changes in LB020 | **None** |
