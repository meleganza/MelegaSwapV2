# R731 — Whale / Smart-Money Indexer Spec

**Status:** `WHALE_INDEXER_NOT_DEPLOYED`  
**Frontend env (future):** `NEXT_PUBLIC_WHALE_INDEXER_URL`

---

## Repo search result

No whale or smart-money HTTP endpoint, API key, subgraph, or legacy feed exists in:

- Environment files (`.env*`)
- `apps/web/src/config/constants/endpoints.ts`
- Radar / Trending runtime modules
- Deployment configs (Vercel, Goldsky, The Graph)

Radar and Trending correctly show **Source not configured** with empty feeds — no simulated data.

---

## Required input source

On-chain wallet intelligence indexer providing large-wallet and smart-money activity for BSC tokens listed in the Melega registry.

---

## Recommended endpoint env

```
NEXT_PUBLIC_WHALE_INDEXER_URL=https://<whale-indexer-host>/v1/feed
```

---

## Expected response schema

```json
{
  "events": [
    {
      "wallet": "0x…",
      "token": "0x…",
      "symbol": "MARCO",
      "amountUSD": 125000,
      "txHash": "0x…",
      "timestamp": "2026-07-08T12:00:00.000Z",
      "signalType": "whale",
      "confidence": 0.92
    }
  ]
}
```

| Field | Type | Required |
| --- | --- | --- |
| `wallet` | address | yes |
| `token` | address | yes |
| `amountUSD` | number | yes |
| `txHash` | hex | yes |
| `timestamp` | ISO-8601 | yes |
| `signalType` | `whale` \| `smart_money` | yes |
| `confidence` | 0–1 | yes |

---

## Machine payload (current)

Radar machine JSON exposes:

```json
{
  "whale_feed": {
    "status": "not_configured",
    "code": "WHALE_INDEXER_NOT_DEPLOYED",
    "required_source": "…",
    "expected_schema": { "events": […] },
    "recommended_endpoint_env": "NEXT_PUBLIC_WHALE_INDEXER_URL"
  }
}
```

---

## Validation

- `/radar` → Whale Alerts KPI: **Source not configured**
- `/radar` → Smart Money Tracker: **Source not configured**
- No fake `0` whale counts
- No simulated wallet rows
