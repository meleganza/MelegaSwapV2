# SmartSwapExecutorV2 Founder deployment package

Prepare-only. Public status: **NOT_EXECUTED**.

This package is for the existing `contracts/smartswap/SmartSwapExecutorV2.sol` on current main `134d39fad838ed54a8c8117be38c47a3b09bef38`. It does not add another executor. It does not change production runtime config.

Founder decision, not taken here:

- `DEPLOY_BSC = READY_FOR_FOUNDER_APPROVAL`
- `DEPLOY_ETH = READY_FOR_FOUNDER_APPROVAL`

## Artifact

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
| DEPLOYED_BYTECODE_SHA256 | `4ccb42b71a9a7826715f14a234a68c71dda90859a1e70c0981bb4a8695594722` |
| ABI_SHA256 | `9ec598d3a8b79b21e61cc184cc2fd8eb5df2384b355f39ad2620165da69e96c2` |

The creation and deployed hashes match `deployments/smartswap-executor-v2/` from #83 and the artifact tested by #84. A fresh `FOUNDRY_PROFILE=smartswap_executor_release forge build` on this main SHA reproduced those bytes. `verification-standard-json-input.json` recompiled with solc 0.8.20 to the same bytes. Do not submit that file to an explorer from this mission.

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

Observed `2026-09-22T06:09:23Z`. Not a guaranteed future cost. Nothing was purchased.

| | BSC | Ethereum |
| --- | --- | --- |
| RPC | `https://bsc-dataseed.binance.org` | `https://rpc.flashbots.net` |
| GAS_UNITS deployment | 1530959 | 1530959 |
| GAS_UNITS setRouter | 48521, 48543 | 48560 |
| GAS_UNITS total | 1628023 | 1579519 |
| OBSERVED_GAS_PRICE | 50000000 wei (`eth_gasPrice`) | 61475511 wei (`eth_gasPrice`; base fee 61467057) |
| RAW_ESTIMATE | 0.000081401150 BNB | 0.000097101738 ETH |
| RECOMMENDED_BUFFER | 2x = 0.000162802300 BNB | 2x = 0.000194203475 ETH |

Ethereum base fee was corroborated near 0.067 gwei on Tenderly and Merkle at block 26031149. Several other public ETH endpoints returned 403 or Unauthorized from this environment. Re-read the fee before funding.

Gas units were measured by deploying the exact Founder creation payload and sending the exact `setRouter` calldata on a local Anvil fork. The fork impersonated the future owner address with no key. That chain state was discarded.

## Explorer verification, prepare only

`verification-standard-json-input.json`

| Field | Value |
| --- | --- |
| Contract | `SmartSwapExecutorV2` |
| Path | `contracts/smartswap/SmartSwapExecutorV2.sol` |
| Compiler | 0.8.20 |
| Optimizer | yes, 200 |
| viaIR | yes |
| EVM | shanghai |
| License | MIT |
| Libraries | none |
| Constructor args | the ABI-encoded args in the chain file, without the creation bytecode |

Do not submit verification.

## Runtime config, not activated

Today, `v2ExecutionRuntimeConfig.ts` keeps chain 56 and chain 1 at `NOT_CONFIGURED`, `enabled=false`, `executorAddress=null`. This mission does not change that file.

`future-runtime-config-patch.NOT_APPLIED.json` is the later patch shape: `CONFIGURED`, the verified address, `enabled=false`. `resolveV2ExecutorConfig` still hides the address while `enabled` is not true. `isProductionCutoverAllowed()` is hardcoded false.

States, in order: `DEPLOYED_VERIFIED` → `CONFIGURED_DISABLED` → `CANARY_ENABLED` → `PUBLIC_CUTOVER`.

## Local fork rehearsal

`founderDeploymentPackageForkRehearsal.test.ts` deployed the current creation bytecode on local Anvil forks of BSC and Ethereum. The constructor used the canonical treasury and wrapped native with an Anvil test owner. `setRouter` used the exact calldata in the chain JSON. No `anvil_setCode` was applied to routers, factories, pools, tokens, or wrapped native.

Checked on the fork: owner, treasury, wrapped native, `allowedVenue`, non-owner `setRouter` revert, `pause` rejecting `execute` with `EnforcedPause` and an unused nonce, `unpause` restoring a Melega native-in, Pancake ERC20-in, and Uniswap native-in plus ERC20-in. Treasury delta matched the protocol fee. ERC20 allowance spender was the executor. Executor to router allowance was zero after the ERC20 swap. `SmartSwapExecuted` was present. Prepared transactions came from `prepareV2UserTransactions`.

## Canary plan, do not run

After a verified deployment, a disabled config, and an owner `setRouter`, a later canary may send:

- BSC: one small native-in and one small ERC20-in. The factual winner may be Melega or Pancake. Do not force the venue.
- Ethereum: one small native-in and one small ERC20-in on Uniswap.

Representative fork pairs were WBNB/USDC and WETH/USDC. Canary notionals must be smaller than the rehearsal (0.05 BNB and 0.02 ETH). The Founder picks the exact canary amount. The user signs only the user's own transactions.

Pass:

- executor, router, `feeBps`, treasury delta, and user input delta match the prepared intent
- user output `>= minUserOut`
- `usedNonce` becomes true only after a successful `execute`
- ERC20 allowance spender is the executor only
- executor → router allowance is zero after an ERC20 swap
- no Team or platform signature
- the same action does not also submit the legacy router swap
- `SmartSwapExecuted` is in the receipt

Stop immediately if any pass row fails, if a wallet prompt asks for a Team or platform signature, if the spender is not the executor, if a reverted execute consumes the nonce, if the router is not the factual winner, or if anyone proposes enabling public cutover during the canary.

## Rollback

| Level | Action | Exists now |
| --- | --- | --- |
| 0 | Keep the public CTA on legacy | `PRODUCTION_EXECUTION_MODE = LEGACY_PRODUCTION`, config `NOT_CONFIGURED`, `V2_TEST_ONLY_CTA_EXECUTION_GATE = false` |
| 1 | Leave runtime V2 disabled | `enabled: false` makes `isV2ExecutorRuntimeEnabled` false and `buildV2UserExecutionPlan` returns legacy |
| 2 | Owner `pause()` | `pause()` is `onlyOwner`. `execute` is `whenNotPaused` |
| 3 | Owner `setRouter(router, venueId, false)` | clears `allowedVenue[router]` |
| 4 | Public action back to legacy | levels 0 and 1. Legacy swap remains the production path |

There is no proxy upgrade to roll back, and no owner sweep of user tokens.

## Security

From the current contract:

- `setRouter`, `pause`, and `unpause` are `onlyOwner`.
- Inherited `transferOwnership` and `renounceOwnership` are also `onlyOwner`.
- Treasury is immutable. It cannot change routers, pause, or fees.
- Users cannot change `allowedVenue`. A non-owner `setRouter` reverts `OwnableUnauthorizedAccount`.
- `execute` requires `msg.sender == intent.user`. There is no `intentSigner`, no platform signature, and no privileged relayer.
- No `delegatecall`. No proxy or upgrade function.
- No owner function withdraws arbitrary tokens. Fees move to the immutable treasury only inside the user's `execute`.
- Owner can halt swaps with `pause`, replace the allowlist with `setRouter` for the three known venue ids, and transfer ownership. An allowlisted router is code the owner has chosen to trust. Unknown venue ids revert `UnknownVenue`.
- Fee bands are pure: Melega and Pancake structural 25 bps → protocol 20 bps; Uniswap structural 30 bps → protocol 15 bps. The owner cannot edit them.
- `renounceOwnership` would remove the ability to pause or change routers. This package does not call it.

## Files

- `README.md`
- `bsc.json`
- `ethereum.json`
- `artifact-manifest.json`
- `verification-standard-json-input.json`
- `NOT_EXECUTED.md`
- `future-runtime-config-patch.NOT_APPLIED.json`

#83 artifacts under `deployments/smartswap-executor-v2/` are unchanged.
