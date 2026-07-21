# PP014 — AI Agent Interface & Machine Actions — Final Report

## 1. Executive verdict

**PP014_AI_AGENT_INTERFACE_MACHINE_ACTIONS_CERTIFIED**

PP014 completes the Project Operating System with a deterministic Machine Interface: capabilities, navigation/discovery action descriptors, resources, schemas, endpoints, and relationships. It does not execute actions, introduce autonomous transactions, quotes, calldata, signatures, or runtime authority. PP001–PP013 remain frozen aside from additive `machineSummary`.

## 2. Repository audit

| Area                    | Reality                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| Public project APIs     | PP001–PP013 hubs present; `/machine/` added                                                  |
| Well-known              | `apps/web/public/.well-known/melega-dex-*.json` convention — added `melega-dex-machine.json` |
| OpenAPI                 | UNAVAILABLE (honest resource)                                                                |
| MCP                     | UNAVAILABLE (honest resource)                                                                |
| AI manifests            | Existing discovery/manifest pointers reused; no invented infra                               |
| Capability graph        | Built from certified PP001–PP013 surfaces only                                               |
| KIRI / private APIs     | Not exposed                                                                                  |
| Project Page Machine UX | Did not exist — compact section added                                                        |

## 3. Machine model

Module: `apps/web/src/registry/projects/identity/machine/`  
Schema: `melega.project-machine.v1`  
Resolver: `PP014_MACHINE_V1`  
Interface version: `1.0.0`  
IDs: `mif_`, `cap_`, `act_`, `mres_`, `ep_`, `mrel_` + fingerprint parts.

Core fields: `interfaceId`, `projectId`, `version`, `generatedAt`, `revision`, `capabilities`, `actions`, `resources`, `schemas`, `endpoints`, `relationships`, `limitations`.

## 4. Capability export

Controlled set includes `VIEW_PROJECT`, `VIEW_EVIDENCE`, `VIEW_READINESS`, `VIEW_TRUST`, `VIEW_WALLET_RELATIONSHIP` (NOT_APPLICABLE for agents), `VIEW_MARKETS`, `SWAP`, `VIEW_PARTICIPATION`, `ADD_LIQUIDITY`, `OPEN_FARM`, `OPEN_POOL`, `OPEN_LIQUIDITY_BUILDING`, `VIEW_UPDATES`, `VIEW_ECOSYSTEM`, `VIEW_DEVELOPER`, `VIEW_GOVERNANCE`, `VIEW_GROWTH`, `VIEW_CONTROL_CENTER`, `VIEW_MACHINE`.

No invented execution capabilities.

## 5. Action descriptors

Kinds: `NAVIGATE`, `FETCH`, `DISCOVER` only.  
Each action exposes: `actionId`, `capability`, `route`, `requiredContext`, `walletRequired` (always `false`), `chainRequired`, `availability`, `status`, `limitations`.  
No transaction payloads, calldata, signatures, or quotes.

## 6. Relationships

Typed edges (`EXPOSES`, `IMPLEMENTS`, `LINKS_SECTION`, `LINKS_ENDPOINT`, `LINKS_SCHEMA`, `USES_CAPABILITY`) reference capabilities, sections, endpoints, schemas, and resources. Hubs are linked, not duplicated.

## 7. Public API

`GET /api/public/projects/{slug}/machine/`  
Response includes: `schemaVersion`, `projectId`, `revision`, `generatedAt`, `machineInterface`, `capabilities`, `actions`, `resources`, `relationships`, `warnings`, `limitations` (+ endpoints/schemas for reconstruction).

## 8. PP001 extension

Additive `machineSummary`: `interfaceVersion`, `capabilityCount`, `endpoint`, `revision` (+ extension/schemaVersion). JSON-LD unchanged.

## 9. Well-known discovery

`/.well-known/melega-dex-machine.json` — thin pointer to machine API, project API, discovery, and limitations.

## 10. Machine UX

Compact `#machine` section: Machine API, Capabilities count, Schemas, Discovery endpoint, Version. Links Developer / Trust / Participate. No technical overload.

## 11. Security

No execution; no secrets; no runtime authority; no signing; no private Control Center mutations; certified route allowlist + sanitized text.

## 12. Accessibility

Semantic hierarchy (`h2`, section labelled), focusable links (44px min-height), human-readable summary.

## 13. Responsive validation

Vertical compact stack; Project HQ SSG includes `machineDocument`.

## 14. Tests

`machine/__tests__/pp014.machine.test.ts` — deterministic IDs, capability/action/relationship export, API shape, PP001 summary, well-known, a11y/responsive, PP001–PP013 regressions, alias parity.

## 15. Commands

```text
npx prettier --write <PP014 scoped files>
yarn vitest run …/pp001…pp014…   # 226 passed
npx tsc --noEmit | filter PP014  # no PP014 path errors
yarn eslint (scoped)             # baseline next/babel config missing (pre-existing)
yarn next build                  # PASS
```

## 16. Build

`yarn next build` — **PASS**

## 17. Regression

| Suite               | Result            |
| ------------------- | ----------------- |
| PP001–PP013         | PASS              |
| PP014 machine       | PASS (12)         |
| Combined PP001–PP014 | **226 passed** |

## 18. Files

- `apps/web/src/registry/projects/identity/machine/**` (new)
- `apps/web/src/pages/api/public/projects/[slug]/machine.ts` (new)
- `apps/web/public/.well-known/melega-dex-machine.json` (new)
- `apps/web/src/views/ProjectPage/ProjectMachineSection.tsx` (new)
- `apps/web/src/registry/projects/identity/index.ts` (export)
- `apps/web/src/registry/projects/identity/normalizeProject.ts` (`machineSummary`)
- `apps/web/src/pages/api/public/projects/[slug].ts` (summary wiring)
- `apps/web/src/pages/project-hq/[slug].tsx` (SSG + alternate)
- `apps/web/src/views/ProjectPage/ProjectIdentityShell.tsx` (nav + section)
- `apps/web/docs/runtime/PP014_AI_AGENT_INTERFACE_MACHINE_ACTIONS_FINAL_REPORT.md`

## 19. Limitations

Machine Interface is discovery-only. OpenAPI/MCP unavailable. Wallet relationship not an agent write surface. Execution remains in Swap, Liquidity Studio, Farms, Pools, Liquidity Building, Control Center, and Runtime.

## 20. Civilization compatibility

Human UI → Canonical Project Graph → Machine Interface → AI Agents → existing execution systems. Orchestration without authority.

## 21. Final certification

PP014_AI_AGENT_INTERFACE_MACHINE_ACTIONS_CERTIFIED
