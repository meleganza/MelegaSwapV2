# MELEGA_DEX_V1_GLOBAL_FOUNDER_ACCEPTANCE_PRE_AUDIT

## Verdict

`MELEGA_DEX_V1_GLOBAL_FOUNDER_PRE_AUDIT_CERTIFIED`

## Severity

P0 — GLOBAL PRODUCT POLISH / PRE-FOUNDER FINAL REVIEW

## Objective

Complete last global product refinement before Founder definitive acceptance. Not a redesign. No regression of certified surfaces. Bind real runtime or use honest premium empty states. No mocks.

## Scope confirmed

- No Router / Factory / Treasury / economics / KERL changes
- No smart-contract changes
- No swap / liquidity / farm / pool execution changes
- Presentation, IA polish, runtime bindings, empty states, avatars, CTAs only

## Phase results

| Phase | Surface | Result |
|---|---|---|
| 1 | Global runtime audit | PASS — see `global-runtime-audit.json` |
| 2 | Home | PASS — Top Movers / Featured / Ecosystem / Footer |
| 3 | Smart Swap | PASS — Instant\|Smart on Home terminal; invented speed removed |
| 4 | Liquidity | PASS — fees/fee preview honesty; IA intact |
| 5 | Farms | PASS — featured avatars + `?view=` scroll |
| 6 | Pools | PASS — featured avatars + anti-flicker retained |
| 7 | List | PASS — Finish draft CTA; Create Token honest Coming Soon |
| 8 | Passport | PASS — LP logos/addresses; wallet-gated Unavailable honest |
| 9 | Design consistency | PASS |
| 10 | Founder walkthrough | PASS — 0 horizontal overflows across 7×7 pack |

## Repairs shipped

1. Trade: remove invented `executionSpeed: 'Fast'`; hide speed row when unset
2. Home discovery: hide missing TVL meta; premium farm/pool empty copy
3. Home ecosystem: Maiora `Not public yet` (no public URL)
4. HomeSwapPanel: factual pair/slippage binding
5. SmartSwap preview: idle `Enter amount`; drop duplicate Protocol fee metric
6. List workspace: primary CTA `Finish draft`
7. Liquidity My Positions: `Not indexed` fees; mint preview fee → `TOTAL_FEE`
8. Farms/Pools featured compact: `MelegaTokenAvatar` stacks + `?view=` scroll
9. Passport LP rows: token addresses + `logoURI` avatars

## Intentional empty / disabled states (not blockers)

- Top Movers: `Market activity unavailable` when index empty
- Create Token: disabled `Coming Soon` (flow not shipped)
- Passport disconnected: `Unavailable` identity badges
- Unindexed APR/volume/fees: `—` / `Not indexed`
- Maiora: disabled `Not public yet`

## Validation

- Focused vitest: **32/32 PASS**
- `yarn next build`: **PASS**
- Browser capture base: `http://127.0.0.1:3491`
- Production before baselines: `https://www.melega.finance`
- Responsive overflows: **0**

## Evidence

```
apps/web/docs/runtime/melega-dex-v1-global-founder-pre-audit/
  global-runtime-audit.json
  home-audit.json
  swap-audit.json
  liquidity-audit.json
  farms-audit.json
  pools-audit.json
  list-audit.json
  passport-audit.json
  design-consistency.json
  responsive-pack.json
  capture-raw.json
  capture.mjs
  MISSION_REPORT.md
  desktop/ tablet/ mobile/ before-after/ raw/
```

## Forbidden files

Untouched: `exchange.ts`, `contracts.ts`, Router/Factory/Treasury contracts, wallet connect core, swap/liquidity/farm/pool write paths, MasterChef, NFT, token lists.
