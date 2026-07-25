# FARMS_MODULE_006 — Yield Advisor Report

## Mission

`FARMS_MODULE_006_YIELD_ADVISOR` — factual action assistant only.

## Certified base

| Item | Value |
| --- | --- |
| Branch base | `farms-module-005-finished-farms` |
| Tip | `640e1e6d` |
| Mission 005 commit | `dfbd93e3` |
| Architecture 000 | `8edd68d4` |
| Founder mockup SHA | `a19e506f7d7a5194050d52481f0b220bad30e4a774e3fde2529b37e830db848a` |
| Delivery branch | `farms-module-006-yield-advisor` |
| Worktree | `/Users/marcomelega/Projects/MelegaSwapV2-farms-m006` |

## Scope delivered

Yield Advisor only:

- Desktop: portals into Module 003 reserved **424×360** slot (Modules 001–005 sources frozen)
- Tablet/mobile: inline mount below Finished Farms (≤1199px), content width **358px** on mobile
- Max **4** advisor cards at **390×64**
- Deterministic priority engine (no AI / predictions / APR opportunity advice)
- Priorities: Emergency Withdraw → Withdraw Finished → Harvest Finished → Harvest Active → Inactive Attention → Everything looks good
- Unavailable / Loading / All-clear states
- Actions via `FarmsActionHost` only (`claim` / `unstake`)
- Legacy `AIYieldAdvisorPanel` superseded in Featured/Advisor grid (file retained)

## Owned files

- `apps/web/src/views/FarmsStudio/modules/FarmsYieldAdvisorModule.tsx`
- `apps/web/src/views/FarmsStudio/modules/FarmsYieldAdvisorCard.tsx`
- `apps/web/src/views/FarmsStudio/modules/buildFarmsYieldAdvisor.ts`
- `apps/web/src/views/FarmsStudio/modules/useFarmsYieldAdvisor.ts`
- `apps/web/src/views/FarmsStudio/modules/farmsYieldAdvisorTokens.ts`
- `apps/web/src/views/FarmsStudio/modules/farmsYieldAdvisorTypes.ts`
- `apps/web/src/views/FarmsStudio/__tests__/farmsModule006.yieldAdvisor.test.ts`
- Mount / supersession in `FarmsStudioScreen.tsx`
- Phase unlock in `farmsArchitecture000Contracts.ts`
- Ownership map Module 006 status
- Prior module mount-gate test updates (001 / 004 / 005 / architecture)
- Evidence under `apps/web/docs/runtime/farms-module-006-yield-advisor/`

## Freeze

Modules 001–005 SHA256 guards locked in `farmsYieldAdvisorTokens.ts` and verified by focused tests + `certify.mjs`.

Hero, Overview KPIs, My Farms, Explore Farms, Finished Farms sources remain byte-identical.

## Tests

Focused Vitest suites for Modules 001–006 passed (68 tests).

## Build

`yarn build` passed.

## Geometry certify

`certify.mjs` desktop / tablet / mobile pass (`allPass: true`).

Slot 424×360 (±2/±4), card geometry tokens, inline below Finished on tablet/mobile, no overflow, no AI panel.

## Forbidden surfaces

Untouched: Hero, Overview KPIs, My Farms, Explore Farms, Finished Farms sources; Pools; Liquidity; Passport; Home; Project Pages; Header; Trending Bar; wallet provider; contracts; Treasury Runtime; Modules 007–008.

No transaction logic added. No predictive scoring. No mock advice.

## Evidence

`apps/web/docs/runtime/farms-module-006-yield-advisor/`

## Delivery

Push `farms-module-006-yield-advisor`. No merge. No deploy.

## Mission commit

_PENDING_PUSH_

## Verdict

`FARMS_MODULE_006_YIELD_ADVISOR_CERTIFIED`
