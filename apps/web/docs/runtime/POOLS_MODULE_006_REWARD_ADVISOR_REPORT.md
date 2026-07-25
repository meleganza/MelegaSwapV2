# POOLS_MODULE_006 — Reward Advisor Report

## Mission

`POOLS_MODULE_006_REWARD_ADVISOR` — factual priority advisor only.

## Certified base

| Item | Value |
| --- | --- |
| Branch base | `pools-module-005-finished-pools` |
| Tip | `552a83bd` |
| Mission 005 commit | `fa435eb9` |
| Architecture 000 | `f1d1fd11` |
| Founder mockup SHA | `549ca3bb663315730945de4ada9bc36559399cf3e9ce72a59de4d10f89558d4f` |
| Delivery branch | `pools-module-006-reward-advisor` |
| Worktree | `/Users/marcomelega/Projects/MelegaSwapV2-pools-m006` |

## Scope delivered

Reward Advisor only:

- Desktop: portals into Module 003 reserved **424×360** slot (Modules 001–005 sources frozen)
- Tablet/mobile: inline mount below Finished Pools, single column
- Max **4** priority cards
- Factual engine only (no AI / predictions)
- Priorities: Claim → Withdraw → Emergency → Ending Soon → High APR → Everything looks good
- Actions via `PoolsActionHost`: Claim / Withdraw / Emergency / Stake; View Pool scrolls to Explore
- Loading skeleton; Unavailable copy when sources fail

## Owned files

- `apps/web/src/views/PoolsStudio/modules/PoolsRewardAdvisorModule.tsx`
- `apps/web/src/views/PoolsStudio/modules/PoolsRewardAdvisorCard.tsx`
- `apps/web/src/views/PoolsStudio/modules/buildPoolsRewardAdvisor.ts`
- `apps/web/src/views/PoolsStudio/modules/usePoolsRewardAdvisor.ts`
- `apps/web/src/views/PoolsStudio/modules/poolsRewardAdvisorTokens.ts`
- `apps/web/src/views/PoolsStudio/modules/poolsRewardAdvisorTypes.ts`
- `apps/web/src/views/PoolsStudio/__tests__/poolsModule006.rewardAdvisor.test.ts`
- Mount + unlock in `PoolsStudioScreen.tsx` and prior module tests
- Ownership map Module 006 status
- Evidence under `apps/web/docs/runtime/pools-module-006-reward-advisor/`

## Freeze

Modules 001–005 SHA256 guards locked in `poolsRewardAdvisorTokens.ts` and verified by focused tests + `certify.mjs`.

## Tests

73 focused tests passed (Modules 001–006).

## Build

`yarn build` passed.

## Geometry certify

`certify.mjs` desktop / tablet / mobile pass (`desktopPass` + `responsivePass`).

## Forbidden surfaces

Untouched: Hero, Overview KPIs, My Positions, Explore, Finished sources; Header; Trending; Footer; Navigation; Wallet provider; Contracts; Treasury Runtime; Modules 007–010.

## Evidence

`apps/web/docs/runtime/pools-module-006-reward-advisor/`

## Delivery

Push `pools-module-006-reward-advisor`. No merge. No deploy.

## Mission commit

_(stamped after commit)_
