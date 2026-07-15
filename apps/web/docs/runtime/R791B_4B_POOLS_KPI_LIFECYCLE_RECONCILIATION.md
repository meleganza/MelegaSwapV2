# R791B.4B — Pools KPI Lifecycle Reconciliation

**Mission date:** 2026-07-15

## Root cause

Pools lifecycle KPI and hero discovered copy were derived from `reconcilePoolLifecycle(rawPools)` and `previewCards.length` (local sous-pool registry ≈242 entries). The canonical SmartChef classification API (`/api/pools/classification/`) reports different lifecycle totals (239 discovered, 0 active, 229 funded, 0 rewarding) because it uses on-chain verified inventory, not the indexed preview card list.

## Old count sources

| Count | Old source |
|-------|------------|
| discovered | `reconcilePoolLifecycle(rawPools).discovered` (~242) |
| active | local lifecycle derivation on rawPools (~2) |
| funded | local lifecycle derivation (~0) |
| rewarding | `listRewardingPools(previewCards).length` |
| hero discovered | `poolReconciliation.discovered` from local reconcile |

## Canonical source

`usePoolClassificationSummary()` → `GET /api/pools/classification/` → shared `PoolClassificationSummary` / `resolveKpiLifecycleFields()` consumed by:

- `aggregateKpis()` (KPI row)
- `usePoolsStakingRuntime()` (`poolReconciliation`, `rewardingCount`)
- `FeaturedPoolHero` (subtitle discovered count)

## Before → after (production fixture)

| Field | Before | After |
|-------|--------|-------|
| Pools Discovered KPI | 242 | 239 |
| KPI secondary | 2 active · 0 funded · 0 rewarding | 0 active · 229 funded · 0 rewarding |
| Hero subtitle discovered | 242 | 239 |
| Hero title | No active rewarding pools | unchanged |

## Fallback behavior

| State | KPI discovered | KPI secondary | Hero |
|-------|----------------|---------------|------|
| loading | `—` | hidden | loading copy, no stale counts |
| ready | canonical values | canonical secondary | canonical discovered in subtitle |
| unavailable | `Unavailable` | hidden | unavailable message |

Local preview/runtime counts no longer override canonical totals when classification is ready.

## Tests

`apps/web/src/views/PoolsStudio/poolsRuntime/__tests__/poolClassificationSummary.test.ts` — 7 focused tests (READY, local disagree, loading, unavailable, invariants, hero case, parser).

## Deferred discrepancy

**Finished tab visible cards: 240 vs canonical ended: 239** — not fixed in this mission. Lifecycle totals now use canonical `ended=239`; card inventory deduplication is scoped to **R791B.4C — POOLS DUPLICATE CARD INVENTORY ONLY**.

## Files changed

- `poolsRuntime/poolClassificationSummary.ts` (new)
- `poolsRuntime/usePoolClassificationSummary.ts` (new)
- `poolsRuntime/formatPoolsRuntime.ts`
- `poolsRuntime/usePoolsStakingRuntime.ts`
- `components/FeaturedPoolHero.tsx`
- `poolsRuntime/__tests__/poolClassificationSummary.test.ts` (new)
