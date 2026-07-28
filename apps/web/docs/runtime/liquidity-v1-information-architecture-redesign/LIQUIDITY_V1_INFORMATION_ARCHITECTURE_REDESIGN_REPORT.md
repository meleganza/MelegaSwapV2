# LIQUIDITY_V1_INFORMATION_ARCHITECTURE_REDESIGN

**Verdict:** `LIQUIDITY_V1_INFORMATION_ARCHITECTURE_REDESIGN_CERTIFIED`

**Severity:** Critical product UX  
**Mode:** Architecture reorder (presentation only)

---

## Before / after hierarchy

| Order | Before (discovery-first) | After (provider-first) |
|------:|--------------------------|------------------------|
| 001 | Hero | Hero (title, artwork, trust; single **Add Liquidity** CTA) |
| 002 | Actions (nav / journey cards) | **50/50 expanded workspace** — Add Liquidity form + AI Liquidity Builder (`NEW`) |
| 003 | Explore Pools | **My Positions** |
| 004 | Add Liquidity (often below discovery) | **Liquidity Insights** (Market Snapshot + Analytics merged) |
| 005 | My Positions | **Explore Pools** (dense market browse, bottom) |
| 006 | Market Snapshot | — |
| 007 | Liquidity Analytics | — |

Measured DOM tops (1440, local build `B8tCjaJLOIaTnJTSpdbFO`):

- Hero `140` → Actions `416` → Positions `1372` → Insights `1580` → Explore `2052`

---

## What changed (presentation only)

- `pages/liquidity.tsx` — provider-first mount order; `data-liquidity-ia="provider-first-v1"`
- `LiquidityActionsModule` — embeds `<LiquidityAddModule embedded />` + `<LiquidityBuildingCard forceExpanded />` with premium **New** badge
- `LiquidityAddModule` — `embedded` stack layout (no second click to open form)
- `LiquidityBuildingCard` — `forceExpanded` starts the builder immediately
- `LiquidityInsightsModule` **(new)** — single “Liquidity Insights” heading; nested Snapshot/Analytics titles suppressed
- Explore — `cardW: 216px`, 6 desktop columns, compact card (logos / pair / status / TVL / Volume / Fees / small Add)
- Hero — journeys strip removed; CTA anchors `#add-liquidity`
- Spacing tokens tightened for compact vertical rhythm

## Explicitly untouched

Liquidity runtime, Router, Factory, mint, approvals, wallet, treasury, economics, contracts, farms/pools/swap engines.

---

## Validation

| Gate | Result |
|------|--------|
| LiquidityStudio `__tests__` | **194 / 194 passed** |
| `yarn next build` | **passed** (`BUILD_ID=B8tCjaJLOIaTnJTSpdbFO`) |
| Forbidden files | **untouched** |
| Desktop 1440 / 1920 | order OK, no horizontal overflow, Explore **6×216px** dense cards |
| Tablet 1024 | order OK, Explore ~4/row |
| Mobile 390 | stacked actions, order OK, Explore 1/row |
| Live verify | `verification.json` → `certifiedCandidate: true` |

### Screenshots

Under `apps/web/docs/runtime/liquidity-v1-information-architecture-redesign/screenshots/`:

- `{1440,1920,1024,390}-above-fold.png`
- `{1440,1920,1024,390}-actions.png`
- `{1440,1920,1024,390}-full.png`

Script: `verify.mjs` → `verification.json`

---

## Final verdict

**LIQUIDITY_V1_INFORMATION_ARCHITECTURE_REDESIGN_CERTIFIED**
