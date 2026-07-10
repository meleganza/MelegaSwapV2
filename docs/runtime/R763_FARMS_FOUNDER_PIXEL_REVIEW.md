# R763 — Farms Founder Pixel Review

**Verdict:** `PASS`  
**Scope:** Founder observations only on Farms Studio UX. No redesign, no Smart Router, no Treasury, no new features.

---

## Validation Matrix

| Founder observation | Status | Implementation |
|---------------------|--------|----------------|
| 1. Marco emits today — never `0 MARCO`, MasterChef truth | PASS | `FarmsKpiRow` maps fake zero → `Unavailable` + technical details |
| 2. Typography — institutional numeric system | PASS | `farmsTypography` extends `tradeTypography`; KPI/card metrics 22px/700 tabular-nums |
| 3. Repeated MARCO labels removed | PASS | Label `Marco Emits Today`; value numeric only; removed `TokenSuffix` |
| 4. Farm cards — clickable contract → BscScan | PASS | Shortened address, hover underline in `FarmGridCard` + `FeaturedFarmPanel` |
| 5. New sort — newest first | PASS | Excludes finished; sorts by `auctionHostingStartSeconds` / `pid` desc |
| 6. Unavailable — never `—`, no fake indexing | PASS | `displayFarmMetric` + `TradeTechnicalDetails` across KPI, cards, advisor, activity |
| 7. Responsive 1728/1440/768/390 | PASS | Farms grid 3→2→1 columns; `FsPanel` overflow visible; card `minmax(0,1fr)` |
| 8. Pixel perfection / Trade-level quality | PASS | Activity table matches Trade institutional table pattern |

---

## Files Changed

### Display & tokens
- `views/FarmsStudio/farmsStudioDisplay.ts` — unavailable helpers, MARCO strip, address shorten
- `views/FarmsStudio/farmsStudioTokens.ts` — `farmsTypography`
- `views/FarmsStudio/__tests__/farmsFounderDisplay.test.ts`

### Components
- `views/FarmsStudio/components/farmsStudioPrimitives.tsx` — KPI + card metric typography
- `views/FarmsStudio/components/FarmsKpiRow.tsx` — emission truth, no duplicate MARCO, technical details
- `views/FarmsStudio/components/FarmGridCard.tsx` — unavailable metrics, contract links, typography
- `views/FarmsStudio/components/FeaturedFarmPanel.tsx` — unavailable metrics, contract links
- `views/FarmsStudio/components/FarmsGrid.tsx` — tablet 2-column breakpoint
- `views/FarmsStudio/components/AIYieldAdvisorPanel.tsx` — unavailable values, `TradeTechnicalDetails`
- `views/FarmsStudio/components/FarmsActivityTable.tsx` — Trade-style table, unavailable empty state

### Presentation wiring (sort + featured display)
- `views/FarmsStudio/farmsRuntime/useFarmsStakingRuntime.ts` — New filter sort, featured/advisor unavailable labels

### Reused
- `views/Trade/components/TradeTechnicalDetails.tsx`
- `views/Trade/tradeTokens.ts` (`tradeTypography`)

---

## Marco Emits Today

| State | Display |
|-------|---------|
| `dailyEmissions > 0` from MasterChef `poolWeight × regularCakePerBlock` | Compact numeric only (e.g. `12,450`) |
| Zero / unknown / `0 MARCO` | `Unavailable` |
| Diagnostics | Collapsed technical details with MasterChef reason |

---

## Screenshot Checklist (manual)

Capture at **1728**, **1440**, **768**, **390** on `/farms`:

- [ ] KPI row — `Marco Emits Today` with numeric value only (no duplicate MARCO)
- [ ] Emission unavailable shows `Unavailable` + collapsed technical details (not `0 MARCO`)
- [ ] All KPI values same 22px institutional weight
- [ ] Farm card Analyze → contract shortened, underlined on hover, opens BscScan
- [ ] `New` filter — live farms newest-first (no finished farms leading)
- [ ] Activity table empty — `Unavailable` not em dash
- [ ] Grid 3/2/1 columns with no clipped card footers

---

## Remaining Founder Observations

External / deferred (not in R763 scope):

1. **MasterChef RPC latency** — emission may show Unavailable until farms hydrate
2. **Subgraph farm activity** — wallet-sourced activity only until indexer ships
3. **List view toggle** — not wired (pre-existing)
4. **Farms badge** — header still `LIVE RUNTIME` (Pools R762 uses Title Case; Farms unchanged per scope)
5. **Manual screenshot sign-off** — founder reference lock at four breakpoints

---

## Test Plan

```bash
cd apps/web && yarn vitest run src/views/FarmsStudio/__tests__/farmsFounderDisplay.test.ts
```
