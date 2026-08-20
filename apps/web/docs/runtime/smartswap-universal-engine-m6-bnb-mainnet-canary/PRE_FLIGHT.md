# PRE_FLIGHT

Status: **STOPPED.** No deploy. No sign. No broadcast.

Verdict: `MELEGASWAP_V2_SMARTSWAP_M6_BLOCKED_PREFLIGHT_DRIFT`

Founder authorization for the limited canary was present. Preflight still failed closed. No automatic repair.

## Baseline

| | |
|--|--|
| Branch start | `mission-smartswap-universal-engine-m5-bnb-canary-readiness` |
| Commit | `83e019b7670be87725c106f05f19baee156936f9` |
| Working tree at start | clean of source; untracked Foundry `out/` only |
| M5 source `SmartSwapExecutorV1.sol` | unchanged (`git diff` empty) |

## What matched M5

| invariant | measured |
|-----------|----------|
| chainId | 56 |
| RPC | `https://bsc.publicnode.com` (block `117019908`) |
| Treasury | `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` |
| Pancake V2 router | `0x10ED43C718714eb63d5aA57B78B54704E256024E` |
| WBNB | `0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c` decimals 18 |
| USDT | `0x55d398326f99059fF775485246999027B3197955` decimals 18 |
| Pair | `0x16b9a82891338f9bA80E2D6970FddA79D1eb0daE` = factory.getPair |
| Liquidity | USDT `43478525214577459828159701` / WBNB `67562087337669994610597` (still deep) |
| Gross 0.01 WBNB quote | `6418978776039224787` USDT |
| Net 0.00998 WBNB quote | `6406199617004210689` USDT |
| Structural cost | 25 bps (Pancake V2 LP) |
| Policy band | **20 bps** via `SMARTSWAP_REVENUE_POLICY_V1` (re-derived, not copied blindly) |
| Canary size | 0.01 WBNB still the certified maximum |

## Material blockers (do not repair)

### 1. Executor bytecode keccak ≠ M5-certified artifact

| | M5 certified | M6 measured (`forge inspect … \| cast keccak`) |
|--|--|--|
| creation | `0x044040c2af494c8d1e34f1de7e3dd3071ae9cdf39df0fdfec908b9d4d261510c` | `0xd0534f444328674466c9bc6c1b72cb2ebd26d870f564c0cb8b85bc8566cb74c9` |
| deployed | `0x0f0b418f1b3f1a7a0897864c271eacedd6ebeb4bf226fcfc3c23aa2153b74fa3` | `0x49a9a3b7ff50e96b7bdd29687bafd40c05edb9e6b42b145407d025afa020cd5f` |

M6 is required to deploy the **exact** M5-certified bytecode. Source matches; the local compile artifact does not. No retune of solc/optimizer/cache.

### 2. No signer

| | |
|--|--|
| root `.env` | missing |
| `MAINNET_DEPLOYER` | unset |
| Foundry keystores `melega-canary-seller` / `melega-team` | present, encrypted, empty-password decrypt failed |

### 3. Known production deployer cannot fund the canary input

Address `0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0` (prior Melega mainnet deploys):

| | wei |
|--|--|
| BNB | `13465384635635472` (~0.0135) |
| WBNB | `0` |

M5/M6 canary input is `10000000000000000` WBNB. WBNB balance is zero. Not increased autonomously.

## Not executed

Deploy, `setRouter`, approval, wrap, swap: **none**.
