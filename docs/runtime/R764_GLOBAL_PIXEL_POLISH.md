# R764 — Global Pixel Polish & Founder Acceptance Gate

**Verdict:** `PASS`  
**Final verdict:** `FOUNDER_ACCEPTANCE_READY`  
**Scope:** Final UX mission. Pixel polish only. No runtime, Smart Router, Treasury, KERL, or new functionality.

---

## Mission Summary

Unified the Melega DEX studio surfaces under one institutional product language:

- **Typography:** `STUDIO_KPI_VALUE` (22px / 700 / tabular-nums) aligned with Trade `statValue`
- **Unavailable states:** `displayStudioMetric()` — never em-dash; always `Unavailable` + collapsed `TradeTechnicalDetails`
- **Live badge:** `STUDIO_LIVE_RUNTIME_LABEL` = `Live Runtime` (Title Case) on all studios
- **Navigation trust:** Sidebar `Identity Hub` matches page hero
- **Projects parity:** mobile padding, trending ribbon, KPI alignment
- **Pools polish:** KPI typography, featured metrics, bottom panel overflow

---

## Files Changed

### Design system
- `design-system/melega/tokens/studioDisplay.ts` — **new** shared display helpers
- `design-system/melega/tokens/index.ts` — exports

### Projects
- `views/ProjectsStudio/ProjectsStudioScreen.tsx`
- `views/ProjectsStudio/projectsStudioTokens.ts`
- `views/ProjectsStudio/components/ProjectsKpiRow.tsx`
- `views/ProjectsStudio/components/projectsStudioPrimitives.tsx`

### Pools
- `views/PoolsStudio/components/PoolsKpiRow.tsx`
- `views/PoolsStudio/components/FeaturedPoolHero.tsx`
- `views/PoolsStudio/components/PoolsBottomRow.tsx`
- `views/PoolsStudio/components/PoolsStudioPageHeader.tsx`

### Farms
- `views/FarmsStudio/farmsStudioTokens.ts` — badge casing

### Liquidity / Radar
- `views/LiquidityStudio/components/LiquidityStudioPageHeader.tsx`
- `views/RadarStudio/components/RadarStudioPageHeader.tsx`
- `views/RadarStudio/components/RadarKpiRow.tsx`

### Build / Identity Hub
- `views/BuildStudio/components/BuildKpiRow.tsx`
- `views/CollectiblesStudio/components/CollectiblesKpiRow.tsx`
- `views/CollectiblesStudio/components/collectiblesStudioPrimitives.tsx`
- `views/CollectiblesStudio/components/CollectiblesStudioPageHeader.tsx` — import fix

### Navigation
- `registry/collectibles/identity-hub-collections.config.ts`

### Documentation
- `docs/runtime/FOUNDER_ACCEPTANCE_CHECKLIST.md` — **new**
- `docs/runtime/R764_GLOBAL_PIXEL_POLISH.md`

---

## Founder Checklist

See [`FOUNDER_ACCEPTANCE_CHECKLIST.md`](FOUNDER_ACCEPTANCE_CHECKLIST.md) — 58 PASS / 18 REQUIRES_FOUNDER_REVIEW.

---

## Screenshot Checklist (manual)

Capture at **1728**, **1440**, **1024**, **768**, **430**, **390**, **360** for:

- [ ] Home `/`
- [ ] Trade `/trade`
- [ ] Liquidity `/liquidity-studio`
- [ ] Pools `/pools`
- [ ] Farms `/farms`
- [ ] Projects `/projects`
- [ ] Radar `/radar`
- [ ] Identity Hub `/collectibles`
- [ ] Build `/build-studio`
- [ ] Sidebar expanded + mobile nav

---

## Remaining Observations (not code blockers)

1. **Subgraph / indexer not deployed** — live charts, activity, some KPIs show Unavailable (correct)
2. **BscScan API key** — holders metrics
3. **MasterChef RPC latency** — farms emission may briefly Unavailable
4. **Build Studio body buttons** — wizard uses `Bs*` primitives at workflow step sizes (acceptable)
5. **Sidebar section labels** — HOME/TRADE/EARN ALL CAPS (nav convention, not hero)
6. **List view toggles** — Pools/Farms unwired (pre-existing)
7. **Manual founder screenshot archive** — required for visual lock

---

## Test Plan

```bash
cd apps/web && yarn vitest run \
  src/views/FarmsStudio/__tests__/farmsFounderDisplay.test.ts \
  src/views/PoolsStudio/__tests__/poolsFounderLayout.test.ts \
  src/views/LiquidityStudio/__tests__/liquidityTypography.test.ts
```
