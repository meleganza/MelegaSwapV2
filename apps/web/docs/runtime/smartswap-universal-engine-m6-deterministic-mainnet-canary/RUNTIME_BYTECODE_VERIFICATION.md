# RUNTIME_BYTECODE_VERIFICATION

Status: **not yet on-chain**. Expected post-CREATE check is frozen.

The certified runtime keccak `0x22b936d04dda69aa1fc31e031793ce922a18013fa9c2f0587043a627e75da0e1` is the **solc template** (immutables zero). After CREATE, `eth_getCode` writes treasury, intentSigner, and wrappedNative into that template.

Required post-deploy procedure (from recertification `BYTECODE_CERTIFICATION.md`):

1. Confirm mined CREATE `input` starts with the certified creation bytecode.
2. Reconstruct expected runtime by inserting constructor immutables at `immutableReferences` (`65` treasury, `67` intentSigner, `69` wrappedNative).
3. Require `eth_getCode(executor) == expectedRuntime` **byte-for-byte**.
4. Call `treasury()`, `intentSigner()`, `wrappedNative()`, `owner()`, `paused()`, `MAX_PROTOCOL_FEE_BPS()`, `allowedVenue(pancake)`.

Fork simulation with the authorized constructor (`testForkCanonicalConstructorRuntime`) produced:

| | |
|--|--|
| Runtime length | 8062 |
| Expected on-chain keccak | `0xd241f1e4dba3a04ed2f17f2d338db37e6adb9235a7de7e658554170a95885801` |
| File | `deployments/mainnet/m6-expected-onchain-runtime.hex` |

Python reconstruction of the stored template with the same immutables produced the **same** keccak.

If on-chain code differs by one byte: **STOP** with `MELEGASWAP_V2_SMARTSWAP_M6_EXECUTOR_DEPLOYMENT_CERTIFICATION_FAILED`. No approval. No canary.
