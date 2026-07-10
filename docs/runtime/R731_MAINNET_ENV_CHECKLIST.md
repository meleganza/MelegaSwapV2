# R731 — Mainnet Environment Checklist

**Target:** [melega.finance](https://melega.finance) / Vercel project `melega-swap-v2-web`

---

## Required environment variables

| Variable | Priority | Purpose | If missing |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_MELEGA_SUBGRAPH_URL` | **P0** | BSC swap/mint/burn/pair indexing | `BLOCKED_SUBGRAPH_NOT_DEPLOYED` on Home, Trade, Liquidity |
| `NEXT_PUBLIC_BSCSCAN_API_KEY` | **P1** | Holder count via BscScan `tokenholdercount` | Trade/Projects show **Source not configured** |
| `NEXT_PUBLIC_WHALE_INDEXER_URL` | **P3** | Whale / smart-money feed | Radar shows **Source not configured** (`WHALE_INDEXER_NOT_DEPLOYED`) |

---

## Vercel deployment steps

### P0 — Melega subgraph

1. Deploy subgraph per [R731_MELEGA_SUBGRAPH_DEPLOYMENT_SPEC.md](./R731_MELEGA_SUBGRAPH_DEPLOYMENT_SPEC.md).
2. Vercel → `melega-swap-v2-web` → Settings → Environment Variables.
3. Add `NEXT_PUBLIC_MELEGA_SUBGRAPH_URL` = your GraphQL HTTPS endpoint.
4. Enable for **Production** and **Preview**.
5. Redeploy.
6. Confirm `/`, `/trade`, `/liquidity-studio` show real swap/LP events or explicit blocker (never dead Pancake proxy).

### P1 — BscScan holder API

1. Create API key at [BscScan API](https://bscscan.com/myapikey).
2. Vercel → `melega-swap-v2-web` → Settings → Environment Variables.
3. Add **`NEXT_PUBLIC_BSCSCAN_API_KEY`** (exact spelling — not `NEXT_PUBLIC_BSCSAN_API_KEY`).
4. If typo var exists, delete `NEXT_PUBLIC_BSCSAN_API_KEY` after copying value to canonical name.
5. Enable for **Production** and **Preview**.
6. Redeploy (env is read at runtime via `/api/holder-count`).
   ```
   curl "https://api.bscscan.com/api?module=token&action=tokenholdercount&contractaddress=0x963556de0eb8138E97A85F0A86eE0acD159D210b&apikey=YOUR_KEY"
   ```
5. Trade `/trade` and Projects `/projects` must never show bare `—` for holders.

### P3 — Whale indexer (future)

1. Deploy wallet intelligence service per [R731_WHALE_INDEXER_SPEC.md](./R731_WHALE_INDEXER_SPEC.md).
2. Add `NEXT_PUBLIC_WHALE_INDEXER_URL` when ready.
3. Until then: Radar `/radar` correctly shows **Source not configured** — no fake zeros.

---

## Local development

Copy `apps/web/.env.example` → `apps/web/.env.local` and fill:

```env
NEXT_PUBLIC_MELEGA_SUBGRAPH_URL=
NEXT_PUBLIC_BSCSCAN_API_KEY=
```

Optional future:

```env
NEXT_PUBLIC_WHALE_INDEXER_URL=
```

---

## Validation scripts

```bash
# R731 mainnet blockers gate
node apps/web/scripts/r731-mainnet-gate.mjs

# Pool gate audit (regenerates docs/runtime/R731_POOL_GATE_AUDIT.md)
node apps/web/scripts/r731-pool-gate-audit.mjs
```

---

## Current local status (auto-generated reference)

See `docs/runtime/R731_MAINNET_GATE.json` after running the gate script.
