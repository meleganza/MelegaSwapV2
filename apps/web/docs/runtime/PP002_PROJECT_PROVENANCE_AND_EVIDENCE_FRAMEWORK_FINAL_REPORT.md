# PP002 — Project Provenance and Evidence Framework — Final Report

**Mission:** PP002 — PROJECT PROVENANCE AND EVIDENCE FRAMEWORK  
**Branch:** `mission-pp002-project-provenance-evidence`  
**Date:** 2026-07-20  
**Certified dependency:** PP001 `4b4f2e66` (`PP001_CANONICAL_PROJECT_IDENTITY_SHELL_CERTIFIED`)

---

## 1. Executive verdict

PP002 adds a reusable claim/evidence substrate under `registry/projects/identity/evidence/` without redesigning the PP001 identity shell. Evidence is modeled separately from display claims, with deterministic IDs, freshness, conflict preservation, private-record exclusion, and a public evidence API. HTML Trust section and APIs agree on identity, availability, conflicts, and freshness. No trust score or safety language was introduced. Frozen DEX surfaces and PP001 routing remain intact.

**Final certification:** `PP002_PROJECT_PROVENANCE_AND_EVIDENCE_FRAMEWORK_CERTIFIED`

---

## 2. PP001 implementation audit

| Item | Reality at `4b4f2e66` |
| --- | --- |
| Identity types | `CanonicalProjectDocument` + `ProjectField<T>` |
| Provenance | `ProjectFieldSourceClass`, `ProjectFieldAvailability` in `identity/provenance.ts` |
| CAIP | `identity/caip.ts` |
| Resolver | `resolveProjectBySlug` / aliases / `loadCanonicalProjectDocument` |
| HTML flow | `project-hq/[slug]` → `ProjectIdentityShell` |
| Public API | `GET /api/public/projects/{slug}/` → `toPublicProjectJson` |
| Schema | `melega.project-page.v1` |
| Legacy evidence | Flat `CanonicalProjectEvidence[]` summary rows (not claim-linked) |
| Pending taxonomy | Separate `pending/ProvenanceField` — not reused |
| Report | `apps/web/docs/runtime/PP001_CANONICAL_PROJECT_IDENTITY_SHELL_FINAL_REPORT.md` |

---

## 3. Existing provenance structures found

- PP001 `ProjectField` / `CanonicalProjectEvidence` (field meta + summary list)
- Pending registry `ProvenanceField` (different sources; non-canonical)
- Unrelated execution/radar “evidence” strings

**Decision:** extend via `identity/evidence/` submodule composing PP001 source/availability enums — no parallel taxonomy.

---

## 4. Canonical evidence architecture

```
Claim (typed claimType + subject + value)
  ↑ supported by
Evidence records (status, verificationLevel, source, freshness, visibility)
  ↑ may derive from / conflict with
Other evidence records
```

Public pack: `ProjectEvidencePack` (`melega.project-evidence.v1`).

---

## 5. Evidence identity strategy

`evidenceId = ev_` + FNV fingerprint of:

`projectId | claimType | subjectKey | sourceType | sourceReference | normalizedClaimValue`

`conflictGroupId = cg_` + fingerprint of `projectId | claimType | subjectKey`.

Not based on array order or display labels alone.

---

## 6. Subject model

`EvidenceSubjectRef`: `{ subjectType, projectId, subjectId, fieldPath }`

Classes: `PROJECT | ASSET | DEPLOYMENT | CONTRACT | RESOURCE | CAPABILITY | VERIFICATION | READINESS`

---

## 7. Claim-type vocabulary

Controlled enum including identity, official resources, chains/deployments, assets/contracts, Melega verification, control, readiness input. Free-text claim types rejected.

---

## 8. Source-type vocabulary

Reuses PP001: `ONCHAIN | PROJECT_ATTESTED | MELEGA_VERIFIED | THIRD_PARTY | DERIVED | UNKNOWN`  
Optional `sourceSubtype` (e.g. `REGISTRY_DECLARATION`, `REGISTRY_REVIEW`, `READINESS_COMPONENT`).

---

## 9. Status semantics

| Status | Meaning |
| --- | --- |
| ASSERTED | Source made the claim; not independently verified |
| OBSERVED | Directly observed without broader trust claim |
| VERIFIED | Passed a defined verification method |
| REJECTED | Evaluated invalid |
| SUPERSEDED | Replaced by newer evidence |
| EXPIRED | Outside validity window |
| CONFLICTED | Contradicts another active record |
| UNRESOLVED | Cannot be evaluated conclusively |

Registry-authored content is **not** labeled VERIFIED merely for existing.

---

## 10. Verification-level semantics

`NONE | SOURCE_CONFIRMED | CONTROL_CONFIRMED | INDEPENDENTLY_VERIFIED | MELEGA_VERIFIED`  
Separated from status. Does not imply project safety.

---

## 11. Availability semantics

PP001 contract preserved: `AVAILABLE | UNAVAILABLE | NOT_APPLICABLE | STALE | CONFLICTED`.

---

## 12. Freshness model

- Injected `asOf` for deterministic evaluation (no client `Date.now` dependency in core logic)
- No policy + no `expiresAt` → freshness `NONE` (not auto-stale)
- `expiresAt < asOf` → `EXPIRED`
- `maxAgeMs` policy → `STALE` when exceeded
- Stale/expired remain inspectable

---

## 13. Conflict detection model

Eligible claim types include identity fields, official website, supported chain, asset/contract identity/classification, Melega verification.

- Normalize values (URL host/path/slash; CAIP casing)
- ≥2 distinct active values → deterministic `conflictGroupId`
- All conflicting records marked `CONFLICTED`
- No silent winner / source-priority resolution

Production registry has no injected conflicts; fixtures cover conflict cases.

---

## 14. Derived evidence model

- `sourceType` must be `DERIVED`
- Non-empty `derivedFromEvidenceIds`
- Circular / missing / rejected inputs fail validation
- Verification level capped to min of valid inputs
- Used for contract classification + readiness input

---

## 15. Public/private evidence boundary

`visibility: PUBLIC | PRIVATE`  
Private records never enter `toPublicEvidenceJson`. Internal notes/secrets not exposed.

---

## 16. Registry integration

`buildProjectEvidencePack(document, StaticProjectRecord)` maps registry + PP001 normalized document into evidence records. No parallel project DB.

---

## 17. Primary Project API changes

**Decision: backward-compatible additive extension** — keep `schemaVersion: melega.project-page.v1`.

Adds optional `evidenceSummary` (`extension: evidenceSummary.v1`) with counts, availability, conflict/stale counts, and `evidenceApiPath`. Detailed records stay on the evidence endpoint.

---

## 18. Evidence API implementation

`GET /api/public/projects/{slug}/evidence/`

- Same slug/alias resolution as PP001
- Real 404 for unknown/malformed
- Deterministic JSON (`fast-json-stable-stringify`)
- ETag from project revision
- Schema `melega.project-evidence.v1`

---

## 19. Public UX implementation

`TrustEvidencePanel` (restrained add-on to PP001 Trust section):

- Factual summary lines (identity / resources / contracts / control / Melega verification / stale / conflicts)
- Accessible `<details>` disclosures per evidence record
- Conflict block when present
- No “Safe”, “Trusted”, “Low Risk”, or numerical trust score

---

## 20. Trust navigation implementation

PP001 `#trust` nav remains; Trust section now renders the evidence panel when `evidencePack` is present (always for registered projects with built evidence).

---

## 21. Machine-readable contract

Agents can read enums + IDs for subject, claimType, claimValue, source, status, verificationLevel, availability, freshness, conflicts, references, derivation, supersession.

---

## 22. Security controls

- Unsafe source refs rejected (`javascript:`, `data:`, `<script`)
- URL allowlist for http(s)
- Notes sanitized
- JSON via `JSON.stringify` / stable stringify
- No mutation endpoints

---

## 23. Privacy controls

- PRIVATE visibility excluded from public JSON
- No owner submission / editing
- No internal actor identities exposed

---

## 24. Accessibility validation

- Semantic disclosures (`details`/`summary`)
- Keyboard focus-visible styles
- Status/availability/verification in text (not color-only)
- Accessible external links
- Screen-reader status labels

---

## 25. Responsive validation

- Compact summary; disclosures wrap long IDs/addresses
- No fixed trust sidebar / dashboard density
- Mobile order unchanged (Trust remains section 3)

---

## 26. Tests added or changed

**Added:** `identity/evidence/__tests__/pp002.evidence.test.ts` (25 tests)  
**Regression:** PP001 identity suite still green (26 tests)  
**Registry suite:** 83 tests passed

---

## 27. Exact commands executed

```bash
git checkout -B mission-pp002-project-provenance-evidence 4b4f2e66

cd apps/web && yarn test src/registry/projects/
# → 7 files, 83 tests passed

cd apps/web && yarn test src/registry/projects/identity/
# → 51 tests passed (26 PP001 + 25 PP002)

npx prettier --write "src/registry/projects/identity/evidence/**/*.{ts,tsx}" \
  "src/views/ProjectPage/**/*.{ts,tsx}" \
  "src/pages/project-hq/**/*.{ts,tsx}" \
  "src/pages/api/public/projects/**/*.{ts,tsx}" ...

cd apps/web && yarn lint
# → FAIL pre-existing: missing eslint config "next/babel"

cd apps/web && npx tsc --noEmit -p tsconfig.json 2>&1 \
  | rg "identity/evidence|ProjectPage|project-hq|api/public/projects"
# → COUNT=0 (no PP002-scoped errors after Heading scale fix)

cd apps/web && yarn build
# → SUCCESS; routes include /api/public/projects/[slug] and .../[slug]/evidence

# Runtime (yarn start --port 3460)
curl -L /api/public/projects/melega-dex/evidence/ → 200 melega.project-evidence.v1
curl -L /api/public/projects/melega-dex/ → 200 + evidenceSummary
curl /api/public/projects/missing/evidence/ → 404
curl /@melega-dex/ → 200 (evidence pack in page props)
curl /projects/melega-dex/ → 308 → /@melega-dex
Frozen routes → 200
```

---

## 28. Unit-test results

`yarn test src/registry/projects/` → **83 passed** (0 failed).

---

## 29. Integration-test results

No dedicated e2e harness for PP002. Manual production-server curl verification used (section 38).

---

## 30. Build result

`yarn build` → **SUCCESS** (exit 0). Evidence API route listed: `/api/public/projects/[slug]/evidence`.

---

## 31. Lint and TypeScript baseline comparison

| Gate | PP001 baseline | PP002 |
| --- | --- | --- |
| `yarn lint` | Fails: missing `next/babel` | Same failure — **not worsened** |
| Repo `tsc` | Broad pre-existing React/uikit errors | Broad failures remain |
| Scoped tsc (`ProjectPage` + evidence + APIs) | N/A | **0 errors** after fixing invalid `Heading scale="sm"` |

PP002 did not weaken lint/tsconfig. Invalid `scale="sm"` on Heading was corrected to `scale="md"` (valid Scales).

---

## 32. Frozen-surface regression results

| Surface | Result |
| --- | --- |
| Command Center | HTTP 200; untouched |
| Liquidity Studio | HTTP 200; untouched |
| Farms / Pools / Liquidity | HTTP 200; untouched |
| Liquidity Building health API | Present; untouched |
| Wallet / swap / farms/pools logic | Not modified |

---

## 33. PP001 regression results

| Check | Result |
| --- | --- |
| `/@melega-dex/` | 200 |
| `/@melega/` alias | 200 same projectId |
| Legacy `/projects/{slug}` | 308 → `/@melega-dex` |
| `/projects` discovery | 200 |
| Project API | 200 + additive `evidenceSummary` |
| SEO Meta pattern | Preserved (`Component.Meta`) |
| PP001 unit tests | 26/26 pass |

---

## 34. Files created

- `apps/web/src/registry/projects/identity/evidence/**` (schema, types, id, freshness, conflict, derive, build, serialize, load, tests)
- `apps/web/src/pages/api/public/projects/[slug]/evidence.ts`
- `apps/web/src/views/ProjectPage/TrustEvidencePanel.tsx`
- `apps/web/docs/runtime/PP002_PROJECT_PROVENANCE_AND_EVIDENCE_FRAMEWORK_FINAL_REPORT.md`

---

## 35. Files modified

- `identity/index.ts` — export evidence module
- `identity/normalizeProject.ts` — additive `evidenceSummary` on public JSON
- `pages/api/public/projects/[slug].ts` — attach evidence summary
- `pages/project-hq/[slug].tsx` — load/pass `evidencePack`; evidence alternate link
- `views/ProjectPage/ProjectIdentityShell.tsx` — Trust panel integration; Heading scale fix

---

## 36. Known limitations

1. Repo ESLint `next/babel` missing (pre-existing)
2. Repo-wide tsc still fails outside PP002 scope (pre-existing)
3. No automated explorer/audit ingestion — unavailable evidence stated honestly
4. No production conflicts today — conflict paths covered by fixtures
5. Legacy `CanonicalProjectEvidence[]` retained for PP001 JSON compatibility; rich model is `ProjectEvidencePack`
6. API trailing-slash 308 under app `trailingSlash: true`

---

## 37. Deferred PP003+ work

- Readiness and Trust Snapshot (PP003)
- Audit ingestion, control proofs, DNS/ownership workflows
- Numerical scores (explicitly out of scope)
- Continuous monitoring

---

## 38. Exact routes manually inspected

| Route | Result |
| --- | --- |
| `/api/public/projects/melega-dex/evidence/` | 200, `melega.project-evidence.v1`, 40 public records |
| `/api/public/projects/melega-dex/` | 200, `evidenceSummary` parity |
| `/api/public/projects/missing/evidence/` | 404 |
| `/@melega-dex/` | 200, evidence pack present |
| `/@melega/` | 200 |
| `/projects/melega-dex/` | 308 → `/@melega-dex` |
| `/projects/`, `/command-center/`, `/farms/`, `/pools/`, `/liquidity-studio/` | 200 |

---

## 39. Screenshots or runtime evidence

Runtime JSON evidence (2026-07-20, local production server port 3460):

- `schemaVersion: melega.project-evidence.v1`
- `controlEvidenceAvailable: false`
- `activeConflictCount: 0`
- `publicEvidenceCount: 40`
- Primary API `evidenceSummary` matches evidence pack summary fields

---

## 40. Final certification verdict

PP002_PROJECT_PROVENANCE_AND_EVIDENCE_FRAMEWORK_CERTIFIED
