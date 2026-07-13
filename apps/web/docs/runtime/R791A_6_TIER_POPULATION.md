# R791A.6 — Tier-1 / Tier-2 Population Certification

**Mission:** Explicit tier pair state completion via up to five sequential production indexer runs.  
**Production authority:** https://www.melega.finance  
**Repository HEAD:** `e682e2c224672e06bf36134252cc15fcf8e36aa1`  
**Production deployment:** `e682e2c224672e06bf36134252cc15fcf8e36aa1`  
**Captured:** 2026-07-13T15:16:30Z  

## Preflight

| Check | Result |
|-------|--------|
| Branch | `main` |
| HEAD | `e682e2c2` |
| `e682e2c2` in history | yes |
| Production deployment | `e682e2c2` |
| Store consistency at baseline | `true` |

## Initial tier state

### Tier 1 (6 pairs)

| Slug | Status | Reason if not ready |
|------|--------|---------------------|
| marco-wbnb | EMPTY_VERIFIED | — |
| 55d398-963556 | NOT_STARTED | Window/checkpoint incomplete |
| 8ac76a-963556 | NOT_STARTED | Window/checkpoint incomplete |
| 55d398-8ac76a | NOT_STARTED | Window/checkpoint incomplete |
| 8ac76a-bb4cdb | NOT_STARTED | Window/checkpoint incomplete |
| 55d398-bb4cdb | NOT_STARTED | Window/checkpoint incomplete |

**Summary:** READY 0 · EMPTY_VERIFIED 1 · NOT_STARTED 5

### Tier 2 (12 pairs)

All 12 pairs: **NOT_STARTED** (UNSCANNED — bootstrap window not complete per pair checkpoint).

**Summary:** READY 0 · EMPTY_VERIFIED 0 · NOT_STARTED 12

## Five-run execution

| # | Lease before | HTTP | Elapsed | Result | Tier-1 job | Tier-2 job | Events | Notes |
|---|--------------|-----:|--------:|--------|------------|------------|-------:|-------|
| 1 | held/healthy | 200 | 0 ms | skip | — | — | — | lease-held-healthy-skip (35s wait) |
| 2 | held/healthy | 200 | 0 ms | skip | — | — | — | lease-held-healthy-skip (35s wait) |
| 3 | free/stale | 200 | 16,173 ms | ok | 55d398-8ac76a | 502eed-ede11c | 0 | Cursors advanced; status unchanged (window incomplete) |
| 4 | free/stale | 200 | 396 ms | skip | — | — | — | LEASE_ACTIVE_BY_OTHER_WORKER |
| 5 | free/stale | 200 | 370 ms | skip | — | — | — | LEASE_ACTIVE_BY_OTHER_WORKER |

- **Clean runs:** 1  
- **Lease skips:** 4  
- **HTTP 504:** 0  
- **Hard timeouts:** 0  

Attempt 3 advanced tier cursors (`55d398-8ac76a` → 109421314, `502eed-ede11c` → 109424429) but tier-metrics still reports NOT_STARTED because each pair’s declared scan window is not yet fully covered (~340k block lag remains).

## Final tier state

### Tier 1

| Slug | Status |
|------|--------|
| marco-wbnb | EMPTY_VERIFIED |
| 55d398-963556 | NOT_STARTED |
| 8ac76a-963556 | NOT_STARTED |
| 55d398-8ac76a | NOT_STARTED |
| 8ac76a-bb4cdb | NOT_STARTED |
| 55d398-bb4cdb | NOT_STARTED |

**Summary:** READY 0 · EMPTY_VERIFIED 1 · NOT_STARTED 5 · ERROR 0

### Tier 2

All 12 pairs remain **NOT_STARTED**.

**Summary:** READY 0 · EMPTY_VERIFIED 0 · NOT_STARTED 12 · ERROR 0

## Newly classified pairs

None — no pair transitioned to READY or EMPTY_VERIFIED during this micro-mission.

## Certification

| Criterion | Result |
|-----------|--------|
| Tier 1 = 6/6 READY or EMPTY_VERIFIED | **no** (1/6) |
| Tier 2 all explicit non-NOT_STARTED | **no** (12/12 NOT_STARTED) |
| ≥3 Tier-2 newly READY/EMPTY_VERIFIED | **no** (0) |
| Store consistency | **true** |
| HTTP 504 | 0 |
| Hard timeouts | 0 |

## Verdict

**`R791A_6_TIER_POPULATION_PARTIAL`**

Featured pair interior bootstrap is complete; tier pair population requires continued sequential orchestrator runs to close per-pair bootstrap windows before EMPTY_VERIFIED classification is valid.

## Artifacts

- `apps/web/docs/runtime/r791a6-tier-population.json`
- `apps/web/docs/runtime/R791A_6_TIER_POPULATION.md`
