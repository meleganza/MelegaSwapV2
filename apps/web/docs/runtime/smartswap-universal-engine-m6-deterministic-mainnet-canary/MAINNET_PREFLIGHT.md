# MAINNET_PREFLIGHT

Read-only RPC against `https://bsc.publicnode.com` (chainId **56**). No broadcast.

Observed at block **117294691** (nonce re-checked at **117295429**):

| | |
|--|--|
| Deployer | `0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0` |
| Confirmed nonce | **3194** (`0xc7a`) |
| Pending nonce | **3194** (`0xc7a`) |
| BNB | `18449657335635472` (~0.01845) |
| WBNB | `15000000000000000` (0.015 ≥ 0.01) |
| Treasury WBNB | `0` |
| Gas price | `50000000` wei (0.05 gwei) |
| Pancake V2 router | `0x10ED43C718714eb63d5aA57B78B54704E256024E` |
| WBNB | `0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c` |
| USDT | `0x55d398326f99059fF775485246999027B3197955` |
| Factory pair | `0x16b9a82891338f9bA80E2D6970FddA79D1eb0daE` |
| Structural route cost | **25 bps** (PancakeSwap V2 LP fee; `VENUE_STRUCTURAL_FEE_BPS.pancakeswap`) |
| Policy band | `SMARTSWAP_REVENUE_POLICY_V1` structural ≤25 → **20 bps** |
| Input | `10000000000000000` (0.01 WBNB) |
| Protocol fee | `20000000000000` |
| Venue input | `9980000000000000` |
| Gross `getAmountsOut(0.01)` | `6716633193307164580` USDT |
| Net `getAmountsOut(0.00998)` | `6703198952135505081` USDT |
| CREATE gas estimate | `1862961` |
| CREATE if nonce 3194 | `0x296015b106F4b2FB94249cf398cbF05d4CcE0391` |

Signer:

| | |
|--|--|
| `MAINNET_DEPLOYER` | unset |
| Root `.env` | absent |
| Foundry keystores | `melega-team`, `melega-canary-seller` (encrypted; empty password failed) |
| Intended signer | canonical deployer only |
| Substituted signer | none |

Funds are sufficient for deploy + setRouter + min approval + one canary at the observed gas price. No wrap. No automatic transfer.

If nonce is not 3194 at Founder sign time: **STOP**. Do not repair, substitute, or increase exposure.
