# DEX V1 — Global Information Architecture Report

## 1. Final verdict

**DEX_V1_GLOBAL_INFORMATION_ARCHITECTURE_CERTIFIED**

## 2. Branch

`dex-v1-global-information-architecture`

## 3. Mission commit

See git tip after mission commit (this report is included in the mission commit).

## 4. Certified base

- Seal: `PASSPORT_V1_CERTIFIED`
- Tip: `70d2bd19`
- Ancestry: verified (`git merge-base --is-ancestor 70d2bd19 HEAD`)

## 5. Worktree

`/Users/marcomelega/Projects/MelegaSwapV2/MelegaSwapV2-dex-ia`

## 6. Scope

Audit and certify global information architecture across Home, Trade, Discover/Project Pages, List, Liquidity Studio, Farms, Pools, and MARCO Passport.

No page redesign. No feature expansion. Fixes limited to proven IA defects (nav active-state + build-blocking import).

## 7. Product hierarchy

Canonical map: `apps/web/docs/runtime/DEX_V1_CANONICAL_PRODUCT_MAP.md`  
JSON: `docs/runtime/dex-v1-global-information-architecture/canonical-product-map.json`

| Domain | Visible entry | Canonical owner |
| --- | --- | --- |
| Discover | Home `/?focus=projects` + `/@{slug}` | Home / Project Page |
| Trade | Home Instant Swap | Home / `/swap` alias |
| Build | List | `/list` |
| Liquidity | Liquidity | `/liquidity-studio` |
| Earn | Farms · Pools | `/farms`, `/pools` |
| Passport | Passport | `/passport` |

## 8. Canonical route table

See `canonical-route-map.json` and `route-inventory.json`.

| Capability | Canonical URL |
| --- | --- |
| Home | `/` |
| Discover | `/?focus=projects` |
| Trade | `/?focus=swap` |
| Project Page | `/@{slug}` |
| List | `/list` |
| List intents | `/list?intent=…` |
| Liquidity Studio | `/liquidity-studio` |
| Positions / Add / Building | `?view=positions\|add\|building` |
| Farms / Pools | `/farms`, `/pools` |
| Passport | `/passport` |

## 9. Alias and redirect table

See `route-alias-map.json`.

| From | To | Kind |
| --- | --- | --- |
| `/trade` | `/?focus=swap` | Temporary redirect |
| `/projects` | `/?focus=projects` | Temporary redirect |
| `/projects/:slug` | `/@:slug` | Permanent redirect |
| `/@:slug` | `/project-hq/:slug` | Rewrite (public URL preserved) |
| `/send` | `/swap` | Permanent |
| `/staking`, `/syrup` | `/pools` | Permanent |
| `/command-center`, `/portfolio`, `/workspace` | Soft Passport aliases | Soft (Passport nav active) |

## 10. Capability ownership

One operational owner per capability (Swap → Trade; Import/Create/Claim → List; Liquidity ops → Liquidity Studio; Identity → Passport; Yield → Farms/Pools; Presentation → Project Page). Summaries and deep-links allowed; duplicated ops not allowed.

## 11. CTA ownership

Runtime sample in `cta-ownership-map.json`. Primary List intents, Passport → List/Liquidity/Swap, Project Page → Swap/Liquidity/Farms destinations resolve live. No dead CTA sample in certification crawl.

## 12. Desktop navigation

Header: Home · Liquidity · Farms · Pools · List · Passport  
Active-state rule: Project Pages and `/swap` activate **Home** (Discover/Trade parent).

## 13. Mobile navigation

Bottom rail: Home · Liquidity · Farms · Pools · Passport  
List reachable via global header List link (not bottom rail — by design).  
Viewports certified: 390×844, 430×932.

## 14. User-journey results

Journeys A–I exercised via `certify.mjs` against production `next start`.  
`certification-results.json`: **pass: true**, failed: 0.

## 15. Browser-history behavior

Back/forward validated on Project Page ↔ Swap. Deep links survive refresh (`view=building`).

## 16. Wallet return-intent behavior

Connect is modal-based; URL/`view=` preserved on open and cancel. Evidence: `wallet-return-intent-validation.json`, `disconnected-return-flow.png`.

## 17. Project Page integration

Canonical `/@{slug}`; legacy `/projects/:slug` redirects. Parent nav = Home. Swap / Liquidity / Earn deep-links remain owner-correct.

## 18. List integration

Canonical `/list` + intents `import-token`, `create-token`, `create-project`, `claim-project`, `ai-assistant`. Passport Create → `/list?intent=create-project`.

## 19. Liquidity integration

Canonical `/liquidity-studio` with `view=` states. Invalid `view` remains under Liquidity parent (no silent product jump).

## 20. Passport integration

Canonical `/passport`. Deep links to Project Page, Liquidity positions/building, and Swap clear Passport active state after leave. Freeze intact (48/48 SHA checks).

## 21. Trade integration

Canonical trade entry `/?focus=swap`; `/trade` redirects; `/swap` live alias; Home nav active.

## 22. Earn integration

`/farms` and `/pools` remain Earn owners; Project Page participation deep-links to studio routes.

## 23. Error and unavailable states

Documented in `error-state-map.json`. Unknown routes and unknown project slugs load without crash; invalid Liquidity views stay in Liquidity. Distinctions NOT FOUND / UNAVAILABLE / DISCONNECTED / UNAUTHORIZED / UNSUPPORTED remain product-owned (not collapsed to one generic page by this mission).

## 24. Integration defects found

1. **DEFECT-IA-001** — Home inactive on `/swap` and `/@{slug}` Project Pages  
2. **DEFECT-IA-002** — `featuredPairSync` imported missing `scanBlockRangeEvents` export (Next build fail on certified tip)

## 25. Integration defects fixed

Both fixed. Details: `integration-defects.json`.

## 26. Certified-file exceptions

None for Passport / List / Liquidity geometry modules.  
Changed files are shared routing/nav adapters + indexer import path only.

## 27. Frozen-module integrity

`frozen-module-integrity.json` — Passport V1 freeze **ok: true** (48 checks).

## 28. Production mock audit

`production-mock-audit.json` — no production mock hits in scanned Passport/List/nav roots.

## 29. Tests

- `src/app-shell/__tests__/dexUxRebuild.nav.test.ts` — pass  
- `src/app-shell/__tests__/ds0012.globalHeader.test.ts` — pass  
- `src/views/PassportStudio/__tests__/passportV1.finalIntegration.test.ts` — pass  
- Runtime matrix via `certify.mjs` — pass  

## 30. Typecheck

Repo-wide `tsc --noEmit` reports pre-existing errors on certified base (Trade/Trending/tokens; untouched by this mission).  
Mission-scoped TypeScript (app-shell nav contracts + Passport V1 integration tests) — pass.

## 31. Build

`yarn next build` — **pass** (after DEFECT-IA-002 fix).

## 32. Evidence

Directory: `apps/web/docs/runtime/dex-v1-global-information-architecture/`

Required maps + screenshots present (desktop/mobile/nav/invalid/disconnected).

## 33. Remaining honest limitations

- List is not in the mobile bottom rail (discoverable via header).  
- Create Token on List remains Coming Soon (`LIST_CREATE_TOKEN_AVAILABLE=false`).  
- Passport controlled-projects / activity feeds may be empty; no fabricated data.  
- Soft aliases (`/command-center`, `/liquidity`) still render legacy pages while nav marks the canonical parent.  
- Repo-wide `tsc` debt predates this mission.

## 34. Recommended next mission

`DEX_V1_PRODUCTION_SEAL` — performance boundary, soft-alias hard redirects where safe, and repo typecheck debt triage.

## 35. Working-tree status

Clean after mission commit and push. Certification servers stopped.

---

**DEX_V1_GLOBAL_INFORMATION_ARCHITECTURE_CERTIFIED**
