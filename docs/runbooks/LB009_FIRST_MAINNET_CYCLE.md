# LB009 — First Mainnet Cycle Runbook

**Status:** PREPARATION ONLY — NOT AUTHORIZED TO EXECUTE
**Gates:** All LB008 production blockers must be closed and deployment validator must return `DEPLOYMENT_INPUTS_VALID`.

## Preconditions (ALL required)

1. Production non-exportable KMS/HSM authority provisioned (LB-G03B)
2. KMS DER→Ethereum signature normalization verified against Authorizer (LB-G11)
3. Canonical Treasury receiver contract-bound (LB-G04B)
4. Treasury Runtime LB ingestion operational (LB-G04C / LB-G12)
5. Quote policy Founder-ratified for selected asset (LB-G08); stables only with verified gas path (LB-G09)
6. Finality policy accepted (LB-G10)
7. `node deployments/liquidity-building/validate-lb-v1-inputs.mjs` → `DEPLOYMENT_INPUTS_VALID`
8. Immutable contracts deployed + BscScan verified
9. `GET /api/liquidity-building/readiness` → `status: READY`
10. No human operational wallet; no HOT_SIGNER; no private-key env for LB

## Cycle definition

| Field | Value |
| --- | --- |
| 1. Selected Program | TBD after Factory deploy |
| 2. Selected pair | Canonical Melega pair for program project/quote |
| 3. Selected quote asset | Prefer WBNB first (NativeEquivalent) |
| 4. Initial budget | Low-value founder-approved project-token budget |
| 5. Expected execution bounds | Gross ≤ ratified floor headroom; impact ≤ 40 bps operating / 100 bps hard |
| 6. Observation window | Finalized epoch window; ≥15 confirmations |
| 7. Signed intent evidence | KMS signature + Authorizer digest match |
| 8. Transaction evidence | Permissionless relay tx hash + receipt |
| 9. Treasury evidence | Sink settlement + Runtime acknowledgement ID |
| 10. LP evidence | LP minted to program `lpRecipient` |
| 11. Accounting evidence | Program ExecutionCompleted + residual accounting |

## Explicit non-goals for this document

- Do not execute while readiness is BLOCKED
- Do not use local dry-run stubs as production authority/Treasury
- Do not treat fork simulation as mainnet activation

## Evidence pack to publish after a real cycle

- Observation artifact (`melega.liquidity-building.observation.v1`)
- Decision artifact (`melega.liquidity-building.decision.v1`)
- Execution artifact (`melega.liquidity-building.execution.v1`)
- Reconciliation artifact (`melega.liquidity-building.reconciliation.v1`)
- BscScan links for Program, Sink, Factory, tx
- Health snapshot at activation time
