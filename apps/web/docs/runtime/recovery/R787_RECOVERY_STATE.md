# R787 Recovery State

Captured: 2026-07-12T13:50Z (before R787 code changes)

## Repository State

| Field | Value |
|-------|-------|
| Branch | `main` |
| HEAD | `59d56b02b8caf604d20345e198728ad48fbe9a6b` |
| origin/main | `59d56b02b8caf604d20345e198728ad48fbe9a6b` |
| R786 commit present | `59d56b02` — **yes** |
| Merge/rebase active | **no** |
| Prior verdict | `R786_PRODUCTION_DATA_BLOCKED` (authoritative) |

## Production Aliases

| Alias | Status at recovery |
|-------|-------------------|
| `https://melega.finance` | Live — redirects 308 → `www.melega.finance` |
| `https://www.melega.finance` | Live — readiness `verdict: ready` |
| `https://dex.melega.ai` | **Not verified in R786** (SSL failure) |

## Deployed Build Identifier

- Repository commit deployed: `59d56b02`
- Vercel server header: `Vercel` (no build ID in HTTP headers at recovery time)
- Indexer generation: `v2-featured-pair`

## Vercel Cron Configuration

From `apps/web/vercel.json`:

| Path | Schedule |
|------|----------|
| `/api/indexer/run/` | `*/5 * * * *` (every 5 minutes) |
| `/api/indexer/registry/refresh/` | `0 3 * * *` (daily 03:00 UTC) |

Indexer API `maxDuration`: 300 seconds.

## Canonical Blob Namespaces

| Pair / scope | Namespace |
|--------------|-----------|
| MARCO/WBNB (featured) | `melega-indexer/v2/featured-pairs/marco-wbnb` |
| Tier-1 secondary | `melega-indexer/v2/featured-pairs/{slug}` |
| Tier-2 | `melega-indexer/v2/featured-pairs/{slug}` |
| Legacy (read-disabled) | `bsc-indexer/*` |

## Indexer Checkpoint Schema (v2)

Fields in `IndexerCheckpoint` (`types.ts`):

- `schemaVersion`, `chainId`, `lastIndexedBlock`, `chainHeadAtSync`
- `reorgSafetyBlocks`, `lastSuccessfulSync`, `lastFailureReason`
- `chunkSize`, `cursorPairIndex`, `phase`, `featuredPairSlug`
- `bootstrapStartBlock`, `bootstrapDays`, `providerUsed`
- `resetReason`, `resetAt`, `anchorSeeded`
- `forwardCursor` — highest block scanned toward head
- `gapFillCursor` — monotonic gap-fill scan position (R786)
- `backwardCursor` — backward bootstrap position

**Not yet present (R787 target):** `coverageRanges[]`, tier scheduler state, protocol-activity checkpoints.

## Production Cursors (live probe 2026-07-12T13:50Z)

### MARCO/WBNB (`/api/indexer/health`)

| Field | Value |
|-------|-------|
| forwardCursor / gapFillCursor | `109124240` |
| backwardCursor | `null` |
| bootstrapStartBlock | `109122940` |
| bootstrapDays | `7` |
| chainHead | `109566576` |
| indexingLag | `442336` (cursor at bootstrap floor — interior gap fill in progress) |
| last indexed range | `109124041` → `109124140` |
| phase | `bootstrap` |
| providerUsed | `chunked-forward-eth_getLogs` |

### Event / Candle Counts (populated pairs)

| Slug | Swaps | Mints | Burns | Candles 1H | tradeCount24h | Status |
|------|-------|-------|-------|------------|---------------|--------|
| marco-wbnb | 3 | 0 | 0 | 3 | 1 | tier-metrics READY |
| 55d398-963556 | 0 | 0 | 0 | 0 | 0 | checkpoint exists, not populated |
| All other tier-1/2 | 0 | 0 | 0 | 0 | 0 | NOT_SCANNED / RPC_UNAVAILABLE |

Interior gap: blocks `~109124k → ~109542k` largely unindexed (sparse events at `86326727`, `109323984`, `109542524` only).

## R786 Visual Matrix Failures (32/88)

Audit source: `r786-screenshots/r786-matrix-report.json` (captured 2026-07-12T10:56Z).

| Viewport | Route | Failure |
|----------|-------|---------|
| 1728×1080 | liquidity-studio | dupUnavailable |
| 1728×1080 | pools | dupUnavailable |
| 1728×1080 | farms | **brokenImg** |
| 1728×1080 | collectibles | dupUnavailable |
| 1440×900 | liquidity-studio | dupUnavailable |
| 1440×900 | pools | dupUnavailable |
| 1440×900 | farms | **brokenImg** |
| 1440×900 | collectibles | dupUnavailable |
| 1280×800 | liquidity-studio | dupUnavailable |
| 1280×800 | pools | dupUnavailable |
| 1280×800 | farms | **brokenImg** |
| 1280×800 | collectibles | dupUnavailable |
| 1024×768 | liquidity-studio | dupUnavailable |
| 1024×768 | pools | dupUnavailable |
| 1024×768 | farms | **brokenImg** |
| 1024×768 | collectibles | dupUnavailable |
| 768×1024 | liquidity-studio | dupUnavailable |
| 768×1024 | pools | dupUnavailable |
| 768×1024 | farms | **brokenImg** |
| 768×1024 | collectibles | dupUnavailable |
| 430×932 | liquidity-studio | dupUnavailable |
| 430×932 | pools | dupUnavailable |
| 430×932 | farms | **brokenImg** |
| 430×932 | collectibles | dupUnavailable |
| 390×844 | liquidity-studio | dupUnavailable |
| 390×844 | pools | dupUnavailable |
| 390×844 | farms | **brokenImg** |
| 390×844 | collectibles | dupUnavailable |
| 360×800 | liquidity-studio | dupUnavailable |
| 360×800 | pools | dupUnavailable |
| 360×800 | farms | **brokenImg** |
| 360×800 | collectibles | dupUnavailable |

**Summary:** 8 farms broken-image failures + 24 duplicate-unavailable failures (liquidity-studio, pools, collectibles × 8 viewports).

Routes passing all 8 viewports: `/`, `/trade`, `/trending`, `/projects`, `/radar`, `/build-studio`, `/status`.

## R786 Gate Scripts (baseline)

- `scripts/r786-data-gates.mjs` — static gates for registry fix, forward-priority, G2, tier sync, inventory, store-consistency
- `scripts/r785-founder-production-gates.mjs` — UI copy and reconciliation stubs
- `scripts/r780-data-quality-gates.mjs` — data quality

## Unrelated Dirty Files (excluded from R787 commits)

**Modified (tracked):**
- `apps/web/docs/runtime/r778-verify.mjs`
- `apps/web/docs/runtime/r780-data-quality-gates.json`
- `apps/web/public/registry/kerl/handoffs/rc1-certified-dry-run-handoff.json`
- `apps/web/public/registry/kerl/index.json`
- `apps/web/tsconfig.tsbuildinfo`

**Untracked (preserve, do not commit):**
- `.cursor/`
- `apps/web/.env.r772-audit`
- `apps/web/.env.r773-prod`
- Prior mission screenshot/report artifacts (`r774`–`r785`, `r777`, `r778`, `r782`, `r783`, `r784`)
- `package-lock.json`
- Various audit scripts (`r772-rpc-log-fetch-audit*`)
- `docs/runtime/screenshots/r767/`, `r769/`

## R787 Mission Entry Conditions

1. Trending empty — 24H change required as listing gate (to be corrected).
2. Protocol Activity AMM-only — MasterChef/SmartChef not wired.
3. MARCO/WBNB interior gap unindexed — gapFill reset active but ~442k blocks remain.
4. Tier-2 stores empty — scheduler not durable.
5. Cron intermittently hits 300s FUNCTION_INVOCATION_TIMEOUT.
6. 32/88 responsive checks fail.
7. SmartChef 242-contract classification not executed.
8. `dex.melega.ai` not verified.
