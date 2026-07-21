# PP012 — Project Control Center — Final Report

## 1. Executive verdict

**PP012_PROJECT_CONTROL_CENTER_CERTIFIED**

PP012 adds the first authenticated owner surface for the Project Page: a Control Center that stages registry mutations under server-enforced roles/permissions with immutable audit records. It does not edit runtime state, smart contracts, treasury, or governance. Wallet SIWE is not available in this repository; authentication uses the operator Bearer pattern already used by private indexer APIs. Staged drafts never auto-promote into frozen PP001–PP011 static registries. Manage Project is never rendered for unauthenticated public visitors.

## 2. Repository audit

| Area | Reality |
|---|---|
| NextAuth / SIWE / JWT sessions | Absent |
| Wallet connect | Client-only (wagmi) — not server-verifiable |
| Private API auth precedent | Bearer `CRON_SECRET` / `INDEXER_CRON_SECRET` |
| Canonical project data | Static TypeScript registries |
| Pending project store | In-memory / localStorage; unauthenticated |
| PP008 update publication | Deferred to PP012 — implemented as staging only |
| PROJECT_CONTROL evidence | UNAVAILABLE — no wallet owner claims |
| Manage Project entry | Did not exist — added (client-only) |

## 3. Owner model

Module: `apps/web/src/registry/projects/identity/controlCenter/`  
Schema: `melega.project-control-center.v1`  
IDs: `ownr_` + fingerprint(`projectId|stableKey|identityType`)

Fields: `ownerId`, `projectId`, `identityType`, `verificationState`, `roles`, `permissions`, `createdAt`, `updatedAt`, `revision`.

Melega seed: platform OPERATOR owners (`OWNER`, `AUDITOR`) — no invented wallet claims.

## 4. Roles

`OWNER`, `ADMIN`, `EDITOR`, `PUBLISHER`, `AUDITOR`, `VIEWER` — server-enforced via `ROLE_PERMISSIONS`.

## 5. Permissions

`EDIT_PROFILE`, `EDIT_RESOURCES`, `PUBLISH_UPDATE`, `MANAGE_DOCUMENTATION`, `MANAGE_ECOSYSTEM`, `VIEW_AUDIT`, `MANAGE_TEAM`.

No runtime / treasury / governance execution permissions.

## 6. Claim lifecycle

`UNCLAIMED` → `CLAIM_PENDING` → `CLAIMED` → `VERIFIED` → `SUSPENDED` / `ARCHIVED`.

Melega DEX seed: `CLAIMED` (platform-operated). No automatic verification.

## 7. Private APIs

Authenticated (Bearer `PROJECT_CONTROL_OPERATOR_SECRET` or cron secrets):

| Method | Path |
|---|---|
| GET | `/api/private/projects/{slug}/control-center/session` |
| GET | `/api/private/projects/{slug}/control-center` |
| PATCH | `/api/private/projects/{slug}/control-center/profile` |
| POST | `/api/private/projects/{slug}/control-center/resources` |
| POST | `/api/private/projects/{slug}/control-center/updates` |
| POST | `/api/private/projects/{slug}/control-center/ecosystem` |
| POST | `/api/private/projects/{slug}/control-center/developer` |
| GET | `/api/private/projects/{slug}/control-center/audit` |

Public (read-only): `GET /api/public/projects/{slug}/control-center/` exposes `claimState` + `ownerVerification` only.  
PP001 additive: `controlCenterSummary` with the same public-safe fields.

## 8. Control Center UX

- Client-only **Owner access** → authenticated **Manage Project** link on Project Page (`ssr: false`)
- Page: `/project-hq/{slug}/manage` (`noindex`)
- Sections: Overview, Profile, Resources, Updates, Developer, Ecosystem, Verification, Audit History

## 9. Audit model

Append-only in-memory audit store. Every mutation produces `aud_` records with actor, action, section, summary, before/after revision, timestamp. No deletion API.

## 10. Security

- Bearer operator auth (repo-supported)
- Server-side permission checks
- Sec-Fetch-Site cross-site mutation rejection
- In-memory rate limiting
- URL/text sanitization
- No secrets in public JSON
- Manage Project never in anonymous SSR HTML

## 11. Accessibility

Semantic forms/labels, 44px controls, keyboard-focusable actions, `role="alert"` / `role="status"`, section headings.

## 12. Responsive validation

Vertical max-width 720px layout; no desktop-only assumptions; manage page SSG paths generated.

## 13. Tests

`controlCenter/__tests__/pp012.controlCenter.test.ts` — claim lifecycle, roles/permissions, auth, profile/resource/update/ecosystem/developer staging, audit immutability, public summary safety, Manage SSR contract, a11y, PP001–PP011 regressions.

PP001–PP012 vitest: **203 passed**.

## 14. Commands

```text
npx prettier --write <PP012 scoped files>
yarn vitest run …/pp001…pp012…   # 203 passed
npx tsc --noEmit | filter PP012  # no PP012 path errors
yarn next build                  # PASS
```

## 15. Build

`yarn next build` — **PASS** (recorded after gate run).

## 16. Regression

| Suite | Result |
|---|---|
| PP001–PP011 | PASS |
| PP012 control center | PASS |

## 17. Files

- `apps/web/src/registry/projects/identity/controlCenter/**` (new)
- `apps/web/src/pages/api/private/projects/[slug]/control-center/**` (new)
- `apps/web/src/pages/api/public/projects/[slug]/control-center.ts` (new)
- `apps/web/src/pages/api/public/projects/[slug].ts`
- `apps/web/src/pages/project-hq/[slug]/manage.tsx` (new)
- `apps/web/src/views/ProjectPage/ProjectControlCenter.tsx` (new)
- `apps/web/src/views/ProjectPage/ProjectManageEntry.tsx` (new)
- `apps/web/src/views/ProjectPage/ProjectIdentityShell.tsx`
- `apps/web/src/registry/projects/identity/index.ts`
- `apps/web/src/registry/projects/identity/normalizeProject.ts`
- `apps/web/docs/runtime/PP012_PROJECT_CONTROL_CENTER_FINAL_REPORT.md` (new)

## 18. Limitations

- No SIWE wallet owner authentication (repository does not support it).
- Staging is process-memory — not durable DB; canonical promotion remains git merge.
- Frozen PP008 public timeline is not mutated by staged updates.
- PROJECT_CONTROL evidence still unavailable — wallet claims remain blocked.
- ESLint `next/babel` config gap is a pre-existing workspace baseline issue.

## 19. Deferred PP013 work

Do not begin PP013. Natural follow-ons: durable staging persistence, SIWE claim proofs when evidence exists, and human-assisted promotion tooling from staged drafts into static registries.

## 20. Final certification

PP012_PROJECT_CONTROL_CENTER_CERTIFIED
