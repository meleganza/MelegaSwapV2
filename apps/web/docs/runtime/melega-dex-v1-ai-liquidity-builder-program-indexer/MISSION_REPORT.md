# MELEGA_DEX_V1_AI_LIQUIDITY_BUILDER_PROGRAM_INDEXER_AND_PORTFOLIO_FOUNDATION

## Verdict

**MELEGA_DEX_V1_AI_LIQUIDITY_BUILDER_PROGRAM_INDEXER_READY**

## Scope

Indexing / API foundation only.

| Forbidden | Status |
|---|---|
| Contracts | Untouched |
| Factory | Untouched |
| Fee logic | Untouched |
| Treasury | Untouched |
| Smart Swap | Untouched |

## Delivered

### 1. Event indexing
Module: `apps/web/src/lib/liquidity-builder-indexer/`

Indexed event types:
- `ProgramCreated` (Factory)
- `ProgramActivated` / `ProgramPaused` / `ProgramResumed` / `ProgramStopped`
- `ProgramSafetyPaused` / `ProgramSafetyCleared`
- `BudgetDeposited` / `BudgetAdded` / `BudgetWithdrawn`
- `ExecutionCompleted`
- `LiquidityBuildingFeeSettled` (FeeSink)
- `StrategyUpdated`

Sync: `syncLbProgramInventory` + orchestrator stage `lb-programs` (deadline-gated, non-blocking).
Operator: `GET/POST /api/indexer/liquidity-building/run`

### 2. Owner inventory API
`GET /api/liquidity-programs/:wallet`

Returns per program:
- program address, token, quote asset, pair
- reserve / remaining
- status, strategy, goal (null until product metadata)
- timestamps, executionCount, totalFeePaid

### 3. Program detail API
`GET /api/liquidity-program/:address`

Returns program row + event ledger + `deepLink`.

### 4. Deep linking
- `programFromQuery` / `buildingHref(..., program)`
- `useProgramReadModel({ programAddress })` override
- Card preserves `?program=` while keeping single-program `activeProgram` path when unset

### 5. Single-program UX
Unchanged when `program` query is absent — still uses Factory `activeProgram(owner, token, quote, pair)`.

## Tests

- `src/lib/liquidity-builder-indexer/__tests__/parseEvents.test.ts`
- `src/lib/liquidity-builder-indexer/__tests__/inventoryApi.test.ts`
- `src/lib/liquidity-builder-indexer/__tests__/deepLink.test.ts`

## Artifacts

- `indexer-architecture.json`
- `api-surface.json`
- `MISSION_REPORT.md`
