# LB019 — First Cycle Readiness Checklist

**Mission:** LB019  
**Purpose:** Controlled mainnet cycle checklist for Liquidity Building on Melega DEX.  
**Status:** Checklist only — **NO EXECUTION** in LB019.

Use after external activation gates close and production CREATE is complete.

---

## Before activation

- [ ] LiquidityBuildingFactoryV1 deployed on chain **56**
- [ ] LiquidityBuildingExecutionAuthorizerV1 deployed and bound
- [ ] LiquidityBuildingTreasuryFeeSinkV1 deployed with verified Treasury receiver
- [ ] Program implementation / CREATE2 path verified
- [ ] Addresses recorded and BscScan-verified
- [ ] `validate-lb-v1-inputs.mjs` → **PASS** (`VALID` / `DEPLOYED`)
- [ ] `activationAuthorized=true` only after gate evidence (no manual override)
- [ ] Runtime health **READY**
- [ ] Quote policy **active / ratified** (LB-G08 closed)
- [ ] Production signer **READY** (non-exportable; LB-G03B / LB-G11 closed)
- [ ] Treasury receiver + ingestion **READY** (LB-G04B / LB-G04C / LB-G12 closed)
- [ ] Finality evidence sufficient (LB-G10 closed)
- [ ] Frontend `LB_DEPLOYED_ADDRESSES` updated **only** via `resolveProductionBinding` with verified addresses
- [ ] Liquidity Studio shows Ready / Active path without Unavailable for bound Program

---

## During cycle

Do **not** run until Before activation is complete.

- [ ] Observation produced (eligible demand / market facts)
- [ ] Decision emitted (skip or execute within strategy bounds)
- [ ] Intent formed (schema + signatures valid)
- [ ] Execution authorized
- [ ] Swap via Melega Router (canonical)
- [ ] Success fee settled to Fee Sink → Treasury receiver
- [ ] Add liquidity (LP minted)
- [ ] LP ownership = project owner (not Protocol)
- [ ] On-chain accounting / event emission consistent with runtime evidence

---

## After cycle

- [ ] Evidence publication (observation / decision / execution artifacts)
- [ ] Reconciliation (amounts, fee, LP) without invented metrics
- [ ] Dashboard / Program read model updated from chain (real values only)
- [ ] No residual mock / placeholder addresses in binding
- [ ] Post-cycle security: no private-key fallback used; no activation override

---

## Explicit non-goals for this checklist

- No economic simulation disguised as production
- No fork dry-run substituted for first mainnet cycle evidence
- No Civilization / BC003S / Genesis Gas / Treasury architecture work inside Melega DEX repo

---

## Stop conditions

Abort cycle if any of:

- validator reverts to BLOCKED;
- signer / Treasury / quote policy regresses;
- frontend binding would require placeholders;
- fee path cannot prove sink → receiver settlement.
