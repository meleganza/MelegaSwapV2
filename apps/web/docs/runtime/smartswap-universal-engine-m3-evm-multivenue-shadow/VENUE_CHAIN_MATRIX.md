# VENUE_CHAIN_MATRIX

Allowed states: `SUPPORTED` | `QUOTE_ONLY` | `UNSUPPORTED` | `UNAVAILABLE` | `NOT_VERIFIED`

No brand-based inference. `SUPPORTED` is used only where this repository already has a live production Melega path. External venues are never `SUPPORTED` in M3 because `EXECUTE = false`.

| Chain | MELEGA | PANCAKESWAP | UNISWAP |
|-------|--------|-------------|---------|
| BNB Smart Chain | SUPPORTED (legacy production path exists; V2 engine remains SHADOW) | QUOTE_ONLY (certified V2 router) | NOT_VERIFIED |
| Ethereum | QUOTE_ONLY (Melega V2 router configured in repo; V2 engine SHADOW) | NOT_VERIFIED | QUOTE_ONLY (certified V2 router; factual RPC sample UNAVAILABLE this run) |
| Base | QUOTE_ONLY (Melega V2 router configured in repo) | NOT_VERIFIED | NOT_VERIFIED |
| Polygon | QUOTE_ONLY (Melega V2 router configured in repo) | UNSUPPORTED | NOT_VERIFIED |
| Arbitrum | QUOTE_ONLY (Melega V2 router configured in repo) | UNSUPPORTED | NOT_VERIFIED |
| Avalanche | QUOTE_ONLY (Melega V2 router configured in repo) | UNSUPPORTED | NOT_VERIFIED |

Notes:

- PancakeSwap on Polygon/Arbitrum/Avalanche is `UNSUPPORTED` because this mission did not certify a Pancake V2 router on those chains.
- Uniswap on L2s is `NOT_VERIFIED` (deployments exist in the wild; this repo does not pin them for M3).
- Same-chain competition only. No BNB→Base, Ethereum→Arbitrum, or any bridge.
