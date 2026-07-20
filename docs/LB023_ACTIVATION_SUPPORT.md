# LB023 — Activation Support (Melega DEX side)

**Mission:** LB023  
**Assessed:** `2026-07-20T11:46:00Z`  
**Baseline:** LB022 `4351b49d` (`LB022_PRODUCTION_FREEZE_COMPLETE`)  
**Verdict target:** `LB023_ACTIVATION_SUPPORT_READY`

**Constraints:** No architecture reopen · no contract deploy · no mainnet execution · no manual activation.

Product remains frozen at [`docs/LB022_LIQUIDITY_BUILDING_FINAL_FREEZE.md`](LB022_LIQUIDITY_BUILDING_FINAL_FREEZE.md).

---

## Deterministic activation sequence

```text
External gates PASS
  → Deployment validator PASS
  → Contract addresses available (CREATE + verify)
  → Frontend binding update (LB_DEPLOYED_ADDRESSES via resolveProductionBinding)
  → Fork validation (real addresses only)
  → First controlled mainnet cycle
```

Do not reorder. Do not skip evidence. Do not invent PASS.

---

## 1. External gate consumption review

| Property | Status | Evidence |
| --- | --- | --- |
| Read-only | Confirmed | `activationGateConsumer.ts` loads artifacts; does not write gates |
| Fail-closed | Confirmed | Missing/FAIL rows → BLOCKED; never invents PASS |
| Deterministic | Confirmed | Pure `consumeActivationGates` + fixed required gate set |
| No manual override | Confirmed | API rejects `override` / `forceReady` / `activationAuthorized` query |
| No admin activation | Confirmed | `manualOverrideForbidden` always `true` in result |

Surfaces:

- `apps/web/src/lib/liquidity-building-runtime/activationGateConsumer.ts`
- `GET /api/liquidity-building/activation-status`
- Gate truth: `deployments/liquidity-building/chain-56/activation-gate-final.v1.json`

Current snapshot (pre-external PASS):

| Field | Value |
| --- | --- |
| `productStatus` | `PENDING_EXTERNAL_ACTIVATION` |
| `activationAuthorized` | `false` |
| `validatorResult` | `DEPLOYMENT_INPUTS_BLOCKED` |

Required gates still external: LB-G03B · G11 · G03C · G04B · G04C/G12 · G08 · G10.

---

## 2. Deployment binding procedure

After external gates PASS and production CREATE completes, Melega DEX operators perform **only** the following.

### Required inputs

| Input | Notes |
| --- | --- |
| Factory address | Chain 56, checksummed |
| Program implementation / CREATE2 | Verified; owner program may resolve later via Factory |
| Authorizer address | Bound to production authority |
| Fee Sink address | Bound to Treasury receiver |
| Treasury receiver | Non-EOA; published in deployment inputs |
| Quote policies | Ratified in inputs |
| Deployment hashes | CREATE tx hashes + bytecode evidence |

### Validation before binding

1. **Checksum** — EIP-55 / valid `0x` + 40 hex; reject zero address.  
2. **Bytecode** — on-chain code matches frozen compiler artifacts (solc 0.8.20 / opt 200 / viaIR).  
3. **Chain 56** — reject any other `chainId`.  
4. **Activation gate validation** — `activation-gate-final` shows required gates PASS; `activationAuthorized=true` only from gate evidence (never hand-edited).  
5. **Deployment validator** — `node deployments/liquidity-building/validate-lb-v1-inputs.mjs` → PASS (`VALID` / not `DEPLOYMENT_INPUTS_BLOCKED`).

### Update path

File: `apps/web/src/views/LiquidityStudio/liquidityBuilding/addresses.ts`

1. Build candidate:

```text
chainId: 56
deploymentReadinessState: VALID | DEPLOYED
activationAuthorized: true   // from gate artifact only
lbFactory / lbAuthorizer / lbFeeSink: verified addresses
programAddress: optional until Factory lookup
```

2. Call `resolveProductionBinding(candidate)`.  
3. On `{ ok: true }`, assign result to `LB_DEPLOYED_ADDRESSES`.  
4. On `{ ok: false }`, **stop** — do not patch addresses manually.

Reject reasons include: `WRONG_CHAIN`, `DEPLOYMENT_INPUTS_BLOCKED`, `ACTIVATION_NOT_AUTHORIZED`, `LB_*_MISSING`.

### After bind

- Confirm `GET /api/liquidity-building/activation-status` → `productStatus=READY` only if consumer conditions hold.  
- Confirm Liquidity Studio Activation Pending clears to available path without fake metrics.  
- Proceed to fork validation, then first cycle checklist.

---

## 3. Validator integration

| Step | Tool / artifact |
| --- | --- |
| Inputs | `deployments/liquidity-building/chain-56/LiquidityBuildingV1.inputs.json` |
| Validate | `deployments/liquidity-building/validate-lb-v1-inputs.mjs` |
| Gate matrix | `activation-gate-final.v1.json` |
| Consumer | `/api/liquidity-building/activation-status` |
| Binding | `resolveProductionBinding` |

`deploymentInputsValid` (consumer) requires: validator PASS + readiness VALID/DEPLOYED + real Factory/Authorizer/Sink + all required gates READY + `activationAuthorized=true`.

---

## Related

- First cycle: [`docs/LB023_FIRST_CYCLE_TECHNICAL_CHECKLIST.md`](LB023_FIRST_CYCLE_TECHNICAL_CHECKLIST.md)  
- Prior handoff: [`docs/LB022_ACTIVATION_HANDOFF.md`](LB022_ACTIVATION_HANDOFF.md)  
- Cycle evidence shape: [`docs/LB021_FIRST_CYCLE_EXECUTION_HANDOFF.md`](LB021_FIRST_CYCLE_EXECUTION_HANDOFF.md)

---

## LB023 validation evidence

| Suite | Result |
| --- | --- |
| Frontend LB016–018 + LB021 consumer | **36/36** |
| Forge LB003 / LB005 / LB006 / LB007 | **144/144** |
| `forge build` / `next build` | Pass |
| Product / architecture code changes | **None** |
| Mainnet execution / deploy | **None** |
