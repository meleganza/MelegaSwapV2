# MELEGA_DEX_V1_FOUNDER_REVIEW_HOME_LIQUIDITY_POOLS_REPAIR_WAVE_03

## Verdict

**MELEGA_DEX_V1_FOUNDER_REVIEW_HOME_LIQUIDITY_POOLS_REPAIR_WAVE_03_BLOCKED**

Primary measured blocker: AI Liquidity Builder activation cannot complete because Liquidity Building contracts are **NOT_DEPLOYED** on BNB Smart Chain (`LB_DEPLOYED_ADDRESSES` all null; `lb018-deployment-binding.v1.json` → `DEPLOYMENT_INPUTS_BLOCKED`). Mission forbids inventing a new backend or placeholder addresses.

## Baseline

- Wave 02 certified tip: `7e86e0eb`
- Branch: `melega-dex-v1-founder-review-home-liquidity-pools-repair-wave-03`
- No merge / no deploy

## Delivered repairs (code)

### Home
- Featured cards: compact height, 4 columns ≥1280, ambient glow without yellow border
- Removed scientific notation; microscopic prices → `Price unavailable`
- Change empty copy → `Insufficient observations`
- Short description when available

### Top Movers indexing
- Orchestrator syncs up to 6 Tier-1 pairs per cron (not one rotate)
- `shouldRunTierStages` no longer starved by featured interior-gap bootstrap
- Production sample at capture time: still **1 eligible (MARCO)** until new cron fills stores post-deploy

### Liquidity
- Hero artwork SVG re-centered
- AI Builder: single-surface (no wizard tracker / AI-POWERED / RECOMMENDED); precise undeployed-contract diagnostic
- Explore Pools: search-only + Highest Liquidity; symbol-resolved MARCO search
- Insights 24H volume: durable tier-metrics USD fallback; sub-dollar formatting preserved

### Pools
- IA: Hero → KPI → My Positions → Analytics → Explore → Finished → Create Pool
- Removed Reward Advisor + sidebar (How it works / donut / health guide)
- View Contract ↗ on pool cards
- Create Pool: no fabricated 153.3% / health / consumption defaults

## Blocker evidence

| Item | Measurement |
|---|---|
| `LB_DEPLOYED_ADDRESSES` | all `null` |
| `LiquidityBuildingFactoryV1` | `NOT_DEPLOYED` |
| `activationAuthorized` | `false` |
| CTA path | fail-closed; no fake wallet activation |

See `ai-liquidity-builder-runtime-trace.json` and `ai-liquidity-builder-activation-result.json`.

## Secondary limitations

1. Top Movers multi-asset density requires production cron to ingest Wave 03 orchestrator changes.
2. Full wallet three-cycle browser fixtures remain operator-side; last-good contracts preserved in unit tests.
3. Pools KPI vs Explore counts remain different universes (classification totals vs displayable cards) — sidebar contradictory counters removed.

## Evidence path

`apps/web/docs/runtime/melega-dex-v1-founder-review-wave-03/`

## Forbidden surfaces

Untouched: Factory / Router / MasterBuilder / SmartChef / Vault contracts, fee/emission economics, Treasury Runtime, KERL, wallet signing.
