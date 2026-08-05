# MELEGASWAP_V2_PROJECT_DISCOVERY_AND_PROJECT_PAGE_V2

## Verdict

`MELEGASWAP_V2_PROJECT_DISCOVERY_AND_PROJECT_PAGE_V2_COMPLETE`

## Scope

Projects directory + Project Page V2 as primary discovery/conversion surfaces.

Forbidden untouched: Smart Swap logic, contracts, Treasury, fee economics, AMM execution.

## Part 1 — Project directory

- Compact header: List Your Project + Claim Project
- Featured Projects section (same founder catalog as Home)
- Dropdown filters: Status / Chain / Category / Sort

## Part 2 — ProjectCard

- Canonical `ProjectCard` (= `ProjectGridCard`)
- 4-col desktop / 2 tablet / 1 mobile
- Logo, name, symbol, chain badge, Verified/Featured/Trending
- Price, 24h, Liquidity, Volume, Holders + mini spark
- Open Project / Trade — Unavailable when missing (never fake zeros)

## Part 3 — Indexing labels

- `metricUiReasonLabel` / holders → **Unavailable** (never “Source not configured”)

## Part 4–8 — Project Page V2

- New `views/ProjectPage/v2/ProjectPageV2Shell.tsx`
- Wired from `pages/project-hq/[slug].tsx`
- Hero: project info | Smart Swap embed + Chart (1H/24H/7D/30D via existing ProjectCharts)
- Compact market strip
- Project Economy: Liquidity / Farm / Pool CTAs
- Grow Your Project: Featured / Trend Boost / Liquidity / Farm → existing List checkout + studios
- Claim Project compact card

## Validation targets

MARCO · MM72 · EYED · BLION · Desktop 1440/1280 · Mobile 390

## Evidence

Structural tests: `src/lib/__tests__/projectDiscoveryProjectPageV2.test.ts`
