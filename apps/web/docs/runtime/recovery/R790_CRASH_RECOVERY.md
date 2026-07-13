# R790 Crash Recovery

**Written:** 2026-07-13T05:48:00Z (post Cursor crash code 5)  
**Mission:** R790 — complete production indexing, protocol activity, final reconciliation  
**R789 authority preserved:** `0dfd254ef9d616c9d57a865034ae8207bced39e3` — **R789_PRODUCTION_BLOCKED** (unchanged)

## Git state at recovery

| Field | Value |
|-------|-------|
| Branch | `main` |
| HEAD | `20ae144bfc8d2a02c812e40cfabb49f16ec1d046` |
| origin/main | `20ae144bfc8d2a02c812e40cfabb49f16ec1d046` |
| Merge/rebase/cherry-pick/bisect | None active |
| `0dfd254e` in history | Yes |

## Implementation checkpoint SHAs (pre-crash work recovered via commits)

| Commit | Message | Role |
|--------|---------|------|
| `5d1a404f` | R790: adaptive featured gap scan, durable indexer lease, and G2 reconciliation fix | Core implementation |
| `20ae144b` | R790: treat released lease marker as inactive and retry skipped certification runs | Lease contention fix + cert retry |

These commits satisfy **R790_RECOVER_CRASHED_IMPLEMENTATION_STATE** intent (pushed to `origin/main` before long certification).

## Dirty-file inventory

### Modified (unstaged) — PRE_EXISTING_UNRELATED (do not stage for R790)

- `apps/web/docs/runtime/r778-verify.mjs`
- `apps/web/docs/runtime/r780-data-quality-gates.json`
- `apps/web/docs/runtime/r789-indexer-sequential-runs.json`
- `apps/web/docs/runtime/r789-production-api-baseline.json`
- `apps/web/docs/runtime/r789-screenshots/r789-matrix-report.json`
- `apps/web/docs/runtime/r789-smartchef-classification.json`
- `apps/web/docs/runtime/r789-tier-population.json`
- `apps/web/docs/runtime/r789-trade-reconciliation.json`
- `apps/web/public/registry/kerl/handoffs/rc1-certified-dry-run-handoff.json`
- `apps/web/public/registry/kerl/index.json`
- `apps/web/tsconfig.tsbuildinfo`

### Untracked — classification

| Class | Files |
|-------|-------|
| R790_GENERATED_ARTIFACT | `r790-indexer-sequential-runs.json`, `r790-indexer-coverage.json`, `r790-indexer-lock-proof.json` (partial; certification in flight) |
| PRE_EXISTING_UNRELATED | `.cursor/`, `.env.r772-audit`, `.env.r773-prod`, r774–r789 screenshot dirs, `package-lock.json`, kerl screenshots, etc. |
| R790_VALID_COMPLETE | `recovery/R790_CONTINUATION_RECOVERY.md` (stale HEAD; superseded by this doc) |

### Staged

None.

## Incomplete / suspicious files at recovery

| File | Issue | Action |
|------|-------|--------|
| `r790-indexer-sequential-runs.json` | Stale partial batch (`5d1a404f`, 3/10 clean) | Regenerate when live cert completes |
| `R790_CONTINUATION_RECOVERY.md` | HEAD listed `0dfd254e`; implementation already at `20ae144b` | Superseded |
| Orphan process PID 80241 | `R790_UNTIL_COVERAGE_COMPLETE=1 MAX_RUNS=40` cert still running | Preserve; monitor to completion |

## Commands inferable at crash

```bash
cd apps/web && R790_REPO_SHA=20ae144b R790_UNTIL_COVERAGE_COMPLETE=1 \
  R790_INDEXER_RUNS=10 R790_INDEXER_MAX_RUNS=40 R790_INDEXER_DELAY_MS=8000 \
  node scripts/r790-indexer-certification.mjs 2>&1 | tee /tmp/r790-cert.log | tail -50
```

Log at recovery: run 28/40, coverage ~5.90%, lease skips retried successfully.

## Continuation plan

1. **Phase 1–2:** Classify dirty files (above); validate committed R790 modules (lease, adaptive scan, G2, protocol bounds).
2. **Phase 3:** Checkpoint already pushed (`5d1a404f` + `20ae144b`); no restage of unrelated dirt.
3. **Phase 4–6:** Let in-flight certification finish; run G2/tier/protocol artifact scripts sequentially; commit artifacts only.
4. **Phase 7:** `vitest` targeted tests + `npm run build` (already green on lease/adaptive/G2/protocol tests).
5. **Phase 8:** Sequential production batches (≤5), cron telemetry proof, no parallel indexer calls.
6. **Phase 9–10:** Final report + honest verdict (bootstrap incomplete → not OPERATIONAL).

## Production snapshot at recovery

- Bootstrap coverage: ~5.9% (`marco-wbnb` 7-day window)
- Tier 1: 6/6 explicit states
- Tier 2: 12/12 explicit states (0 UNSCANNED; several EMPTY_VERIFIED on partial pre-R790 checkpoints)
- Protocol activity events: 0 (orchestrator gates protocol scan until featured bootstrap complete)
- Lease: durable blob, `lockState: free` between runs
- Adaptive telemetry: ~2175 runs remaining @ ~7.3 blocks/s effective
