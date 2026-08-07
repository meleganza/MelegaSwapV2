# MELEGASWAP_V2_PROJECT_PAGE_V5_PIXEL_PERFECT_REBUILD

## Verdict

**MELEGASWAP_V2_PROJECT_PAGE_V5_PIXEL_PERFECT_COMPLETE**

## Summary

Rebuilt the public Project Page as a V5 composition from zero (not a V4 visual patch). Fixed client navigation stalls first, then shipped a single cohesive landing page with progressive hydration.

## Part 0 — Navigation performance

### Root causes (before)
- Soft-nav waited on a 14-document GSP `pageProps` payload
- Project page statically imported Smart Swap into the first chunk (fake `dynamic(Promise.resolve)`)
- Hero blocked on wallet `switchNetworkAsync` (“Aligning wallet…”)
- Holders / farm constant packs competed with first paint
- Featured View used `/project-hq/...` with default Link prefetch of the heavy page

### Fixes
- Slim GSP: identity + markets + participation + readiness + optional tokenomics/roadmap only; `revalidate: 120`
- Real code-split: `ProjectSwapFormIsland` + `dynamic()` for Charts / TradingEmbed
- Non-blocking hero chain align; holders deferred 1.5s
- Featured View → `/@slug` + `prefetch={false}` + `markProjectNavClick`
- Shell marks: click → route → shell → market → chart → swap

### Measured (local prod `next start :3055`)
| Path | Result |
|------|--------|
| Featured View MM72 → shell | route wait **602ms**, shell visible **~2.7s** (no multi-minute stall) |
| Direct `/@mm72` | shell **376ms** |
| Direct `/@marco` | shell **846ms** |
| Featured Trade MM72 → `/swap` | **pass** (&lt;8s) |

## Canonical structure (public)

1. Project Hero (identity + integrated Chart/Smart Swap workspace)
2. Compact market strip (≤8 metrics, `—` when uncertified)
3. Project Economy (exactly Liquidity / Farms / Pools)
4. Boost Your Project (compact 3×2 commercial console)
5. Claim strip (only when unclaimed) / Official chip when claimed
6. About / Community
7. Technical Transparency accordion (collapsed)
8. Related rail (max 4)
9. Footer (app shell)

## Forbidden surfaces untouched

Smart Swap engine, AMM, Router, Contracts, Treasury, Payment Router economics, protocol fees, wallet tx logic, Global Data Truth formulas — **not modified**. Smart Swap is only dynamically mounted.

## Data Truth

`data-truth-pipeline="melega-global-data-truth-v1"` via `useProjectLiveMarket` → `buildProjectTruthMarketFromFeatured`.

## Evidence

Directory: `apps/web/docs/runtime/melegaswap-v2-project-page-v5-pixel-perfect/`

Screenshots: MARCO-1440, EYED-1440, YoungDegens-1440, MARCO-1024, MARCO-390

## Tests / build

- V5 suite + Project Page / Featured / routing / Data Truth regressions: **pass**
- `next build`: **pass** (`/project-hq/[slug]` ISR 120s; page chunk ~37.4 kB)
