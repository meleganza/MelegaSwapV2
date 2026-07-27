# LIQUIDITY_MODULE_003_POOL_DISCOVERY — Report

## Status

**LIQUIDITY_MODULE_003_POOL_DISCOVERY_CERTIFIED**

## Base

`LIQUIDITY_MODULE_002_ACTIONS_CERTIFIED` @ `c218bd2b`

## Scope

Pool Discovery only — search, factual filters/sorts, factory inventory, subgraph metrics when present, address-based logos, CTA to `/add`.

No deposits, approvals, mint, contracts, or liquidity transaction changes.

## Mount

`/liquidity`: Hero → Actions → Pool Discovery → legacy `views/Pool`

## Geometry (measured)

- Desktop 1440: module 1376px, 3 × ~445px cards, gap 20
- Tablet 1024: 2 columns
- Mobile 390 / 430: 1 column
- No overflow

## Data

- Factory / indexer: `useMelegaFactoryPools` → `/api/indexer/pairs`
- Metrics: `usePoolDatasSWR` when present; otherwise `—`
- Logos: `MelegaTokenAvatar` + address resolver (`chainId` 56)
- Filters / sorts only when factual

## Tests / build

- Vitest: 28/28 (Modules 001–003)
- `next build`: passed

## Freeze

- Module 001 Hero and Module 002 Actions byte-frozen
- `views/Pool` / contracts / liquidity runtime write paths not feature-edited

## Evidence

`apps/web/docs/runtime/liquidity-module-003-pool-discovery/`
