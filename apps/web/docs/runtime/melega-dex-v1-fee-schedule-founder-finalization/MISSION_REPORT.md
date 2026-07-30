# MISSION REPORT — Fee Schedule Founder Governance Finalization

**Mission ID:** `MELEGA_DEX_V1_FEE_SCHEDULE_FOUNDER_GOVERNANCE_FINALIZATION`  
**Baseline:** `melega-dex-v1-create-token-fee-finalization` @ `f425f80c`  
**Branch:** `melega-dex-v1-fee-schedule-founder-finalization`  
**Assessed:** 2026-07-30T13:15:00.000Z

## Verdict

`MELEGA_DEX_V1_FEE_SCHEDULE_FOUNDER_GOVERNANCE_FINALIZATION_CERTIFIED`

## Canonical SSOT

`apps/web/src/config/constants/fee-schedule.json`  
TypeScript accessor: `apps/web/src/config/constants/feeSchedule.ts`

## Founder schedule (summary)

| Service | Fee | Destination |
|---|---|---|
| Smart Router | 25% of DEX gas fees | `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` |
| Create Token | **0.10 BNB** (`100000000000000000` wei) | same Treasury |
| Create Pool | FREE if staking=MARCO; else 0.25 BNB | same Treasury |
| Create Farm | 1.00 BNB if reward=MARCO; FREE if pair contains MARCO; else 0.25 BNB | same Treasury |
| Featured Project | 99 USD / 7 days / BNB·USDT·USDC·MARCO / 5% M-Credits cashback with MARCO | same Treasury |
| Liquidity Builder | **10%** of every LB engine swap (governance) | same Treasury |

## Create Token supersession

| | Prior | Current |
|---|---|---|
| BNB | 0.05 | **0.10** |
| wei | 50000000000000000 | **100000000000000000** |

Factory address remains `null`. No deploy. No bind.

## Liquidity Builder note

Certified factory bytecode still hard-requires `successFeeBps == 500` (5%). Founder schedule records **10%**. This mission does **not** change LB bytecode / execution model. `LiquidityBuildingV1.inputs.json` records the Founder schedule alongside the certified lock.

## Treasury Runtime

Forbidden in the DEX fee path. All destinations are the MELEGA TREASURY WALLET directly.

## Explicit non-actions

- No mainnet deploy
- No fabricated addresses / transactions
- No frontend factory binding
- No LB execution-model redesign
