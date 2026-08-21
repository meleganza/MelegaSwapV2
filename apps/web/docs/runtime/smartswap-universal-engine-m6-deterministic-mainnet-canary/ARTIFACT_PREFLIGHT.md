# ARTIFACT_PREFLIGHT

Status: **SMARTSWAP_EXECUTOR_V1_ARTIFACT_VERIFIED**

Command: `python3 scripts/smartswap/certify-executor-v1-artifact.py --verify`

Source:

| | |
|--|--|
| Path | `contracts/smartswap/SmartSwapExecutorV1.sol` |
| git blob | `7869980ca19ce62bebc99e17670c99cc7e637172` |
| SHA-256 | `5ecdeb832ad0990a1ed7a6a024b8a60bbf1b683afc2738adceadefa5150b8cee` |

Reproduced bytecode:

| | |
|--|--|
| Creation length / keccak | 8584 / `0xaa68423fc2a7e4fb80b54516bed42dccda8978ff4a5dd1d24180c5add2ad0791` |
| Runtime template length / keccak | 8062 / `0x22b936d04dda69aa1fc31e031793ce922a18013fa9c2f0587043a627e75da0e1` |
| Compiler input SHA-256 | `d714e86a97098d0978ee06038bc51c6c47b4a3c9276235e6b3f98cc5453ef003` |
| solc | `0.8.20+commit.a1b79de6` |

Both required keccaks matched. No `MELEGASWAP_V2_SMARTSWAP_M6_BLOCKED_ARTIFACT_DRIFT`.
