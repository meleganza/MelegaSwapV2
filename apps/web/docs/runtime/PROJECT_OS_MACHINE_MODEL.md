# Project Operating System — Machine Model

**Status:** Canonical (PP-CERT)  
**Schema:** `melega.project-machine.v1`  
**Interface version:** `1.0.0`  
**Resolver:** `PP014_MACHINE_V1`

## 1. Purpose

Expose the Project OS as a deterministic, machine-readable interface for AI agents and integrators.

**Does:** discovery, capabilities, navigation/fetch/discover action descriptors, schemas, endpoints, relationships, limitations.  
**Does not:** execute transactions, return quotes, emit calldata, request signatures, grant runtime authority, or expose private APIs.

## 2. Core object

`machineInterface`:

| Field               | Meaning                                    |
| ------------------- | ------------------------------------------ |
| `interfaceId`       | `mif_` fingerprint(`projectId`, `version`) |
| `projectId`         | Shared UPI                                 |
| `version`           | Interface semver (`1.0.0`)                 |
| `generatedAt`       | ISO timestamp                              |
| `revision`          | Document fingerprint                       |
| `discoveryEndpoint` | `/.well-known/melega-dex-discovery.json`   |
| `machineEndpoint`   | `/api/public/projects/{slug}/machine/`     |
| `wellKnownPath`     | `/.well-known/melega-dex-machine.json`     |

Document also includes: `capabilities`, `actions`, `resources`, `endpoints`, `schemas`, `relationships`, `warnings`, `limitations`.

## 3. Capability graph

Controlled capabilities (examples): `VIEW_PROJECT`, `VIEW_EVIDENCE`, `VIEW_READINESS`, `VIEW_TRUST`, `VIEW_WALLET_RELATIONSHIP` (`NOT_APPLICABLE` for agent write), `VIEW_MARKETS`, `SWAP`, `VIEW_PARTICIPATION`, `ADD_LIQUIDITY`, `OPEN_FARM`, `OPEN_POOL`, `OPEN_LIQUIDITY_BUILDING`, `VIEW_UPDATES`, `VIEW_ECOSYSTEM`, `VIEW_DEVELOPER`, `VIEW_GOVERNANCE`, `VIEW_GROWTH`, `VIEW_CONTROL_CENTER`, `VIEW_MACHINE`.

Each capability ID is `cap_` + fingerprint. Related section IDs and certified GET endpoints are attached.

## 4. Action descriptors

Kinds: `NAVIGATE` | `FETCH` | `DISCOVER`.

Required fields: `actionId`, `capability`, `route`, `requiredContext`, `walletRequired` (**always false**), `chainRequired`, `availability`, `status`, `limitations`.

Routes must pass `isCertifiedMachineRoute` (allowlist + slug-safe public API / project-hq / well-known / registry patterns).

## 5. Schema catalog

Machine `schemas[]` lists every certified hub schema PP001–PP014, including PP004 `melega.project-wallet-relationship.v1` (contextual; not a public bulk endpoint).

## 6. Relationships

Types: `EXPOSES`, `IMPLEMENTS`, `LINKS_SECTION`, `LINKS_ENDPOINT`, `LINKS_SCHEMA`, `USES_CAPABILITY`. IDs: `mrel_`.

## 7. Security invariants

- No private Control Center mutation paths in action routes.
- OpenAPI / MCP resources remain honestly `UNAVAILABLE` until published.
- Limitations array is authoritative for agent consumers.

## 8. Reconstruction

An agent can rebuild the OS by:

1. Reading well-known machine pointer
2. Fetching `/machine/`
3. Following capability → endpoint / section links
4. Fetching hub documents listed in endpoints
5. Navigating humans to certified product routes for execution
