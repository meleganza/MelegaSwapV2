# LIQUIDITY_MODULE_006_MY_POSITIONS — Report

## Status

**LIQUIDITY_MODULE_006_MY_POSITIONS_CERTIFIED**

## Base

`LIQUIDITY_MODULE_005_MARKET_SNAPSHOT_CERTIFIED` @ `aa9137e5`

## Scope

Wallet LP positions only — My Positions after Market Snapshot:

| Concern | Behavior |
| --- | --- |
| Data | Shared `LiquidityRuntimeProvider` + `useLiquidityPositionDetails` |
| Model | `LiquidityPosition` (pair, tokens, lpBalance, poolShare, value, fees, status, actions) |
| Fees | `—` unless factual (never fake earnings) |
| Status | `ACTIVE` / `PARTIAL` / `UNAVAILABLE` — no false zero |
| Manage | Seeds currencies + scrolls `#add-liquidity` |
| Remove | `setSelectedPositionId` + `setMode('Remove Liquidity')` + `openRemoveModal()` |
| Empty | Connected: Explore Pools · Disconnected: Connect wallet |

No new wallet indexer. No Farms/Pools duplication. No new transaction logic.

## Mount

Hero → Actions → Discovery → `[LiquidityRuntimeProvider: Add → Snapshot → My Positions]` → legacy Pool

Provider hoist: nested provider removed from Add module so one mint/positions host serves 004–006.

## Geometry (measured 1440)

1376 container · `928px 424px` (mission 936+24+424=1384 clamped to 1376) · tablet/mobile stack · no overflow

## Tests / build

- Vitest: 53/53 (Modules 001–006)
- `next build`: passed

## Freeze

Modules 001–003 + 005 byte-identical. Module 004 provider-hoist only (new SHA). Mint runtime untouched. No Router / Farms / Pools / Passport / Treasury / KERL edits.

## Evidence

`apps/web/docs/runtime/liquidity-module-006-my-positions/`
