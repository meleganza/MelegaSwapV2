# Project Operating System — API Reference

**Status:** Canonical (PP-CERT)  
**Base:** `/api/public/projects/{slug}`

All handlers: `GET` only (405 otherwise), `normalizeProjectSlugInput`, true 404 when unknown, ETag + stable `fast-json-stable-stringify` where used.

## 1. Endpoints

| Path                           | Schema                                                   | Loader / builder                       |
| ------------------------------ | -------------------------------------------------------- | -------------------------------------- |
| `/api/public/projects/{slug}/` | `melega.project-page.v1` + additive summaries            | `toPublicProjectJson`                  |
| `/evidence/`                   | `melega.project-evidence.v1`                             | `loadProjectEvidencePack`              |
| `/readiness/`                  | `melega.project-readiness.v1`                            | `loadProjectReadinessDocument`         |
| `/markets/`                    | `melega.project-markets.v1`                              | `loadProjectMarketsDocument`           |
| `/participation/`              | `melega.project-participation.v1`                        | `loadProjectParticipationDocument`     |
| `/liquidity-building/`         | `melega.project-liquidity-building.v1`                   | `loadProjectLiquidityBuildingDocument` |
| `/updates/`                    | `melega.project-updates.v1`                              | `loadProjectUpdatesDocument`           |
| `/ecosystem/`                  | `melega.project-ecosystem.v1`                            | `loadProjectEcosystemDocument`         |
| `/developer/`                  | `melega.project-developer.v1`                            | `loadProjectDeveloperDocument`         |
| `/governance/`                 | `melega.project-governance.v1`                           | `loadProjectGovernanceDocument`        |
| `/control-center/`             | `melega.project-control-center.v1` (public claim subset) | `loadProjectControlCenterDocument`     |
| `/growth/`                     | `melega.project-growth.v1`                               | `loadProjectGrowthDocument`            |
| `/machine/`                    | `melega.project-machine.v1`                              | `loadProjectMachineDocument`           |

**Not public:** full wallet relationship document, Control Center private mutations.

## 2. Shared response fields

Hub documents typically include:

- `schemaVersion`
- `projectId` (shared UPI)
- `slug` (canonical)
- `revision` (hub-specific fingerprint)
- `generatedAt` (ISO timestamp)
- `warnings` / `limitations` where applicable

Alias input slugs resolve to the same `projectId` and canonical `slug`.

## 3. PP001 additive summaries

Attached only on the project document (not JSON-LD):

| Field                       | Contents (summary)                                            |
| --------------------------- | ------------------------------------------------------------- |
| `evidenceSummary`           | Evidence availability / counts / endpoint                     |
| `readinessSummary`          | Score / state / endpoint                                      |
| `trustSnapshotSummary`      | Coverage / conflicts / gaps                                   |
| `walletRelationshipSupport` | Static support metadata only                                  |
| `marketsSummary`            | Market discovery counts / endpoint                            |
| `participationSummary`      | Participation discovery / endpoint                            |
| `liquidityBuildingSummary`  | LB discovery / endpoint                                       |
| `updatesSummary`            | Update counts / endpoint                                      |
| `ecosystemSummary`          | Service graph discovery / endpoint                            |
| `developerSummary`          | Developer resource discovery / endpoint                       |
| `governanceSummary`         | Governance/treasury disclosure / endpoint                     |
| `controlCenterSummary`      | Public claim/verification only                                |
| `growthSummary`             | Program counts / endpoint                                     |
| `machineSummary`            | `interfaceVersion`, `capabilityCount`, `endpoint`, `revision` |

Summaries must not embed full hub entity arrays.

## 4. Well-known

| Path                                     | Role                                       |
| ---------------------------------------- | ------------------------------------------ |
| `/.well-known/melega-dex-discovery.json` | Project registry discovery                 |
| `/.well-known/melega-dex-machine.json`   | Machine Interface pointer                  |
| Other `melega-dex-*.json`                | Adjacent DEX discovery (assets, venues, …) |

## 5. HTML alternates

`project-hq/[slug]` Meta emits `rel=alternate` JSON links for every public hub, including `control-center` (public claim) and `machine`.

## 6. Determinism

- Fingerprint IDs are stable for fixed inputs.
- API payloads use stable key ordering at the wire boundary.
- Do not depend on wall-clock `generatedAt` for ID equality tests; pin `generatedAt` in tests.
