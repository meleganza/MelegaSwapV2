# MELEGASWAP_V2_PROJECT_PAGE_V6_FOUNDER_PIXEL_PERFECT

## Baseline

- `a12efabe` — Founder Review V4 Runtime Data Repair
- Branch: `mission-project-page-v6-founder-pixel-perfect`

## Deconstruction

See `PROJECT_PAGE_V5_DECONSTRUCTION.md`.

## What shipped

New public mount: `pages/project-hq/[slug].tsx` → `ProjectPageV6Shell`.

Canonical hierarchy:

1. Hero (34/66 identity + trading terminal)
2. Market strip
3. Project Economy (address-matched farms/pools)
4. Activity + Holders + Melega Score
5. Boost console (compact 6 actions → existing checkout/claim)
6. Community reactions (local preview; persistence unavailable)
7. About / Links
8. Related projects

Removed: Technical Transparency, Buy Token CTA, sticky Buy, giant Add to Wallet (MetaMask icon beside contract).

Chart: compact empty state + parent reclaim for Smart Swap.  
Smart Swap: real `ProjectTradingEmbed` / `SmartSwapForm`, hero chrome title hidden.

## Detection notes

- Farms/Pools: `matchProjectYieldByToken` searches config by `chainId + token address`, then hydrates APR/TVL from runtime when available.
- Holders: total count only — no fabricated distribution.
- Activity: protocol activity filtered by project token address when indexed.
- Melega Score: readiness score with explanation dialog (Audit Center remains platform Melega Score SSOT).
- Community: UI only; **persistence dependency missing**.

## Evidence

- `tests.json`, `build.json`, `browser-acceptance.json`, `performance.json`
- Screenshots for MM72 / MARCO / EYED desktop+mobile + economy / intel / boost

## Verdict

`MELEGASWAP_V2_PROJECT_PAGE_V6_FOUNDER_PIXEL_PERFECT_COMPLETE`
