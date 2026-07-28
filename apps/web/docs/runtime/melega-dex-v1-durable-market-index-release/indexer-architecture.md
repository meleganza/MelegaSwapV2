# Durable Market Index Architecture

## Invocation

- Vercel Cron `*/5 * * * *` → `POST/GET /api/indexer/run/?budget=full` (`apps/web/vercel.json`)
- Daily `0 3 * * *` → `/api/indexer/registry/refresh/` (Factory pair enumeration)
- Auth: `Authorization: Bearer $CRON_SECRET|$INDEXER_CRON_SECRET` or Vercel `x-vercel-cron: 1`
- Lease/lock: blob-backed `indexerLease` prevents overlapping heavy runs
- `maxDuration`: 300s; orchestrator uses bounded deadline budget (~240s)

## Durable storage

- Primary: Vercel Blob `melega-indexer/v2/featured-pairs/{slug}/` when `BLOB_READ_WRITE_TOKEN` set
- Fallback: filesystem `BSC_INDEXER_DATA_DIR` / `data/melega-indexer/...`
- Per-slug: `checkpoint.json`, `events.json`, `candles/*`, `health.json`
- Registry: `melega-indexer/v2/registry/bsc-mainnet.json`

## Sync pipeline

1. **Featured pair** MARCO/WBNB always (`runFeaturedPairSync` → `runPairSyncEngine`)
2. **Protocol activity** MasterChef (separate topics OR-filter)
3. **Tier-1 / Tier-2** rotating pairs after featured bootstrap coverage ~complete
4. Founder Featured Project WBNB pairs are prioritized into Tier-1

## Event topics (critical)

```
topics: [[SWAP_TOPIC, MINT_TOPIC, BURN_TOPIC]]  // topic0 OR
```

Flat `[SWAP, MINT, BURN]` is an AND across topic slots and matches zero AMM logs.

Burn signature must be `Burn(address,uint256,uint256,address)`.

## Checkpoints

Persisted fields include `lastIndexedBlock`, `gapFillCursor`, `coverageRanges`, `phase`, `resetReason`, `chainHeadAtSync`. Successful cursor never advances past unscanned gaps. Self-heal reason `R792_PAIR_SYNC_TOPICS_OR_FILTER_CORRECTION` clears false-complete coverage when Swap≤3 with ≥90% claimed coverage.

## Product consumers

| Surface | Source |
|---|---|
| Top Movers | `useDexTrendingRankings` ← featured events/candles + `/api/indexer/tier-metrics` + protocol activity |
| Home 24H Volume | tier-metrics quote volume × WBNB USD |
| Featured Projects | `/api/indexer/featured-markets` (reserves + indexed swaps; last-good preserved) |
| Explore Pools TVL | Factory reserves × quote USD (+ subgraph when present) |
| Explore Pools volume/fees | subgraph or tier-metrics × `LP_HOLDERS_FEE` |

## Env (server)

`BSC_RPC_URL`, `BSC_RPC_FALLBACK_URL`, `BLOB_READ_WRITE_TOKEN`, `CRON_SECRET` / `INDEXER_CRON_SECRET`, `INDEXER_HTTP_BUDGET_MS`, `BSC_INDEXER_DATA_DIR`
