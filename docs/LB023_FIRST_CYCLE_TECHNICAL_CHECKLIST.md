# LB023 — First Cycle Technical Checklist

**Mission:** LB023  
**Purpose:** Melega DEX–side technical checklist for the first controlled Liquidity Building mainnet cycle.  
**Status:** Checklist only — **NO EXECUTION** · **NO DEPLOYMENT** in LB023.

Use after [`docs/LB023_ACTIVATION_SUPPORT.md`](LB023_ACTIVATION_SUPPORT.md) binding procedure completes.

---

## Before

- [ ] External gates PASS (LB-G03B · G11 · G03C · G04B · G04C/G12 · G08 · G10)
- [ ] `activationAuthorized=true` in gate artifact (no manual edit)
- [ ] Deployment validator **PASS** (`validate-lb-v1-inputs.mjs`)
- [ ] Runtime health **READY**
- [ ] Contracts deployed on chain **56** and explorer-verified
- [ ] Factory · Authorizer · Fee Sink · Program implementation addresses recorded
- [ ] Fee Sink → Treasury receiver binding proven
- [ ] `LB_DEPLOYED_ADDRESSES` updated **only** via `resolveProductionBinding`
- [ ] `/api/liquidity-building/activation-status` → `productStatus=READY`
- [ ] Liquidity Studio shows available path (no fake metrics)
- [ ] Fork validation complete with **real** production addresses

---

## During

Do **not** start until Before is complete. Single controlled cycle only.

- [ ] **Observation** — eligible demand / market facts produced
- [ ] **Decision** — skip or execute within strategy bounds
- [ ] **Intent** — schema-valid execution intent
- [ ] **Signature** — production authority (non-exportable) signs Intent
- [ ] **Execution** — authorized on-chain path
- [ ] **Swap** — Melega Router swap receipt
- [ ] **Fee** — success fee → Fee Sink → Treasury receiver
- [ ] **LP** — add liquidity; LP owned by project owner

---

## After

- [ ] **Accounting** — Program events reconcile with runtime evidence
- [ ] **Dashboard update** — read model shows real values only
- [ ] **Evidence package** — observation · decision · intent · signature · tx · swap · fee · LP · accounting published
- [ ] Confirm no private-key fallback / no activation override used
- [ ] Confirm consumer still reports READY (no gate regression)

---

## Stop conditions

Abort without further execution if:

- any required gate regresses to BLOCKED;
- validator returns BLOCKED;
- binding would need placeholders;
- fee path cannot prove Sink → receiver;
- consumer leaves READY without addresses.

---

## Explicit non-goals

- No UX / contract / runtime architecture changes
- No Civilization / BC003S / KMS / Treasury Runtime implementation in MelegaSwapV2
- No simulated liquidity as production evidence
