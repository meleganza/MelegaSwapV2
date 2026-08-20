# M5_ARTIFACT_POSTMORTEM

Status: **SUPERSEDED_UNREPRODUCIBLE_ARTIFACT**

M4/M5 source and fork **functionality** remain valid. Only the M5 *deployment-artifact reproducibility* component is superseded.

## What M5 recorded

Method: `forge inspect SmartSwapExecutorV1 bytecode \| cast keccak`

| | |
|--|--|
| Creation keccak | `0x044040c2af494c8d1e34f1de7e3dd3071ae9cdf39df0fdfec908b9d4d261510c` |
| Deployed keccak | `0x0f0b418f1b3f1a7a0897864c271eacedd6ebeb4bf226fcfc3c23aa2153b74fa3` |

`out/` was not committed. Exact bytecode bytes were not stored.

## Why those hashes cannot be reproduced

Default Foundry settings were `bytecode_hash = ipfs` and `cbor_metadata = true`. solc appends a CBOR trailer whose IPFS CID hashes the **compiler input**, not only the executor source. Extra files in the compilation unit (tests, scripts, unrelated contracts) change the CID and therefore the final keccak.

Two clean local compiles of identical `SmartSwapExecutorV1.sol` during M6 preflight recovery produced two different keccaks (`0xd0534f44…` vs `0x94a549a0…`). Neither matched M5.

Stripping metadata after compilation is not an acceptable recertification method. This mission replaces the artifact with a compiler-locked `bytecodeHash=none` / `appendCBOR=false` build that stores the actual bytes.
