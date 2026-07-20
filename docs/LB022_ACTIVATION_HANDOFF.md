# LB022 — Activation Handoff

**Mission:** LB022  
**Purpose:** Final package for external activation teams to connect production Liquidity Building on Melega DEX (chain 56).  
**Status:** Handoff only — **NO DEPLOYMENT** · **NO TRANSACTIONS** · **NO EXECUTION** in LB022.

Melega DEX side is frozen at [`docs/LB022_LIQUIDITY_BUILDING_FINAL_FREEZE.md`](LB022_LIQUIDITY_BUILDING_FINAL_FREEZE.md).  
Do not reopen architecture, contracts, UX, or runtime decision logic.

---

## Required external inputs

| Input | Required evidence |
| --- | --- |
| **Deployed contract addresses** | Factory · Program implementation / CREATE2 · Authorizer · Fee Sink on chain 56 |
| **Authorizer address** | Bound to production authority; BscScan-verified |
| **Treasury receiver** | Non-EOA LB fee receiver (LB-G04B) published into deployment inputs |
| **Sink binding** | Fee Sink → receiver immutable binding proven |
| **Quote policies** | Founder-ratified non-empty policies (LB-G08) |
| **Relay status** | Permissionless submit-only relay live (LB-G03C) |
| **Runtime readiness** | Treasury Runtime settlement OPERATIONAL (LB-G04C/G12); LB runtime health READY |
| **Finality evidence** | Certification ≥ configured depth 15 (LB-G10) |
| **Production signer** | Non-exportable KMS/HSM READY (LB-G03B); Intent verify PASS (LB-G11) |

Frontend bind **only** via:

`apps/web/src/views/LiquidityStudio/liquidityBuilding/addresses.ts` → `resolveProductionBinding`

Never placeholders · never manual `activationAuthorized=true`.

Consumer surface:

`GET /api/liquidity-building/activation-status` → expect `productStatus=READY` only after gates + addresses + validator PASS.

---

## Required validation order

1. **External gates PASS** — LB-G03B · G11 · G03C · G04B · G04C/G12 · G08 · G10 (evidence in gate / inputs artifacts).  
2. **Deployment validator PASS** — `node deployments/liquidity-building/validate-lb-v1-inputs.mjs` → not `DEPLOYMENT_INPUTS_BLOCKED`.  
3. **Contract deployment** — autonomous CREATE on chain 56 (no human execution wallet / no private-key fallback).  
4. **Address binding** — verify on explorer → `resolveProductionBinding` → update `LB_DEPLOYED_ADDRESSES` only with real addresses.  
5. **Fork validation** — mainnet-fork path with **real** production addresses (no mock authority/receiver).  
6. **First controlled mainnet cycle** — follow [`docs/LB021_FIRST_CYCLE_EXECUTION_HANDOFF.md`](LB021_FIRST_CYCLE_EXECUTION_HANDOFF.md) and [`docs/LB019_FIRST_CYCLE_READINESS_CHECKLIST.md`](LB019_FIRST_CYCLE_READINESS_CHECKLIST.md).

Also: [`docs/LB020_ACTIVATION_CHECKLIST.md`](LB020_ACTIVATION_CHECKLIST.md).

---

## Stop conditions

Do not proceed if:

- any required gate remains BLOCKED;
- validator reverts to BLOCKED;
- binding would require placeholders;
- private-key or manual activation path appears;
- fee path cannot prove Sink → Treasury receiver;
- gate consumer would report READY without addresses.

---

## Explicit non-goals

- No Civilization / BC003S / Genesis Gas / KMS / Treasury Runtime code inside MelegaSwapV2
- No contract economic/security redesign
- No UX redesign
- No mainnet transaction as part of LB022

---

## Current snapshot (pre-activation)

| Field | Value |
| --- | --- |
| `activationAuthorized` | `false` |
| Validator | `DEPLOYMENT_INPUTS_BLOCKED` |
| LB addresses | all `null` |
| Mainnet cycle | not authorized · not executed |
