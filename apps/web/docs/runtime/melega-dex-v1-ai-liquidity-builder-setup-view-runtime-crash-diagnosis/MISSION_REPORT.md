# MELEGA_DEX_V1_AI_LIQUIDITY_BUILDER_SETUP_VIEW_RUNTIME_CRASH_DIAGNOSIS

## Verdict

**MELEGA_DEX_V1_AI_LIQUIDITY_BUILDER_SETUP_CRASH_FIXED**

## Exact exception

`TypeError: Cannot read properties of undefined (reading 'executionCount')`

## File / line

- `apps/web/src/views/LiquidityStudio/liquidityBuilding/useProgramReadModel.ts`
- Line ~127 (pre-fix): `activityFromLatestExecution(latestResult?.result?.[0] as any)`

## Root cause

1. **Crash:** With an existing active program, `getProgramView` resolves ON_CHAIN. `latestExecution` is often empty → `undefined` passed into `activityFromLatestExecution`, which accessed `.executionCount` without a null guard.
2. **UX:** `forceExpanded` + `step=setup` always opened the create wizard (`useState(forceExpanded)`), ignoring portfolio inventory.

## Minimal frontend fix

- Null-safe `activityFromLatestExecution`
- Structured call args from `useProgramReadModel`
- Portfolio-first when programs exist; create only on intentional start / empty portfolio
- Copy: Program Active · Manage Program · View Portfolio

## Scope

Frontend only. No contracts / fees / Factory / Treasury / Smart Swap / KERL changes.
