# LB021 — First Cycle Execution Handoff

**Mission:** LB021  
**Purpose:** Prepare the handoff package for the first controlled mainnet Liquidity Building cycle.  
**Status:** Handoff only — **NO EXECUTION** · **NO DEPLOYMENT** · **NO TRANSACTIONS** in LB021.

Prerequisite: LB021 activation gate consumer reports `productStatus=READY` and LB020 activation checklist steps 1–7 complete.

---

## Required inputs

| Input | Description | Source |
| --- | --- | --- |
| Program address | Deployed `LiquidityBuildingProgramV1` for the owner | Factory create / binding |
| Token | Project token under program | Owner setup / on-chain |
| Pair | Melega V2 pair for token + quote | Factory getPair / live detection |
| Quote asset | Ratified quote (e.g. WBNB) | Quote policy (LB-G08) |
| Budget | Token amount deposited / committed | Program accounting |
| Strategy | `FULL_AI` or `DYNAMIC_RANGE` (+ bps bounds) | Owner setup |
| Frequency | Decision epoch (300 / 900 / 1800 / 3600 s) | Owner setup |

Also required before cycle start:

- Production signer READY (LB-G03B)
- Signature path READY (LB-G11)
- Relay live (LB-G03C)
- Treasury receiver + Fee Sink bound (LB-G04B)
- Treasury Runtime OPERATIONAL (LB-G04C/G12)
- Finality certified (LB-G10)
- Frontend binding via `resolveProductionBinding` only

---

## Required evidence (publish after cycle)

| Evidence | Description |
| --- | --- |
| Observation | Eligible demand / market facts artifact |
| Decision | Skip or execute within strategy bounds |
| Intent | Schema-valid execution intent |
| Signature | Production authority signature (non-exportable) |
| Transaction | On-chain execution tx hash |
| Swap | Melega Router swap receipt |
| Fee | Success fee → Fee Sink → Treasury receiver |
| LP | Add-liquidity mint; LP owned by project owner |
| Accounting | Program accounting / events reconcile with runtime |

Do not invent metrics. Do not publish simulated liquidity as production evidence.

---

## Operator sequence (after gates READY)

1. Confirm `/api/liquidity-building/activation-status` → `productStatus=READY`
2. Confirm validator PASS and addresses verified
3. Confirm Liquidity Studio shows available (not Activation Pending)
4. Execute **one** controlled cycle per LB019 / LB020 checklists
5. Publish evidence table above
6. Reconcile dashboard read model against chain

---

## Stop conditions

Abort without execution if:

- consumer regresses from READY;
- any required gate returns BLOCKED;
- binding would require placeholders;
- fee path cannot prove sink → receiver;
- private-key or manual activation path appears.

---

## Explicit non-goals

- No Civilization / BC003S / Genesis Gas / KMS implementation in MelegaSwapV2
- No contract redesign
- No UX redesign beyond status consumption
- No mainnet transaction as part of LB021
