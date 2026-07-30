# Architecture Decision — Create Token Factory

## Chosen model

**One immutable `MelegaTokenFactory`** deploys **`MelegaFixedSupplyToken`** instances via `CREATE` (not CREATE2).

## Why

- Simplest safe architecture supported by Foundry 0.8.20 + vendored OpenZeppelin ERC20
- Factory stores factual `TokenCreated` events only
- Factory does not custody supply, retain token ownership, or alter deployed tokens
- No upgradeable proxies
- Creation fee forwarded immediately to MELEGA TREASURY WALLET (`0xb643…F65b`)
- No Treasury Runtime dependency

## Rejected alternatives

- Proxy/upgradeable tokens — forbidden by mission safety model
- Reusing MockERC20 — open mint
- Reusing AMM factory — different product
- Managed withdrawal fee vault — prefer immediate forward
