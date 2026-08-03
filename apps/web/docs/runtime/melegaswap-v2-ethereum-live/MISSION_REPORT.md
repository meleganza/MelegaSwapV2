# MELEGASWAP_V2_ETHEREUM_LIVE

**Branch:** `melegaswap-v2-multichain-execution-program`  
**Prior:** Polygon LIVE @ `a1534157`

## Verdict
**MELEGASWAP_V2_ETHEREUM_LIVE**

## Canonical addresses (on-chain verified)
| Role | Address | Bytecode |
|------|---------|----------|
| Factory | `0x149EE9245E5eD52a89Ea777d19AD3A5D87873680` | 19065 |
| Router | `0xFF8EBf8edf1C533A02d066f852788773BdCD631C` | 17845 |
| MasterBuilder | `0x585364c747CaF6cF6441656F803796230fb1d61c` | 12116 |
| Vault | `0x4C11221D39FcE56D12E46deC799F73029859B974` | 15543 |
| MARCO | `0x5911Dc98a9E1A4FfFD802C3A57cdA6bbd26Cdb76` | 6193 |

`router.factory()` == Factory.

## LIVE switcher now
BNB (56) · Base (8453) · Polygon (137) · Ethereum (1)

## PREPARING (Founder decision required)
- **Arbitrum:** MasterChef exists; Factory + Router missing (stale `0x3BC722…` has 0 bytecode)
- **Avalanche:** only Multicall present — Factory, Router, MasterBuilder, Vault required
