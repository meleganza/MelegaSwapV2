# LATENCY_REPORT

Configurable budgets (`DEFAULT_LATENCY_BUDGET`):

- per-adapter timeout: 1200 ms
- global shadow cycle: 1800 ms
- stale quote: 15000 ms

These are bounds, not measured SLOs.

## Factual PancakeSwap V2 `eth_call` (this run)

| sample | latency |
|--------|---------|
| BSC WBNB→USDC 0.01 | 610 ms |
| BSC WBNB→USDT 0.01 | 363 ms |

| statistic | value |
|-----------|-------|
| n | 2 |
| P50 | INSUFFICIENT_SAMPLE |
| P95 | INSUFFICIENT_SAMPLE |
| bounded maximum observed | 610 ms |
| Uniswap Ethereum | UNAVAILABLE |
| Melega live | UNAVAILABLE |

Synthetic timeout tests prove one slow venue cannot hold the cycle beyond `quoteTimeoutMs` / `overallBudgetMs`. Those timings are **SYNTHETIC**.
