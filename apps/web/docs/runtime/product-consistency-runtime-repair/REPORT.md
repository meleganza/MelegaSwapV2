# MELEGASWAP_V2_PRODUCT_CONSISTENCY_AND_RUNTIME_REPAIR

## Verdict

`MELEGASWAP_V2_PRODUCT_CONSISTENCY_RUNTIME_REPAIR_COMPLETE`

## Scope

Product-level consistency + runtime repair before Project Discovery redesign.

Forbidden untouched: contracts, Smart Swap logic, Treasury, fee economics, AMM logic.

## Part 1 — Header navigation (P0)

- **Root fix:** `_app-full.tsx` uses `MemoryRouter` instead of `BrowserRouter` so react-router-dom no longer owns `window.history` (which hung Next soft-nav after `beforeHistoryChange` with Home still mounted).
- `MelegaGlobalHeader.navigatePrimary`: preventDefault + `router.push` with 1.6s stall hard-fallback via `window.location.assign`, plus post-push pathname verify.
- `useRouteTransitionRecovery`: 2s stall timer + hard nav on Abort/chunk errors.

Acceptance: Home → Liquidity / Farms / Pools / Portfolio remount without manual refresh.

## Part 2 — Chain switch (P0)

- `NetworkSwitchModal` migrated to canonical `MelegaModal` (size sm). Never crashes; try/catch around switch.
- `ChainSwitchConfirmDialog` copy: `This product is available on {chain}. Switch network?`
- Removed BSC invent fallbacks in WrongNetwork / UnsupportedNetwork disconnect paths.
- Supported LIVE: BSC, Base, Polygon, Ethereum, Arbitrum, Avalanche.

## Part 3 — Top Farms / Top Pools

- Prefer active-chain Farms/Pools runtime (same sources as those pages), then pad multichain inventory.
- Farm rewards from dual earnLabel / MARCO; pool rewards from earning token or inventory label.
- Missing metrics still render `Unavailable` (never hardcoded zeros).

## Part 4 — Liquidity Studio

- DEX Snapshot volume uses canonical market snapshot (same as Home) with protocol fallback.
- Footer shows Fees (24H LP = volume × LP_HOLDERS_FEE when volume known) + Positions + Last Sync.
- Route oscillation guards preserved.

## Part 5 — Modal system

- Create Farm / Create Pool `MelegaModal` size `md` (720px).
- Network switch + chain confirm use MelegaModal family.
- Accordion + sticky preview retained.

## Part 6 — Portfolio visual system

- Tokens/font/contentMax aligned to `uxRebuild`.
- Passport / identity CTAs removed; hero CTAs → View Farms / View Pools.
- Privacy link cleaned; debug cache keys removed from UI.

## Part 7 — Project page prep

- Project page theme gold/font/max-width aligned to `uxRebuild` (no redesign).

## Validation viewports

Desktop 1440 / 1280 · Tablet 1024 · Mobile 390 — structural contracts covered by unit tests; visual QA on production after deploy.
