# Recovery Ledger — Projects Directory V3 Premium Discovery

**Recovery mission:** `MELEGASWAP_V2_PROJECTS_DIRECTORY_V3_PREMIUM_DISCOVERY_RECOVERY`
**Date:** 2026-08-07
**Branch:** `mission-projects-directory-v3-premium-discovery`
**Recovered commit (crashed session):** `c943414c`
**Baseline parent:** `f402413c` (Farms/Pools Analytics Premium Polish)

## Phase 0 findings

| Check | Result |
|-------|--------|
| Branch is mission branch | YES |
| Working tree at recovery start | CLEAN (0 uncommitted) |
| Already committed + pushed | YES (`c943414c` → origin) |
| Reset / checkout other branch | NOT performed |
| Implementation restart | NOT performed |

## Files recovered from crashed session (already in `c943414c`)

### Product
- `apps/web/src/views/ProjectsStudio/ProjectsStudioScreen.tsx` — V3 directory shell
- `apps/web/src/views/ProjectsStudio/projectsDirectoryV3.ts` — multi-axis query, pagination, identity helpers
- `apps/web/src/views/ProjectsStudio/projectsStudioData.ts` — filter/sort constants + card fields
- `apps/web/src/views/ProjectsStudio/components/ProjectsStudioPageHeader.tsx` — compact Discover Projects hero
- `apps/web/src/views/ProjectsStudio/components/ProjectsFilterRow.tsx` — dropdown toolbar + mobile drawer
- `apps/web/src/views/ProjectsStudio/components/ProjectsGrid.tsx` — 28 + Load More, empty Reset, scroll restore
- `apps/web/src/views/ProjectsStudio/components/ProjectGridCard.tsx` — ProjectCard V3
- `apps/web/src/views/ProjectsStudio/components/FeaturedProjectsSection.tsx` — Home `FeaturedProjectsRail` reuse
- `apps/web/src/views/ProjectsStudio/components/projectsStudioPrimitives.tsx` — logoURI passthrough
- `apps/web/src/views/ProjectsStudio/projectsRuntime/formatProjectsRuntime.ts` — listedAt, chain-aware trade hrefs
- `apps/web/src/views/ProjectsStudio/projectsRuntime/useProjectsIntelligenceRuntime.ts` — V3 query state + pagination
- `apps/web/src/lib/token-logo/resolveTokenLogoSources.ts` — chainId+address logo priority
- `apps/web/src/design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar.tsx` — broken-image fallback

### Tests
- `apps/web/src/lib/__tests__/projectsDirectoryV3PremiumDiscovery.test.ts`
- Updates: `founderReviewP0P1Repair.test.ts`, `projectDiscoveryRestructure.test.ts`

### Evidence (crashed session)
- REPORT.md, proofs JSON, browser-acceptance, tests.json, build.json
- Screenshots: Projects-1440, 1280, Trending, ChainFilter, Search-MARCO, 390

## Files completed afterward (recovery session)

- `recovery-ledger.md` (this file)
- `screenshots/Projects-Featured.png` (required by recovery mission; missing from crash commit)
- Updated `REPORT.md` / `browser-acceptance.json` / `tests.json` with recovery verification stamps

## Intentionally preserved design decisions (not discarded)

1. **Trending lives in Sort only** — Status excludes Trending to satisfy “Avoid duplicated Trending controls” / organic honesty. `/trending` → `/projects?sort=trending` remains. Selecting Status=Trending would duplicate the Sort control.
2. **No second Featured pipeline** — Projects hosts `FeaturedProjectsRail` only.
3. **Legacy `FeaturedProjectPanel`** retained in tree but not mounted on V3 screen (no half-migration dual mount).

## Code discarded from crashed session

**None.** No crashed-session product files were reverted or overwritten with older versions.

## Suspect items reviewed

| Item | Verdict |
|------|---------|
| Dual filter systems (pills + dropdowns) | Only dropdown toolbar mounted |
| Duplicate Featured pipelines | Single `FeaturedProjectsRail` |
| Address-only logo cache | Cache key `chainId:address` |
| Giant initial DOM | Initial 28 of 274 + Load More |
| Fake sparklines | Indexer candles only; neutral `—` baseline |
| Temporary console.log / TODO in V3 files | None found in mission surfaces |
| Forbidden surfaces | Untouched |

## Recovery verification

- Mission + Projects / Featured / V5 / routing / Data Truth finalization tests: re-run PASS
- `next build`: re-confirmed (see build.json)
- Browser acceptance: extended with Featured screenshot
