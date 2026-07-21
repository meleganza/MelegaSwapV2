# Project Operating System — Entity Model

**Status:** Canonical (PP-CERT)

## 1. Root identity

| Entity         | ID form                   | Source                                       |
| -------------- | ------------------------- | -------------------------------------------- |
| Project        | `upi://…` (`projectId`)   | Static registry + `normalizeProjectDocument` |
| Slug / aliases | lowercase slug            | `resolveProjectBySlug`                       |
| Revision       | deterministic fingerprint | Per-document revision fields                 |

There is **one** canonical project document (`CanonicalProjectDocument`). Hubs reference `projectId` + `slug`; they do not invent parallel identity models.

## 2. Core graph entities

| Entity                                               | Prefix / key                                | Mission |
| ---------------------------------------------------- | ------------------------------------------- | ------- |
| Asset                                                | `assetId` (document-local)                  | PP001   |
| Deployment                                           | `deploymentId`                              | PP001   |
| Contract                                             | `contractId`                                | PP001   |
| Evidence                                             | `ev_`                                       | PP002   |
| Conflict group                                       | `cg_`                                       | PP002   |
| Readiness / Trust snapshot                           | document-level                              | PP003   |
| Wallet relationship                                  | `wr_`                                       | PP004   |
| Market                                               | `mkt_`                                      | PP005   |
| Swap destination                                     | `dst_`                                      | PP005   |
| Participation                                        | `part_`                                     | PP006   |
| Participation destination                            | `pdst_`                                     | PP006   |
| Liquidity Building destination                       | href + revision (no `lb_` prefix)           | PP007   |
| Update                                               | `upd_`                                      | PP008   |
| Service                                              | `svc_`                                      | PP009   |
| Ecosystem relation                                   | `rel_`                                      | PP009   |
| Developer resource                                   | `dev_`                                      | PP010   |
| Developer relation                                   | `drel_`                                     | PP010   |
| Governance                                           | `gov_`                                      | PP011   |
| Treasury                                             | `tre_`                                      | PP011   |
| Ownership / upgradeability                           | `own_` / `upg_`                             | PP011   |
| Governance resource / relation                       | `gres_` / `grel_`                           | PP011   |
| Control Center owner / audit                         | `ownr_` / `aud_`                            | PP012   |
| Growth program                                       | `grp_`                                      | PP013   |
| Growth relation                                      | `grel_`                                     | PP013   |
| Machine interface                                    | `mif_`                                      | PP014   |
| Capability / action / resource / endpoint / relation | `cap_` / `act_` / `mres_` / `ep_` / `mrel_` | PP014   |

## 3. Shared semantics

### Availability

Hubs use controlled availability vocabularies derived from PP001 provenance patterns (`AVAILABLE` / `UNAVAILABLE` / `NOT_APPLICABLE` and hub-specific status enums). Do not invent parallel “live / online” labels for public discovery.

### Provenance

PP001 `ProjectField` meta (`sourceClass`, availability) is the provenance shell. Evidence (PP002) attaches typed evidence; later hubs link evidence IDs rather than redefining provenance.

### Chain identifiers

Prefer CAIP-2 (`eip155:56`) on assets/contracts/deployments. UI may show human labels; machine documents retain CAIP forms.

### Declared capabilities

PP001 `declaredCapabilities` describe project claims. PP014 machine `capabilities` are **agent-facing OS capabilities** (navigation/discovery). They are related but not the same enum namespace.

## 4. Known namespace note

Governance relations and growth relations both use the `grel_` prefix. Fingerprint inputs differ by domain, so practical collisions are unlikely, but the **prefix is not globally unique**. Future missions must not introduce a third `grel_` consumer; prefer `mrel_`-style domain prefixes. Prefix change is deferred to avoid semantic ID churn on frozen PP011/PP013.

## 5. No duplication rules

- One project identity model (`CanonicalProjectDocument`).
- One evidence pack builder for public trust evidence.
- Hub summaries on PP001 are **pointers/counts**, not full hub payloads.
- Machine resources **link** Developer / Trust / Markets / Growth hubs; they do not copy their entities.
