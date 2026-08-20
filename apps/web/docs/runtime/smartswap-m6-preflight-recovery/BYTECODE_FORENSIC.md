# BYTECODE_FORENSIC

Status: **M5-certified artifact not reproduced.** Source matches. Full bytecode (including IPFS metadata) does not.

## M5 recorded hashes

Method documented in M5: `forge inspect SmartSwapExecutorV1 bytecode | cast keccak` (and `shasum -a 256` of the hex text).

| | M5 certified |
|--|--|
| creation keccak256 | `0x044040c2af494c8d1e34f1de7e3dd3071ae9cdf39df0fdfec908b9d4d261510c` |
| deployed keccak256 | `0x0f0b418f1b3f1a7a0897864c271eacedd6ebeb4bf226fcfc3c23aa2153b74fa3` |
| creation sha256 (hex text + newline) | `487002f09f61418310fed745ea9d24fcb936333010118a7aaf68e646419a449c` |
| deployed sha256 (hex text + newline) | `88a7c3bdec89153740034d48477763fc48f013f34222bb7ba71f8501fd6fb99e` |

M5 did **not** store the bytecode bytes, compiler input JSON, or `out/` artifact in git.

## Source

`contracts/smartswap/SmartSwapExecutorV1.sol` is unchanged from M5 (`40c2129f` introduced it; blob `7869980ca19ce62bebc99e17670c99cc7e637172` at M5 tip `83e019b7` and at this recovery HEAD).

SHA-256: `5ecdeb832ad0990a1ed7a6a024b8a60bbf1b683afc2738adceadefa5150b8cee`

## Compiler configuration (current `foundry.toml` profile.default)

| | |
|--|--|
| solc | 0.8.20 (`0.8.20+commit.a1b79de6` in artifact metadata) |
| optimizer | true, 200 runs |
| via_ir | true |
| evm_version | shanghai (solc default for 0.8.20; not pinned in toml) |
| metadata.bytecodeHash | **ipfs** (Foundry/solc default; not pinned in toml) |
| libraries | none linked |
| remappings in toml | OZ + forge-std |
| extra remappings in metadata | OZ nested `erc4626-tests`, `halmos-cheatcodes`, `openzeppelin-contracts/` |
| forge | 1.7.1 / `4072e487` |
| OZ | git `5fd1781b1454fd1ef8e722282f86f9293cacf256` (5.6.1) |
| forge-std | git `bf647bd6046f2f7da30d0c2bf435e5c76a780c1b` (1.16.2) |

Constructor is not part of `forge inspect` bytecode. Args would be `(treasury, intentSigner, wrappedNative, owner)` at deploy time only.

## Why hashes move without source changes

Solidity appends CBOR metadata (~51 bytes) whose IPFS CID hashes the **compiler input**, including the set of sources in that compilation unit.

This recovery measured **two different keccaks** from the same source on the same machine:

| compile | creation keccak |
|---------|-----------------|
| M6 blocked session (`forge inspect` after tests/scripts present) | `0xd0534f444328674466c9bc6c1b72cb2ebd26d870f564c0cb8b85bc8566cb74c9` |
| `forge build --skip test --skip script` then inspect | `0x94a549a0651b0d50d82e591120b62d8fd6a8ac81f624ea649714d09a44d671b8` |

Neither equals M5. Hashing variants of the current bytes (body-only, hex-as-utf8, with/without newline) also do not recover the M5 keccak/sha256.

Local `out/build-info` files do not contain a stored object whose keccak is the M5 value.

## Conclusion

Exact M5 artifact reproduction **failed**. A new `bytecode_hash = none` (or similar) lock would be a **new** artifact and is out of scope. No automatic recertification.
