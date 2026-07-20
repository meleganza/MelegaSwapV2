# LB021 — Activation Gate Consumer

**Mission:** LB021  
**Assessed:** `2026-07-20T11:30:00Z`  
**Baseline:** LB020 `c1b89305`  
**Role:** Melega DEX-side **read-only** consumer of external activation gates.

Does **not** become the authority. Does **not** deploy. Does **not** execute transactions.  
Source of truth remains: deployment validator · activation-gate-final · production inputs.

Implementation:

- `apps/web/src/lib/liquidity-building-runtime/activationGateConsumer.ts`
- `GET /api/liquidity-building/activation-status`

---

## Gate matrix

| Gate | Source | Required state | UI impact |
| --- | --- | --- | --- |
| **LB-G03B** Production signer | `activation-gate-final.v1.json` (Signer) + inputs `productionAuthority` | READY / BLOCKED | Pending until READY; never shows KMS labels |
| **LB-G11** Signature validation | Same gate row / Authorizer verify evidence | READY / BLOCKED | Pending until READY |
| **LB-G03C** Relay | Gate row Relay | READY / BLOCKED | Pending until READY |
| **LB-G04B** Treasury receiver | Gate rows Treasury receiver / Fee Sink | READY / BLOCKED | Pending until READY; no Treasury internals in UI |
| **LB-G04C/G12** Treasury Runtime | Gate row Runtime ingestion | READY / BLOCKED | Pending until READY |
| **LB-G08** Quote policy | Gate row Quote policy | READY / BLOCKED | Pending until READY |
| **LB-G10** Finality | Gate row Finality | READY / BLOCKED | Pending until READY |

Additional structural checks (not user-facing jargon):

| Check | Required for READY |
| --- | --- |
| Validator | `VALID` / `DEPLOYMENT_INPUTS_VALID` / `PASS` |
| Deployment readiness | `VALID` or `DEPLOYED` |
| Contract addresses | Factory + Authorizer + Fee Sink non-zero |
| `activationAuthorized` | `true` in gate artifact only |

---

## Product status model

| Status | Meaning | UI mode |
| --- | --- | --- |
| `READY` | All required gates READY + validator + addresses + authorization | available |
| `PENDING_EXTERNAL_ACTIVATION` | Melega DEX frozen; external gates incomplete (current) | pending |
| `BLOCKED` | Structural block after partial gate progress | blocked |
| `FAILED` | Forbidden override / private-key config violation | blocked |

User-facing mapping (frozen):

- **Liquidity Building Ready**
- **Activation Pending**

Copy variants:

- Ready → “Liquidity Building available.”
- Pending → “Liquidity Building is prepared and waiting for production activation.”
- Blocked → “Activation requirements are incomplete.”

No KMS · BC003S · Treasury internals · infrastructure terminology.

---

## Fail-closed rules

- Never invent gate PASS
- Never accept query/body activation overrides (`MANUAL_ACTIVATION_FORBIDDEN`)
- `deploymentInputsValid` only when addresses + validator + gates + `activationAuthorized`
- Frontend `LB_DEPLOYED_ADDRESSES` remains null until verified bind
- Mutating CTAs still require `canSubmitMutatingAction` (LB015+)

---

## Current consumption snapshot

| Field | Value |
| --- | --- |
| productStatus | `PENDING_EXTERNAL_ACTIVATION` |
| activationAuthorized | `false` |
| validatorResult | `DEPLOYMENT_INPUTS_BLOCKED` |
| All LB021 gates | BLOCKED |
| Contracts | NOT_DEPLOYED |

---

## Related

- [`docs/LB020_LIQUIDITY_BUILDING_PRODUCTION_HANDOFF.md`](LB020_LIQUIDITY_BUILDING_PRODUCTION_HANDOFF.md)
- [`docs/LB020_ACTIVATION_CHECKLIST.md`](LB020_ACTIVATION_CHECKLIST.md)
- [`docs/LB021_FIRST_CYCLE_EXECUTION_HANDOFF.md`](LB021_FIRST_CYCLE_EXECUTION_HANDOFF.md)
