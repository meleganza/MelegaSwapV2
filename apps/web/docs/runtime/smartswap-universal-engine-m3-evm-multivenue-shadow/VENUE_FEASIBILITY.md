# VENUE_FEASIBILITY

Mission: `MELEGASWAP_V2_SMARTSWAP_UNIVERSAL_ENGINE_M3_EVM_MULTIVENUE_SHADOW`  
Mode: QUOTE-ONLY / SHADOW. No execution. No wallet. No aggregator dependency for a second DEX quote.

## Method

Feasibility is taken from this repository plus **certified official V2 router addresses** used only for read-only `getAmountsOut` `eth_call`. Brand names are not treated as chain coverage.

`@pancakeswap/smart-router` and Melega router addresses in `apps/web/src/config/constants/exchange.ts` / `apps/web/src/views/Swap/SmartSwap/utils/exchange.ts` are **Melega liquidity**, not PancakeSwap.

| Melega contract | Address | Role |
|-----------------|---------|------|
| V2 Router (BSC) | `0xc25033218D181b27D4a2944Fbb04FC055da4EAB3` | Production Melega V2 |
| Smart Router (BSC only) | `0xC6665d98Efd81f47B03801187eB46cbC63F328B0` | Production Melega smart router |
| V2 Router (Ethereum) | `0xFF8EBf8edf1C533A02d066f852788773BdCD631C` | Repo-configured Melega router |
| V2 Router (Base) | `0x1B30D21354a082EeBC66c4C5E56320759f7994e5` | Repo-configured Melega router |
| V2 Router (Polygon) | `0x64935e2A3d8F3840445fB2DdF37FBBfc3b292EFe` | Repo-configured Melega router |
| V2 Router (Arbitrum) | `0x149ee9245e5ed52a89ea777d19ad3a5d87873680` | Repo-configured Melega router |
| V2 Router (Avalanche) | `0x5A38b0B75C2E199fD8098710594115A35ABb6c7F` | Repo-configured Melega router |

## PancakeSwap

| Field | Repository / certified truth |
|-------|------------------------------|
| Supported chains in M3 | **BNB Smart Chain only** (`QUOTE_ONLY`) |
| Quote mechanism | Official PancakeSwap V2 Router `getAmountsOut` via `eth_call` |
| SDK/API/RPC | No Pancake SDK. Optional public RPC. Tests inject `ShadowQuoteSource` |
| Router / version | V2 Router `0x10ED43C718714eb63d5aA57B78B54704E256024E` |
| Factory (published) | `0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73` |
| Fee model | V2 LP **25 bps**, **embedded** in quoted output |
| Gas estimation | Not performed. Field remains null unless the quote source supplies units |
| Price impact | Not computed. Field remains null unless the quote source supplies it |
| Freshness | `quotedAt` from observation. Stale window = `LatencyBudget.staleQuoteMs` (default 15s) |
| Token identity | Canonical address + chain. Native BNB is wrapped to WBNB for the V2 path |
| EXECUTE | false |
| Known limitations | No V3/Infinity quoter. No other-chain routers certified here. Not Melega's inherited smart-router |

Ethereum / Base / Polygon / Arbitrum / Avalanche Pancake routers: **NOT_VERIFIED** or **UNSUPPORTED**. Not guessed.

## Uniswap

| Field | Repository / certified truth |
|-------|------------------------------|
| Supported chains in M3 | **Ethereum only** (`QUOTE_ONLY`) |
| Quote mechanism | Official Uniswap V2 Router `getAmountsOut` via `eth_call` |
| SDK/API/RPC | No Uniswap SDK. Optional public RPC. Tests inject `ShadowQuoteSource` |
| Router / version | V2 Router `0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D` |
| Factory (published) | `0x5C69bEe701ef814a2B6a3EDD41c2A0d3D6111E3d` |
| Fee model | V2 LP **30 bps**, **embedded** in quoted output |
| Gas estimation | Not performed (null unless source supplies units) |
| Price impact | Not computed (null unless source supplies it) |
| Freshness | Same stale window as Pancake |
| Token identity | Canonical address + chain. Native ETH wraps to WETH for the V2 path |
| EXECUTE | false |
| Known limitations | Universal Router / SwapRouter02 / Permit2 / V3 Quoter **not used**. Other chains **NOT_VERIFIED** |

This mission run: Ethereum public RPCs did not return a usable `eth_call` result. Adapter remains implemented; factual Uniswap sample = **UNAVAILABLE**.

## Melega DEX

M1 adapter preserved. Maps `LegacyMelegaQuoteSnapshot` only. Does not rewrite AMM/router. `EXECUTE` remains false inside Universal Engine V2.

## Avoided

Third-party aggregators (0x, 1inch, OpenOcean, etc.) were not added merely to obtain another DEX quote.

## Robinhood / Solana

Robinhood: `FEASIBILITY_REQUIRED`. No adapter.  
Solana: domain abstraction only. No Jupiter/Raydium/Orca implementation.
