# Build Runtime Inventory — R021 Phase A

**Route:** `/build-studio` (`BuildStudioScreen`)  
**Date:** 2026-07-03  
**Mission:** Activate Build Studio as infrastructure orchestrator. No UI/CSS/layout changes.

---

## Route composition

```
pages/build-studio/index.tsx
  └── BuildStudioScreen
        ├── BuildRuntimeProvider (NEW — R021)
        ├── ConstitutionalBanner (unchanged)
        ├── BuildStudioPageHeader (unchanged)
        ├── BuildKpiRow (runtime — was BUILD_KPIS mock)
        ├── ImportTokenPanel (runtime — was static pipeline + fake detections)
        ├── AIBuildAdvisorPanel (runtime — was ADVISOR_DATA)
        ├── SecondRowCards (runtime pools/farms/templates — was FARM_SIMULATION + static templates)
        ├── CreateTokenPanel (runtime preparation — was static deploy links)
        ├── AIValidationEngine (runtime — was VALIDATION_CHECKS)
        ├── AIManifestPanel (runtime — was AI_MANIFEST_PREVIEW)
        ├── OptionalServices (runtime extensions — was OPTIONAL_SERVICES)
        ├── RecentBuildsTable (runtime — was RECENT_BUILDS)
        ├── InfrastructureFlow (static FLOW_STEPS — constitutional copy, acceptable)
        └── TrustedInfrastructurePanel (static TRUSTED_INFRASTRUCTURE_COPY — acceptable)
```

---

## Component inventory

| Component | Prior source | Real source (R021) | Replacement | Dependencies | Risk |
|-----------|--------------|-------------------|-------------|--------------|------|
| `buildStudioData.ts` | All mock arrays | **Types + chain/template constants only** | Mock exports removed | — | None |
| `buildRuntime/useBuildOrchestrationRuntime.ts` | — | Orchestrator hook | New | Projects, Radar, Pools, Farms | Low |
| `buildRuntime/BuildRuntimeContext.tsx` | — | Context provider | New | orchestrator | Low |
| `buildRuntime/buildImportAnalysis.ts` | Static detections | `discoverProjectFromContract` + enrich | Import pipeline | `registry/projects` | Low |
| `buildRuntime/buildInfrastructureScore.ts` | Hardcoded score | Rule-based 0–100 | Projects rating + Radar + capabilities | projectsRuntime, radarRuntime | Low |
| `buildRuntime/buildInfrastructureSuggestions.ts` | Placeholder cards | `buildAiRecommendations` mapped | Operational only | projectsRuntime | Low |
| `buildRuntime/buildValidationChecks.ts` | `VALIDATION_CHECKS` | Dynamic from project state | Green/yellow/red | registry | Low |
| `buildRuntime/buildBuilderTemplates.ts` | `BUILDER_TEMPLATES` | 6 templates + config JSON | Preparation only | — | Low |
| `buildRuntime/buildTokenPreparation.ts` | Static deploy | Gas/ownership/treasury preview | No deployment | — | Low |
| `buildRuntime/buildPoolsFarmsPreview.ts` | `FARM_SIMULATION` | `usePoolsWithVault` + `useFarms` | Live APR/budget | state/pools, state/farms | Low |
| `buildRuntime/buildManifest.ts` | `AI_MANIFEST_PREVIEW` | Runtime JSON from project | Copy/download | registry | Low |
| `buildRuntime/buildAdvisor.ts` | `ADVISOR_DATA` | Next action + confidence | Projects/Radar/Pools/Farms | runtimes | Low |
| `buildRuntime/buildExtensions.ts` | `OPTIONAL_SERVICES` | Radar/Projects/Trending/Space/Labs/SmartDrop | Availability + requirements | capabilities | Low |
| `buildRuntime/formatBuildRuntime.ts` | `BUILD_KPIS`, `RECENT_BUILDS` | Aggregated KPIs + registry events | Timeline only | registry | Low |
| `buildRuntime/buildRuntimeErrors.ts` | — | Machine + human error codes | Phase M | — | Low |
| `ImportTokenPanel` | Mock pipeline | `runAnalysis` + live detections | Contract → score → suggestions | runtime | Low |
| `AIBuildAdvisorPanel` | Static advisor | `advisor` from runtime | D87 contribution estimate | runtime | Low |
| `BuildKpiRow` | `BUILD_KPIS` | `aggregateBuildKpis()` | Real counts | runtime | Low |
| `CreateTokenPanel` | Deploy links | `tokenPreparation` | Deploy button disabled | runtime | Low |
| `SecondRowCards` | Farm simulation | `poolPreview` + `farmPreview` + templates | Create buttons disabled | runtime | Low |
| `AIManifestPanel` | Static JSON | `manifest` generated | Version + timestamp | runtime | Low |
| `OptionalServices` | Static services | `extensions` with status | No pricing | runtime | Low |
| `RecentBuildsTable` | `RECENT_BUILDS` | `buildRecentBuilds()` | Registry timeline | registry | Low |
| `AIValidationEngine` | `VALIDATION_CHECKS` | `validationChecks` | Dynamic | runtime | Low |

---

## Mock elimination checklist

| Mock artifact | Status |
|---------------|--------|
| `BUILD_KPIS` (fake indexed counts) | ✅ Aggregated from registry + pools/farms |
| `ADVISOR_DATA` (hardcoded next action) | ✅ `buildAdvisorData()` from runtimes |
| `FARM_SIMULATION` (estimated APR/TVL) | ✅ `buildFarmPreviewFromRuntime()` |
| `BUILDER_TEMPLATES` (static list) | ✅ `buildBuilderTemplates()` + config JSON |
| `VALIDATION_CHECKS` (static green rows) | ✅ `buildValidationChecks()` |
| `RECENT_BUILDS` (placeholder rows) | ✅ Registry capability events |
| `AI_MANIFEST_PREVIEW` (static JSON) | ✅ `buildAiManifest()` |
| `OPTIONAL_SERVICES` (marketing cards) | ✅ `buildInfrastructureExtensions()` |
| Import detections (fake ticker/name) | ✅ From registry discovery |
| Infrastructure score (hardcoded) | ✅ `buildInfrastructureScore()` |

---

## Runtime integration map

| Runtime | Consumed by Build Studio | Usage |
|---------|-------------------------|-------|
| Projects Runtime | Import, score, suggestions, advisor, manifest | `discoverProjectFromContract`, `enrichProject`, `buildAiRecommendations` |
| Radar Runtime | Infrastructure score, advisor | `buildOpportunityScore` |
| Pools Runtime | KPIs, pool preview, advisor, extensions | `usePoolsWithVault`, APR formatting |
| Farms Runtime | KPIs, farm preview, advisor, extensions | `useFarms`, multiplier/APR |

---

## Error codes (Phase M)

| Code | Message |
|------|---------|
| `PROJECT_NOT_FOUND` | No project matches this contract in the Melega registry. |
| `NO_CONTRACT` | Paste a valid contract address to begin import analysis. |
| `POOL_RUNTIME_UNAVAILABLE` | Pools runtime is unavailable on this network. |
| `FARM_RUNTIME_UNAVAILABLE` | Farms runtime is unavailable on this network. |
| `INFRASTRUCTURE_INCOMPLETE` | Core infrastructure checks are incomplete for this project. |
| `PROJECT_ALREADY_IMPORTED` | This project is already indexed in the Melega registry. |
| `NETWORK_UNAVAILABLE` | Switch to a supported network to continue. |

---

## Known limitations

- **No deployment execution** — Create Token/Pool/Farm buttons are disabled; preparation only.
- **Gas estimation** — Displays `Unavailable` until dedicated launch runtime provides estimates.
- **Registry scale** — Currently 1 canonical project (MARCO); KPIs reflect real counts only.
- **External feeds** — Market sources show Unavailable when not confirmed (inherited from Projects Runtime).
- **InfrastructureFlow** — Constitutional step labels remain static (`FLOW_STEPS`); not a runtime surface.
