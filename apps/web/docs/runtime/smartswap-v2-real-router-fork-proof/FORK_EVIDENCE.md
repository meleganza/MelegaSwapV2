# SmartSwap V2 — Real Router Local Anvil Fork Proof

Status: **VENUES VERIFIED ON LOCAL FORK (corrected HEAD)** — **NOT GO_LIVE_READY**
Public path remains legacy. No merge, public deploy, payment, approval, Founder signature, public broadcast, or activation.

Copied forward from #83 `FINAL_FOUNDER_REVIEW.md` FORK_EVIDENCE. #83 branch was not reopened. #50 was not reused.

This revision is **not** the earlier 11/11 run. Evidence below is from the architect `sendExpectRevert` / `startFork` fix re-run on this HEAD.

## Identity

| Field | Value |
| --- | --- |
| BASE_MAIN_SHA | `cf2575c290718e5bf9eacb24e70c1ee1728e11eb` |
| BRANCH | `cursor/smartswap-v2-real-router-fork-proof-c987` |
| Architect-reviewed parent | `189fbd2b2767b14860f618e607971bcf2150603b` |
| Helper-fix parent | `1701b8128ceb3ae265d269ee9eac0fd8f882c14c` |
| CODE_HEAD (this suite run) | `72bed786cff9b1475379b2ece47d25cf9aa2837c` |
| FINAL_HEAD | `b040f40e119252f7ea198aacc0f3d1ed29c5646e` |
| Unique goal | Prove existing `SmartSwapExecutorV2` on **real** routers via **local** Anvil fork using existing `prepareV2UserTransactions` calldata |
| Isolation | Anvil `--host 127.0.0.1` only. Public RPC is read-only fork source. Writes stay on localhost. Occupied listen port → `PORT_IN_USE` (no `lsof`/`kill -9` of foreign processes). Cleanup kills only the Anvil child spawned by the test. |
| Modes | `LEGACY_PRODUCTION` / `SHADOW` / `isProductionCutoverAllowed() === false` unchanged |

## Artifact (#83 match)

Release profile `smartswap_executor_release` (solc 0.8.20, optimizer 200, viaIR, shanghai, `bytecodeHash=none`).

| Field | Value |
| --- | --- |
| Creation SHA-256 | `36d2503e328425ab66b61e384fa02418ec18c29df3e7966f01ece0c1e4422217` |
| Deployed SHA-256 | `4ccb42b71a9a7826715f14a234a68c71dda90859a1e70c0981bb4a8695594722` |
| Local deploy owner | Anvil account 0 `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` ≠ future public owner `0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0` |
| Treasury | `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` |
| Public executor | **NON_DEPLOYED / not used** |

`setRouter` ran only on the local Anvil instance.

## sendExpectRevert (corrected)

Positive EVM revert only:

- mined receipt `status=0`, then revert data from `eth_call` / provider payload
- provider exception carrying a failed receipt (`status=0`) plus revert data
- RPC revert payload whose selector/string decodes with the compiled Executor ABI or `Error(string)`

Timeout, HTTP 429, missing/null receipt, and `status=1` throw. They do **not** satisfy a negative case. Transport errors from `waitForReceipt` are tagged the same way as send.

Expected reasons (a different selector/string fails the case):

| Case | Required reason | Compiled / decoded evidence from this run |
| --- | --- | --- |
| Replay | custom `Replay()` | selector `0xb5a78004` |
| Expired | custom `Expired()` | selector `0x203d82d8` |
| Slippage | `Error(string)` containing `INSUFFICIENT_OUTPUT_AMOUNT` | BSC `DEXRouter: INSUFFICIENT_OUTPUT_AMOUNT`; ETH `UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT`; selector `0x08c379a0` |

Treasury WBNB/WETH, user input/output balances, and `usedNonce` were checked on each failed execute.

### Helper regressions (no fork)

Focused `sendExpectRevert helper regressions` on this HEAD: **5 passed | 11 skipped** (4ms).

| Case | Result |
| --- | --- |
| timeout (`code=TIMEOUT`) | REJECTED `REVERT_HELPER_TRANSPORT:TIMEOUT` |
| HTTP 429 | REJECTED `REVERT_HELPER_TRANSPORT:RATE_LIMIT` |
| null receipt | REJECTED `REVERT_HELPER_NULL_RECEIPT` |
| successful receipt `status=1` | REJECTED `REVERT_HELPER_SUCCEEDED` |
| status=0 + `Replay` accepted; `Expired` data rejected for a Replay expectation | PASS / `REVERT_REASON_MISMATCH:want=Replay:have=Expired` |

## RPC diagnosis

Configured env: `BNB_MAINNET_RPC_URL` UNSET, `ETHEREUM_RPC_URL` UNSET, `BSC_RPC_URL` UNSET, `ETH_RPC_URL` UNSET. Documented public read-only endpoints were probed (not “env unset” alone).

Used this run:

- BSC: `https://bsc-dataseed.binance.org`
- ETH: `https://ethereum-rpc.publicnode.com`

Rejected examples (unchanged diagnosis): Ankr `Unauthorized`; LlamaRPC Cloudflare 403; PublicNode BSC archive-token 403; Cloudflare-eth `Cannot fulfill request`.

## Pinned forks actually used (this HEAD)

From the passing full-file run after the helper fix:

| Chain | RPC | Block | Hash | Listen |
| --- | --- | --- | --- | --- |
| BSC 56 | `https://bsc-dataseed.binance.org` | `0x751efb3` (122810291) | `0x23e43516a5623766b5e5cd0a95972801db95a80e749415e4dcfc36c4e9ad7771` | `127.0.0.1:18557` (+ `:18559` isolated expiry/slippage child) |
| ETH 1 | `https://ethereum-rpc.publicnode.com` | `0x18ce98b` (26012043) | `0xcd7c54753f1bac747427fda1de67050b63a05b87abbc5db4c18a2987ced65aa6` | `127.0.0.1:18558` |

Routers (real code, no `anvil_setCode`): Melega `0xc250…EAB3`, Pancake `0x10ED…024E`, Uniswap `0x7a25…488D`.

## Execute outcomes (this HEAD)

GROSS BSC `5e16` (0.05 BNB) → fee `1e14` (20 bps) net `4.99e16`.
GROSS ETH `2e16` (0.02 ETH) → fee `3e13` (15 bps) net `1.997e16`.
Native-in fee as **WBNB / WETH**. Pair `balanceOf` + Transfer logs — not `lastAmountIn()`.

| Proof | Result | Observed | TS calldata keccak |
| --- | --- | --- | --- |
| Melega native-in (single-venue) | PASS | fee `1e14` WBNB; net `4.99e16`; userOut `+2487242764277502268` USDC | `0x3ce0a40f…6cc200` |
| Melega ERC20-in (single-venue) | PASS | fee `1e14` WBNB; net `4.99e16`; userOut `+84297174923593828` USDC | `0xa8349614…0e391a` |
| Pancake native-in (single-venue) | PASS | fee `1e14` WBNB; net `4.99e16`; userOut `+38309693622732593826` USDC | `0x2cc4bf3b…59d82e` |
| Pancake ERC20-in (single-venue) | PASS | fee `1e14` WBNB; net `4.99e16`; userOut `+38292422092768525151` USDC | `0x20344e9e…61b073` |
| BSC competition same WBNB/USDC | PASS — winner **pancakeswap** (not forced) | melegaOut `29405714733814080` vs pancakeOut `38275162245077046984` | `0xdea728c5…d946bf` |
| Uniswap native-in | PASS | fee `3e13` WETH; net `1.997e16`; userOut `+52500157` USDC (6 dec) | `0x8f24c4b2…d16881` |
| Uniswap ERC20-in | PASS | fee `3e13` WETH; net `1.997e16`; userOut `+52499627` USDC | `0x81216f33…9414b5` |

Full calldata hashes from `FORK_PROOF.calldata`:

- `BSC:melega-dex:native:0x3ce0a40ff3d6cd3c2dfca0a34788532342c9cac010968297024d73da786cc200`
- `BSC:melega-dex:erc20:0xa83496147c973a9e650638d9cb0b0e9c965ccf6c79aa729524418515ed0e391a`
- `BSC:pancakeswap:native:0x2cc4bf3b94799c73d42f97bba8466273dc292685cc96e0fd1df5e3c64f59d82e`
- `BSC:pancakeswap:erc20:0x20344e9e7203ee7013b237557bebcc9dc18fa039a38cf121d68fc0e4e861b073`
- `BSC:competition:pancakeswap:0xdea728c5a58cb8d73f834089ef89fbe44d0e2cded1656b74a492de4360d946bf`
- `ETH:uniswap:native:0x8f24c4b2f70479daeff2980885950c0d1318529beec0cda4000a9c2dead16881`
- `ETH:uniswap:erc20:0x81216f3377a23b1aac07fae49e6e8e6319e8b80503316e5e79ad31605b9414b5`
- `ETH:uniswap:erc20:0x8257ba192f58749f84c3f4ae3a204e4e43119abd8b3ef59d35cecb35e44e2c5c`

### Decoded negative-case evidence (this HEAD)

All sources `receipt-status-0`. Treasury fee token and user in/out balances unchanged.

| Case | Selector | Decoded reason | nonce after |
| --- | --- | --- | --- |
| BSC pancake replay | `0xb5a78004` | `Replay()` | used |
| BSC melega expired | `0x203d82d8` | `Expired()` | unused |
| BSC melega slippage | `0x08c379a0` | `DEXRouter: INSUFFICIENT_OUTPUT_AMOUNT` | unused |
| ETH uniswap replay | `0xb5a78004` | `Replay()` | used |
| ETH uniswap expired | `0x203d82d8` | `Expired()` | unused |
| ETH uniswap slippage | `0x08c379a0` | `UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT` | unused |

## Commands actually run on this HEAD

```bash
yarn --ignore-engines test src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts -t 'sendExpectRevert helper regressions'
# 5 passed | 11 skipped (4ms)

yarn --ignore-engines test src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts
# 16 passed (5 helper + 11 fork) in 152.69s — pins and negative rows above
git diff --check
```

Do not cite the pre-fix 11/11 run as proof of this helper.

## Limits

- Ordinary WBNB/USDC and WETH/USDC only. Not a FOT certification.
- Melega WBNB/USDC is thin; later Melega ERC20 output is lower after earlier native-in on the same fork.
- BSC expiry/slippage uses a dedicated `:18559` child so time-travel/dumps do not stall the shared dataseed fork.
- Local fork execute ≠ public V2 activation. CTA still legacy.

## #83 FORK_EVIDENCE (superseded for this PR)

#83 recorded FORK_EVIDENCE as MISSING/BLOCKED. This PR executes TS calldata against real routers on localhost. The #83 branch is not updated.
