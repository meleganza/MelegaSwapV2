# PP001 — Canonical Project Identity Shell — Final Report

**Mission:** PP001 — CANONICAL PROJECT IDENTITY SHELL  
**Branch:** `mission-pp001-canonical-project-identity-shell`  
**Date:** 2026-07-20  
**Base commit:** `0e10c0ac` (R791E.8)

---

## 1. Executive verdict

PP001 establishes the canonical public Project Page identity foundation at `/@{projectSlug}`, backed solely by the existing Melega Project Registry (`STATIC_PROJECTS` / UPI). HTML shell and public JSON share one normalized document. Unknown/malformed slugs return real 404s. Legacy `/projects/{slug}` permanently redirects to `/@{slug}`. Discovery `/projects` is preserved. Frozen DEX studios were not modified.

**Final certification:** `PP001_CANONICAL_PROJECT_IDENTITY_SHELL_CERTIFIED`

---

## 2. Repository reality audit

| Surface | Pre-PP001 reality |
| --- | --- |
| Discovery | `/projects` → `ProjectsStudioScreen` (`pages/projects/index.tsx`) |
| Detail | `/projects/[slug]` SSG `ProjectDetail` via `getProjectBySlug` + `serializeProjectManifest` |
| Registry | `apps/web/src/registry/projects/` — `StaticProjectRecord`, `projects.data.ts` (only `melega-dex`), `upi` as immutable identity |
| Pending tier | `registry/projects/pending/` with different provenance taxonomy |
| Machine JSON | Static `/registry/projects/{slug}.json` + well-known index; no dynamic public GET API |
| Scoring | `discovery.computeCivilizationReadiness` (ecosystem integration, not safety) |
| `/@*` routes | None |
| SEO on detail | Weak / DefaultSeo-dominated |
| Frozen studios | Command Center, Liquidity Studio, Farms, Pools, Liquidity Building — out of scope |

---

## 3. Pre-existing Project Registry architecture

- Single static list: `STATIC_PROJECTS` in `projects.data.ts`
- Identity key: `upi` (e.g. `upi://melega/project/melega-dex@1`)
- Public slug: `slug` (`melega-dex`)
- Tokens under `resources.tokens` (not project identity)
- Capabilities as status cells; deep links present but unused by PP001 actions
- Intelligence helpers + Civilization Readiness in `discovery.ts` / `intelligence.ts`

PP001 **does not** create a parallel database or mock registry.

---

## 4. Implemented route architecture

| Public URL | Mechanism | Internal |
| --- | --- | --- |
| `/@{slug}/` | `next.config.mjs` rewrite | `/project-hq/[slug]` |
| `/projects/{slug}/` | permanent redirect (308) | `/@{slug}/` |
| `/projects/` | unchanged | discovery |
| `GET /api/public/projects/{slug}/` | API route | normalized JSON |

Case-normalization: mixed-case path → permanent redirect to lowercase via `getStaticProps` (`fallback: 'blocking'`).

---

## 5. Canonical identity model

Module: `apps/web/src/registry/projects/identity/`

- `projectId` = registry `upi` (immutable; not token/address/slug)
- Canonical public slug remains registry `slug`
- Optional `aliases` on `StaticProjectRecord` (e.g. `melega` → same `upi`)
- Normalized document: `CanonicalProjectDocument` (`schemaVersion: melega.project-page.v1`)

---

## 6. Slug and alias behavior

- Valid: `melega-dex`, `Melega-DEX` (redirect), `@melega-dex` stripped
- Alias: `/@melega/` resolves same `projectId`; `canonicalUrl` stays `/@melega-dex/`; alias view `noindex,follow`
- Unknown: HTTP 404
- Malformed (`../`, spaces, etc.): fail closed → 404
- Symbol/address helpers may resolve a project for search; **never** become canonical URLs

---

## 7. Legacy-route compatibility

- `/projects/{slug}` → `/@{slug}` permanent redirect in `next.config.mjs`
- Detail page `pages/projects/[slug].tsx` **removed** (GSP `redirect` incompatible with this app’s prerender/export)
- Discovery `/projects` retained
- Limitation: old `ProjectDetail` experience is no longer served; one identity shell only

---

## 8. Project / asset / deployment / contract distinctions

Normalized from registry without inventing markets:

- **Project** — UPI identity, display, purpose, type, lifecycle, categories, verification, readiness
- **Asset** — CAIP-19 ERC-20 refs from `resources.tokens`
- **Contract** — CAIP-10 token contracts + derived explorer URLs
- **Deployment** — per `supportedChains` entry with associated contract IDs
- **Resource / Evidence / Capability** — validated URLs; registry evidence; descriptive capability states only

---

## 9. Provenance and availability implementation

Typed in `identity/provenance.ts`:

- Sources: `ONCHAIN | PROJECT_ATTESTED | MELEGA_VERIFIED | THIRD_PARTY | DERIVED | UNKNOWN`
- Availability: `AVAILABLE | UNAVAILABLE | NOT_APPLICABLE | STALE | CONFLICTED`
- Missing logo/purpose/decimals stay `UNAVAILABLE` with `null` value (never coerced to zero)
- Conflicts (same CAIP-10, different symbols) surface as conflicted evidence, not silent merge

---

## 10. Chain identifier conventions

Local CAIP helpers (`identity/caip.ts`), no new dependency:

- CAIP-2: `eip155:{chainId}`
- CAIP-10: `eip155:{chainId}:{address}`
- CAIP-19: `eip155:{chainId}/erc20:{address}`
- EVM address normalized lowercase; malformed rejected
- Non-EVM chains not assumed; only registry EVM chain IDs used today

---

## 11. Public UX implementation

`views/ProjectPage/ProjectIdentityShell.tsx` — calm identity shell:

1. Identity hero (logo fallback when unavailable)
2. Primary verified facts
3. Trust state (not safety)
4. Overview
5. Chains / deployments
6. Official resources
7. Assets / contracts (mobile order via `$mobileOrder`)

No Buy/Swap/fake action grids. Nav only for sections with real data (Overview / Trust / Ecosystem). Participate/Updates omitted when empty.

---

## 12. Machine-readable endpoint

`GET /api/public/projects/{slug}/` → deterministic JSON via `fast-json-stable-stringify`

- Same `normalizeProjectDocument` as HTML
- `schemaVersion`, `revision`, ETag, Cache-Control
- Unknown/malformed → `{ ok:false, reason:'NOT_FOUND' }` HTTP 404
- Note: app `trailingSlash: true` redirects non-slash API URLs with 308

---

## 13. JSON-LD and SEO implementation

Via `ProjectHqPage.Meta` (required by `_app-full` `Component.Meta` pattern so tags enter static HTML head):

- title, description, canonical `/@{canonicalSlug}/`
- Open Graph + Twitter
- `alternate` `application/json`
- JSON-LD `Organization` from sanitized fields (no invented founding date/price/rating)

**Evidence (production server, 2026-07-20):**  
`/@melega-dex/` HTML head contains title `Melega DEX | Melega DEX Project`, canonical `https://www.melega.finance/@melega-dex/`, `application/ld+json` Organization.

---

## 14. Security controls

- Plain-text sanitize (strip HTML/control chars)
- URL allowlist `http:`/`https:` only; reject `javascript:`, credentials, etc.
- JSON-LD via `JSON.stringify`
- No owner mutation / claim flows
- Private pending-registry fields not exposed
- Verification labels tied to provenance classes

---

## 15. Accessibility validation

Implemented in shell + source tests:

- `h1`/`h2`/`h3` hierarchy, `main` landmark, section nav
- Focus-visible styles, 44px touch targets
- Accessible copy buttons + external-link names (“opens in a new tab”)
- Logo alt / neutral fallback
- Screen-reader verification prefix
- `prefers-reduced-motion` disable

---

## 16. Responsive validation

- Max content width 720px; no dashboard density
- Mobile CSS order 1→7 as specified
- Contract addresses wrap + copy control
- Source-contract tests assert `$mobileOrder` hooks

---

## 17. Tests added or changed

**Added:** `apps/web/src/registry/projects/identity/__tests__/pp001.identity.test.ts` (26 tests)

Covers: resolution, aliases, 404/malformed, no-token / one-token / multi-asset+chain, collisions, unavailable/stale/conflict, URL rejection, HTML/JSON parity, schema version, SEO source contract, no fake actions, a11y/responsive source checks, discovery + frozen route presence.

**Changed:** `getProjectBySlug` resolves aliases/case; `StaticProjectRecord` optional identity fields; `melega-dex` aliases/`projectType`/`lifecycleStatus`.

---

## 18. Exact commands executed

```bash
# Unit tests
cd apps/web && yarn test src/registry/projects/
# → 6 files, 58 tests passed

cd apps/web && yarn test src/registry/projects/identity/__tests__/pp001.identity.test.ts
# → 26 passed

# Format (PP001 scoped)
npx prettier --write "apps/web/src/registry/projects/identity/**/*.{ts,tsx}" \
  "apps/web/src/views/ProjectPage/**/*.{ts,tsx}" \
  "apps/web/src/pages/project-hq/**/*.{ts,tsx}" \
  "apps/web/src/pages/api/public/projects/**/*.{ts,tsx}" \
  "apps/web/next.config.mjs"

# Lint (repo-standard)
cd apps/web && yarn lint
# → FAILS pre-existing: ESLint couldn't find config "next/babel" (.eslintrc)
#   Also reported during next build; build continues.

# Typecheck
cd apps/web && npx tsc --noEmit -p tsconfig.json
# → FAILS pre-existing (React types / unrelated modules). next.config ignoreBuildErrors: true

# Production build
cd apps/web && yarn build
# → SUCCESS (94 pages; includes /project-hq/melega-dex, /project-hq/melega, /api/public/projects/[slug])

# Manual runtime checks
yarn start --port 3458
curl /@melega-dex/          → 200 + SEO head PASS
curl /@melega/              → 200 same projectId
curl /@does-not-exist/      → 404
curl /projects/melega-dex/  → 308 → /@melega-dex
curl -L /api/public/projects/melega-dex/ → 200 schema melega.project-page.v1
curl /api/public/projects/does-not-exist/ → 404 JSON
curl /projects/ /command-center/ /liquidity-studio/ /farms/ /pools/ /liquidity/ → 200
```

---

## 19. Build, lint, typecheck and test results

| Gate | Result | Evidence |
| --- | --- | --- |
| Unit tests (registry + PP001) | PASS | 58/58 |
| `next build` | PASS | exit 0; routes listed |
| Prettier (scoped) | PASS | written clean |
| `yarn lint` | FAIL (pre-existing) | missing `next/babel` eslint config |
| `tsc --noEmit` | FAIL (pre-existing) | widespread unrelated TS errors; Next skips type validation |
| Integration/e2e suite | Not run | no PP001 e2e harness; manual curl verification used |

PP001 does not introduce the lint/tsc environment failures; production build succeeds as the repository’s standard ship gate.

---

## 20. Frozen-surface regression results

| Surface | Result |
| --- | --- |
| Command Center `/command-center/` | HTTP 200; page file untouched |
| Liquidity Studio `/liquidity-studio/` | HTTP 200; untouched |
| Farms `/farms/` | HTTP 200; untouched |
| Pools `/pools/` | HTTP 200; untouched |
| Liquidity `/liquidity/` | HTTP 200; untouched |
| Liquidity Building API | `pages/api/liquidity-building/health.ts` present; untouched |
| Forbidden files (`exchange.ts`, contracts, router, wallet, swap logic, MasterChef, NFT, token lists) | Not modified by PP001 |

---

## 21. Files created

- `apps/web/src/registry/projects/identity/**` (provenance, caip, normalize, resolve, types, urlSafety, tests, index)
- `apps/web/src/views/ProjectPage/ProjectIdentityShell.tsx`
- `apps/web/src/pages/project-hq/[slug].tsx`
- `apps/web/src/pages/api/public/projects/[slug].ts`
- `apps/web/docs/runtime/PP001_CANONICAL_PROJECT_IDENTITY_SHELL_FINAL_REPORT.md`

---

## 22. Files modified

- `apps/web/next.config.mjs` — `/@` rewrite + `/projects/:slug` permanent redirect
- `apps/web/src/registry/projects/types.ts` — optional aliases/logo/projectType/lifecycle
- `apps/web/src/registry/projects/projects.data.ts` — melega aliases + type/lifecycle
- `apps/web/src/registry/projects/getProjectBySlug.ts` — alias/case resolution
- `apps/web/src/pages/projects/[slug].tsx` — **deleted** (replaced by config redirect)

---

## 23. Known limitations

1. Repo ESLint config broken (`next/babel` missing) — pre-existing  
2. Repo `tsc` fails broadly — pre-existing; Next build ignores types  
3. Only one registered project (`melega-dex`) in static registry  
4. No logo URL in registry → neutral fallback  
5. Token decimals/names unavailable in static registry → UNAVAILABLE  
6. Capability declarations descriptive only — no Project Page transactional actions  
7. Participate/Updates nav deferred until real data exists  
8. Static `/registry/projects/*.json` manifests remain; public API is additive  
9. API requires trailing slash under app `trailingSlash: true` (308 otherwise)

---

## 24. Deferred PP002+ work

- Participate / Trust deep sections beyond identity summary  
- Updates / announcements  
- Owner claim / editing  
- Transactional capabilities on Project Page  
- Broader registry population  
- Non-EVM CAIP profiles when chains are registered  
- Optional migration of discovery cards to link `/@{slug}` directly (redirect already works)

---

## 25. Screens or routes manually inspected

| Route | Result |
| --- | --- |
| `/@melega-dex/` | 200; SEO + `__NEXT_DATA__` identity |
| `/@melega/` | 200; same `projectId`; canonical `/@melega-dex/` |
| `/@does-not-exist/` | 404 |
| `/@has%20space/` | 404 |
| `/projects/melega-dex/` | 308 → `/@melega-dex` |
| `/api/public/projects/melega-dex/` | 200 JSON v1 |
| `/api/public/projects/melega/` | 200 same identity |
| `/api/public/projects/does-not-exist/` | 404 JSON |
| `/projects/` | 200 discovery |
| Frozen DEX routes listed above | 200 |

---

## 26. Final certification verdict

PP001_CANONICAL_PROJECT_IDENTITY_SHELL_CERTIFIED
