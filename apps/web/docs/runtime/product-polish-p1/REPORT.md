# MELEGASWAP_V2_PRODUCT_POLISH_P1

## Verdict

`MELEGASWAP_V2_PRODUCT_POLISH_P1_COMPLETE`

## Changes

### A. Home
- Top Pools & Top Farms: missing metrics render `—` (never `Unavailable`)
- Ecosystem: PORTFOLIO→PASSPORT, BLACKPUMP→BLACK with required copy

### B. Modals (Melega Modal Design System)
- Canonical shell: 740px · max 80vh · Melega logo header · internal scroll
- Create Farm: Step 1 / Step 2 / Step 3 / Advanced accordion + sticky preview
- Create Pool: Step 1 / Step 2 / Step 3 / Advanced (review inside Advanced) + sticky preview
- Network Switch + Chain confirm remain on MelegaModal family
- No duplicate page-style headers inside create workspaces

### C. Pools
- My Positions returns `null` when empty (no empty card / “No positions”)

### D. Portfolio
- Slim DEX-aligned hero · Assets · Positions · Rewards · Activity · Analytics accordion
- No Passport / Identity / Guest / Verification UI surface

### E. Header
- Shared DS001 72px / mobile 56px contracts unchanged; Portfolio mounts in app shell

## Acceptance
- Unit: productPolishP1 + melegaModalDesignSystem + portfolioV2 + productIaHomeRefinement — pass
- `next build` — pass
- Browser (desktop 1440 / tablet 1024 / 390): create farm/pool/network within viewport, single accordion open, no Unavailable in Top Pools/Farms blocks — pass (`browser-acceptance.json`)

## Forbidden (untouched)
Smart Swap · contracts · Treasury · fee logic · AMM / blockchain routing writes
