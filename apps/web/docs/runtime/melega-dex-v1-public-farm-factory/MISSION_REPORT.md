# MISSION REPORT — Public Farm Factory & Eligibility Engine

## Verdict

**MELEGA_DEX_V1_PUBLIC_FARM_FACTORY_BLOCKED**

Orchestration, eligibility, fees, remediation, contracts package, indexer hooks, tests, and UI evidence are complete. On-chain create execution remains blocked until `PublicFarmFactoryV1` is deployed (address/tx deliberately null).

## Recovery

| Field | Value |
|---|---|
| Recovered branch | `melega-dex-v1-public-farm-factory` |
| Recovered base | `ad32627a` (pools/farms final completion) |
| Pre-recovery HEAD | `ad32627a` |
| Interrupted implementation | none (clean tree) |
| Checkpoint commit | not required |

## Architecture

- Outcome **B**: new Public Farm Factory package required
- Package: `contracts/public-farm-factory/`
- Deployment: BLOCKED · address null · tx null
- MasterBuilder: not exposed
- MARCO rewards: rejected

## Eligibility

- Min TVL **0.25 BNB** (threshold, not fee)
- Machine-readable result shape enforced
- On-chain vs attested model documented (signed eligibility authorization)

## Fees

- Consumes `fee-schedule.json` via `feeSchedule.ts`
- Public Factory: MARCO unsupported · MARCO pair FREE · else 0.25 BNB
- Treasury: `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b`
- Treasury Runtime: FORBIDDEN

## Validation

- Tests: 65 passed (mission + founder/architecture locks)
- `next build`: PASS
- Responsive screenshots: 9 viewports × 3 states + interactive state pack
- Low-liquidity remediation captured factually (`remediationVisible: true`)

## Remaining blockers

1. Deploy `PublicFarmFactoryV1` with authorized credentials
2. Bind non-null factory address
3. Operate eligibility signer for TVL attestation
4. Enable wallet create execution after verification

## Certified lineage preserved

Top Movers snapshot · Featured Trade project routing · LB 10% · Create Token 0.10 BNB · fee schedule SSOT · Pools/Farms action modals · Active Farmers · Finished Farms removal · Explore density · Treasury Runtime decommission · canonical Treasury wallet.
