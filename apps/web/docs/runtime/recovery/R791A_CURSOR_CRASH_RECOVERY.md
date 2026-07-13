# R791A Cursor Crash Recovery

**Written:** 2026-07-13  
**Mission:** R791A.1 — recovery-only micro-mission (no production execution)

## Git state at recovery

| Field | Value |
|-------|-------|
| Branch | `main` |
| HEAD (pre-recovery) | `3f768f9cd517cdd67727130dac2ae9134ec4b0ea` |
| origin/main | `3f768f9cd517cdd67727130dac2ae9134ec4b0ea` |
| Merge/rebase/cherry-pick/bisect | None active |

## Files found after crash

| File | Classification | Action |
|------|----------------|--------|
| `apps/web/scripts/r791a-indexer-convergence.mjs` | R791A_RECOVERY | Hardened + committed |
| `apps/web/docs/runtime/r791a-indexer-convergence.json` | GENERATED | Excluded (prior session artifact) |
| `apps/web/docs/runtime/r778-verify.mjs` | PREEXISTING_UNRELATED | Excluded |
| `apps/web/docs/runtime/r789-*.json` | PREEXISTING_UNRELATED | Excluded |
| `apps/web/src/views/PoolsStudio/components/PoolGridCard.tsx` | PREEXISTING_UNRELATED | Excluded |
| `apps/web/src/lib/data-truth/dexIntelligenceDisposition.ts` | PREEXISTING_UNRELATED | Excluded |
| `apps/web/tsconfig.tsbuildinfo` | GENERATED | Excluded |
| `.cursor/`, screenshots, `.env.*` | UNKNOWN / GENERATED | Excluded |

## State of `r791a-indexer-convergence.mjs`

Pre-recovery script at `3f768f9c` was syntactically complete (123 lines) but unsafe by construction:

- `R791A_RUNS` env could exceed 5 invocations
- No `INDEXER_CRON_SECRET` / `CRON_SECRET` support
- Read requests had no explicit timeout
- Loop did not stop immediately on HTTP 504 or other non-2xx indexer run responses
- Unused `healthBefore` fetch per run

## Repairs applied (this recovery session)

1. Hard cap `MAX_RUNS = 5` regardless of env
2. Auth via `INDEXER_CRON_SECRET` or `CRON_SECRET`, fallback `x-vercel-cron`
3. `AbortSignal.timeout` on all HTTP calls (30s read, 300s run)
4. Stop loop immediately on HTTP 504 or non-2xx for indexer run POST
5. Fail fast on non-2xx baseline/final read endpoints
6. Removed unused per-run health-before fetch
7. Documented artifact output path unchanged

## Production execution in this recovery session

**None.** No production API calls, no background indexer tasks, no build, no Playwright.

Prior session (pre-crash) completed a 5-run batch and committed evidence at `3f768f9c`; artifact `r791a-indexer-convergence.json` remains local/uncommitted.

## Next separate execution mission

**R791A.2 — FIVE-RUN PRODUCTION EXECUTION**

```bash
cd apps/web && \
R791A_REPO_SHA="$(git rev-parse --short HEAD)" \
R791A_RUNS=5 \
node scripts/r791a-indexer-convergence.mjs
```

Optional: set `R791A_BASE`, `VERCEL_BYPASS`, `INDEXER_CRON_SECRET` or `CRON_SECRET` from secure env.
