# R786 Production Data Recovery

Captured: 2026-07-12 (before R786 indexer activation)

## Pre-Mission Repository State

| Field | Value |
|-------|-------|
| Branch | `main` |
| HEAD | `22b9e581` |
| origin/main | `22b9e581` |
| R785 commits present | `2148fb27`, `22b9e581` |
| Merge/rebase active | No |

## State Classification (Pre-R786)

| Surface | UI Correct | Pipeline Wired | Pipeline Populated | Production Visible |
|---------|------------|----------------|------------------|-------------------|
| Trending ticker | Yes (R785 empty copy) | Partial | **No** | **No** (tier-metrics rows=[]) |
| Protocol Activity | Yes (R785 messages) | Partial | **No** (2 swaps only) | **No** recent rows |
| Trade Recent Swaps | Yes | Yes | Partial | Partial (2 historical swaps) |
| Trade chart/candles | Yes (3+ rule) | Yes | **No** (invalid interval probe) | **No** line |
| Pools lifecycle | Yes (R785 hero) | Yes | Yes | Yes (0 rewarding proven) |
| Farms emission | Yes | Yes | Yes | Yes (144K/day) |

## Production API Snapshots (Pre-Implementation)

### `/api/indexer/health`
- status: `ready`, phase: `bootstrap`
- lastIndexedBlock: `109323531`, chainHead: `109538871`, lag: `215340`
- eventCounts: `{ Swap: 2 }`
- bootstrapDays: `7`, bootstrapStartBlock: `109122940`

### `/api/indexer/events?limit=5`
- 2 Swap events (blocks `109323984`, older anchor `1773393280` timestamps)
- MARCO/WBNB pair `0x7286...61d1e`

### `/api/indexer/tier-metrics`
- **tier1Count: 0, tier2Count: 0, rows: []**
- Root cause: `tierInventory.ts` treated `resolveOnchainRegistry()` wrapper as registry object (`registry?.amm` undefined)

### `/api/runtime/swaps?limit=5`
- 2 transactions mapped from indexer store
- meta.status: `ready`, indexingLag: `214952`

### `/api/runtime/readiness`
- verdict: `ready`, featuredPairIndexer: `READY`
- multiPairHistoricalIndexer: `DEFERRED`

### `/api/indexer/pairs?limit=5`
- Registry pairs returned with reserves (discovery OK)

### `/api/masterchef/emission`
- totalDailyEmission: `144000`, currentBlock: `109538940`

## Root Causes Identified

1. **Empty tier-metrics** — registry destructuring bug in `tierInventory.ts` (not external limitation).
2. **215k block lag** — backward-only 5-block/cron crawl without forward-priority chunked sync.
3. **Tier-2 never populated** — tier1 beyond MARCO/WBNB not synced; tier2 rotation too slow.
4. **No dual cursor** — recent head blocks not indexed while bootstrap crawls backward.

## R786 Implementation Targets

- Fix tier inventory registry read
- Canonical Tier 1 Factory-proven pairs
- Forward-priority dual-cursor `pairSyncEngine`
- Sync all Tier 1 + rotating Tier 2 in `/api/indexer/run`
- Complete G2 reconciliation module + tests
- Inventory + store-consistency diagnostics
- 88-screenshot responsive matrix script

## Verdict Rule

`R786_PRODUCTION_DATA_OPERATIONAL` only when production shows reconciled trending, activity, swaps, and charts.
Until indexer cycles populate stores after deploy, expect `R786_PRODUCTION_DATA_BLOCKED`.
