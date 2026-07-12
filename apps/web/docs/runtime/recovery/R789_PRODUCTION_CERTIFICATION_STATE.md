# R789 Production Certification State

Captured: 2026-07-12T16:24Z

## Repository State

| Field | Value |
|-------|-------|
| Branch | `main` |
| HEAD | `5d718c9933af04572a849c2344510f7a5dbc2e5a` |
| origin/main | `5d718c99` |
| R788 commit present | **yes** |
| Merge/rebase | **none** |

## Production Deployment

| Field | Value |
|-------|-------|
| GitHub Production deployment | `5d718c99` @ 2026-07-12T16:12:00Z |
| Deployment ID | `5414071837` |
| Canonical host | `https://www.melega.finance` |
| Redirect | `https://melega.finance` → 308 → `www` |
| Next.js buildId | `IyxXJDpsJztizZ-9v-n1l` |
| HTTP status | 200 |

## Environment Readiness (live)

| Check | Status |
|-------|--------|
| `/api/runtime/readiness` | `verdict: ready` |
| BLOB_READ_WRITE_TOKEN | configured |
| INDEXER_CRON_SECRET | configured (production) |
| BSC RPC primary/fallback | ok |
| Indexer generation | `v2-featured-pair` |

## Indexer Baseline (pre-R789 activation)

| Field | Value |
|-------|-------|
| featuredPairSlug | `marco-wbnb` |
| phase | `bootstrap` |
| lastIndexedBlock | `109124340` |
| chainHead | `109587007` |
| indexingLag | `462667` |
| eventCounts.Swap | `3` |
| lastSuccessfulSync | `2026-07-12T15:30:23Z` |

## Screenshot / Gate Baseline

| Artifact | Status |
|----------|--------|
| R786 matrix | 32/88 failed (farms brokenImg, liquidity/pools/collectibles dupUnavailable) |
| R788 matrix | not yet executed on production |
| R789 matrix | pending |

## Unrelated Dirty Files (preserved)

- `apps/web/docs/runtime/r778-verify.mjs`
- kerl registry JSON
- prior screenshot artifacts
- `.env.*` audit files

## R789 Mission Status

**IN PROGRESS** — production serving R788; sequential indexer activation and 88/88 certification executing.
