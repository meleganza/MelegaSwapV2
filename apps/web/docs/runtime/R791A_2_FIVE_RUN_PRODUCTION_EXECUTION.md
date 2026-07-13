# R791A.2 — Five-Run Production Execution

**Production authority:** https://www.melega.finance  
**Execution timestamp:** 2026-07-13T13:48:03Z → 2026-07-13T13:52:12Z  
**Repository SHA (script):** `a4a0c900`  
**Deployed production SHA (observed):** `a4a0c90` (lease owner telemetry)  
**Vercel build ID (observed):** `fra1::6gzq9-1783950738840-bb5c3505bf34`

## Five-run table

| Run | HTTP | OK | Skipped | Elapsed (ms) | Scanned blocks | Gap ranges | Tier-1 | Tier-2 | Coverage after |
|-----|------|----|---------|--------------|----------------|------------|--------|--------|----------------|
| 1 | 200 | yes | no | 16,050 | 338 | 1 | 8ac76a-963556 | 52abb0-bb4cdb | 99.994% |
| 2 | 200 | yes | no | 15,679 | 59 | 1 | 55d398-8ac76a | 502eed-bb4cdb | 99.986% |
| 3 | 200 | no | yes (lease-held-by-other) | 572 | — | — | — | — | 99.982% |
| 4 | 200 | no | yes (lease-held-by-other) | 2,571 | — | — | — | — | 99.957% |
| 5 | 200 | yes | no | 16,143 | 221 | 1 | 55d398-bb4cdb | 502eed-963556 | 99.960% |

## Baseline vs final

| Metric | Baseline | Final | Delta |
|--------|----------|-------|-------|
| Coverage % | 99.947% | 99.960% | +0.013 pp |
| Covered blocks | 634,849 | 635,514 | +665 |
| Uncovered blocks | 335 | 254 | −81 |
| Gap count | 1 | 1 | 0 |
| gapFillCursor | — | 109,758,453 | advanced |
| chainHead | — | 109,758,719 | — |
| featuredBootstrapComplete | false (pre-run window) | true (runs 1/2/5) | yes |
| bootstrapWindow.complete | false | false | — |

## Checkpoint integrity

- Net covered blocks increased (+665); no net regression vs baseline.
- `gapFillCursor` advanced to `109758453`; final single gap `109758454` → `109758707` (chain head lag).
- Runs 3–4 were lease skips with no indexer work; coverage dipped transiently during concurrent holder run 4.
- No HTTP 504. No hard timeouts. All responses HTTP 200.

## Event / tier / store

| Check | Result |
|-------|--------|
| Store consistency | `true` (no failures) |
| Tier-1 scanned (non-UNSCANNED) | 1/6 (`marco-wbnb` EMPTY_VERIFIED) |
| Tier-2 scanned | 0/12 (all UNSCANNED) |
| Tier jobs executed | runs 1, 2, 5 processed tier1+tier2 pairs |
| Protocol activity stage | executed on runs 1, 2, 5 |

## Failures / skips / timeouts

- **HTTP 504:** 0
- **Hard timeouts:** 0
- **Lease skips:** 2 (runs 3, 4 — `lease-held-by-other`)
- **Clean ok runs:** 3/5

## Verdict

**R791A_2_FIVE_RUN_EXECUTION_PARTIAL**

All five invocations completed sequentially with no 504 and store consistency held, but two lease-contentions skipped runs and bootstrap window remains incomplete (254 blocks, 99.96% < 99.999% gate).
