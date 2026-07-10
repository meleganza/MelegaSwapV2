# R768 — Production On-Chain Indexer and Full Discovery Activation

## Verdict criteria

Pass requires:

- Full verified pool universe visible (only `invalid_contract` hidden)
- Production indexer operational with **durable** persistence (`BLOB_READ_WRITE_TOKEN`)
- Real production swap events and chart candles in durable store
- Deployed production SHA verified

Without Vercel secrets/storage, deploy honest `UNAVAILABLE` surfaces — verdict remains **BLOCKED**.

## Pair visibility (Part A)

| Classification | Visible | Notes |
|---|---|---|
| `tradeable` | Yes | Full metadata + liquidity |
| `liquidity_present` | Yes | May lack APR |
| `inactive` | Yes | Ended / unfunded |
| `metadata_incomplete` | Yes | Short address + generic avatar |
| `invalid_contract` | **Hidden** | Only class fully excluded |

SmartChef: `listUsablePools` → `listDiscoverablePools` (R768).  
AMM: `public/registry/onchain/bsc-mainnet.json` → `/api/indexer/pairs` with pagination/search.

## Indexer architecture (Part B)

```
BSC RPC → chunked eth_getLogs → checkpoint → normalized event store → read APIs → UI
```

| Component | Path |
|---|---|
| Core sync | `apps/web/src/lib/bsc-indexer/indexer/syncIncremental.ts` |
| RPC chunking | `apps/web/src/lib/bsc-indexer/rpc/chunkedLogs.ts` |
| Dev storage | `data/bsc-indexer/` (JSON filesystem) |
| Production storage | Vercel Blob when `BLOB_READ_WRITE_TOKEN` set |
| Cron | `vercel.json` → `/api/indexer/run` every 5 min |
| Backfill | `apps/web/scripts/r768-indexer-backfill.mjs` |

## API endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/indexer/health` | Lag, event counts, storage backend |
| `POST /api/indexer/run` | Protected incremental sync |
| `GET /api/indexer/events` | Normalized events (pair filter, pagination) |
| `GET /api/indexer/candles` | OHLCV 1H/4H/1D |
| `GET /api/indexer/pairs` | Classified AMM registry query |
| `GET /api/runtime/readiness` | Production env checklist |
| `GET /api/holder-count` | Server-side `BSCSCAN_API_KEY` holders |

## Vercel Production secrets

```
BSC_RPC_URL
BSC_RPC_FALLBACK_URL (optional)
BSCSCAN_API_KEY
BLOB_READ_WRITE_TOKEN
INDEXER_CRON_SECRET
CRON_SECRET
```

## Homepage opportunity selection (Part J)

- **Top Farm**: MasterChef farm universe via `useGetTopFarmsByApr` (on-chain farms state)
- **Top Pool**: SmartChef staking pools via `useGetTopPoolsByApr` — not mixed with AMM LP pairs
- **Top AMM trade opportunity**: `selectTopAmmPair()` from on-chain registry (liquidity-ranked)

## Remaining production blockers

Until secrets are provisioned and indexer cron runs:

1. Durable event store empty → Live Activity / Recent Swaps / Candles show `UNAVAILABLE` or `EMPTY`
2. Holder count requires `BSCSCAN_API_KEY`
3. Historical backfill must be executed via `r768-indexer-backfill.mjs` against production URL
