# R791A.6K — Post-Worker Tier Progress and Single-Run Certification

**Mission:** Verify post-worker tier progress and stage-budget behavior on production without stealing an active lease.  
**Production authority:** `c444e8b7654f271cf5328027a9b073d733c22380`  
**Build ID:** `y_bp67MMr2J-YFqwprUJu`  
**Captured:** 2026-07-14T13:30:20Z  

## Phase 1 — Initial Snapshot

| Field | Value |
|-------|-------|
| activeDeploymentSha | `c444e8b7` |
| lockState / lockHealth | `held` / `healthy` |
| lockOwner | `manual:c444e8b:iad1:1784035548253` |
| lockExpiresAt | `2026-07-14T13:30:18.292Z` |
| gapFillCursor | 109947134 |
| coveragePercent | 99.949% |
| coveredBlocks / uncoveredBlocks | 824195 / 421 |
| store consistency | `true` |

### Initial stage timings (lastOrchestratorRun @ 13:25:54Z)

| Stage | Duration (ms) |
|-------|--------------:|
| init | 38 |
| featured-sync | 3737 |
| protocol-activity | 466 |
| tier1-sync | 1248 |
| tier2-sync | 685 |
| **total elapsed** | **6257** / 240000 budget |

## Phase 2 — Controlled Wait (70s)

After a single 70-second wait:

| Observation | Result |
|-------------|--------|
| Original owner released lease | **no** — same owner retained |
| New cron owner acquired | **no** |
| lastOrchestratorRun changed | **no** |
| gapFillCursor advanced | **no** (109947134 stable) |
| coverage metric changed | **yes** — 99.949% → 99.929% (chain-head drift; covered blocks unchanged) |
| Tier-1 / Tier-2 status changed | **no** |

## Phase 3 — Single Manual Run Decision

**Manual run executed:** no  
**Skip reason:** `AUTONOMOUS_WORKER_ACTIVE` (Case C)  
**Case A also triggered:** coverage metric drift during wait — manual invocation prohibited.

No POST to `/api/indexer/run/` was made.

## Phase 4 — Tier Reconciliation

Classification maps production `UNSCANNED` → `NOT_STARTED`; `EMPTY_VERIFIED` retained only where declared scan range is complete.

### Tier 1 (6 pairs)

| Slug | Classification | Production status | Orchestrator cursor |
|------|----------------|-------------------|--------------------:|
| marco-wbnb | EMPTY_VERIFIED | EMPTY_VERIFIED | 109947134 |
| 55d398-963556 | NOT_STARTED | UNSCANNED | — |
| 8ac76a-963556 | NOT_STARTED | UNSCANNED | — |
| 55d398-8ac76a | NOT_STARTED | UNSCANNED | 109429714 |
| 8ac76a-bb4cdb | NOT_STARTED | UNSCANNED | — |
| 55d398-bb4cdb | NOT_STARTED | UNSCANNED | — |

**Totals:** READY 0 · EMPTY_VERIFIED 1 · SYNCING 0 · NOT_STARTED 5 · errors 0

### Tier 2 (12 pairs)

All 12 pairs: **NOT_STARTED** (production `UNSCANNED`; bootstrap windows incomplete).

Notable orchestrator cursor: `52abb0-bb4cdb` → 109422969 (processed this run; next work item).

**Totals:** READY 0 · EMPTY_VERIFIED 0 · SYNCING 0 · NOT_STARTED 12 · errors 0

### Processed slugs (latest orchestrator run)

| Stage | Slug |
|-------|------|
| featured | `marco-wbnb` |
| Tier-1 | `55d398-8ac76a` |
| Tier-2 | `52abb0-bb4cdb` |

## Phase 5 — Stage-Budget Certification

| Criterion | Result |
|-----------|--------|
| featured-sync bounded (not full invocation) | **pass** — 3737 ms of 240000 ms |
| protocol-activity receives slot | **pass** — 466 ms |
| Tier-1 receives slot | **pass** — 1248 ms |
| Tier-2 receives slot | **pass** — 685 ms |
| Order: featured → protocol → Tier-1 → Tier-2 | **pass** |
| HTTP 504 | **0** |
| Hard timeout | **0** |
| Store consistency | **true** |
| gapFillCursor monotonic | **pass** — 109947134 → 109947134 |

## Coverage and cursor delta

| Metric | Before | After |
|--------|-------:|------:|
| coveragePercent | 99.949% | 99.929% |
| coveredBlocks | 824195 | 824195 |
| uncoveredBlocks | 421 | 586 |
| gapFillCursor | 109947134 | 109947134 |

## Verdict

**`R791A_6K_STAGE_BUDGET_PASS_TIER_PROGRESS_PARTIAL`**

Stage budgeting is certified live: all four downstream stages received execution time and featured-sync did not monopolize the 240s budget. Tier pair population remains partial — only `marco-wbnb` is EMPTY_VERIFIED; tier cursors advanced for `55d398-8ac76a` and `52abb0-bb4cdb` but declared scan windows are not yet complete for EMPTY_VERIFIED classification.

## Artifacts

- `apps/web/docs/runtime/r791a6k-tier-progress.json`
- `apps/web/docs/runtime/R791A_6K_TIER_PROGRESS_CERTIFICATION.md`
