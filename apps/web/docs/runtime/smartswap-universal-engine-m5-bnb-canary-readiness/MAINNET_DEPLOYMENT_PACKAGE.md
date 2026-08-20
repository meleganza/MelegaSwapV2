# MAINNET_DEPLOYMENT_PACKAGE

**DO NOT SIGN. DO NOT BROADCAST.**

Pattern: existing `DryRunWrapperDeploy` — `new` constructor, **not CREATE2**.

## Deployer requirements

- Authorized deployer EOA with BNB for ~2M gas (dry-run construction used ~1,706,190 gas units locally; plan ≥ 2,000,000)
- Owner key distinct from user canary wallet
- Intent signer key that is **not** the founder wallet until a later authorized mission
- No production cutover

## Constructor args

| arg | value |
|-----|--------|
| `treasury_` | `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` |
| `intentSigner_` | `SET_AT_AUTHORIZED_DEPLOY` |
| `wrappedNative_` | `0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c` |
| `owner_` | `SET_AT_AUTHORIZED_DEPLOY` |

## Expected bytecode (local solc 0.8.20 / opt 200 / via_ir)

| | hash |
|--|------|
| creation keccak256 | `0x044040c2af494c8d1e34f1de7e3dd3071ae9cdf39df0fdfec908b9d4d261510c` |
| deployed keccak256 | `0x0f0b418f1b3f1a7a0897864c271eacedd6ebeb4bf226fcfc3c23aa2153b74fa3` |

Recompute at deploy time; do not assume CREATE address. Dry-run local address `0x5aAdFB43eF8dAF45DD80F4676345b7676f1D70e3` is **not** a mainnet address.

## Post-deploy verification (future mission)

1. Capture executor address from receipt
2. `treasury() == canonical`
3. `wrappedNative() == WBNB`
4. `intentSigner()` expected
5. Verify source on BscScan
6. `setRouter(0x10ED43C718714eb63d5aA57B78B54704E256024E, keccak256("pancakeswap"), true)`
7. Confirm Melega router is **not** allowlisted unless separately authorized
8. `pause()` remains available
9. `ACTIVE_V2_ROLLOUT` stays `LEGACY_PRODUCTION`

Script: `script/DryRunDeploySmartSwapExecutorV1.s.sol` (`broadcast` logged as 0).
