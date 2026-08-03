# MELEGASWAP_V2_POLYGON_FULL_REACTIVATION_AND_ARBITRUM_REGISTRY_COMPLETION

**Baseline:** `melegaswap-v2-project-pages-multichain-product-completion` @ `a91625b1`  
**Branch:** `melegaswap-v2-polygon-full-reactivation-and-arbitrum-registry`

## Verdict

**MELEGASWAP_V2_POLYGON_LIVE_AND_ARBITRUM_REGISTERED**

## Matrix

| Chain | Status |
|------|--------|
| BNB 56 | LIVE |
| Base 8453 | LIVE |
| Polygon 137 | LIVE |
| Ethereum 1 | PREPARING |
| Arbitrum 42161 | PREPARING (registered) |
| Avalanche 43114 | PREPARING |

## Arbitrum (Part A)
Added to `melegaChainRegistry`, Coming soon switcher, Project Pages deployments, explore badge label, Arbiscan explorer. No fabricated Factory/Router.

## Polygon (Parts B–K)
- Contracts verified on-chain including Pool Deploy `0x88142810…7786`
- Router SSOT fixed (web = registry = smart-router pkg = `0x64935e2A…EFe`)
- syrup `ChainId.BASE` → `ChainId.POLYGON`
- LIVE switcher; fee POL 25% → MELEGA TREASURY
- Farms/pools inventory factual; LB remains BNB-only BETA
- Project Pages Buy Token + embed auto-switch to 137

## Gates
- Mission tests: PASS (38)
- `next build`: PASS
