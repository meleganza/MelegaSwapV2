# Project Page V2 — Real Data & Conversion Audit

**Mission:** `MELEGASWAP_V2_PROJECT_PAGE_V2_REAL_DATA_AND_CONVERSION_AUDIT`  
**Verdict target:** `MELEGASWAP_V2_PROJECT_PAGE_V2_CONVERSION_READY`  
**Branch:** `mission-project-page-v2-conversion-audit`

## Scope

Improve existing Project Page V2 / directory / claim checkout funnels.  
No Smart Swap execution, contracts, AMM, Treasury, or fee logic changes.

## Parts

| Part | Change |
|------|--------|
| 1 Hero | Above-fold denser layout; chain chips under identity (not action bar); socials Website/X/Telegram; Buy / Add Wallet / Claim |
| 2 Market + chart | USD-preferring live market; Market Cap/Holders provenance when factual; compact chart with **Unavailable** (no empty boxes); pair from featured markets when indexed |
| 3 Economy | Liquidity: TVL/Volume/Pools; Farm: APR/TVL/Rewards (+ farm count when known); Pool: TVL/Rewards/APR — never invent APR/rewards |
| 4 Grow funnel | Featured/Trend → `/list?intent=claim-project&slug=…#featured|#trend-boost` with hash scroll + slug passed into checkout; Liquidity → `?view=add`; Farm → `?create=1` |
| 5 Directory | Enrich cards from featured markets + trending volume/price; prioritize indexed signals; no fake liquidity/holders |
| 6 Featured | Directory reuses `FeaturedProjectsRail`; mini spark from real indexer candles only |
| 7 Claim | Compact premium card: claim ownership, verify wallet, manage logo/socials/description/links |
| 8 Consistency | Shared MelegaModal language preserved; uxRebuild Featured cards; Project Page theme tokens |

## Validation tokens

MARCO · MM72 · EYED · BLION — consume featured market rows / founder pairs when present.

## Forbidden untouched

- Smart Swap execution paths
- contracts / AMM / Treasury / fee economics
