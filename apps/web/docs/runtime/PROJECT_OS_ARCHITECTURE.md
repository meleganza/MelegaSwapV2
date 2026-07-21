# Project Operating System — Architecture

**Status:** Canonical (PP-CERT)  
**Scope:** PP001–PP014 certified missions  
**Principle:** Discovery and orchestration on the Project Page; execution remains in product surfaces.

## 1. Layering

```text
Human UI (Project Page /@slug)
        ↓
Canonical Project Graph (registry/projects/identity)
        ↓
Public APIs + Machine Interface
        ↓
AI Agents / Integrators
        ↓
Existing execution systems
  (Trade, Liquidity Studio, Farms, Pools, Liquidity Building, Control Center, Runtime)
```

The Project OS **does not** execute swaps, liquidity, farm/pool stakes, treasury moves, or autonomous transactions. It exposes identity, evidence, readiness, participation discovery, and machine-readable capabilities.

## 2. Module map

| Mission | Module path                       | Schema                                  |
| ------- | --------------------------------- | --------------------------------------- |
| PP001   | `identity/` (+ normalize/resolve) | `melega.project-page.v1`                |
| PP002   | `identity/evidence/`              | `melega.project-evidence.v1`            |
| PP003   | `identity/readiness/`             | `melega.project-readiness.v1`           |
| PP004   | `identity/walletRelationship/`    | `melega.project-wallet-relationship.v1` |
| PP005   | `identity/markets/`               | `melega.project-markets.v1`             |
| PP006   | `identity/participation/`         | `melega.project-participation.v1`       |
| PP007   | `identity/liquidityBuilding/`     | `melega.project-liquidity-building.v1`  |
| PP008   | `identity/updates/`               | `melega.project-updates.v1`             |
| PP009   | `identity/ecosystem/`             | `melega.project-ecosystem.v1`           |
| PP010   | `identity/developer/`             | `melega.project-developer.v1`           |
| PP011   | `identity/governance/`            | `melega.project-governance.v1`          |
| PP012   | `identity/controlCenter/`         | `melega.project-control-center.v1`      |
| PP013   | `identity/growth/`                | `melega.project-growth.v1`              |
| PP014   | `identity/machine/`               | `melega.project-machine.v1`             |

Shared barrel: `apps/web/src/registry/projects/identity/index.ts`.

## 3. Resolution contract

1. `normalizeProjectSlugInput(raw)` — trim, lowercase, strip `@`, validate slug.
2. `resolveProjectBySlug(slug)` — canonical slug or alias → `StaticProjectRecord`.
3. Hub builders consume the same `CanonicalProjectDocument` / evidence pack where required.
4. Alias views (`/@melega`) resolve to the same `projectId` as `/@melega-dex`; alias HTML is `noindex,follow`.

## 4. Public vs private

| Surface                          | Exposure                                                                                                                |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `/api/public/projects/**`        | Public, cacheable, no secrets                                                                                           |
| PP001 additive `*Summary` fields | Public discovery only                                                                                                   |
| Wallet relationship              | Contextual client + `/api/projects/{slug}/wallet-relationship` (no-store); public gets `walletRelationshipSupport` only |
| Control Center mutations         | `/api/private/projects/{slug}/control-center/*` — never on Project Page SSR                                             |
| Manage UI                        | `/project-hq/{slug}/manage` — client-only, `noindex`                                                                    |

## 5. Routing

| Entry                            | Behavior                                           |
| -------------------------------- | -------------------------------------------------- |
| `/@{slug}`                       | Rewrite → `/project-hq/{slug}` (`next.config.mjs`) |
| `/projects/{slug}`               | Permanent redirect → `/@{slug}`                    |
| `/project-hq/{slug}`             | SSG Project Page                                   |
| `/project-hq/{slug}/manage`      | Control Center entry                               |
| `/.well-known/melega-dex-*.json` | Static discovery pointers                          |

## 6. Frozen missions

PP001–PP014 are certified and frozen. Architectural changes require a new mission. PP-CERT may only fix objectively verified defects that preserve certified semantics.

## 7. Related documents

- `PROJECT_OS_ENTITY_MODEL.md`
- `PROJECT_OS_API_REFERENCE.md`
- `PROJECT_OS_MACHINE_MODEL.md`
- `PROJECT_OS_UX_INFORMATION_ARCHITECTURE.md`
- `PROJECT_OS_CERTIFICATION.md`
