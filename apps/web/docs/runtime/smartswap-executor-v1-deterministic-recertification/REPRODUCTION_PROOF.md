# REPRODUCTION_PROOF

Three independent clean Forge compiles (wipe `out-smartswap-executor-release/` and `cache-smartswap-executor-release/` each time) plus one `solc --standard-json` path.

Compiler-input SHA-256 (all runs): `d714e86a97098d0978ee06038bc51c6c47b4a3c9276235e6b3f98cc5453ef003`

| Run | Creation length | Creation keccak | Deployed length | Deployed keccak |
|--|--|--|--|--|
| 1 Forge | 8584 | `0xaa68423fc2a7e4fb80b54516bed42dccda8978ff4a5dd1d24180c5add2ad0791` | 8062 | `0x22b936d04dda69aa1fc31e031793ce922a18013fa9c2f0587043a627e75da0e1` |
| 2 Forge | 8584 | `0xaa68423fc2a7e4fb80b54516bed42dccda8978ff4a5dd1d24180c5add2ad0791` | 8062 | `0x22b936d04dda69aa1fc31e031793ce922a18013fa9c2f0587043a627e75da0e1` |
| 3 Forge | 8584 | `0xaa68423fc2a7e4fb80b54516bed42dccda8978ff4a5dd1d24180c5add2ad0791` | 8062 | `0x22b936d04dda69aa1fc31e031793ce922a18013fa9c2f0587043a627e75da0e1` |
| solc standard-json | 8584 | `0xaa68423fc2a7e4fb80b54516bed42dccda8978ff4a5dd1d24180c5add2ad0791` | 8062 | `0x22b936d04dda69aa1fc31e031793ce922a18013fa9c2f0587043a627e75da0e1` |

RUN 1 == RUN 2 == RUN 3 == independent solc. Byte-for-byte.

`--verify` recompiled once more and matched the stored artifact (`SMARTSWAP_EXECUTOR_V1_ARTIFACT_VERIFIED`).
