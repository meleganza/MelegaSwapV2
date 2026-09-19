# SmartSwap V2 — Real Router Local Anvil Fork Proof

Status: **IN PROGRESS** (execute outcomes filled after `v2RealRouterForkProof.test.ts` runs)  
Public path: **NOT GO_LIVE_READY**  
This PR adds one adjacent fork test plus this evidence update. No runtime, contract, fee, catalog, or UI change. No merge, public deploy, payment, approval, Founder signature, public broadcast, or activation.

Copied forward from #83 `FINAL_FOUNDER_REVIEW.md` FORK_EVIDENCE. #83 branch was not reopened. #50 was not reused.

## Identity

| Field | Value |
| --- | --- |
| BASE_MAIN_SHA | `cf2575c290718e5bf9eacb24e70c1ee1728e11eb` |
| BRANCH | `cursor/smartswap-v2-real-router-fork-proof-c987` |
| Unique goal | Prove existing `SmartSwapExecutorV2` on **real** routers via **local** Anvil fork using existing `prepareV2UserTransactions` calldata |
| Isolation | Anvil `--host 127.0.0.1` only. Public RPC is read-only fork source. Writes stay on localhost. |

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

Working `eth_chainId` + `eth_blockNumber`:

- `https://bsc-dataseed.binance.org` (repo `BSC_RPC_URLS` / indexer default)
- `https://bsc-dataseed1.defibit.io`
- `https://bsc-dataseed1.ninicoin.io`
- `https://bsc-dataseed1.bnbchain.org`
- `https://bsc-dataseed2.binance.org`
- `https://bsc-rpc.publicnode.com`
- `https://bsc.publicnode.com`

Failed:

- `https://rpc.ankr.com/bsc` — method `eth_chainId`, HTTP 200, error `Unauthorized: You must authenticate your request with an API key`

Preferred source: `https://bsc-dataseed.binance.org`.

### Ethereum (chainId `0x1`)

Working:

- `https://ethereum-rpc.publicnode.com` (repo indexer default)
- `https://ethereum.publicnode.com`
- `https://1rpc.io/eth`
- `https://rpc.flashbots.net`
- `https://eth.drpc.org`
- `https://eth.meowrpc.com`
- `https://eth-mainnet.public.blastapi.io`
- plus several others (Tenderly, merkle, mevblocker, nodies)

Failed (exact):

| Endpoint | Method | Error |
| --- | --- | --- |
| `https://rpc.ankr.com/eth` | `eth_chainId` | HTTP 200 `Unauthorized` (API key required) |
| `https://eth.llamarpc.com` | `eth_chainId` | HTTP 403 Cloudflare “Just a moment…” |
| `https://cloudflare-eth.com` | `eth_blockNumber` | HTTP 200 JSON-RPC `Cannot fulfill request` |
| `https://eth.api.onfinality.io/public` | `eth_chainId` | HTTP 429 rate limit |
| `https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161` | `eth_chainId` | HTTP 401 project ID has no access |
| `https://eth-mainnet.g.alchemy.com/v2/demo` | `eth_chainId` | HTTP 429 |

Preferred source: `https://ethereum-rpc.publicnode.com`.

## Pinned fork sources (pre-test probe)

Pin is finalized by the test at runtime (latest−8) and recorded in the vitest output.

Pre-test liveness sample (not the execute pin):

| Chain | RPC | Block | Hash | Routers with code |
| --- | --- | --- | --- | --- |
| BSC 56 | `https://bsc-dataseed.binance.org` | `0x751d001` (122802177) | `0x9bd8cdeea997dda5339d6d07c90550d61508386e2d1b2d655daf398a9dd85f2c` | Melega `0xc250…EAB3` 17845 B; Pancake `0x10ED…024E` 21936 B |
| ETH 1 | `https://ethereum-rpc.publicnode.com` | `0x18ce85e` (26011742) | `0x18ced0119d705c855cf27affcea3da975281e780a70287a6ee64e9f9eb66b197` | Uniswap `0x7a25…488D` 21943 B |

Factories, WBNB/WETH, USDC, and the WBNB/USDC + WETH/USDC pairs also returned non-empty code. No `anvil_setCode` on those addresses.

## Pairs (factual NET `getAmountsOut`)

GROSS BSC `50000000000000000` (0.05 BNB), fee 20 bps → NET `49900000000000000`.  
GROSS ETH `20000000000000000` (0.02 ETH), fee 15 bps → NET `19970000000000000`.

| Venue | Pair | Factory getPair | NET quote out |
| --- | --- | --- | --- |
| Melega V2 | WBNB/USDC | `0x7165b14cf9d03061b67e3237078e5f5a03fe01a9` | `2487242764277502268` |
| Pancake V2 | WBNB/USDC | `0xd99c7f6c65857ac913a8f880a4cb84032ab2fc5b` | `38391037249639135802` |
| Uniswap V2 | WETH/USDC | `0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc` | `52588655` (6 decimals) |

Both BSC venues have a real WBNB/USDC route. Competition uses the same request; Pancake is expected to win on output without forcing.

## Isolation rules applied

- Anvil listen `127.0.0.1:18557` (BSC) and `127.0.0.1:18558` (ETH)
- Fund Anvil test accounts only; wrapped native via real `deposit()`
- No `anvil_setCode` on router / factory / pool / token / wrapped native
- No reserve storage edits
- No Founder keys, signatures, public broadcast, or production `setRouter`
- Native-in fee is WBNB (BSC) / WETH (ETH)
- Net-to-router proven from pair `balanceOf` + Transfer logs — not mock `lastAmountIn()`

## Execute outcomes

Filled after `yarn test src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts`.

| Proof | Result | Fee / net / userOut | Calldata keccak |
| --- | --- | --- | --- |
| Melega native-in | PENDING | | |
| Melega ERC20-in | PENDING | | |
| Pancake native-in | PENDING | | |
| Pancake ERC20-in | PENDING | | |
| BSC competition (same request) | PENDING | winner TBD (not forced) | |
| Uniswap native-in | PENDING | | |
| Uniswap ERC20-in | PENDING | | |
| Replay / expired / slippage | PENDING | no fee; unused nonce on expired/slippage | |

**No global PASS** unless every venue row above is verified.

## Commands

```bash
FOUNDRY_PROFILE=smartswap_executor_release forge build   # if release artifact missing
cd apps/web
yarn test src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts
git diff --check
```

## Limits

- Ordinary-token WBNB/USDC and WETH/USDC only. Does **not** certify FOT tokens.
- Output is measured from user token balance, not only the router return value.
- Local fork execute ≠ public V2 activation. CTA still legacy. `LEGACY_PRODUCTION` / `SHADOW` / `cutover=false` unchanged.

## #83 FORK_EVIDENCE (superseded for this PR)

#83 recorded FORK_EVIDENCE as MISSING/BLOCKED because there was no real-router harness and env RPCs were unset, with Ankr ETH `Unauthorized` and BSC dataseed used only for `eth_blockNumber` liveness. This PR adds the harness and uses working documented public endpoints as the fork source. The #83 branch is not updated.
