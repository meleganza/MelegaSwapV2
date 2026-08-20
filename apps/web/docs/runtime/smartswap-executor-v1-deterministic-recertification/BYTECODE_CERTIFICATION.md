# BYTECODE_CERTIFICATION

Status: **SMARTSWAP_EXECUTOR_V1_DETERMINISTIC_ARTIFACT_CERTIFIED**

Canonical files:

- `deployments/smartswap-executor-v1/smart-swap-executor-v1-artifact.json`
- `deployments/mainnet/smartswap-executor-v1-artifact.json` (identical)
- `deployments/smartswap-executor-v1/creation.hex`
- `deployments/smartswap-executor-v1/deployed.hex`

| | |
|--|--|
| Creation length | 8584 bytes |
| Creation keccak | `0xaa68423fc2a7e4fb80b54516bed42dccda8978ff4a5dd1d24180c5add2ad0791` |
| Runtime template length | 8062 bytes |
| Runtime template keccak | `0x22b936d04dda69aa1fc31e031793ce922a18013fa9c2f0587043a627e75da0e1` |
| ABI SHA-256 | `1a192f2403346dfc89087f55c07290a0e4fae5c968397039b7e8e0c3cfb2e746` |
| CBOR metadata trailer | absent |
| Libraries | none |

These hashes **replace** M5 hashes for any future M6 preflight. M5 hashes must not be reused.

## On-chain `eth_getCode` after deploy

Constructor immutables (`treasury`, `intentSigner`, `wrappedNative`) are written into the runtime template. Naive equality of `eth_getCode` to the stored template **without** substituting those 32-byte words will fail.

Future M6 must:

1. Confirm the deploy transaction data is `creationBytecode || abi.encode(treasury, intentSigner, wrappedNative, owner)`.
2. Build expected runtime by inserting constructor immutables at `immutableReferences`.
3. Require `eth_getCode(executor) == expectedRuntime` byte-for-byte.
4. Also call `treasury()`, `intentSigner()`, `wrappedNative()`, `owner()`, `paused()`, `MAX_PROTOCOL_FEE_BPS()`, and `allowedVenue(pancakeRouter)`.

If runtime differs by one byte: STOP.
