# Mission Report — Pools Final Founder Acceptance (Recovery)

**Mission ID:** `MELEGA_DEX_V1_POOLS_FINAL_FOUNDER_ACCEPTANCE_RECOVERY`  
**Prior mission:** `MELEGA_DEX_V1_POOLS_FINAL_FOUNDER_ACCEPTANCE_ZERO_REFINEMENT`  
**Base tip:** `907fa0d2`  
**Branch:** `melega-dex-v1-pools-final-founder-acceptance`  
**Mode:** Recovery (no restart, no new branch)

## Recovery diagnosis (measured)

| Option | Result |
|--------|--------|
| **A** UI failed to render View Contract | **TRUE (root cause)** — Explore/Featured had zero pool cards, so no View Contract CTAs mounted |
| **B** Wrong screenshot selector | FALSE — body text also had zero `View Contract` matches |
| **C** Timing-only | FALSE — after 8–15s + full scroll, cards still empty before repair |

### Exact failure

Open-ended SmartChef pools (`endBlock` / `bonusEndBlock` ≤ 0) were incorrectly treated as:

1. **ended** via `currentBlock > bonusEndBlock` when `bonusEndBlock === 0`
2. **not started** via `getPoolBlockInfo` (`blocksRemaining === 0` when `endBlock === 0`)
3. Explore membership required `status === 'live' && displayStatus === 'LIVE'` and ignored `lifecycle.active/rewarding`
4. `poolIsLive` applied USD budget gates against the open-ended runway sentinel

Result: Featured empty, Explore “No active staking pools”, View Contract count = 0, despite KPI/classification knowing rewarding pools exist when RPC is healthy.

### Exact repaired files

- `apps/web/src/lib/data-truth/poolLifecycle.ts`
- `apps/web/src/views/PoolsStudio/poolsRuntime/formatPoolPresentation.ts`
- `apps/web/src/views/PoolsStudio/modules/buildPoolsExplorePools.ts`

## Post-repair measured (1440)

- Featured: `ready` (`sous-0` MARCO Staking, highest TVL active)
- Explore count: `1`
- View Contract text count: `2` (Featured + Explore)
- Overflow: none across 1920 / 1600 / 1440 / 1366 / 1024 / 430 / 390

## Validation

- PoolsStudio tests: **141/141 PASS**
- `next build`: **PASS**
- Forbidden surfaces: Home / Liquidity / Farms / Passport / Project / List / Top Movers / Swap / Treasury / Economics — untouched

## Evidence pack

- `pool-index-audit.json`
- `featured-pool-selection.json`
- `pool-contract-links.json`
- `state-machine.json`
- `flicker-regression.json`
- `responsive.json`
- `screenshots/`

## Verdict

`MELEGA_DEX_V1_POOLS_FINAL_FOUNDER_ACCEPTANCE_CERTIFIED`
