# SmartSwap V2 — Real Router Local Anvil Fork Proof

Status: **VENUES VERIFIED ON LOCAL FORK (synced to CURRENT MAIN)** — **NOT GO_LIVE_READY**
Public path remains legacy. No merge, public deploy, payment, approval, Founder signature, public broadcast, or activation.

Copied forward from #83 `FINAL_FOUNDER_REVIEW.md` FORK_EVIDENCE. #83 branch was not reopened. #50 was not reused. #85/#86/#87/#88 surfaces were not modified.

This revision is **not** a recycled 16/16. Evidence below is from the post-rebase re-run on CURRENT MAIN.

## Identity

| Field | Value |
| --- | --- |
| CURRENT_MAIN_SHA | `7886fbbebf09eda2cf4494cd707aff699b712d3b` |
| PRE_SYNC_HEAD | `d5c34a289ac7b59b67d854950f05d4a5fb992287` |
| SYNC_METHOD | rebase onto `origin/main` (15 commits replayed, 0 conflicts) |
| CODE_HEAD (this suite run) | `eb34586546cfe481a0eb7d56f710ce4750c52f0f` |
| BRANCH | `cursor/smartswap-v2-real-router-fork-proof-c987` |
| Architect-reviewed parent (pre-rebase) | `189fbd2b2767b14860f618e607971bcf2150603b` |
| Unique goal | Prove existing `SmartSwapExecutorV2` on **real** routers via **local** Anvil fork using existing `prepareV2UserTransactions` calldata |
| Isolation | Anvil `--host 127.0.0.1` only. Public RPC is read-only fork source. Writes stay on localhost. Occupied listen port → `PORT_IN_USE` (no `lsof`/`kill -9` of foreign processes). Cleanup kills only the Anvil child spawned by the test. |
| Modes | `LEGACY_PRODUCTION` / `SHADOW` / `isProductionCutoverAllowed() === false` unchanged |

## Artifact (#83 match)

Release profile `smartswap_executor_release` (solc 0.8.20, optimizer 200, viaIR, shanghai, `bytecodeHash=none`).

| Field | Value |
| --- | --- |
| Creation SHA-256 | `36d2503e328425ab66b61e384fa02418ec18c29df3e7966f01ece0c1e4422217` |
| Deployed SHA-256 | `4ccb42b71a9a7826715f14a234a68c71dda90859a1e70c0981bb4a8695594722` |
| Package `creation.hex` / `deployed.hex` | MATCH |
| Local deploy owner | Anvil account 0 `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` ≠ future public owner `0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0` |
| Treasury | `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` |
| Public executor | **NON_DEPLOYED / not used** |

`setRouter` ran only on the local Anvil instance. No `anvil_setCode` on router/factory/pool/token/WNative.

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

Focused `sendExpectRevert helper regressions` on this post-rebase HEAD: **5 passed | 11 skipped** (4ms).

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

From the passing full-file run after rebase onto CURRENT MAIN:

| Chain | RPC | Block | Hash | Listen |
| --- | --- | --- | --- | --- |
| BSC 56 | `https://bsc-dataseed.binance.org` | `0x755bbfa` (123059194) | `0xee2ab91b9f1bfa251f28c4132f5d0768d811cd5b9834787d8fb582026324e94b` | `127.0.0.1:18557` (+ `:18559` isolated expiry/slippage child) |
| ETH 1 | `https://ethereum-rpc.publicnode.com` | `0x18d0dd9` (26021337) | `0xdfe3e7456b89bdb7c217174d5b85e18b71679713f40bd0dc2e5ac8038343c5c0` | `127.0.0.1:18558` |

Routers (real code, no `anvil_setCode`): Melega `0xc250…EAB3`, Pancake `0x10ED…024E`, Uniswap `0x7a25…488D`.

## Execute outcomes (this HEAD)

GROSS BSC `5e16` (0.05 BNB) → fee `1e14` (20 bps) net `4.99e16`.
GROSS ETH `2e16` (0.02 ETH) → fee `3e13` (15 bps) net `1.997e16`.
Native-in fee as **WBNB / WETH**. Pair `balanceOf` + Transfer logs — not `lastAmountIn()`.

| Proof | Result | Observed | TS calldata keccak |
| --- | --- | --- | --- |
| Melega native-in (single-venue) | PASS | fee `1e14` WBNB; net `4.99e16`; userOut `+2487242764277502268` USDC | `0xa17cf398…efc891` |
| Melega ERC20-in (single-venue) | PASS | fee `1e14` WBNB; net `4.99e16`; userOut `+84297174923593828` USDC | `0xc3af8ece…eed14d` |
| Pancake native-in (single-venue) | PASS | fee `1e14` WBNB; net `4.99e16`; userOut `+38045202707447640944` USDC | `0x96ce6ca6…4400db` |
| Pancake ERC20-in (single-venue) | PASS | fee `1e14` WBNB; net `4.99e16`; userOut `+38028113735943237093` USDC | `0x1e02bf49…672c19` |
| BSC competition same WBNB/USDC | PASS — winner **pancakeswap** (not forced) | melegaOut `29405714733814080` vs pancakeOut `38011036280572691690` | `0x5e1b5200…5f32ef` |
| Uniswap native-in | PASS | fee `3e13` WETH; net `1.997e16`; userOut `+52163649` USDC (6 dec) | `0xe6f83f27…eded05` |
| Uniswap ERC20-in | PASS | fee `3e13` WETH; net `1.997e16`; userOut `+52163123` USDC | `0x64e8191f…808346` |

Full calldata hashes from `FORK_PROOF.calldata`:

- `BSC:melega-dex:native:0xa17cf398a48c53c085db88ce754aac3ead96cd6e61d7ae382324d7b4e0efc891`
- `BSC:melega-dex:erc20:0xc3af8ececf8c641640ad3501185b721fde2e6614558a9ba488868aea66eed14d`
- `BSC:pancakeswap:native:0x96ce6ca6fa45ee1274b59b2c2cfa2d8de9af426cbbc16c2daf4fa2b8d64400db`
- `BSC:pancakeswap:erc20:0x1e02bf49ad0c422ce16e24fc9c74a9dbc7fe7ceeb139b161dbc87094b2672c19`
- `BSC:competition:pancakeswap:0x5e1b520048a54d3ec07c07fce8d8df32598c8707da95d647c4eba84dfd5f32ef`
- `ETH:uniswap:native:0xe6f83f27f813646bd81f77dcaf59f52f6faae6085c7c0959b0c9f49ceceded05`
- `ETH:uniswap:erc20:0x64e8191ffcbd925cc74b58ac6a2742ca333fac64f655643691cc491ba2808346`
- `ETH:uniswap:erc20:0x9e4c13314f72cc0429811e60db4c3e8ab716e52e95756a3acd683eb9a9538075`

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
git fetch origin main
git rebase origin/main
# 15/15 replayed, 0 conflicts; files vs main still only the two product files

yarn --ignore-engines test src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts -t 'sendExpectRevert helper regressions'
# 5 passed | 11 skipped (4ms)

yarn --ignore-engines test src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts
# 16 passed (5 helper + 11 fork) in 153.37s — pins and negative rows above
git diff --check
```

Do not cite a prior 16/16 as proof of this synced HEAD.

## Limits

- Ordinary WBNB/USDC and WETH/USDC only. Not a FOT certification.
- Melega WBNB/USDC is thin; later Melega ERC20 output is lower after earlier native-in on the same fork.
- BSC expiry/slippage uses a dedicated `:18559` child so time-travel/dumps do not stall the shared dataseed fork.
- Local fork execute ≠ public V2 activation. CTA still legacy.

## #83 FORK_EVIDENCE (superseded for this PR)

#83 recorded FORK_EVIDENCE as MISSING/BLOCKED. This PR executes TS calldata against real routers on localhost. The #83 branch is not updated.
