# Global Data Indexer Completion

**Mission:** `MELEGASWAP_V2_GLOBAL_DATA_INDEXER_COMPLETION`  
**Verdict:** `MELEGASWAP_V2_GLOBAL_DATA_INDEXER_READY`  
**Branch:** `mission-global-data-indexer-completion`

## Scope

Maximize factual coverage for Home / Farms / Pools / Projects from existing runtime + constants + indexer.  
Never invent metrics. Never touch Smart Swap / AMM / Treasury / fee logic / Liquidity Builder execution.

## Delivered

| Part | Change |
|------|--------|
| 1 Farms | `formatFarmDisplayApr` → `APR unavailable` when uncertified; TVL/rewards/chain preserved; Unavailable replaces bare em-dashes in farm formatters |
| 2 Pools | `volume24h` / `fees` / `chainId` on preview cards; fees show `0%` only when deposit fee is factually 0%; volume stays Unavailable when not indexed |
| 3 Top Farms | Rank TVL → APR → volume proxy → activity; pad to 5 from multichain farm inventory; logos + chain badge |
| 4 Top Pools | Rank TVL → volume → fees → APR; include pools with TVL/rewards even when APR missing; pad to 5 |
| 5 Projects | Enrich + founder pair sparklines via indexer candles; Unavailable when no series |
| 6 New Listings | Multichain rows (logo, symbol, chain, listing date from updates registry or Indexed) |
| 7 Status | User language: Available / Indexed / Unavailable (+ APR unavailable). Removed Source not configured / Waiting explorer from UI maps |

## Forbidden untouched

Smart Swap · AMM contracts · Treasury · fee economics · Liquidity Builder execution
