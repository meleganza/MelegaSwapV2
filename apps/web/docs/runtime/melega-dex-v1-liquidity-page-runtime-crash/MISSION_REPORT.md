# Liquidity page runtime crash — FIXED

**Mission:** `MELEGA_DEX_V1_LIQUIDITY_PAGE_RUNTIME_CRASH_DIAGNOSIS`  
**Verdict:** `MELEGA_DEX_V1_LIQUIDITY_PAGE_CRASH_FIXED`

## Exact exception

`Error: types/values length mismatch (count={types:2, values:0}, code=INVALID_ARGUMENT, version=abi/5.6.4)`

Encoding `Factory.activeProgram(address owner, address projectToken)` with zero values.

## Location

| Item | Value |
| --- | --- |
| Component | `LiquidityBuildingCard` / `useProgramReadModel` |
| File | `apps/web/src/views/LiquidityStudio/liquidityBuilding/useProgramReadModel.ts` |
| Trigger | Page mount with missing owner and/or projectToken |
| Multicall | `state/multicall/hooks.ts` `isValidMethodArgs(undefined) === true` → zero-arg encode |

## Root cause

`useSingleCallResult(contract, 'activeProgram', undefined)` is interpreted as a valid **0-arg** call. `activeProgram` requires 2 args → ethers throws → Sentry Error Boundary.

## Minimal fix

`activeProgramCallArgs` returns null unless both addresses exist; `useSingleCallResult` receives `contract=undefined` when skipped.

## SSOT verified (unchanged)

- LB Factory `0xB9f3e3020141157C215902acC1fDF65e49bE4e82`
- Create Token `0x6DbB5d7162842dA94ef9172AedC8D148d203d311`
- Public Farm `0x89Ffa439B197FE98f0F5388E00EdF1eBfD80D7E9`
