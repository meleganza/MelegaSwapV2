# MELEGA_DEX_V1_AI_LIQUIDITY_BUILDER_PROGRAM_EXECUTION_RUNTIME_VALIDATION

## Verdict

**MELEGA_DEX_V1_AI_LIQUIDITY_BUILDER_EXECUTION_RUNTIME_GAP_IDENTIFIED**

## Baseline

- Branch foundation: `melega-dex-v1-ai-liquidity-builder-setup-view-runtime-crash-diagnosis`
- Commit: `659ee032`

## How an Active program executes

An Active program does **not** self-execute. Liquidity building runs only when a **permissionless caller** submits:

`executeLiquidityBuilding(ExecutionIntent, signature)`

with a signature from the Authorizer `signingAuthority`. Epoch duration is a constraint (one execution per epoch window), not an on-chain timer.

## Parts A–F (summary)

| Part | Finding |
|---|---|
| A Trigger | Signed-intent submit model — not UI, not keeper cron, not market auto-fire |
| B Lifecycle | On-chain atomic path implemented; off-chain sign+relay not provisioned |
| C Program | `0xb603EA55…EC9D` MARCO/WBNB Active, 1 MARCO reserve, **executionCount=0** |
| D Automation | KMS Disabled + Relay Disabled; no execute worker |
| E Fees | 10% on successful execute → FeeSink → FeeReceiver; TREASURY EOA via governor recover |
| F Gap | Protocol ready · Runtime automation missing |

## Why executions = 0

Program is Active and funded. No signed intent has been broadcast. Production loop uses `DisabledLiquidityBuildingKmsSigner` and `DisabledLiquidityBuildingRelay`.

## Scope

Docs/evidence only. No contracts, economics, or new programs created.

## Evidence

| File | Role |
|---|---|
| `execution-model.json` | Trigger + lifecycle |
| `program-state.json` | Live BSC MARCO/WBNB state |
| `automation-analysis.json` | KMS/relay/worker status |
| `fee-trigger-analysis.json` | 10% fee path |
| `product-gap-analysis.json` | Protocol vs runtime gap |
