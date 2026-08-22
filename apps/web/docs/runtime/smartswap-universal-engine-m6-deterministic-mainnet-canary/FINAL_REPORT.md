# FINAL_REPORT

`MELEGASWAP_V2_SMARTSWAP_M6_DEPLOYMENT_VERIFIED_AWAITING_SETROUTER`

CREATE mined and runtime-certified. Agent cannot sign. Unsigned `setRouter` is frozen. **No approval. No canary.**

| | |
|--|--|
| CREATE tx | `0x3f9d56f0e0d1094a304ed66d256db2e3e55539ae022128e8be7d2ca4d6664b70` |
| Executor | `0x296015b106F4b2FB94249cf398cbF05d4CcE0391` |
| On-chain runtime keccak | `0xd241f1e4dba3a04ed2f17f2d338db37e6adb9235a7de7e658554170a95885801` |
| Byte-for-byte | match |
| Deployer nonce now | **3195** |
| Next package | `deployments/mainnet/m6-unsigned-set-router-tx.json` |
| Fee state | `FEE_ENFORCEABLE` |
| Production | `LEGACY_PRODUCTION` |
| UX_DIFF | ZERO |
| UNAUTHORIZED_UI_CHANGE | 0 |

HARD STOP after this gate. Founder signs only `setRouter` from the canonical deployer at nonce 3195. If nonce ≠ 3195: STOP and rebuild. Do not approve, swap, retry, change venue, or merge to main.
