# LIQUIDITY_MODULE_005_MARKET_SNAPSHOT — Report

## Status

**LIQUIDITY_MODULE_005_MARKET_SNAPSHOT_CERTIFIED**

## Base

`LIQUIDITY_MODULE_004_ADD_LIQUIDITY_CERTIFIED` @ `2566006c`

## Scope

Read-only Market Snapshot after Add Liquidity:

| Card | Source | Honesty |
| --- | --- | --- |
| Total Liquidity | `useProtocolDataSWR` | `—` when unavailable |
| Active Pools | Factory indexer tradeable/funded count | factual count when ready |
| 24H Volume | `useProtocolDataSWR` | `—` when unavailable |
| Liquidity Providers | none | always `—` + explanation |

No fake TVL/volume/users/APR. No “Awaiting Indexer”. Every card exposes source, timestamp, status.

## Mount

Hero → Actions → Discovery → Add → **Market Snapshot** → legacy Pool

## Geometry (measured 1440)

1376 container · 4 × 329 · gap 20 · tablet 2-col · mobile 1-col · no overflow

## Tests / build

- Vitest: 45/45 (Modules 001–005)
- `next build`: passed

## Freeze

Modules 001–004 + mint runtime untouched. No Router/Factory/contracts edits.

## Evidence

`apps/web/docs/runtime/liquidity-module-005-market-snapshot/`
