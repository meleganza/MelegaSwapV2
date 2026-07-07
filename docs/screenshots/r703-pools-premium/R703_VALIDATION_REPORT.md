# R703 Pools Premium — Validation Report

Generated: 2026-07-06
Base URL: http://127.0.0.1:3000

## Build

- `yarn build`: **PASS**

## Layout checks

| Check | Result |
|-------|--------|
| Error boundary on /pools | **none** |
| Featured hero (`data-ps-featured-hero`) | **visible** |
| Sidebar (`data-ps-sidebar`) | **visible** |
| Pool cards in grid | **2** |
| Create Pool below grid | **yes** |
| Top ticker APR | numeric or "No sustainable pool" |
| Forbidden APR strings | **none** |

## Fixes applied this pass

- **Crash fix**: `PoolsBottomRow` used `terminal.rows[0]` — corrected to `terminal.activityRows[0]`.
- **Contract resolution**: `getContractRef` / `normalizeAddress` now resolve chain-keyed `contractAddress` maps via `getAddress`.
- **Visibility**: live BSC pools with emission now surface in grid when APR is sustainable.

## Screenshots

- `docs/screenshots/r703-pools-premium/pools-r703-1440.png` (full page)
- `docs/screenshots/r703-pools-premium/pools-r703-1440-analyze.png` (full page, analyze expanded)
- `docs/screenshots/r703-pools-premium/pools-r703-1728.png`
- `docs/screenshots/r703-pools-premium/pools-r703-390.png`

## RESULT

**R703 PASSED**
