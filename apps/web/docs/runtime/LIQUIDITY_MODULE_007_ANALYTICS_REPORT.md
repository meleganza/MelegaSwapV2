# LIQUIDITY_MODULE_007_ANALYTICS — Report

## Status

**LIQUIDITY_MODULE_007_ANALYTICS_CERTIFIED**

## Base

`LIQUIDITY_MODULE_006_MY_POSITIONS_CERTIFIED` @ `65bf0b07`

## Scope

Read-only Liquidity Analytics after My Positions:

| Card | Source | Honesty |
| --- | --- | --- |
| Liquidity Growth | `useProtocolDataSWR` liquidity (+ factual 24H % when present) | `—` when unavailable |
| Pool Distribution | Factory indexer classification counts | counts only — no fake % |
| Liquidity Activity | mint/burn via `useProtocolTransactionsIndexer` | swaps excluded |
| Provider Activity | none | always `—` + explanation |

No fake TVL/growth/providers/projections. Copy uses **Data unavailable** — never “Awaiting Indexer”.

## Mount

Hero → Actions → Discovery → `[Runtime: Add → Snapshot → My Positions]` → **Analytics** → legacy Pool

Analytics mounts outside `LiquidityRuntimeProvider` (read-only; mint/positions host untouched).

## Geometry (measured 1440)

1376 container · 4 × 329 · gap 20 · module min-height 240 · tablet 2-col · mobile 1-col · no overflow

## Tests / build

- Vitest: 61/61 (Modules 001–007)
- `next build`: passed

## Freeze

Modules 001–006 + mint runtime byte-identical. No Router / Factory writes / Farms / Pools staking / Treasury / KERL / Economics edits.

## Evidence

`apps/web/docs/runtime/liquidity-module-007-analytics/`
