# PP008 — Project Activity & Verified Updates Hub — Final Report

## 1. Executive verdict

**PP008_PROJECT_ACTIVITY_VERIFIED_UPDATES_HUB_CERTIFIED**

PP008 establishes the canonical Project Activity & Verified Updates Hub on the Project Page. Updates are official, attributable, timestamped, versioned, evidence-aware project events — not a social feed. The timeline is chronological and append-only (ACTIVE / SUPERSEDED / RETRACTED / ARCHIVED). Provenance and evidence reuse PP002. Publishing is deferred to PP012. PP001–PP007 remain frozen aside from the additive `updatesSummary` on the public project JSON.

## 2. Repository audit

| Area | Finding |
|---|---|
| Project Page Updates section | Deferred since PP001; no prior render surface |
| News / announcements / changelog | None project-scoped |
| Protocol activity / PremiumActivityTimeline | DEX-wide feeds — not reused |
| RSS / notifications | None for Project Page |
| Registry | No updates field on `StaticProjectRecord` |
| Reusable pattern | Mirror PP007 module under `identity/updates/` |

**Repository reality:** greenfield static registry + read-model orchestration.

## 3. Update model

Module: `apps/web/src/registry/projects/identity/updates/`  
Schema: `melega.project-updates.v1`  
Resolver: `PP008_UPDATES_V1`  
IDs: `upd_` + deterministic fingerprint of `projectId|stableKey|version|publishedAt|category`

Fields: `updateId`, `projectId`, `version`, `publishedAt`, `updatedAt`, `authorType`, `authorIdentity`, `title`, `summary`, `content`, `category`, `affectedCapabilities`, `affectedDeployments`, `affectedAssets`, `affectedContracts`, `evidenceIds`, `provenance`, `verification`, `visibility`, `machineTags`, `revision`, `supersedesUpdate`, `status`.

## 4. Category model

Controlled vocabulary in `UPDATE_CATEGORIES` (PROJECT_NEWS … OTHER), including MARKET_AVAILABILITY, LIQUIDITY, FARM, POOL, LIQUIDITY_BUILDING. Invalid categories dropped with warnings.

Authors: `PROJECT` | `MELEGA` | `AUTOMATED_RUNTIME` | `UNKNOWN` (no invented people).

## 5. Timeline architecture

- Static source: `registry.data.ts` keyed by `projectSlug`
- Builder resolves public PP002 evidence via claim-type match
- Sort: `publishedAt` descending, then `updateId`
- UX: `#updates` / Latest Updates after Participate, before Trust
- Nav injects Updates only when public updates exist

## 6. Revision model

- Per-update `revision` fingerprint of id + status + updatedAt + content + supersession
- Document `updatesRevision` aggregates update revisions
- Supersession via `supersedesStableKey` → resolved `supersedesUpdate` id
- History never deleted

## 7. Public API

`GET /api/public/projects/{slug}/updates/`  
Schema: `melega.project-updates.v1`  
Includes: `schemaVersion`, `projectId`, `slug`, `revision` fields, `generatedAt`, `updates`, `summary`, `availability`, `warnings`, `limitations`.  
Public only. Cache aligned with PP005–PP007.

## 8. PP001 extension

Additive `updatesSummary` on `GET /api/public/projects/{slug}`:

- `totalPublicUpdates`
- `latestPublishedAt`
- `categoriesPresent`
- `endpoint`
- `revision`
- (+ `extension`, `schemaVersion`)

## 9. UX

- Section title: Latest Updates
- Compact vertical timeline cards: category, title, summary, date, verification, status, affected areas, Read update (`<details>`)
- Expanded: full content, capabilities, deployments, contracts, evidence, revision, supersession / state notices
- No comments, reactions, likes, or social metrics

## 10. Machine contract

Agents can reconstruct chronology from update IDs, categories, timestamps, affected objects, evidence IDs, revisions, supersession, provenance, and `machineTags` (search-ready, not indexed yet).

## 11. Security

- `sanitizePlainText` strips HTML / control chars
- No markdown rendering / no `dangerouslySetInnerHTML` in Updates UI
- Private evidence never attached
- No execution payloads

## 12. Accessibility

- Semantic `<section>` / `<ol>` timeline
- Accessible `<time dateTime>`
- Keyboard-focusable Read update summary (44px min height)
- Status and verification as text, not color-only

## 13. Responsive validation

Vertical column layout only; compact cards; Project HQ SSG includes `/project-hq/melega-dex` and `/project-hq/melega`.

## 14. Tests

`updates/__tests__/pp008.updates.test.ts` covers IDs, chronology, revisions, statuses, categories/authors, evidence, API, PP001 summary, a11y/responsive contracts, PP001–PP007 regressions.

PP001–PP008 vitest: **144 passed**.

## 15. Commands

```text
npx prettier --write <PP008 scoped files>
yarn vitest run …/pp001…pp008…          # 144 passed
npx tsc --noEmit | filter PP008 paths   # no PP008 path errors after registry typing fix
yarn next build                         # PASS
```

Scoped ESLint baseline still cannot load `next/babel` (pre-existing).

## 16. Build

`yarn next build` — **PASS**.

## 17. Regressions

| Suite | Result |
|---|---|
| PP001–PP007 | PASS |
| PP008 updates | PASS |
| Frozen surfaces (Swap/Farms/Pools/LB/Trust) | Untouched |

## 18. Files

- `apps/web/src/registry/projects/identity/updates/**` (new)
- `apps/web/src/registry/projects/identity/index.ts`
- `apps/web/src/registry/projects/identity/normalizeProject.ts`
- `apps/web/src/pages/api/public/projects/[slug].ts`
- `apps/web/src/pages/api/public/projects/[slug]/updates.ts` (new)
- `apps/web/src/pages/project-hq/[slug].tsx`
- `apps/web/src/views/ProjectPage/ProjectIdentityShell.tsx`
- `apps/web/src/views/ProjectPage/ProjectUpdatesSection.tsx` (new)
- `apps/web/docs/runtime/PP008_PROJECT_ACTIVITY_VERIFIED_UPDATES_HUB_FINAL_REPORT.md` (new)

## 19. Limitations

- Seed updates are certified static registry events for `melega-dex` only
- No owner publishing console (PP012)
- No full-text search index yet (`machineTags` prepared)
- Evidence attachment is claim-type match, not manual evidence-ID authorship
- Verification never invented when evidence unresolved

## 20. Deferred PP009 work

- Broader multi-project update catalogs
- Search / filter UI over the timeline
- Owner publication workflow (PP012)
- Do not begin PP009 in this mission

## 21. Final certification

**PP008_PROJECT_ACTIVITY_VERIFIED_UPDATES_HUB_CERTIFIED**

Criteria met:

- Updates are canonical project events
- Timeline chronological and append-only
- Provenance reuses PP002
- Revisions and supersession supported
- Machine-readable API works
- PP001–PP007 unchanged in semantics
- No social feed / comments / reactions / likes
- Tests and production build pass
- Diagnostics not worsened by PP008
- Final report complete
