# R791A.3 — Featured-Pair Coverage Convergence

**Mission:** Close remaining MARCO/WBNB featured-pair bootstrap gap and prove 100% coverage.  
**Production authority:** https://www.melega.finance  
**Repository HEAD:** `37f594387dea19a88f3d697cdb3c6c79fe5ef092`  
**Production build:** `fra1::jjjct-1783951307306-cfd88295d473`  
**Captured:** 2026-07-13T14:01:36Z  

## Preflight

| Check | Result |
|-------|--------|
| Branch | `main` |
| HEAD | `37f594387dea19a88f3d697cdb3c6c79fe5ef092` |
| origin/main | `37f594387dea19a88f3d697cdb3c6c79fe5ef092` |
| `37f59438` in history | yes |
| `INDEXER_CRON_SECRET` / `CRON_SECRET` | present (not printed) |
| Unrelated dirty files | preserved |

## Baseline (Phase 1)

| Field | Value |
|-------|-------|
| `bootstrapWindow.complete` | `false` |
| `coveragePercent` | 99.990% |
| `coveredBlocks` | 636,817 |
| `uncoveredBlocks` | 62 |
| Remaining gap | `109759757`–`109759818` |
| `gapFillCursor` | 109,759,756 |
| `lastIndexedBlock` | 109,759,756 |
| `chainHead` | 109,759,830 |
| `lastSuccessfulSync` | 2026-07-13T14:00:04.954Z |
| Last orchestrator run | 2026-07-13T13:55:26.208Z (ok, featuredBootstrapComplete) |
| Lease state | free at baseline read |
| Store consistency | `true` |

**Note:** Prior R791A.2 certified gap `109758454`–`109758707` (254 blocks) had already advanced; baseline at mission start showed a smaller head-edge gap only (`109759757`+).

## Execution (Phase 2)

Maximum three sequential invocations. No concurrent requests. No HTTP 504. No hard timeouts.

| Attempt | Lease before | HTTP | Elapsed | ok | Skip reason | Coverage before → after | Uncovered before → after | gapFill before → after | lastIndexed before → after |
|--------:|--------------|-----:|--------:|:--:|-------------|-------------------------|--------------------------|------------------------|----------------------------|
| 1 | held | — | 0 ms | no | lease-held-before-run | 99.983% → 99.983% | 110 → 111 | 109759756 → 109759756 | 109759756 → 109759756 |
| 2 | held | — | 0 ms | no | lease-held-before-run | 99.976% → 99.975% | 156 → 157 | 109759756 → 109759756 | 109759756 → 109759756 |
| 3 | held | — | 0 ms | no | lease-held-before-run | 99.968% → 99.968% | 203 → 204 | 109759756 → 109759756 | 109759756 → 109759756 |

- **Successful invocations:** 0  
- **Lease skips:** 3 (20 s wait + one re-read each; lock owner `manual:37f5943:iad1:1783951201457`)  
- **HTTP 504:** 0  
- **Hard timeouts:** 0  
- **Checkpoint regression:** none  
- **False cursor jump:** none  

Uncovered block counts rose during waits because BSC chain head advanced while the lease remained held; `gapFillCursor` and `lastIndexedBlock` did not regress.

## Final certification (Phase 3)

| Field | Value |
|-------|-------|
| `bootstrapWindow.complete` | `false` |
| `coveragePercent` | 99.968% |
| `uncoveredBlocks` | 206 |
| Remaining gap ranges | `[{ fromBlock: 109759757, toBlock: 109759962 }]` |
| Store consistency | `true` |
| `featuredBootstrapComplete` (last run) | `true` |
| Tier-1 `marco-wbnb` | `EMPTY_VERIFIED` |

### Interior vs live head (A / B)

| Dimension | State |
|-----------|-------|
| **A. Bootstrap interior window** | Complete through block 109,759,756 (single continuous range `109122940`–`109759756`; no interior gaps) |
| **B. Live head synchronization** | In progress — gap `109759757`–chain head (~218 blocks lag at certification) |

PASS criteria for 100% bootstrap window completion were **not** met because the rolling window to chain head still shows uncovered head-edge blocks and no manual run could execute.

## Errors and skips

- 3× lease-held-before-run (no forced execution per mission rules)
- 0× HTTP 504
- 0× hard timeout
- 0× malformed JSON / unexpected non-2xx on attempted POST (no POST attempted after lease skip)

## Verdict

**`R791A_3_FEATURED_PAIR_COVERAGE_PARTIAL`**

Mission could not close the head-edge gap: all three planned invocations were skipped due to active lease contention. Interior historical coverage through `gapFillCursor` is intact; live head lag remains.

## Artifacts

- `apps/web/docs/runtime/r791a3-featured-pair-convergence.json`
- `apps/web/docs/runtime/R791A_3_FEATURED_PAIR_CONVERGENCE.md`
