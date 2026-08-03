# MELEGASWAP_V2_POLYGON_LIVE

**Branch:** `melegaswap-v2-multichain-execution-program`  
**Baseline:** Project Pages multichain @ `a91625b1`

## Verdict
**MELEGASWAP_V2_POLYGON_LIVE**

## Canonical addresses (Founder / on-chain verified)
| Role | Address | Bytecode |
|------|---------|----------|
| Factory | `0x2541DBEa199a22501D75EA141627776Bd4EefC80` | 10852 |
| Router | `0x64935e2A3d8F3840445fB2DdF37FBBfc3b292EFe` | 17845 |
| MasterBuilder | `0x130d2BD998767B6091352dd71fEABa4460846D94` | 12116 |
| Vault | `0xd70bff1e6354c49adff9b0c9608364dcd2d5deb6` | 15543 |
| MARCO | `0xD3e28c74177B812d1543A406aD1A97ee3C398AC2` | 3556 |

`router.factory()` == Factory. Stale smart-router pkg address `0x3BC722…` had **0** bytecode — corrected to web SSOT.

## Shipped
- Registry LIVE + capabilities (swap/farms/pools/tokens; LB false)
- Switcher LIVE: BNB + Base + Polygon
- Router SSOT across registry / web / smart-router / V2 adapter
- Fee: native POL, 25% treasury unchanged
- Fixed `polygonTokens.syrup` ChainId.BASE bug → POLYGON
- Inventory: farms/pools/tokenlist/logos already present

## Next
Ethereum LIVE (contracts pre-verified). Arbitrum/Avalanche need Founder Factory+Router.
