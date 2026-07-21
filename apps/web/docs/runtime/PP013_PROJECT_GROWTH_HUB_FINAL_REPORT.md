# PP013 — Project Growth Hub — Final Report

## 1. Executive verdict

**PP013_PROJECT_GROWTH_HUB_CERTIFIED**

PP013 adds the canonical Project Growth Hub: a deterministic, machine-readable orchestration layer for growth programs (SmartDrop, campaigns, referral, onboarding, liquidity incentive discovery, community, and related surfaces). It does not execute campaigns, SmartDrop, referrals, or reward claims. No fabricated campaign metrics. ACTIVE is never invented — Melega DEX has **0 ACTIVE** growth programs. PP001–PP012 remain frozen aside from additive `growthSummary`.

## 2. Repository audit

| Area | Reality |
|---|---|
| SmartDrop route | None — PP009 UNAVAILABLE; capability planned |
| Referral runtime | Blocked / not local — UNAVAILABLE |
| Campaign registry | Empty — UNAVAILABLE |
| Airdrop / Ambassador / Missions | No product surfaces — UNAVAILABLE |
| Labs / Radar / Space / ILO | Routes or links exist; capability planned — PLANNED |
| Trending / Onboarding / Build Studio | Present as discovery/tooling — PREVIEW |
| Growth Project Page nav | Did not exist — added |
| ACTIVE growth programs | **0** |

## 3. Growth model

Module: `apps/web/src/registry/projects/identity/growth/`  
Schema: `melega.project-growth.v1`  
Resolver: `PP013_GROWTH_V1`  
IDs: `grp_` + fingerprint(`projectId|stableKey|category|type`)

Fields: `programId`, `projectId`, `category`, `type`, `title`, `summary`, `status`, `availability`, `lifecycle`, `provenance`, `verification`, `evidence`, `capabilities`, `destination`, `supportedChains`, `updatedAt`, `revision`.

## 4. Categories

Controlled: `SMARTDROP`, `CAMPAIGN`, `REFERRAL`, `AIRDROP`, `MISSION`, `ONBOARDING`, `AMBASSADOR`, `LIQUIDITY_INCENTIVE`, `STAKING_INCENTIVE`, `COMMUNITY`, `MARKETING`, `ECOSYSTEM`, `LAUNCHPAD`, `OTHER`.

UX groups: Campaigns · SmartDrop · Referral · Onboarding · Liquidity Incentives · Community · Resources.

Statuses: `ACTIVE`, `BETA`, `PREVIEW`, `PLANNED`, `ARCHIVED`, `UNAVAILABLE`. ACTIVE without a certified destination is downgraded.

## 5. Relationships

Typed edges (`LINKS_SECTION`, `LINKS_SERVICE`, `LINKS_UPDATE`, `LINKS_EVIDENCE`, `LINKS_DEVELOPER`, `USES`, `COMPOSES`) with `grel_` IDs. Cross-links to Participate, Updates, Ecosystem, Developer — without duplicating those hubs.

## 6. Public API

`GET /api/public/projects/{slug}/growth/`  
Response: `schemaVersion`, `projectId`, `revision`, `generatedAt`, `programs`, `categories`, `summary`, `availability`, `warnings`, `limitations` (+ relationships for machine readability).

## 7. PP001 extension

Additive `growthSummary`: `programCount`, `activeProgramCount`, `endpoint`, `revision` (+ extension/schemaVersion).

## 8. UX

`#growth` section after Participate: grouped program cards with category, title, summary, availability, status, Open (when destination exists). No metrics.

## 9. Machine contract

Agents discover programs via IDs, categories, status, availability, capabilities, destinations, evidence, relationships, and `machineTags`.

## 10. Security

Certified route allowlist + safe HTTP URLs; sanitized text; no execution endpoints; no reward claims; no campaign mutations.

## 11. Accessibility

Semantic hierarchy, focusable Open links (44px), readable status labels, `<time dateTime>`.

## 12. Responsive validation

Vertical compact cards; Project HQ SSG includes growth document.

## 13. Tests

`growth/__tests__/pp013.growth.test.ts` — IDs, category/status validation, zero ACTIVE honesty, API, PP001 summary, relationships, a11y, integrations, PP001–PP012 regressions.

PP001–PP013 vitest: **214 passed** (recorded after gate run).

## 14. Commands

```text
npx prettier --write <PP013 scoped files>
yarn vitest run …/pp001…pp013…   # 214 passed
npx tsc --noEmit | filter PP013  # no PP013 path errors
yarn next build                  # PASS
```

## 15. Build

`yarn next build` — **PASS** (recorded after gate run).

## 16. Regression

| Suite | Result |
|---|---|
| PP001–PP012 | PASS |
| PP013 growth | PASS |

## 17. Files

- `apps/web/src/registry/projects/identity/growth/**` (new)
- `apps/web/src/registry/projects/identity/index.ts`
- `apps/web/src/registry/projects/identity/normalizeProject.ts`
- `apps/web/src/pages/api/public/projects/[slug].ts`
- `apps/web/src/pages/api/public/projects/[slug]/growth.ts` (new)
- `apps/web/src/pages/project-hq/[slug].tsx`
- `apps/web/src/views/ProjectPage/ProjectIdentityShell.tsx`
- `apps/web/src/views/ProjectPage/ProjectGrowthSection.tsx` (new)
- `apps/web/docs/runtime/PP013_PROJECT_GROWTH_HUB_FINAL_REPORT.md` (new)

## 18. Limitations

- No ACTIVE SmartDrop / referral / airdrop / ambassador programs.
- Liquidity incentive card is discovery-only (links Participation) — no emission metrics.
- Staged Control Center mutations do not publish growth programs.
- Full-text growth search deferred.
- ESLint `next/babel` config gap is a pre-existing workspace baseline issue.

## 19. Deferred PP014 work

Do not begin PP014. Natural follow-ons: certified ACTIVE programs when live campaign routes exist; optional Control Center staging for growth drafts; search indexing over `machineTags`.

## 20. Final certification

PP013_PROJECT_GROWTH_HUB_CERTIFIED
