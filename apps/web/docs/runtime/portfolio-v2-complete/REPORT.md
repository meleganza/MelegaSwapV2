# MELEGASWAP_V2_PORTFOLIO_V2_COMPLETE_REDESIGN

## Verdict

`MELEGASWAP_V2_PORTFOLIO_V2_COMPLETE`

## Summary

Complete Portfolio redesign as `PortfolioStudio` — Project Page / Farms / Pools band language.

### Removed

- Passport product language
- Identity / Verification / Guest / Subject
- Wallet-linked identity enrollment
- Controlled Projects band
- Passport surface states (`CONNECTED_*_PASSPORT_*`)

### Kept

- Portfolio hero
- Assets summary
- Positions (Liquidity / Farms / Pools tabs)
- Rewards
- Recent Activity (honest empty when unindexed)
- Analytics (collapsed `<details>`)
- Account (wallet session only)

### Routes

- `/portfolio` → `PortfolioStudioScreen`
- `/passport` → redirect to `/portfolio`
- Nav OWN / header / bottom → `/portfolio`

### Forbidden untouched

Smart Swap, AMM, contracts, Treasury, fee logic.
