# Farms & Pools Analytics Premium Polish

**Mission:** `MELEGASWAP_V2_FARMS_POOLS_ANALYTICS_PREMIUM_POLISH`  
**Verdict:** MELEGASWAP_V2_FARMS_POOLS_ANALYTICS_PREMIUM_COMPLETE  
**Date:** 2026-08-07

## Summary

Premium density polish for Farms / Pools explore cards and My positions:

- Compact two-column factual metrics (uncertified → `—`)
- Factual `YieldActivitySparkline` (indexer candles or neutral baseline — never fake oscillation)
- My Farms / My Pools empty modules suppressed
- Provenance audit gate for uncertified farm config identities
- Home Top Farms selection aligned to `compareYieldTruthDesc` (TVL → APR → volume)
- Cross-chain Manage/Stake uses MelegaModal V3 sentence copy

## Provenance

- Farms included/excluded: 471/0
- Pools included/excluded: 188/0

## Acceptance

| Gate | Result |
|------|--------|
| Mission + Data Truth tests | PASS |
| `next build` | PASS |
| Browser acceptance | PASS |
| Screenshots | FarmCard-detail.png, Farms-1280.png, Farms-1440.png, Home-TopFarms-TopPools.png, Mobile-390.png, MyFarms.png, MyPools.png, PoolCard-detail.png, Pools-1280.png, Pools-1440.png |

## Forbidden surfaces

Untouched: MasterChef/MasterBuilder contracts, Router/Factory/AMM, Smart Swap, Treasury, fees, wallet execution core, Global Data Truth formulas.
