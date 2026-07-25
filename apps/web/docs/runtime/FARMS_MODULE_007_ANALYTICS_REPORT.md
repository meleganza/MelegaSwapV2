# FARMS_MODULE_007 — Analytics Report

## Mission

`FARMS_MODULE_007_ANALYTICS` — factual ecosystem analytics only.

## Certified base

| Item | Value |
| --- | --- |
| Branch base | `farms-module-006-yield-advisor` |
| Tip | `86c6c068` |
| Mission 006 commit | `2ffc1795` |
| Architecture 000 | `8edd68d4` |
| Founder mockup SHA | `a19e506f7d7a5194050d52481f0b220bad30e4a774e3fde2529b37e830db848a` |
| Delivery branch | `farms-module-007-analytics` |
| Worktree | `/Users/marcomelega/Projects/MelegaSwapV2-farms-m007` |

## Scope delivered

Analytics only:

- Desktop band **1376 × 240**, four equal panels, **18px** gap (**330px** panel width)
- Panels: Farm Distribution · Reward Distribution · Participation · Farm Health
- Factual LP farm inventory only (`portfolioFarms`, pid 0 excluded)
- Unavailable metrics show `—` (no estimates / projections / mock charts)
- Compact stacked distribution bars (no animated graphs / no fake timelines)
- Tablet: 2-column; Mobile: stacked (358 @ 390 / 398 @ 430)
- Mount after Module 006; Modules 001–006 sources frozen

## Owned files

- `apps/web/src/views/FarmsStudio/modules/FarmsAnalyticsModule.tsx`
- `apps/web/src/views/FarmsStudio/modules/FarmsAnalyticsPanel.tsx`
- `apps/web/src/views/FarmsStudio/modules/buildFarmsAnalytics.ts`
- `apps/web/src/views/FarmsStudio/modules/useFarmsAnalytics.ts`
- `apps/web/src/views/FarmsStudio/modules/farmsAnalyticsTokens.ts`
- `apps/web/src/views/FarmsStudio/modules/farmsAnalyticsTypes.ts`
- `apps/web/src/views/FarmsStudio/__tests__/farmsModule007.analytics.test.ts`
- Mount + unlock in `FarmsStudioScreen.tsx` and prior module mount-gate tests
- Ownership map Module 007 status
- Evidence under `apps/web/docs/runtime/farms-module-007-analytics/`

## Freeze

Modules 001–006 SHA256 guards locked in `farmsAnalyticsTokens.ts` and verified by focused tests + `certify.mjs`.

## Tests

Focused Vitest suites for Modules 001–007 passed.

## Build

`yarn build` passed.

## Geometry certify

`certify.mjs` desktop / tablet / mobile pass (`allPass: true`).

## Forbidden surfaces

Untouched: Hero, Overview KPIs, My Farms, Explore Farms, Finished Farms, Yield Advisor sources; Pools; Liquidity; Passport; Home; Project Pages; Header; Trending; wallet provider; contracts; Treasury Runtime; Module 008.

## Evidence

`apps/web/docs/runtime/farms-module-007-analytics/`

## Delivery

Push `farms-module-007-analytics`. No merge. No deploy.

## Mission commit

_PENDING_PUSH_

## Verdict

`FARMS_MODULE_007_ANALYTICS_CERTIFIED`
