# R791A.5 — Final Coverage Confirmation

**Mission:** Verification-only final coverage confirmation.  
**Production authority:** https://www.melega.finance  
**Repository HEAD:** `50d3ca3a33118ee7e014111f02cda09b6b1964de`  
**Production build:** `fra1::hw2r8-1783954714735-97a70e47519b`  
**Captured:** 2026-07-13T14:59:25Z  

## Preflight

| Check | Result |
|-------|--------|
| Branch | `main` |
| HEAD | `50d3ca3a` |
| origin/main | `50d3ca3a` |
| Lease fix in history | yes |
| Production deployment | `50d3ca3a33118ee7e014111f02cda09b6b1964de` |
| Unrelated dirty files | preserved |

## Initial production state

| Field | Value |
|-------|-------|
| `lockState` | `held` |
| `lockHealth` | `healthy` |
| `lockOwner` | `manual:50d3ca3:iad1:1783954528303` |
| `lockExpiresAt` | 2026-07-13T14:59:58.368Z |
| `coveragePercent` | 99.935% |
| `coveredBlocks` | 644,206 |
| `uncoveredBlocks` | 417 |
| Gap range | `109767146`–`109767562` |
| `gapFillCursor` | 109,767,145 |
| `bootstrapWindow.complete` | `false` |
| Forward lag | 429 blocks |
| Store consistency | `true` |
| `featuredBootstrapComplete` | `true` (last orchestrator run) |

Interior coverage: single continuous range `109122940`–`109767145` (no interior gaps).

## Decision — Case B

Healthy lease active. No manual invocation. Waited exactly 35 seconds and re-read health/coverage.

| After wait | Value |
|------------|-------|
| Lease | still `healthy` / `held` (same owner) |
| Coverage advanced | no (`coveredBlocks` unchanged at 644,206) |
| `uncoveredBlocks` | 526 (chain head moved; head-edge only) |
| Gap range | `109767146`–`109767671` |
| Manual execution | **none** |

Uncovered block count rose only because BSC mined new blocks after `gapFillCursor`; this is forward live sync lag, not an unresolved interior gap.

## Certification

| Criterion | Result |
|-----------|--------|
| `bootstrapWindow.complete` | `false` (rolling window to chain head) |
| `historicalBootstrapComplete` | **true** |
| `forwardLiveSync` | **active** |
| `currentHeadLag` | ~538 blocks |
| Interior gap | none |
| Store consistency | `true` |
| Cursor regression | none |
| False cursor jump | none |
| HTTP 504 | 0 |
| Hard timeouts | 0 |

## Verdict

**`R791A_5_FEATURED_PAIR_FORWARD_SYNC_ACTIVE`**

Historical featured-pair bootstrap interior is complete through block 109,767,145. The remaining uncovered range is exclusively the moving chain-head edge; cron/manual forward sync will close it on the next successful run after lease release.

## Artifacts

- `apps/web/docs/runtime/r791a5-final-coverage.json`
- `apps/web/docs/runtime/R791A_5_FINAL_COVERAGE_CONFIRMATION.md`
