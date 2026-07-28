# LIQUIDITY_MODULE_004_ADD_LIQUIDITY — Report

## Status

**LIQUIDITY_MODULE_004_ADD_LIQUIDITY_CERTIFIED**

## Base

`LIQUIDITY_MODULE_003_POOL_DISCOVERY_CERTIFIED` @ `32cab6ca`

## Architecture

Premium UI shell over existing `LiquidityRuntimeProvider` / `useLiquidityMintRuntime`.

- Pair select + amounts + balances (factual)
- Preview: pair, deposited assets, LP received, share, fee tier
- Slippage via existing Settings modal (`SWAP_LIQUIDITY`) — no second model
- CTA states: Connect → Approve A/B → Confirming → Add Liquidity
- User confirms wallet transactions (non-custodial)

No second mint engine. No AMM/Router/Factory/contracts edits.

## Mount

`/liquidity`: Hero → Actions → Discovery → **Add Liquidity** → legacy `views/Pool`

Deep-link seed: `?token0=&token1=` into runtime currencies. Anchor: `#add-liquidity`.

## Geometry (measured desktop 1440)

- Module width 1376
- Form 900 / Preview 424 / gap 24
- Mobile 390/430: single column, no overflow

## Tests / build

- Vitest: 38/38 (Modules 001–004)
- `next build`: passed

## Freeze

- Modules 001–003 byte-frozen
- `useLiquidityMintRuntime` not modified
- `views/Pool` untouched

## Evidence

`apps/web/docs/runtime/liquidity-module-004-add-liquidity/`
