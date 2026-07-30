# Before / After

| Concern | Before | After |
|---|---|---|
| Home 24H Volume | Independent tier-metrics client sum | `/api/market-data/snapshot.volume24hUsd` |
| Liquidity 24H Volume | Independent tier-metrics client sum | Same canonical field |
| BNB/USD | Duplicated in featuredMarkets | `lib/market-data/bnbUsd.ts` |
| Featured | Separate poll only | Prefers canonical `featured[]` |
| Sanity / last-good | Partial | Full sanity + process last-good retain |
| APR | Already factual post-economics repair | Certified via `poolsAprRules` |
