# TEST_REPORT

| Suite | Result |
|--|--|
| Three clean Forge release-profile compiles | RUN1 == RUN2 == RUN3 |
| Independent `solc --standard-json` | identical to Forge |
| `python3 scripts/smartswap/certify-executor-v1-artifact.py --verify` | `SMARTSWAP_EXECUTOR_V1_ARTIFACT_VERIFIED` |
| `SmartSwapExecutorV1Test` (default profile) | 4 passed |
| `SmartSwapExecutorV1Test` (`smartswap_executor_release`) | 4 passed |
| `SmartSwapExecutorV1BnbForkTest` | 8 passed (fork) |
| `SmartSwapExecutorV1DeterministicArtifactTest` | 4 passed (artifact CREATE + fork canary) |
| Engine vitest M1–M6 + recertification | 88 passed (8 files) |
| Route-engine vitest | 10 passed |
| Gas-protocol-fee vitest | 13 passed |
| UX freeze vs M1 manifest | `UX_DIFF = ZERO` |
| `next build` | passed (exit 0) |

No test was weakened. Production remains `LEGACY_PRODUCTION`. Fee state remains `FEE_ENFORCEABLE`.
