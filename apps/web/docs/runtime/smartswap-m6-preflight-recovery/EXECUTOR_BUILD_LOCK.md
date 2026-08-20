# EXECUTOR_BUILD_LOCK

**Not an M5-equivalent certified artifact.** Exact reproduction failed. This file records the environment that was measured so a later recertification mission can pin it.

Do not deploy from this lock.

| field | value |
|-------|--------|
| m5ExactMatch | false |
| solc | 0.8.20+commit.a1b79de6 |
| forge | 1.7.1 `4072e487` |
| profile | default |
| optimizer | true |
| optimizer_runs | 200 |
| viaIR | true |
| evmVersion | shanghai (unpinned) |
| metadata.bytecodeHash | ipfs (unpinned; causes compile-unit drift) |
| remappings | see `foundry.toml` |
| OZ | `5fd1781b1454fd1ef8e722282f86f9293cacf256` |
| forge-std | `bf647bd6046f2f7da30d0c2bf435e5c76a780c1b` |
| build command (M5 method) | `forge inspect SmartSwapExecutorV1 bytecode \| cast keccak` |
| M5 creation | `0x044040c2af494c8d1e34f1de7e3dd3071ae9cdf39df0fdfec908b9d4d261510c` |
| measured creation (session A) | `0xd0534f444328674466c9bc6c1b72cb2ebd26d870f564c0cb8b85bc8566cb74c9` |
| measured creation (session B, skip test/script) | `0x94a549a0651b0d50d82e591120b62d8fd6a8ac81f624ea649714d09a44d671b8` |
