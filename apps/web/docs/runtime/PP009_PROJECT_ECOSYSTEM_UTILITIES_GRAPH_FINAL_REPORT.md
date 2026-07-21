# PP009 — Project Ecosystem & Utilities Graph — Final Report

## 1. Executive verdict

**PP009_PROJECT_ECOSYSTEM_UTILITIES_GRAPH_CERTIFIED**

PP009 adds a deterministic, machine-readable Project Ecosystem & Utilities Graph to the Project Page. Services are operational capabilities (not a sitemap). ACTIVE is never invented. Relationships are exposed. Markets, Participation, Trust, and Updates are linked, not duplicated. PP001–PP008 remain frozen aside from additive `ecosystemSummary` on the public project JSON.

## 2. Repository audit

| Area | Finding |
|---|---|
| Prior `#ecosystem` | Deployments-only list |
| Capability keys | Present on `StaticProjectRecord`; not rendered as services |
| Product routes | `/trade`, `/liquidity-studio`, `/farms`, `/pools`, `/command-center`, etc. |
| Service registry | Did not exist — created under `identity/ecosystem/` |
| Pattern | Mirrored PP008 updates module |

## 3. Service model

Module: `apps/web/src/registry/projects/identity/ecosystem/`  
Schema: `melega.project-ecosystem.v1`  
Resolver: `PP009_ECOSYSTEM_V1`  
IDs: `svc_` + fingerprint(`projectId|stableKey|category|type`)

Fields: `serviceId`, `projectId`, `category`, `type`, `title`, `summary`, `route`, `externalUrl`, `availability`, `lifecycle`, `verification`, `provenance`, `evidenceIds`, `capabilities`, `supportedChains`, `machineTags`, `updatedAt`, `revision`, plus related section/update/doc refs.

## 4. Category model

Controlled vocabulary (`DEX`, `LIQUIDITY`, `STAKING`, `API`, `AI`, `TREASURY`, `DOCUMENTATION`, …). Mapped to UX groups: Products, Infrastructure, Developer Resources, Economy, AI, Governance, Resources.

## 5. Type model

`WEB_APP`, `API`, `RUNTIME`, `SERVICE`, `MODULE`, `MICROSERVICE`, `LIBRARY`, `MOBILE_APP`, `EXTENSION`, `SMART_CONTRACT`, `PORTAL`.

Lifecycle: `ACTIVE | BETA | PREVIEW | PLANNED | DEPRECATED | ARCHIVED | UNAVAILABLE`.

## 6. Relationships

Typed edges (`PROVIDES`, `USES`, `COMPOSES`, `DOCUMENTS`, `SECURES`, …) with deterministic `rel_` IDs. Examples: Trade → Liquidity Studio → Liquidity Building; Command Center uses Farms/Pools/Liquidity; Docs documents Machine Manifest.

## 7. Public API

`GET /api/public/projects/{slug}/ecosystem/`  
Includes: `schemaVersion`, `projectId`, `revision` fields, `generatedAt`, `services`, `relationships`, `categories`, `summary`, `availability`, `warnings`, `limitations`.

## 8. PP001 extension

Additive `ecosystemSummary`: `categoryCounts`, `activeServiceCount`, `endpoint`, `revision` (+ extension/schemaVersion).

## 9. UX

Ecosystem section hierarchy with compact vertical service cards (icon badge, category, title, summary, lifecycle, chains, Open, expandable Details). Deployments retained under Infrastructure subsection. Related sections link to `#participate` / `#trust` / `#updates`.

## 10. Machine contract

Agents reconstruct ecosystem from service IDs, categories, relationships, capabilities, chains, routes, lifecycle, provenance, evidence, and `machineTags` (search-ready).

## 11. Security

- Certified internal route allowlist
- External URLs via `isSafeHttpUrl`
- Content sanitized (no HTML)
- No private evidence leakage

## 12. Accessibility

Semantic section/groups, focusable Open/Details, readable lifecycle text, `<time dateTime>`.

## 13. Responsive validation

Vertical stack only; no giant graph viz; Project HQ SSG builds.

## 14. Tests

`ecosystem/__tests__/pp009.ecosystem.test.ts` — IDs, validation, ordering, API, summary, relationships, evidence, updates integration, a11y, ACTIVE rules, PP001–PP008 regressions.

PP001–PP009 vitest: **157 passed**.

## 15. Commands

```text
npx prettier --write <PP009 scoped files>
yarn vitest run …/pp001…pp009…   # 157 passed
npx tsc --noEmit | filter PP009  # no PP009 path errors
yarn next build                  # PASS
```

## 16. Build

`yarn next build` — **PASS**.

## 17. Regression

| Suite | Result |
|---|---|
| PP001–PP008 | PASS |
| PP009 ecosystem | PASS |
| Frozen orchestration modules | Untouched in semantics |

## 18. Files

- `apps/web/src/registry/projects/identity/ecosystem/**` (new)
- `apps/web/src/registry/projects/identity/index.ts`
- `apps/web/src/registry/projects/identity/normalizeProject.ts`
- `apps/web/src/pages/api/public/projects/[slug].ts`
- `apps/web/src/pages/api/public/projects/[slug]/ecosystem.ts` (new)
- `apps/web/src/pages/project-hq/[slug].tsx`
- `apps/web/src/views/ProjectPage/ProjectIdentityShell.tsx`
- `apps/web/src/views/ProjectPage/ProjectEcosystemSection.tsx` (new)
- `apps/web/docs/runtime/PP009_PROJECT_ECOSYSTEM_UTILITIES_GRAPH_FINAL_REPORT.md` (new)

## 19. Limitations

- Seed graph covers `melega-dex` only
- Build Studio / Identity marked PLANNED (no capability ACTIVE claim)
- No search UI yet
- Official resources section remains for PP001 parity (ecosystem Resources also lists website/docs/space)

## 20. Deferred PP010 work

- Multi-project ecosystem catalogs
- Service search / filter
- Owner-managed service publication
- Do not begin PP010 in this mission

## 21. Final certification

**PP009_PROJECT_ECOSYSTEM_UTILITIES_GRAPH_CERTIFIED**

Criteria met: deterministic graph, machine-readable services, no duplicated Markets/Participation/Trust/Updates, relationships exposed, PP001–PP008 unchanged in semantics, APIs/tests/build pass, diagnostics not worsened, report complete.
