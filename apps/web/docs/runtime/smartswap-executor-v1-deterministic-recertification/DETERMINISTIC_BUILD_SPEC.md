# DETERMINISTIC_BUILD_SPEC

Canonical compiler input: `deployments/smartswap-executor-v1/compiler-input.json`

SHA-256: `d714e86a97098d0978ee06038bc51c6c47b4a3c9276235e6b3f98cc5453ef003`

## Locked settings

| Setting | Value |
|--|--|
| language | Solidity |
| solc | 0.8.20+commit.a1b79de6 |
| optimizer | enabled, 200 runs |
| viaIR | true |
| evmVersion | shanghai |
| metadata.bytecodeHash | `none` |
| metadata.appendCBOR | false |
| metadata.useLiteralContent | true |
| libraries | none |
| remappings | `@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/`, `forge-std/=lib/forge-std/src/` |

## Source set (15 files)

Executor plus imported OpenZeppelin / interface files only. Unrelated repository contracts are excluded so they cannot enter the compilation unit.

Including extra unimported contracts in the same `solc --standard-json` invocation **does** change via-IR executor bytecode even with `bytecodeHash=none`. The release profile therefore sets `src = "contracts/smartswap"` and the certify command skips tests, scripts, and mocks.

## Invocation

Path A: `FOUNDRY_PROFILE=smartswap_executor_release forge build --skip test --skip script --skip **/mocks/** --force`

Path B: pinned `solc-0.8.20 --standard-json --base-path <repo> --allow-paths <repo>,<repo>/lib` using the stored compiler input.

Required: A == B, byte-for-byte.
