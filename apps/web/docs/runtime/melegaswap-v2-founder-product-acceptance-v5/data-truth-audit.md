# Data Truth Audit V5

## Classifications

| Surface | Class | Note |
|---|---|---|
| Home Top Farms | ok / B | Factual TVL after hydrate; brief `—` during load is B |
| Home Top Pools (pre-fix) | **C** | Fetch aborted → empty CTA despite live inventory |
| Home Top Pools (post FA-V5-001) | **ok** | TVL rows surfaced (e.g. $19.8K, $5.8K); APR `—` when unpriced |
| Pools Explore KPIs (pre-fix) | **C** | Public data error |
| Pools Explore KPIs (post-fix) | **ok** | TVL $46.8K · 24H $37.56 |
| Explore cards unpriced | **B** | Partial cards keep `—` — no invention |
| Project economy farms/pools | ok | Address-matched counts; APR often `—` (B) |
| My Melega | ok | Reuses Portfolio runtime; disconnected CTA only in clean session |
| Audit Owner/Upgrade | **B** | `UNAVAILABLE` when SSOT lacks field — honest |

## Rules honored

- Never invent TVL/APR
- Prefer dash when uncertified
- Fix was adapter/fetch robustness only (no formula edits)
