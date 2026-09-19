# SmartSwap V2 — Real Router Local Anvil Fork Proof

Status: **VENUES VERIFIED ON LOCAL FORK** — **NOT GO_LIVE_READY**  
Public path remains legacy. No merge, public deploy, payment, approval, Founder signature, public broadcast, or activation.

Copied forward from #83 `FINAL_FOUNDER_REVIEW.md` FORK_EVIDENCE. #83 branch was not reopened. #50 was not reused.

## Identity

| Field | Value |
| --- | --- |
| BASE_MAIN_SHA | `cf2575c290718e5bf9eacb24e70c1ee1728e11eb` |
| BRANCH | `cursor/smartswap-v2-real-router-fork-proof-c987` |
| Unique goal | Prove existing `SmartSwapExecutorV2` on **real** routers via **local** Anvil fork using existing `prepareV2UserTransactions` calldata |
| Isolation | Anvil `--host 127.0.0.1` only. Public RPC is read-only fork source. Writes stay on localhost. |
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

## RPC diagnosis

Configured env: `BNB_MAINNET_RPC_URL` UNSET, `ETHEREUM_RPC_URL` UNSET, `BSC_RPC_URL` UNSET, `ETH_RPC_URL` UNSET. That alone is not the diagnosis — documented public read-only endpoints were probed.

### BSC (chainId `0x38`)

Working `eth_chainId` + `eth_blockNumber` + `eth_getStorageAt` at pin:

- `https://bsc-dataseed.binance.org` (**used**)
- `https://bsc-dataseed1.defibit.io`
- `https://bsc-dataseed1.ninicoin.io`
- `https://bsc-dataseed1.bnbchain.org`
- `https://bsc-dataseed2.binance.org`

Failed / rejected for fork:

| Endpoint | Method | Error |
| --- | --- | --- |
| `https://rpc.ankr.com/bsc` | `eth_chainId` | HTTP 200 `Unauthorized` (API key required) |
| `https://bsc-rpc.publicnode.com` | Anvil fork / `eth_getTransactionReceipt` | HTTP 403 `Archive requests require a personal token` (Allnodes PublicNode) |

### Ethereum (chainId `0x1`)

Working (used `https://ethereum-rpc.publicnode.com`):

- `https://ethereum-rpc.publicnode.com`
- `https://ethereum.publicnode.com`
- `https://1rpc.io/eth`
- `https://rpc.flashbots.net`
- `https://eth.drpc.org`
- `https://eth.meowrpc.com`
- `https://eth-mainnet.public.blastapi.io`

Failed:

| Endpoint | Method | Error |
| --- | --- | --- |
| `https://rpc.ankr.com/eth` | `eth_chainId` | HTTP 200 `Unauthorized` (API key required) |
| `https://eth.llamarpc.com` | `eth_chainId` | HTTP 403 Cloudflare “Just a moment…” |
| `https://cloudflare-eth.com` | `eth_blockNumber` | HTTP 200 JSON-RPC `Cannot fulfill request` |
| `https://eth.api.onfinality.io/public` | `eth_chainId` | HTTP 429 rate limit |
| `https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161` | `eth_chainId` | HTTP 401 project ID has no access |
| `https://eth-mainnet.g.alchemy.com/v2/demo` | `eth_chainId` | HTTP 429 |

## Pinned forks actually used

From the passing `v2RealRouterForkProof.test.ts` run:

| Chain | RPC | Block | Hash | Listen |
| --- | --- | --- | --- | --- |
| BSC 56 | `https://bsc-dataseed.binance.org` | `0x751e113` (122806547) | `0x56771620f74d6d78ca68e4163cfaba58118e23cdb9d0b348aa2fd92236869fa4` | `127.0.0.1:18557` (+ `:18559` isolated failure-mode fork) |
| ETH 1 | `https://ethereum-rpc.publicnode.com` | `0x18ce8ff` (26011903) | `0x48a5c1932caa91a3f5a4d8c09ec5b8e5b8537147119ba6d9b4c94b567ba1c474` | `127.0.0.1:18558` |

Routers with real code (no `anvil_setCode`):

- Melega `0xc25033218D181b27D4a2944Fbb04FC055da4EAB3`
- Pancake `0x10ED43C718714eb63d5aA57B78B54704E256024E`
- Uniswap `0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D`

Pair: BSC WBNB/USDC (both factories have a real pair). ETH WETH/USDC Uniswap V2 `0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc`.

## Execute outcomes

GROSS BSC `50000000000000000` (0.05 BNB), fee 20 bps → fee `100000000000000`, net `49900000000000000`.  
GROSS ETH `20000000000000000` (0.02 ETH), fee 15 bps → fee `30000000000000`, net `19970000000000000`.  
Native-in fee received as **WBNB** / **WETH**. Net-to-router from pair `balanceOf` + Transfer logs. No `lastAmountIn()`.

| Proof | Result | Observed | TS calldata keccak |
| --- | --- | --- | --- |
| Melega native-in | **PASS** (single-venue) | fee `1e14` WBNB; net `4.99e16`; userOut `+2487242764277502268` USDC | `0xaed504858e84a40665ee77a2dcbbc0ce2df7fae6035b71ee0512e9f011567a61` |
| Melega ERC20-in | **PASS** (single-venue) | fee `1e14` WBNB; net `4.99e16`; userOut `+84297174923593828` USDC | `0xe84734b22e9c2f36ce1daf9462aecf5e2ed656d20716fec2e553a272fd79c5fb` |
| Pancake native-in | **PASS** (single-venue) | fee `1e14` WBNB; net `4.99e16`; userOut `+38257214262792176718` USDC | `0x5828920da43099bfca2d0af4d2f8033f9d497afd00182db39daf179e9b25bff2` |
| Pancake ERC20-in | **PASS** (single-venue) | fee `1e14` WBNB; net `4.99e16`; userOut `+38239978191243671082` USDC | `0x6247be268380d3ebfd3d489fd432bc99141988d86080ed2bcb17776205ce9123` |
| BSC competition (same WBNB/USDC request) | **PASS** — winner **pancakeswap** (not forced) | melegaOut `29405714733814080` vs pancakeOut `38222753770010863175` | `0xe0b9ac9211a89d5b9afc81ec944685baded29a2b919a840ba8b4504b451f64db` |
| Uniswap native-in | **PASS** (single-venue) | fee `3e13` WETH; net `1.997e16`; userOut `+52500356` USDC (6 dec) | `0x4e295cce9ddb5a99dc1b91c309fa746e7cf6e294be7ae2cb0fa2e61cbaf461b4` |
| Uniswap ERC20-in | **PASS** (single-venue) | fee `3e13` WETH; net `1.997e16`; userOut `+52499825` USDC | `0xe58ffb321ee01b21247dac9d52d027b711fce3345dfc78237c4a5d37ff4327f1` |
| Replay / expired / slippage | **PASS** on BSC (isolated fork `:18559`) and ETH | replay: nonce stays used, no extra fee; expired/slippage: nonce unused, treasury WBNB/WETH unchanged | ETH replay calldata `0x048356cd61039ebfb7a0aefcbeda7ce3185f0beb8e50a6d5647a03cd2216cb56` |

Approval spender was the local Executor, not Team/Treasury. Executor→router allowance was 0 after ERC20 swaps. No second output fee.

**No global PASS would be claimed if any row above were unverified.** All listed venues verified on this local fork.

## Commands actually run

```bash
yarn --ignore-engines test src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts
# 11 passed (153.57s) on the evidence pin above
git diff --check
```

## Isolation rules applied

- Anvil listen `127.0.0.1` only
- Fund Anvil test accounts only; wrapped native via real `deposit()`
- No `anvil_setCode` on router / factory / pool / token / wrapped native
- No reserve storage edits
- No Founder keys, signatures, public broadcast, or production `setRouter`

## Limits

- Ordinary-token WBNB/USDC and WETH/USDC only. Does **not** certify FOT tokens.
- Output is measured from user token balance, not only the router return value.
- Melega WBNB/USDC is thin; later Melega ERC20 output is lower after earlier native-in on the same fork (factual pool impact, not a lowered `minUserOut`).
- BSC expiry/slippage uses a dedicated `:18559` fork so `evm_increaseTime` / real dumps do not stall later receipts on the non-archive dataseed fork.
- Local fork execute ≠ public V2 activation. CTA still legacy.

## #83 FORK_EVIDENCE (superseded for this PR)

#83 recorded FORK_EVIDENCE as MISSING/BLOCKED (no harness; env RPCs unset; Ankr ETH `Unauthorized`; BSC dataseed used only for `eth_blockNumber` liveness). This PR adds the harness and executes TS calldata against real routers on localhost. The #83 branch is not updated.
