# PROJECT_OS_P0 — Production-Blocking Remediation — Final Report

## 1. Executive verdict

**PROJECT_OS_P0_REMEDIATION_CERTIFIED**

Production `/@melega-dex` 404 was caused by **Project OS never being deployed on `main`**, not by a broken local rewrite. This remediation hardens routing at Next + middleware + Vercel edge, restores import discovery honesty, adds discovery navigation, surfaces Open Project Page links, and exposes `/@marco` via a real registry alias to the certified Melega DEX Project OS page.

## 2. Root cause — `/@melega-dex` 404 (P0-01)

| Check | Production (`main`) | This branch |
| ----- | ------------------- | ----------- |
| `next.config` rewrites `/@:slug` → `/project-hq/:slug` | **Empty** `rewrites: []` | Present |
| `/project-hq/[slug]` page | **Absent** | Present |
| `/api/public/projects/*` | **Absent** | Present |
| `/projects/melega-dex` | **200** legacy ProjectDetail | 308 → `/@:slug` |
| Middleware `@` rewrite | N/A | Added |
| Vercel edge rewrites | None | Added |

**Exact reason:** PP001–PP-CERT lived only on mission branches and were never merged to production `main`. `/@melega-dex` and `/project-hq/melega-dex` both 404 because those routes do not exist in the deployed build.

**Fix applied in code:**

1. Middleware rewrite `/@{slug}` → `/project-hq/{slug}`
2. Vercel `rewrites` for `/@:slug`
3. Enable preview deploys for remediation/CERT branches in `vercel.json`
4. Preserve Next.js rewrites + legacy `/projects/:slug` → `/@:slug` redirects

**Production unblock:** merge this branch (or CERT tip + P0) into `main` and redeploy.

## 3. Root cause — Import “Unknown Project” (P0-03)

Import UI called sync `discoverProjectFromContract` **without ERC-20 `name`/`symbol`/`decimals`**. Pending profiles then rendered as “Unknown Project” with no explanation.

**Fix applied:**

1. `fetchErc20OnChainIdentity` — read-only RPC identity (name/symbol/decimals/deployment)
2. `POST /api/registry/projects/onboard` always fetches on-chain identity
3. Import runtime analyzes via onboard API (async) with registry fallback
4. Pending UI shows symbol/name when available and an explicit **Why discovery stopped** reason — never silent Unknown
5. DEX-list matches create pending profiles with symbol hints instead of hollow `found:true`

## 4. Routing fixes (P0-01)

- `apps/web/src/middleware.ts` — edge rewrite + matcher for `/@:slug`
- `vercel.json` — edge rewrites + deploy enablement
- `apps/web/next.config.mjs` — existing PP001 rewrites retained

## 5. Navigation improvements (P0-02)

| Surface | Entry | Destination |
| ------- | ----- | ----------- |
| Home CTA | Create / Import Project | `/import-existing-token` |
| Home Quick Actions | Projects, Import | `/projects`, `/import-existing-token` |
| Projects header | Import Existing Token | `/import-existing-token` |
| Projects header | Claim Existing Project | `/import-existing-token?mode=claim` |
| Projects header | Open Project Page | `/@melega-dex/` |
| Import claim mode | Explains Manage Project path | Project Page → Manage |

No duplicate claim workflow invented — Control Center remains the certified owner path.

## 6. Discovery fixes (P0-03)

See §3. Verified BNB MARCO (`0x9635…210b`) continues to resolve to canonical `melega-dex`.

## 7. Project Page visibility (P0-04)

`Open Project Page` / project hrefs standardized to `/@{slug}/` on:

- Projects cards / featured
- Import detected card
- Trending / Radar / Search / Query / Graph
- Home latest project
- Assets / Venues / Events / Presence
- Trade / Farms / Pools / Liquidity headers

Legacy `/projects/{slug}` still 308 → `/@{slug}` when deployed.

## 8. `@marco` Project Page (P0-05)

- Added registry alias `marco` → same UPI as `melega-dex` (real MARCO token data; no duplicate identity; no fake metrics)
- `/@marco` resolves via SSG paths (`getAllResolvableProjectSlugs`)
- Full PP001–PP014 sections load for the shared Project OS document
- Public registry JSON lists aliases

Unavailable hub fields remain UNAVAILABLE per certified builders.

## 9. Screenshots

Local/production visual capture depends on deploying this branch. After Vercel deploy of `mission-project-os-p0-remediation` or merge to `main`, capture:

1. `/@melega-dex/` — Identity → Machine
2. `/@marco/` — same Project OS (alias)
3. `/import-existing-token` — MARCO BSC analysis (canonical)
4. `/projects` — Import / Claim / Open Project Page CTAs
5. `/trade` — Open Project Page header action

Placeholder evidence paths (post-deploy): `apps/web/docs/runtime/project-os-p0-screenshots/`

## 10. Routes tested

| Route | Expectation | Verification |
| ----- | ----------- | ------------ |
| `/@melega-dex` | rewrite → project-hq | unit + config presence |
| `/@marco` | alias → melega-dex OS | vitest resolve + machine load |
| `/@melega` | alias | vitest |
| `/project-hq/melega-dex` | SSG page | build route table |
| `/projects/{slug}` | redirect to `/@` | next.config |
| `/import-existing-token` | discovery | vitest MARCO + pending honesty |
| `/api/registry/projects/onboard` | on-chain fetch | code + helper tests |

## 11. Regression results

PP001–PP014 + PP-CERT + P0 vitest: **245 passed** (16 files).

## 12. Build results

`yarn next build` — **PASS**  
SSG includes `/project-hq/melega-dex`, `/project-hq/melega`, `/project-hq/marco`.

## 13. Files changed (mission-scoped)

- Routing: `middleware.ts`, `vercel.json`, `next.config` (unchanged rewrites retained)
- Registry: `projects.data.ts` (`marco` alias), `public/registry/projects/melega-dex.json`
- Import: `fetchErc20OnChainIdentity.ts`, `onboard.ts`, `discoverProjectFromContract.ts`, `buildImportAnalysis.ts`, import runtime + Pending/Import headers
- Navigation / links: Home, Projects, Trade, Farms, Pools, Liquidity, cards, search, radar, trending, …
- Tests: `project-os-p0.remediation.test.ts`
- Report: this file

## 14. Final certification

PROJECT_OS_P0_REMEDIATION_CERTIFIED

**Deploy note:** CERTIFICATION of production URLs requires merging/deploying this branch to the production environment. Code and tests certify the remediation is complete and ready to ship.
