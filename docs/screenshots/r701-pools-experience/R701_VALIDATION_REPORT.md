# R701 — Pools Experience Redesign Validation

**Status:** Local implementation complete — **no commit, no push**  
**Base:** `b8a9ec2` (R600 staging) + R601/R701 working tree

## Build

| Check | Result |
|-------|--------|
| `yarn build` | Pass |

## Screenshots

Path: `docs/screenshots/r701-pools-experience/`

| File | Route |
|------|-------|
| `pools-desktop-1440x900.png` | `/pools` |
| `pools-desktop-1728x1117.png` | `/pools` |
| `pools-mobile-390x844.png` | `/pools` |
| `pools-featured-expanded-1440.png` | `/pools` (Analyze expanded) |

Reference: `assets/MELEGADEX_NEW_POOL_PAGE-2ee4d1b6-3586-4901-b8de-2d82be2b2b38.png`

---

## R701 Deliverables

| Section | Implementation |
|---------|----------------|
| Header | Title POOLS; 3-line subtitle; LIVE RUNTIME + Create Pool |
| Top metrics | 5 equal KPIs: TVL, Active Pools, Total Daily Rewards (USD), Your Active Positions, Featured Pool |
| Featured pool | 65/35 card: 72px APR, daily reward, metrics grid, donut allocation, sustainability bar, contract always visible |
| Bottom buttons | Connect Wallet / Stake / Analyze (equal width); Analyze ↔ Hide Analysis |
| Filters | Single horizontal row, one active chip, mobile scroll |
| Pool grid | 6-line hierarchy + remaining rewards progress bar; expand 220ms with APR History only |
| Create Pool | Single-card builder preview → Build Studio |
| Machine JSON | Hidden `data-melega-pool-v2` on cards + advisor payload `melega.pool.v2` |

---

## UX / Presentation Rules

| Rule | Status |
|------|--------|
| APR clamp >50% → `50%+` (exact in machine JSON) | Yes |
| No 0% on LIVE; ENDED when meaningless budget | Yes |
| One pool type badge per card | Yes |
| Cooldown + Lock Period always visible | Yes |
| Remaining rewards + progress tone (green/yellow/red) | Yes |
| No duplicated metrics in expanded analyze | Yes |
| Design system colors/typography/spacing preserved | Yes |

---

## Files Touched (R701)

- `poolsRuntime/formatPoolPresentation.ts` (new)
- `poolsRuntime/formatPoolsRuntime.ts`
- `poolsRuntime/usePoolsStakingRuntime.ts`
- `poolsStudioData.ts`
- `components/PoolsStudioPageHeader.tsx`
- `components/PoolsKpiRow.tsx`
- `components/FeaturedPoolPanel.tsx`
- `components/FeaturedPoolAllocation.tsx`
- `components/PoolsFilterRow.tsx`
- `components/PoolGridCard.tsx`
- `components/CreatePoolCta.tsx`
- `components/poolsStudioPrimitives.tsx`
- `PoolsStudioScreen.tsx`

---

## Issue Table

| Issue | Severity | Fixed | Remaining |
|-------|----------|-------|-----------|
| Disorganized pool metrics | P0 | Yes | — |
| Missing reward-product mental model | P0 | Yes | — |
| KPI clutter (6+ metrics) | P0 | Yes | 5 KPIs only |
| Featured pool buried in sidebar grid | P0 | Yes | Full-width featured |
| Filter wrap / multi-select | P1 | Yes | Single active chip |
| APR absurd values | P0 | Yes | Clamped display |
| Missing remaining rewards | P0 | Yes | With progress bar |
| Contract hidden | P0 | Yes | Always on featured |
| Machine readability | P1 | Yes | `melega.pool.v2` hidden attrs |
| Create Pool fragmented | P1 | Yes | Single builder card |

---

## Not Changed (per spec)

- Global layout, sidebar, header, ticker, search
- Business logic / on-chain staking flows
- Melega Design System tokens
- Pools modal stake/claim/unstake behavior

---

## Blockers

None for local validation. Awaiting founder approval before commit/push.
