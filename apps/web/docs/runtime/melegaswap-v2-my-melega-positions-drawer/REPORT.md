# MELEGASWAP_V2_MY_MELEGA_POSITIONS_DRAWER

## Baseline

- Branch base: `mission-project-page-v6-founder-pixel-perfect` @ `4a5d55ab`
- Mission branch: `mission-my-melega-positions-drawer`

## What shipped

1. Replaced header hamburger (`melega-header-overflow`) with circular **My Melega** user silhouette trigger (`melega-header-my-melega`, tooltip “My Melega”, aria-label “Open My Melega”).
2. Added mobile header trigger (`melega-mobile-my-melega`, 44×44).
3. Right-side drawer (desktop/tablet) / bottom sheet (mobile) via portal + `melegaZIndex.overlay` (10040).
4. Removed **Portfolio** from primary desktop header nav; kept `/portfolio` + drawer link **View Full Portfolio**.
5. Lightweight adapter `lib/data-truth/myMelegaPositions.ts` over Portfolio runtime + LB owner programs.
6. Compact search flex at ≤1100px so Wallet + My Melega stay in-viewport at 1024.

## Primary nav (desktop)

Home · Liquidity · Farms · Pools · List → Search · Chain · Language · Wallet · My Melega

## Route decisions

| Destination | Route |
|---|---|
| Liquidity | `/liquidity-studio?view=positions` |
| Farms | `/farms?view=my` |
| Pools | `/pools?view=positions` |
| Liquidity Builder | `/liquidity-studio?view=building` (closest valid) |
| Full Portfolio | `/portfolio` |

## Acceptance

- Desktop open/close from Home, Project, Farms, Pools, Liquidity, Portfolio: pass
- Mobile 390 sheet: pass
- Viewports 1440/1280/1024/768/390 trigger in-view: pass
- Overlay z-index 10040: pass
- No Passport / Guest / Subject / Verification copy in drawer: pass
- Disconnected state observed in local acceptance: connect CTA only
- `/portfolio` still mounts with Melega shell

## Forbidden surfaces

Untouched: Smart Swap engine, AMM, contracts, Treasury, fees, Payment Router, Project Page V6, Global Data Truth formulas, Farms/Pools economics, Liquidity execution.

## Evidence

`apps/web/docs/runtime/melegaswap-v2-my-melega-positions-drawer/`
