# Radar Runtime Inventory — R020 Phase A

**Route:** `/radar` (`RadarStudioScreen`)  
**Date:** 2026-07-03  
**Mission:** Activate Radar operational intelligence runtime. No UI/CSS/layout changes.

---

## Route composition

```
pages/radar/index.tsx
  └── RadarStudioScreen
        ├── RadarRuntimeProvider (NEW — R020)
        ├── TrendingRibbon (live)
        ├── RadarStudioPageHeader (unchanged)
        ├── RadarKpiRow (runtime — was RADAR_KPIS mock)
        ├── RadarContractIntelligenceInput (runtime — was MOCK_CONTRACT_PREVIEW)
        ├── RadarLiveEventStream (runtime — was LIVE_EVENTS mock)
        ├── RadarFilterRow (runtime filter)
        ├── RadarOpsLeftColumn (runtime — was WHALE_ROWS / SMART_MONEY mock)
        ├── RadarDiscoveriesGrid (runtime — was RADAR_EVENTS mock)
        ├── RadarOpsRightColumn (runtime — was AI_OPPORTUNITY mock)
        └── RadarHeatmapTable (runtime — was HEATMAP_PROJECTS mock)
```

---

## Widget inventory

| Widget | Prior source | Real source (R020) | Replacement | Dependencies |
|--------|--------------|-------------------|-------------|--------------|
| `radarStudioData.ts` | All mock arrays | Types + constants only | Mocks removed | — |
| `radarRuntime/useRadarIntelligenceRuntime.ts` | — | Projects registry via `projectsRuntime` | No duplicate registry | `registry/projects` |
| `buildLiveEvents.ts` | `LIVE_EVENTS` | Registry capability + indexing events | Timestamp, severity, source, confidence | Projects Runtime |
| `buildContractIntelligence.ts` | `MOCK_CONTRACT_PREVIEW` | Projects metadata + source matrix | Unavailable explicit | `marketSources` |
| `buildOpportunityScore.ts` | `AI_OPPORTUNITY` score 96 | Rule-based heuristic | No ML | `buildProjectRating` |
| `buildHeatmap.ts` | `HEATMAP_PROJECTS` fake % | Available=green, Unavailable=gray | No random colors | `buildProjectHealth` |
| `formatRadarRuntime.ts` | `RADAR_EVENTS` | `mapProjectToRadarEvent` | Real projects only | discovery |
| Whale Monitor | `WHALE_ROWS` | Empty + Unavailable label | No fake whales | — |
| Smart Money | `SMART_MONEY_ROWS` | Unavailable | No fabrication | — |
| AI Opportunity Gauge | Hardcoded 96 | `buildOpportunityScore` | Featured project | Projects Runtime |
| Data Sources panel | `DEFAULT_PROVENANCE` all true | `buildMarketSources` availability | Phase J | Projects Runtime |
| Machine JSON | — | Collapsed in right column | Phase M | runtime hook |

---

## Projects integration (Phase B)

Radar consumes **only** `registry/projects` + `projectsRuntime` helpers:

- `discoverProjectFromContract`
- `buildAiSummary`, `buildProjectRating`, `buildProjectHealth`
- `buildMarketSources`, `buildOnChainMetrics`, `buildAiRecommendations`

No second project registry created.

---

## Mock elimination checklist

| Mock artifact | Status |
|---------------|--------|
| `RADAR_KPIS` (12.8K indexed, 287 whales) | ✅ Registry counts |
| `LIVE_EVENTS` (fake whale buys) | ✅ Registry events |
| `RADAR_EVENTS` (4 fake projects) | ✅ `getAllProjects()` only |
| `WHALE_ROWS` / `SMART_MONEY_ROWS` | ✅ Unavailable |
| `AI_OPPORTUNITY` 96 / Strong Buy | ✅ Heuristic score |
| `HEATMAP_PROJECTS` random colors | ✅ Binary available/unavailable |
| `MOCK_CONTRACT_PREVIEW` | ✅ `buildContractIntelligence` |

---

## Error codes (Phase N)

| Code | Message |
|------|---------|
| `NO_RUNTIME_DATA` | Radar runtime has no indexed signals for this scope. |
| `PROJECT_NOT_INDEXED` | Project is not indexed in the Melega registry. |
| `NO_CONTRACT` | No contract address is available for intelligence preview. |
| `NO_MARKET_SOURCE` | No external market source confirmed for this contract. |
| `NO_EXPLORER` | Explorer link is unavailable for this contract. |
| `NO_SOCIAL` | No social channels indexed for this project. |
| `INDEXING_PENDING` | Radar indexing is pending for this project. |

---

## Known limitations

- Whale monitor and smart money require wallet feed integration — display **Unavailable**.
- External market feeds show **Unavailable** until API confirmation.
- On-chain liquidity/volume/holders never estimated.
