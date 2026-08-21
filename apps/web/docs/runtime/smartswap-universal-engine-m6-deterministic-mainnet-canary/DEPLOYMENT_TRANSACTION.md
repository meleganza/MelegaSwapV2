# DEPLOYMENT_TRANSACTION

Status: **unsigned package ready. not signed. not broadcast.**

The agent cannot access the canonical deployer key. Per mission rules the unsigned CREATE is prepared for Founder signing from `0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0` only.

| | |
|--|--|
| Package | `deployments/mainnet/m6-unsigned-create-tx.json` |
| Data | `deployments/mainnet/m6-unsigned-create.data.hex` |
| Type | legacy (`type: 0`) |
| Chain | 56 |
| `to` | `null` (CREATE) |
| Value | `0` |
| Nonce | **3194** |
| Gas limit | `2250000` (estimate `1862961`) |
| Gas price | `50000000` wei |
| Data keccak | `0xb1c93b60890386532429a93495c3e5f3be87600096646cb1e3da7032db84a1fe` |
| Creation prefix keccak | `0xaa68423fc2a7e4fb80b54516bed42dccda8978ff4a5dd1d24180c5add2ad0791` |
| Constructor | treasury + intentSigner=deployer + WBNB + owner=deployer |
| Predicted address | `0x296015b106F4b2FB94249cf398cbF05d4CcE0391` |

Data is `creationBytecode || abi.encode(treasury, intentSigner, wrappedNative, owner)`. Creation prefix matches the certified artifact.

Do **not** broadcast if nonce ≠ 3194. Rebuild first.

Do **not** send setRouter, approve, or execute until this CREATE is mined and runtime certification passes.
