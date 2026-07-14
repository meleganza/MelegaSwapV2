# R791A.6L — Tier State Transition Fix

**Mission:** Correct tier pair state promotion in the read model when orchestrator scans persist checkpoints without full bootstrap completion.  
**Authority:** `c444e8b7654f271cf5328027a9b073d733c22380`  
**Captured:** 2026-07-14  

## Root cause

Tier status was computed inline in `tier-metrics.ts` with a single gate:

```text
!touched || !windowComplete → UNSCANNED
```

Pairs processed by the orchestrator (checkpoint + `lastSuccessfulSync` present, cursors advanced — e.g. `55d398-8ac76a`, `52abb0-bb4cdb`) failed the bootstrap-window completeness check and were misclassified as `UNSCANNED` / `NOT_STARTED` instead of `SYNCING`.

The processing pipeline executed; only the **read-model transition** was wrong.

## State machine (fixed)

| Condition | Status |
|-----------|--------|
| Trade/volume/price signal | `READY` |
| RPC failure on health | `RPC_UNAVAILABLE` |
| Non-RPC error after touch | `INCONSISTENT` |
| Never touched | `NOT_STARTED` |
| Touched, window incomplete, or health `syncing` | `SYNCING` |
| Window complete, zero signal, healthy | `EMPTY_VERIFIED` |

Enum source: `TierMetricStatus` in `types.ts`  
Transition function: `resolveTierPairStatus()` in `tierPairStatus.ts`  
Persistence point: none (derived read model)  
Final write: `tier-metrics.ts` API response `rows[].status`

## Transition fixed

- **Before:** partial scan → `UNSCANNED` (stuck as NOT_STARTED in certification)
- **After:** partial scan → `SYNCING`
- **After:** completed window + zero events → `EMPTY_VERIFIED` (unchanged path)
- **After:** completed window + events → `READY` (unchanged path)

## Files changed

- `apps/web/src/lib/bsc-indexer/indexer/tierPairStatus.ts` (new)
- `apps/web/src/lib/bsc-indexer/indexer/__tests__/tierPairStatus.test.ts` (new)
- `apps/web/src/pages/api/indexer/tier-metrics.ts` (uses state machine)

## Tests

```bash
npm test -- src/lib/bsc-indexer/indexer/__tests__/tierPairStatus.test.ts
```

10 assertions covering NOT_STARTED, SYNCING, EMPTY_VERIFIED, READY, RPC_UNAVAILABLE, INCONSISTENT, and helper builders.

## Verdict

Tier state transitions now reflect orchestrator progress without modifying scheduler, scans, coverage, checkpoints, lease, or auth.
