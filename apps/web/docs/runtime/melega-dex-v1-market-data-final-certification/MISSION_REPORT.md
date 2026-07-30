# MISSION REPORT — Market Data Final Certification

**Base:** `acf0680f`  
**Branch:** `melega-dex-v1-market-data-final-certification`  
**Snapshot:** `8dfc18fb82f22345`  
**Status:** `LIVE`  
**BNB/USD:** 571.68 (coingecko)

## Coverage
- Listed Projects: **266**
- Markets: **505**
- Tracked tokens: **20**
- Priced tokens: **4**
- Featured price: **4/4**
- FDV: **4/4**
- Featured volume: **0/4** (field-level unavailable when no 24h swaps)
- Protocol 24H Volume USD: **0** (WBNB-side; local candles currently empty)
- Sanity: **True**

## Canonicalization
- `/api/market-data/snapshot` is the certified dataset
- Home + Liquidity 24H Volume read `volume24hUsd` from it
- Featured prefers `snapshot.featured`
- Shared `lib/market-data/bnbUsd.ts`
- Sanity + last-good retention on corruption

## Deployment blockers (non-app)
- Liquidity Builder mainnet authority
- Create Token fee + mainnet authority
