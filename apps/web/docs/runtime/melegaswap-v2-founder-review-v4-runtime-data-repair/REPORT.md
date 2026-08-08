# MELEGASWAP_V2_FOUNDER_REVIEW_V4_RUNTIME_DATA_REPAIR

## Baseline

- Tip: `e99dd628` — Founder Release Acceptance V3
- Branch: `mission-founder-review-v4-runtime-data-repair`
- Includes: Global Data Truth v1, Liquidity Studio V3 (`382f5f7a`), Farms/Pools polish, Projects Directory V3, Project Page V5, Premium Modal V3

## Part A — Modal stacking

**Root cause:** `MelegaModal` rendered in-tree under header chrome. Header `backdrop-filter` / fixed stacking trapped `position: fixed` overlays beneath the Top Movers ticker.

**Fix:**
- Canonical `melegaZIndex` (`chromeTicker: 900`, `chromeHeader: 1000`, `overlay: 10040`)
- `MelegaModal` portals to `#portal-root` / `document.body` with `data-melega-layer="overlay"`
- Header + GlobalTrendingBar consume the same tokens

**Acceptance:** Switch Network title hit-tested above ticker at 1440/1280/1024/768/390.

## Part B — Home Top Pools

**Root cause:** Home padded with inventory-only names; price helper PIDs missed earn-token farms; economics filter too loose.

**Fix:**
- Home uses `resolvePoolTvlUsd` / `resolvePoolAprPercent` with MARCO hints
- Farm price prefetch expands live pool earn addresses + WBNB helpers
- Certified-economics-only membership; no inventory pad

## Part C — Liquidity Studio V3

**Root cause:** Not a tip overwrite. Tip already mounts `LiquidityStudioV3Shell` on `/liquidity` and `/liquidity-studio` (byte-identical to `382f5f7a`). Production “generic Liquidity” matches `origin/main` lag (V1 IA, no V3 shell).

**Action:** No tip remount change required. Browser confirmed `data-liquidity-studio="v3"` via direct load, header nav, back/forward, refresh. Explore inventory was not mounted by certified V3 design (modules remain unused by entry).

## Part D — Pools data

**Root causes:**
1. `getActiveFarms` missed `MARCO/WBNB` → `stakingTokenPrice` stayed 0
2. Explore card hardcoded Remaining/Emission to `—`
3. Participants previously misused totalStaked

**Fix:**
- Align `getActiveFarms` with Home WBNB/earn helpers
- Wire Remaining/Emission from preview facts
- Participants always `—` (no wallet census)

## Part E — My Farms

Full-width module; “View all my farms” expands inline (Cards/List); Yield Advisor keeps a clipped portal host (no blank column).

## Part F — Farm multiplier

Reserved badge column on explore farm cards; no overlap with TVL/APR/identity.

## Part G — Audit hero

Borderless `HeroBand`, LIVE SECURITY CENTER copy aligned with DEX pages, subtle `ScoreGauge` glow (respects reduced motion). Calculations untouched.

## Forbidden files

Untouched: exchange/router/contracts/wallet/swap/farms MasterChef execution, NFT, token lists, Treasury/payment economics.

## Verdict

`MELEGASWAP_V2_FOUNDER_REVIEW_V4_RUNTIME_DATA_REPAIR_COMPLETE`
