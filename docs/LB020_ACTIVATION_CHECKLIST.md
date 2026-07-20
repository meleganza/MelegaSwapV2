# LB020 — Activation Checklist

**Mission:** LB020  
**Purpose:** Ordered production activation sequence for Liquidity Building on Melega DEX (chain 56).  
**Status:** Checklist only — **NO EXECUTION** inside LB020.  
**Prerequisite:** Melega DEX side frozen at LB019 / LB020 handoff (`READY IN MELEGA DEX`).

Do not reorder. Do not skip evidence. Do not use placeholders or activation overrides.

---

## Required sequence

### 1. External dependencies PASS

Close and attach evidence for:

- [ ] LB-G03B — production KMS/HSM authority READY (`nonExportable=true`, address published)
- [ ] LB-G11 — production Intent signature verifies in Authorizer path
- [ ] LB-G03C — permissionless submit-only relay identified and live
- [ ] LB-G04B — Treasury LB fee receiver published (non-EOA, chain 56)
- [ ] LB-G04C / LB-G12 — Treasury Runtime settlement ingestion OPERATIONAL (external repo)
- [ ] LB-G08 — quote policies founder-ratified and present in inputs
- [ ] LB-G10 — finality certification sufficient (≥ depth 15)

Reference: `docs/handoffs/LB012_EXTERNAL_DEPENDENCIES.md`  
Gate file: `deployments/liquidity-building/chain-56/activation-gate-final.v1.json`

**Stop if any blocker remains OPEN.**

---

### 2. Deployment validator PASS

- [ ] Update `deployments/liquidity-building/chain-56/LiquidityBuildingV1.inputs.json` with real authority / Treasury / quote / readiness fields only (no mocks)
- [ ] Run `node deployments/liquidity-building/validate-lb-v1-inputs.mjs`
- [ ] Result must be **PASS** (`VALID` / readiness allowing deploy — not `DEPLOYMENT_INPUTS_BLOCKED`)
- [ ] Confirm `activationAuthorized` may become `true` **only** from gate evidence (no manual override)

**Stop if validator BLOCKED.**

---

### 3. Contracts deployed

- [ ] Autonomous production CREATE on chain **56** (Factory, Authorizer, Fee Sink, Program implementation / CREATE2 path per frozen deploy script)
- [ ] No human execution wallet as production signer
- [ ] No private-key fallback in deploy path
- [ ] Record tx hashes and CREATE addresses

Dry-run scripts may be used for rehearsal; **broadcast only after step 2 PASS.**

---

### 4. Addresses verified

- [ ] BscScan (or equivalent) source verification for Factory / Authorizer / Fee Sink / Program
- [ ] Bytecode / constructor args match frozen compiler settings (`0.8.20`, optimizer 200, viaIR)
- [ ] Fee Sink receiver matches published Treasury receiver (LB-G04B)
- [ ] Authorizer authority matches published production authority (LB-G03B)

---

### 5. Frontend binding updated

- [ ] Populate binding **only** via `resolveProductionBinding` in  
  `apps/web/src/views/LiquidityStudio/liquidityBuilding/addresses.ts`
- [ ] Inputs: `chainId=56`, `deploymentReadinessState` VALID/DEPLOYED, `activationAuthorized=true`, real Factory / Authorizer / Fee Sink
- [ ] Reject any temporary / test / zero / placeholder address
- [ ] Confirm Liquidity Studio shows Activation path → Ready without fake metrics

---

### 6. Runtime health READY

- [ ] Observation / decision / intent pipeline healthy
- [ ] Runtime health endpoint / operator check reports **READY**
- [ ] Quote policy active per ratified inputs
- [ ] Treasury Runtime ingestion reachable (external) for settlement events
- [ ] Relay can submit (not sign) when needed

---

### 7. Fork validation

- [ ] Mainnet-fork smoke with **real** production addresses (not mocks)
- [ ] Path: Factory → Program create → deposit → activate → execute → swap → fee → addLiquidity → LP owner → read model
- [ ] Abort if any step requires fake authority, fake receiver, or simulated fee settlement

Reference fork intent: `docs/LB018_CONTRACT_DEPLOYMENT_BINDING.md` (Fork Validation)

---

### 8. First controlled mainnet cycle

- [ ] Follow `docs/LB019_FIRST_CYCLE_READINESS_CHECKLIST.md` Before / During / After
- [ ] Single controlled cycle only
- [ ] Publish observation / decision / execution evidence
- [ ] Reconcile amounts, fee, LP ownership
- [ ] Dashboard shows real values only

**Stop conditions:** validator regresses; signer/Treasury/quote/finality regress; binding would need placeholders; fee path cannot prove sink → receiver.

---

## Explicit non-goals

- No Civilization / BC003S / Genesis Gas / KMS implementation inside MelegaSwapV2
- No contract economic/security redesign
- No UX redesign
- No activation override
- No simulated liquidity presented as production

---

## Handoff pointer

Full product + interface freeze: [`docs/LB020_LIQUIDITY_BUILDING_PRODUCTION_HANDOFF.md`](LB020_LIQUIDITY_BUILDING_PRODUCTION_HANDOFF.md)
