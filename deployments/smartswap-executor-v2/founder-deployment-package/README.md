# SmartSwapExecutorV2 Founder deployment package

Prepare-only. Public status: **NOT_EXECUTED**.

This package is for the existing `contracts/smartswap/SmartSwapExecutorV2.sol` on current main `2f94866e7834514d6e8d1d6c3db416a41e9308f9` (includes merged #90). It does not add another executor. It does not change production runtime config.

Gate-correction mission: **MELEGA-SMARTSWAP-V2-IMMUTABLE-RUNTIME-GATE-CORRECTION**.

Founder decision context:

- `DEPLOY_BSC` was previously approved, but the attempt stopped safely before signature. No public tx. No contract. No `setRouter`.
- `DEPLOY_ETH = NOT_AUTHORIZED`

## Artifact (build reproducibility)

Classification: **ARTIFACT_MATCH**

| Field | Value |
| --- | --- |
| SOURCE_SHA (git blob) | `eb5e54725a2d3cdc316de18fd542ac66dcfbf688` |
| Source SHA-256 | `e5a4acafa5114834d249b70758722ae91b5fc4a17b4776c0376f714440535b52` |
| SOLC | `0.8.20+commit.a1b79de6` |
| Profile | `smartswap_executor_release` |
| Optimizer | enabled, 200 runs |
| viaIR | true |
| EVM | shanghai |
| Metadata | `bytecodeHash=none`, `appendCBOR=false`, `useLiteralContent=true` |
| Libraries | none |
| License | MIT |
| CREATION_BYTECODE_SHA256 | `36d2503e328425ab66b61e384fa02418ec18c29df3e7966f01ece0c1e4422217` |
| COMPILER_RUNTIME_TEMPLATE_SHA256 | `4ccb42b71a9a7826715f14a234a68c71dda90859a1e70c0981bb4a8695594722` |
| ABI_SHA256 | `9ec598d3a8b79b21e61cc184cc2fd8eb5df2384b355f39ad2620165da69e96c2` |

`COMPILER_RUNTIME_TEMPLATE_SHA256` is the SHA-256 of solc `evm.deployedBytecode.object`. That object still contains **immutable placeholders**. It is for build reproducibility only.

**Never** compare public `eth_getCode` to `COMPILER_RUNTIME_TEMPLATE_SHA256`.

## Immutable references (compiler truth)

AST-mapped from solc output (not positional guessing):

| AST id | Name | Offsets (start, length=32) |
| --- | --- | --- |
| 63 | `treasury` | 1088, 1417, 2284, 2776, 3309 |
| 65 | `wrappedNative` | 473, 2098, 2149, 2220, 2317, 4219, 4384 |

`owner_` is constructor input for Ownable storage. It is **not** an immutable and does not appear in `immutableReferences`.

Full machine-readable map: `immutable-references.json`.

## Expected post-constructor runtime (public eth_getCode gate)

Derived deterministically:

`compiler runtime template` + `immutableReferences` + chain `(treasury, wrappedNative)`.

| Chain | EXPECTED_POST_CONSTRUCTOR_RUNTIME_SHA256 | EXPECTED_POST_CONSTRUCTOR_RUNTIME_KECCAK256 |
| --- | --- | --- |
| BSC 56 | `81328ab7fcce60fedb386a41fb17adceffcf897b25530a4504a8cff5c389845a` | `0x262bb476ce9ec68f74d9570b93e46cf9bd963bc6f0a6572d7b18d3b4e88f0f13` |
| Ethereum 1 | `98235593533c8543c09c5e122f27f5c26296a985f3af19e5b2f17beae27930ea` | `0x4efbb79f0bf7338c519dd471ba33b0cc0a6f59b98ce2dfe9ac3463a54126a8d9` |

BSC immutables: treasury `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b`, wrappedNative WBNB `0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c`.

Ethereum immutables: same treasury, wrappedNative WETH `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`.

Independent local Anvil CREATE of the exact #90 `creationTransaction.data` produced byte-for-byte equality with these derived runtimes. Local executor addresses are disposable.

## PR #90 gate bug (corrected here)

#90 incorrectly used `COMPILER_RUNTIME_TEMPLATE_SHA256` as `expectedRuntimeBytecodeSha256` for public verification. That is invalid whenever immutable values are non-zero:

`COMPILER_RUNTIME_TEMPLATE_SHA256 != EXPECTED_POST_CONSTRUCTOR_RUNTIME_SHA256` by design.

## Public post-deploy verification algorithm

1. verify `creationTransaction.data` keccak256
2. Founder signs CREATE
3. `receipt.status == 1`
4. obtain `contractAddress`
5. `eth_getCode(contractAddress)`
6. compare byte-for-byte / hash against `EXPECTED_POST_CONSTRUCTOR_RUNTIME` for **that** chain
7. verify `owner()`, `treasury()`, `wrappedNative()`, `paused()`
8. only after **all** pass may `setRouter` begin

## Governance addresses

| Role | Address |
| --- | --- |
| Future owner / admin / deployer | `0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0` |
| Future treasury | `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` |

Local rehearsal uses an Anvil test account as owner. It does not use a Founder key.

## Addresses checked

BSC 56 matches the certified venue catalog, production Melega router, chain wrapped-native config, and the #84 fork routers.

| Item | Address | Where it matched |
| --- | --- | --- |
| WBNB | `0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c` | `certifiedVenues.ts`, `WETH9[BSC]` |
| Melega V2 | `0xc25033218D181b27D4a2944Fbb04FC055da4EAB3` | `MELEGA_DEX_VENUE`, `ROUTER_ADDRESS[BSC]`, `MELEGA_BNB_ROUTER`, `MELEGA_ROUTER_BSC` |
| PancakeSwap V2 | `0x10ED43C718714eb63d5aA57B78B54704E256024E` | `PANCAKE_SWAP_VENUE` (QUOTE_ONLY). This is not the production Melega router. |

Ethereum 1:

| Item | Address | Where it matched |
| --- | --- | --- |
| WETH | `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2` | `UNISWAP_VENUE`, `WETH9[ETHEREUM]` |
| Uniswap V2 | `0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D` | `UNISWAP_VENUE` (QUOTE_ONLY), #84 |

Production Melega on Ethereum is a different contract, `0xFF8EBf8edf1C533A02d066f852788773BdCD631C` (`MELEGA_ETH_ROUTER` and `ROUTER_ADDRESS[ETHEREUM]`). It is not the Uniswap target and it is not in this deployment.

## Constructor and setRouter

Constructor: `constructor(address treasury_, address wrappedNative_, address owner_)`.

The on-chain allowlist function is `setRouter(address router, bytes32 venueId, bool allowed)`, selector `0x1bdbc79b`. It is not `setRouter(address,bool)`. The venue word is `keccak256` of `melega-dex`, `pancakeswap`, or `uniswap`. The post-deploy read is `allowedVenue(address)`, not `allowedRouters`.

| Chain | Call | Calldata keccak256 |
| --- | --- | --- |
| 56 | setRouter Melega `melega-dex` true | `0xc4e049247d6a9cd0f3ab0ed3a657d1bcc6f9c4ac1b532a6121fb673eed0189fb` |
| 56 | setRouter Pancake `pancakeswap` true | `0x511f3b828af96fbc22acd05d474d02a9ab75eb240dfaf3117706353b2c23afac` |
| 1 | setRouter Uniswap `uniswap` true | `0x398092b3ff1cd07f638d86f1511908b93323b00d82113fe017a03334e0169f49` |

Caller required: **OWNER**.

Creation is a normal CREATE. Nonce is not fixed, so `executorAddress = NON_DEPLOYED / UNKNOWN`.

Exact args, ABI encoding, creation `data`, and `dataKeccak256` are in `bsc.json` and `ethereum.json`.

BSC creation data keccak256: `0x2db6aa9c2552a8dc73f7afde588bbf8e21293fe587bc7b3e042098ac6876ca9e`

Ethereum creation data keccak256: `0xf2652d8efd7555a8dbe7c75c7655fd78b49d6c1086252ca412830966813ec642`

## Gas observation

Observed `2026-09-22T06:09:23Z` (from #90). Not a guaranteed future cost. Nothing was purchased.

| | BSC | Ethereum |
| --- | --- | --- |
| RPC | `https://bsc-dataseed.binance.org` | `https://rpc.flashbots.net` |
| GAS_UNITS deployment | 1530959 | 1530959 |
| GAS_UNITS setRouter | 48521, 48543 | 48560 |
| GAS_UNITS total | 1628023 | 1579519 |
| OBSERVED_GAS_PRICE | 50000000 wei (`eth_gasPrice`) | 61475511 wei (`eth_gasPrice`; base fee 61467057) |
| RAW_ESTIMATE | 0.000081401150 BNB | 0.000097101738 ETH |
| RECOMMENDED_BUFFER | 2x = 0.000162802300 BNB | 2x = 0.000194203475 ETH |

## Stopped BSC run

| Field | Value |
| --- | --- |
| PUBLIC_DEPLOY_TX | NONE |
| FOUNDER_SIGNATURE | NONE |
| SETROUTER_TX | NONE |
| RUNTIME_CONFIG | NOT_CONFIGURED |
| CANARY | NOT_STARTED |
| CUTOVER | FALSE |

Fresh Founder BSC observation (read-only): nonce `3280`, balance ≈ `0.016460216118043106` BNB. Ethereum remains not authorized.

## Explorer verification, prepare only

`verification-standard-json-input.json`

Do not submit verification.

## Runtime config, not activated

Today, `v2ExecutionRuntimeConfig.ts` keeps chain 56 and chain 1 at `NOT_CONFIGURED`, `enabled=false`, `executorAddress=null`. This mission does not change that file.

`future-runtime-config-patch.NOT_APPLIED.json` is the later patch shape.

## Local fork rehearsal / Anvil cross-check

`founderDeploymentPackageForkRehearsal.test.ts` and the immutable runtime gate tests deploy on local Anvil only. No public broadcast. Local executor addresses must never be promoted to production config.

## Canary plan, do not run

After a verified deployment, a disabled config, and an owner `setRouter`, a later canary may proceed. Not this mission.

## Rollback

| Level | Action | Exists now |
| --- | --- | --- |
| 0 | Keep the public CTA on legacy | `PRODUCTION_EXECUTION_MODE = LEGACY_PRODUCTION`, config `NOT_CONFIGURED`, `V2_TEST_ONLY_CTA_EXECUTION_GATE = false` |
| 1 | Leave runtime V2 disabled | `enabled: false` |
| 2 | Owner `pause()` | `pause()` is `onlyOwner` |
| 3 | Owner `setRouter(router, venueId, false)` | clears `allowedVenue[router]` |
| 4 | Public action back to legacy | levels 0 and 1 |

## Security

Unchanged from the current contract. Treasury and wrappedNative are immutable. Owner is Ownable storage.

## Files

- `README.md`
- `bsc.json`
- `ethereum.json`
- `artifact-manifest.json`
- `immutable-references.json`
- `verification-standard-json-input.json`
- `NOT_EXECUTED.md`
- `future-runtime-config-patch.NOT_APPLIED.json`

#83 artifacts under `deployments/smartswap-executor-v2/` are unchanged.
