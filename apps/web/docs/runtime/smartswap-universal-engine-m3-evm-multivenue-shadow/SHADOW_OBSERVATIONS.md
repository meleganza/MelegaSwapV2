# SHADOW_OBSERVATIONS

Read-only `eth_call` only. No wallet. No broadcast.

## Factual

| chain | pair | input | venue | output | structural cost | gas estimate | SmartSwap fee bps | net output | latency | health | timestamp |
|-------|------|-------|-------|--------|-----------------|--------------|-------------------|------------|---------|--------|-----------|
| BSC (56) | WBNB → USDC `0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d` | 0.01 WBNB (`10000000000000000`) | pancakeswap | `6251779553612704946` (USDC 18dp) | 25 bps LP embedded | UNAVAILABLE | 20 | `6239275994505479537` | 610 ms | HEALTHY | 2026-08-19T23:42:00.000Z (approx, mission run) |
| BSC (56) | WBNB → USDT `0x55d398326f99059fF775485246999027B3197955` | 0.01 WBNB | pancakeswap | `6263924129396514873` (USDT 18dp) | 25 bps LP embedded | UNAVAILABLE | 20 | `6251396281137721844` | 363 ms | HEALTHY | 2026-08-19T23:42:00.000Z (approx, mission run) |

RPC: `https://bsc.publicnode.com`  
Router: `0x10ED43C718714eb63d5aA57B78B54704E256024E`

### Uniswap Ethereum

**UNAVAILABLE.** `getAmountsOut` `eth_call` to V2 router `0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D` failed on public endpoints used in this run (`ethereum.publicnode.com` fetch failed; `rpc.ankr.com/eth` unauthorized; `1rpc.io/eth` 503; `cloudflare-eth.com` -32603; `eth.llamarpc.com` HTML). No synthetic Uniswap output is recorded here.

### Melega live quote

**UNAVAILABLE** as a simultaneous market observation. Melega remains the M1 snapshot mapper. A live Melega quote was not captured beside the Pancake `eth_call` samples, so no factual Melega vs Pancake winner is claimed.

### Other pairs / chains

Native→ecosystem, stable→ecosystem, etc. were not probed on-chain in this bounded sample. Missing routes would be `NO_ROUTE`. Liquidity was not fabricated.

## Synthetic

Labeled **SYNTHETIC** in `m3EvmMultivenueShadow.test.ts`. Used for winner isolation, timeouts, fee bands, and identity. Not observed market behavior.
