# DATA_BINDING_AUDIT — Project Page V6

Pipeline: `melega-global-data-truth-v1`

| Field | Source | Key | Chain identity | Fallback | Availability |
|---|---|---|---|---|---|
| Project identity | `CanonicalProjectDocument` | `document.identity.*` | deployment `chainId` + contract | slug display name | SSR props |
| Chart | `useIndexerCandles` via `ProjectCharts` | pairAddress (featured / markets / MARCO_WBNB) | pair chain (BSC indexer) | compact “No chart history”; reclaim space | progressive |
| Price | `useProjectLiveMarket` + featured markets | `priceUsd` | project chain | `—` | progressive |
| Liquidity | live market + participation pools | `liquidity` / pair count | project chain | `—` | progressive |
| Volume | live market | `volume24h` | project chain | `—` | progressive |
| Market cap | live market | `marketCap` | project chain | `—` | progressive |
| FDV | live market | `fdv` | project chain | `—` | progressive |
| Holders | `useHolderCount` via live market | `holders` | project chain + token | `—`; no fabricated distribution | deferred ~1.8s |
| Transactions | live market `swaps24h` + protocol activity filter | count / activity rows | token address match | `—` | progressive |
| Farms | `matchFarmsByToken` + `useFarms` hydrate | chainId + token0/token1/lp | project chain + contract | count from config; APR/TVL `—` until runtime | Phase A sync / Phase B hydrate |
| Pools | `matchPoolsByToken` + `usePoolsWithVault` | chainId + stake/earn address | project chain + contract | same honesty rules | Phase A / B |
| Melega Score | `readinessDocument.readiness.score` | Organ 01 readiness | project slug | `—`; details note Audit Center owns platform score | SSR |
| Social links | `document.resources` | website / x / telegram / discord | n/a | omit if missing | SSR |

## Dependencies reported

- **Community reactions persistence:** none — UI is local preview only (`persistence unavailable`).
- **Holder concentration / donut:** no certified distribution API — total holders only.
- **Chart history:** indexer-dependent; missing history collapses chart slot so Smart Swap expands.
