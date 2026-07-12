# R789 Fourth Crash Recovery — Delta

**Recovered:** 2026-07-12T17:40:00Z  
**Prior recovery:** [R789_THIRD_CRASH_RECOVERY.md](./R789_THIRD_CRASH_RECOVERY.md)

## Delta Since Third Crash

| Check | Result |
|-------|--------|
| HEAD unchanged | `a7d59406` = `origin/main` |
| `R789_THIRD_CRASH_RECOVERY.md` | present (untracked, preserved) |
| Active merge/rebase | none |
| Staged R789 work lost | none (nothing was staged) |

## Fourth-Crash Interruption Point

Third-crash session wrote `R789_THIRD_CRASH_RECOVERY.md` then crashed **before** resuming production indexer polling.

Live verification at fourth-crash recovery confirmed:

- Production buildId `W7pRDXd7z5JBQS1eN5ahS` @ `a7d59406`
- `lastSuccessfulSync` frozen at `2026-07-12T16:25:38.622Z` (>1h stale)
- `lastOrchestratorRun` still `null` on `/api/indexer/health`
- External POST `/api/indexer/run/` returns **504 @ ~15s** with **zero** checkpoint movement after 22×15s polls

**Root cause identified (repository-owned):** Vercel HTTP gateway timeout kills `/api/indexer/run` before the 240s orchestrator budget completes; no persistence occurs.

## Fourth-Crash Repository Fix (in progress)

- Add `INDEXER_HTTP_GATEWAY_BUDGET_MS` (12s) and pass bounded budget from `run.ts`
- Classify tier pairs as `UNSCANNED` / `EMPTY_VERIFIED` instead of mislabeling unscanned pairs as `RPC_UNAVAILABLE`
- Fix `r789-trade-reconciliation.mjs` to read `transactions` payload

## Still Complete From Prior Sessions (do not redo)

- 88/88 matrix PASS (`r789-matrix-report.json`)
- Liquidity Studio dup-unavailable fix (`02fa57bf`)
- SmartChef 239/239 on-chain classification
- R780/R786/R787/R789 static gates

## Remaining After This Delta

1. Deploy gateway-budget fix
2. Run 10 sequential indexer invocations with verified persistence
3. Advance MARCO/WBNB coverage toward `complete: true`
4. Tier-1/Tier-2 population via sequential cron cycles
5. Refresh trade/trending/protocol activity artifacts
6. Re-verify 88/88 on post-fix SHA
7. Commit certification artifacts

**Verdict remains:** `R789_PRODUCTION_BLOCKED` until Gate A indexer persistence is proven on production.
