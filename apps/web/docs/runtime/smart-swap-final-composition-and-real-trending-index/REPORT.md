# SMART_SWAP_FINAL_COMPOSITION_AND_REAL_TRENDING_INDEX

Base tip `4b85dae6`.

## Composition
- Wider swap card (520px) for single-row header
- Instant: From → To → Swap → Details only
- Smart: From → To → Swap → Route → Metrics → Fee → AI → Details
- One Details accordion; open state persists across Instant ↔ Smart

## Trending
- Sources: `/api/protocol/activity`, `/api/indexer/events?types=Swap`, protocol txs, tier metrics
- Roots: Melega Factory `MELEGA_FACTORY_BSC`, Router `MELEGA_ROUTER_BSC`
- Rank: recent swaps → volume → recency
