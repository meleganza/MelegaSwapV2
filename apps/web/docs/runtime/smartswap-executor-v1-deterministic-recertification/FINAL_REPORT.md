# FINAL_REPORT

**MELEGASWAP_V2_SMARTSWAP_EXECUTOR_V1_DETERMINISTIC_ARTIFACT_RECERTIFIED**

| | |
|--|--|
| Branch | `mission-smartswap-executor-v1-deterministic-recertification` |
| Baseline | `mission-smartswap-m6-preflight-recovery` @ `76c54eadfbd54a1285ac9cca3f8d28a3aa5e0bc7` |
| Source git blob | `7869980ca19ce62bebc99e17670c99cc7e637172` |
| Source SHA-256 | `5ecdeb832ad0990a1ed7a6a024b8a60bbf1b683afc2738adceadefa5150b8cee` |
| Source unchanged | yes |
| Solc version | 0.8.20 |
| Solc build | `0.8.20+commit.a1b79de6` / Darwin.appleclang |
| Forge version | 1.7.1 / `4072e48705af9d93e3c0f6e29e93b5e9a40caed8` |
| Compiler profile | `smartswap_executor_release` |
| Metadata bytecode hash | `none` (`appendCBOR=false`) |
| Optimizer | true, 200 runs |
| viaIR | true |
| EVM version | shanghai |
| Compiler input hash | `d714e86a97098d0978ee06038bc51c6c47b4a3c9276235e6b3f98cc5453ef003` |
| Creation length / keccak | 8584 / `0xaa68423fc2a7e4fb80b54516bed42dccda8978ff4a5dd1d24180c5add2ad0791` |
| Runtime length / keccak | 8062 / `0x22b936d04dda69aa1fc31e031793ce922a18013fa9c2f0587043a627e75da0e1` |
| Reproduction 1/2/3 | identical (see REPRODUCTION_PROOF.md) |
| Independent reproduction | Forge profile == pinned `solc --standard-json` |
| Canonical artifact | `deployments/smartswap-executor-v1/smart-swap-executor-v1-artifact.json` |
| BNB fork deployment | CREATE of stored creation bytecode succeeded |
| BNB fork canary | Pancake V2 WBNB→USDT 0.01; atomic fee+swap |
| Atomicity | venue revert / execute both preserve Treasury correctness |
| Treasury delta | `20000000000000` WBNB |
| User output | `6463583388417442046` USDT (`>= minOut`) |
| No trapped funds | executor WBNB/USDT/BNB = 0 |
| Fee state | `FEE_ENFORCEABLE` (not FEE_VERIFIED) |
| Canonical deployer | `0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0` |
| BNB balance | `18462459335635472` wei (~0.01846) |
| WBNB balance | `15000000000000000` (0.015) |
| Canary route | PancakeSwap V2 BSC WBNB → USDT 0.01 WBNB |
| Structural cost | 25 bps (derived from Pancake V2 LP fee) |
| Current fee band | 20 bps (`SMARTSWAP_REVENUE_POLICY_V1` BAND_11_25) |
| Unsigned deployment package | `deployments/mainnet/smartswap-executor-v1-unsigned-deployment.json` (unsigned, not broadcast) |
| UX_DIFF | ZERO |
| Tests | Foundry unit + fork + artifact; engine M1–M6; route-engine; gas-fee; verify-artifact |
| Build | `next build` passed |
| Evidence | `apps/web/docs/runtime/smartswap-executor-v1-deterministic-recertification/` |

M5 bytecode hashes are `SUPERSEDED_UNREPRODUCIBLE_ARTIFACT`. Future M6 must use this artifact.

HARD STOP: no mainnet deploy, broadcast, signature, approve, wrap, swap, V2 activation, or FEE_VERIFIED.
