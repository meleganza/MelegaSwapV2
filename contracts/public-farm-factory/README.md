# Public Farm Factory V1 (package only — NOT DEPLOYED)

Permissionless farm creation for Melega DEX public users.

## Guarantees

- Deploys only `PublicFarmTemplateV1`
- Never exposes MasterBuilder / MasterChef
- Rejects MARCO reward token (`MarcoRewardForbidden`)
- Validates LP via Melega pair factory `getPair`
- Creation fee: FREE if pair contains MARCO, else `0.25 ether` → treasury direct
- Creator funds reward budget via `transferFrom`
- Emits `FarmCreated` with creator, farm, LP, reward, budget, start, end, emission, fee, timestamp
- TVL eligibility via signed attestation (not an unsafe on-chain oracle)
- No upgradeability, no template injection, no arbitrary seizure

## Deployment status

| Field | Value |
|---|---|
| status | BLOCKED |
| address | null |
| transaction | null |

Do not fabricate addresses. Deploy only with authorized credentials outside this mission.
