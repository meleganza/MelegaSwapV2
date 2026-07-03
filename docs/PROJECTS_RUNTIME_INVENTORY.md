# Projects Runtime Inventory — R019 Phase A

**Route:** `/projects` (`ProjectsStudioScreen`)  
**Date:** 2026-07-03  
**Mission:** Activate Projects runtime + first AI intelligence layer. No UI/CSS/layout changes.

---

## Route composition

```
pages/projects/index.tsx
  └── ProjectsStudioScreen
        ├── ProjectsRuntimeProvider (NEW — R019)
        ├── TrendingRibbon (live)
        ├── ProjectsStudioPageHeader (unchanged)
        ├── ProjectsKpiRow (runtime — was PROJECTS_KPIS mock)
        ├── FeaturedProjectPanel (runtime — was hardcoded MARCO metrics)
        ├── AIProjectAdvisorPanel (runtime — was AI_ADVISOR_ROWS + hardcoded 92/100)
        ├── ProjectsFilterRow (runtime filter — was local-only chips)
        ├── ProjectsGrid / ProjectGridCard (runtime — was PROJECT_PREVIEW_CARDS)
        └── ProjectsActivityTable (registry events — was PROJECTS_ACTIVITY mock)

pages/projects/[slug].tsx → legacy ProjectDetail (unchanged)
```

---

## Component inventory

| Component | Prior source | Real source (R019) | Replacement | Dependencies | Risk |
|-----------|--------------|-------------------|-------------|--------------|------|
| `projectsStudioData.ts` | All mock arrays | **Types + filter chips only** | Mock exports removed | — | None |
| `projectsRuntime/useProjectsIntelligenceRuntime.ts` | — | `getAllProjects()` + `enrichProject` | New orchestrator | `registry/projects` | Low |
| `projectsRuntime/ProjectsRuntimeContext.tsx` | — | Context provider | New | orchestrator | Low |
| `projectsRuntime/formatProjectsRuntime.ts` | — | Map registry → card/KPI/featured | Card shape preserved | discovery | Low |
| `projectsRuntime/discoverProjectFromContract.ts` | — | Registry token lookup | User confirms discovery | registry | Low |
| `projectsRuntime/marketSources.ts` | — | Source availability matrix | Never fabricate feeds | constants | Low |
| `projectsRuntime/onChainMetrics.ts` | — | Registry capabilities + Unavailable | No fake TVL/holders | — | Low |
| `projectsRuntime/buildAiSummary.ts` | — | Rule-based 4-line summary | Factual only | intelligence | Low |
| `projectsRuntime/buildProjectRating.ts` | — | Heuristic 0–100 score | No ML | intelligence | Low |
| `projectsRuntime/buildProjectHealth.ts` | — | Green/yellow/red dimensions | Rule-based | — | Low |
| `projectsRuntime/buildAiRecommendations.ts` | — | Suggestion list only | No auto-execution | — | Low |
| `projectsRuntime/projectsRuntimeErrors.ts` | — | Machine + human error codes | Phase L | — | Low |
| `projectsRuntime/useProjectsTerminalData.ts` | — | Registry indexing events | Sparse real rows | registry | Low |
| `ProjectsKpiRow` | `PROJECTS_KPIS` | `aggregateKpis()` | Real project counts | runtime | Low |
| `FeaturedProjectPanel` | Hardcoded MARCO $3.21M | Top-rated registry project | MARCO price from farms hook | `usePriceCakeBusd` | Low |
| `AIProjectAdvisorPanel` | `AI_ADVISOR_ROWS` | `advisorRows` + recommendations | Index coverage from sources | machine JSON | Low |
| `ProjectsFilterRow` | Local state only | `setFilter` on live list | Chip → project filter | runtime | Low |
| `ProjectsGrid` | `PROJECT_PREVIEW_CARDS` | `useProjectsRuntime().projects` | Registry projects only | — | Low |
| `ProjectsActivityTable` | `PROJECTS_ACTIVITY` | `useProjectsTerminalData` | Registry + rating events | — | Low |
| `projectsStudioTokens.ts` | PREVIEW LAYOUT | LIVE RUNTIME / LIVE | Label only | — | None |

---

## Mock elimination checklist

| Mock artifact | Status |
|---------------|--------|
| `PROJECTS_KPIS` (1,245 indexed, 2.48M holders) | ✅ Aggregated from registry |
| `PROJECT_PREVIEW_CARDS` (6 fake projects) | ✅ `getAllProjects()` only |
| `AI_ADVISOR_ROWS` | ✅ Live heuristics from rated projects |
| `PROJECTS_ACTIVITY` | ✅ Registry indexing + rating events |
| Featured fake price/TVL/holders | ✅ Unavailable or live MARCO price only |
| PREVIEW badges | ✅ LIVE RUNTIME / LIVE |

---

## Market sources (Phase C)

| Source | Integration | Display |
|--------|-------------|---------|
| Internal Melega Runtime | Registry listed | Available when indexed |
| Explorer | URL builder from contract | Available when contract present |
| Website / Social / GitHub | Registry fields | Available when present |
| CoinGecko / CMC / DexScreener / DexTools | URL stubs only | **Unavailable** until feed confirms |
| TokenSniffer / GoPlus | URL stubs only | **Unavailable** until feed confirms |

---

## Error codes (Phase L)

| Code | Message |
|------|---------|
| `PROJECT_NOT_FOUND` | No project matches this contract in the Melega registry. |
| `NO_METADATA` | Token metadata is not available from registry or explorer. |
| `NO_WEBSITE` | No official website discovered for this project. |
| `NO_SOCIAL` | No social channels discovered for this project. |
| `NO_MARKET_DATA` | Market data is unavailable from integrated sources. |
| `NO_CONTRACT` | No contract address is linked to this project. |
| `INDEXING_PENDING` | Project indexing is in progress — check back shortly. |

---

## Known limitations

- Registry currently lists **1 canonical project** (`melega-dex` / MARCO). Grid shows real count only — no padding with fake cards.
- External market feeds (CoinGecko, DexScreener, etc.) show **Unavailable** until live API integration confirms listings.
- On-chain liquidity, volume, holders, age display **Unavailable** — never estimated.
