# R762 — Pools Founder Pixel Review

**Verdict:** `PASS`  
**Scope:** Founder observations only on Pools Studio UX. No redesign, no runtime, no Smart Router, no Treasury.

---

## Validation Matrix

| Founder observation | Status | Implementation |
|---------------------|--------|----------------|
| 1. Reduce vertical whitespace above hero — match Farms | PASS | Mobile content padding `72px` → `16px` (Farms parity) |
| 2. Hero typography — Farms title size, Title Case, no ALL CAPS | PASS | `MelegaStudioPageHeader` + `STUDIO_PAGE_TITLES.pools`; badge `Live Runtime` |
| 3. Pool grid — no card clipping at 1728/1440/tablet/390 | PASS | Fluid `repeat(3, minmax(0, 1fr))` grid; cards `width: 100%`; expanded `height: auto` |
| 4. Reward Advisor — same top/bottom/height as featured | PASS | Advisor card `300px` = `poolsFeaturedHero.height`; `align-items: stretch` on main grid |
| 5. Live pool cards — spacing, no visual jumps | PASS | Removed fixed expanded max-height; `overflow: visible`; wrap-friendly title row |
| 6. Create Pool card — width and spacing | PASS | `width: 100%`; removed viewport breakout; `min-height` not locked `max-height` |
| 7. Trending — complete asset index | PASS | `getTrendingSurfaceAssets()` — all trending assets, no `slice(0, 4)` cap |
| 8. Runtime — no fake indexing / meaningless placeholders | PASS | Empty grid uses `RUNTIME_UNAVAILABLE_LABEL` + `TradeTechnicalDetails`; bottom panels use unavailable label |

---

## Files Changed

### Pools Studio
- `views/PoolsStudio/PoolsStudioScreen.tsx` — Farms mobile padding, stretch grid, Create Pool width
- `views/PoolsStudio/poolsStudioTokens.ts` — `mobileContentPaddingTop: 16px`, `POOLS_STUDIO_LIVE_LABEL`
- `views/PoolsStudio/components/PoolsStudioPageHeader.tsx` — Title Case live badge
- `views/PoolsStudio/components/PoolsGrid.tsx` — fluid grid, hidden diagnostics
- `views/PoolsStudio/components/PoolGridCard.tsx` — no clipping, auto expand height
- `views/PoolsStudio/components/PoolsSidebar.tsx` — advisor height 300px aligned with featured
- `views/PoolsStudio/components/FeaturedPoolHero.tsx` — empty state height 300px
- `views/PoolsStudio/components/CreatePoolCta.tsx` — spacing, no height lock
- `views/PoolsStudio/components/PoolsBottomRow.tsx` — Title Case titles, unavailable labels
- `views/PoolsStudio/components/PoolsKpiRow.tsx` — featured empty uses `RUNTIME_UNAVAILABLE_LABEL`
- `views/PoolsStudio/__tests__/poolsFounderLayout.test.ts`

### Shared (trending ribbon)
- `views/HomeTrade/useHomeTradeData.ts` — full `getTrendingSurfaceAssets()` index in ticker

### Reused
- `views/Trade/components/TradeTechnicalDetails.tsx`

---

## Screenshot Checklist (manual)

Capture founder reference at **1728**, **1440**, **768**, **390** on `/pools`:

- [ ] Hero top spacing matches Farms (ribbon → title rhythm)
- [ ] Title `Pools` at constitution 44px; badge `Live Runtime` (not ALL CAPS)
- [ ] Featured pool + Reward Advisor equal 300px height, aligned tops
- [ ] Pool grid — 3 columns desktop, 2 tablet, 1 mobile; no clipped cards or badges
- [ ] Analyze expand — content fully visible, no footer overlap
- [ ] Create Pool collapsed card — full width, balanced padding
- [ ] Trending ribbon shows all indexed DEX assets (not 3-project cap)
- [ ] Empty/unavailable states show `Unavailable` — diagnostics collapsed only

---

## Remaining Founder Observations

External / deferred (not in R762 scope):

1. **Subgraph / pool registry** — live pool count and activity may show Unavailable until indexer live
2. **`NEXT_PUBLIC_POOLS_UX_FIXTURE=1`** — dev-only 3-pool fixture; do not use for founder screenshots
3. **Farms badge casing** — Farms still uses `LIVE RUNTIME`; Pools uses Title Case per founder note (intentional divergence)
4. **List view toggle** — toolbar Grid/List exists; list layout (`PoolListCard`) not wired (pre-existing)
5. **Manual screenshot sign-off** — founder captures at four breakpoints for reference lock

---

## Test Plan

```bash
cd apps/web && yarn vitest run src/views/PoolsStudio/__tests__/poolsFounderLayout.test.ts
```
