# P0 Ethereum MARCO/WETH removal after PR #85

Base main and merge #85: `c7ddc191cd34f08567f01970b7244625a60ba1f2`.
Branch: `fix/eth-marco-remove-root-cause`. Draft / architect review only.

## Confirmed cause

The wallet had already approved the correct LP and router. Three public Approval events for the supplied wallet have receipts with status 1 (see `public-approval-events.json`), including:
[0x17f517f9b42ecddcc7ac2bad299b1515a2f6c79ed5111064e3e406572d999745](https://etherscan.io/tx/0x17f517f9b42ecddcc7ac2bad299b1515a2f6c79ed5111064e3e406572d999745).
At block 26013025 the LP balance is `150000499999999999` and allowance is `2^256 - 1`.

The deployed /liquidity bundle (build `Wj_hgRlJy0fqwbYvZ9etS`) contains the #85 direct polling option, but its Ethereum provider is still `https://rpc.ankr.com/eth`. A real `eth_chainId` request to that endpoint returns JSON-RPC -32000, "Unauthorized: You must authenticate your request with an API key". The custom chain's network is `ethereum`; the NodeReal override switches only on `homestead`, so it does not override this chain's endpoint. Public asset URLs, hashes and excerpts are in `live-verification.json`.

`useTokenAllowance` explicitly called `useTokenContract(address, false)`: reads used the failing app RPC. Approval uses the wallet signer, with a working transport. #85 kept retrying the failing transport and swallowed each rejection. No authoritative allowance snapshot arrived. `resolveApprovalState` therefore stayed UNKNOWN initially, then PENDING while the locally recorded approval remained pending; the runtime rendered "Approving LP Token…" and disabled Remove. After the bounded pending timeout it could return to Approve rather than advancing.

This is an unavailable read transport, in addition to the cache defect fixed by #85. Repeated public approvals cannot repair it.

## Minimal production fix

Only `apps/web/src/hooks/useTokenAllowance.ts` changes runtime behavior. The existing Remove-only `preferDirect` opt-in now selects the wallet-backed contract for read-only `allowance(owner, spender)` calls, the same transport used for approve. No signature is requested for that read. A signer-chain check rejects a snapshot from a different chain. The request remains scoped to chain, LP, owner and spender. All consumers without the opt-in continue using the public read contract and existing cache precedence.

No router, pair, amount, slippage, deadline, permit path, UI or contract changes. SmartSwap, Boost, list and bridge source files are untouched. Both root and web-app `vercel.json` files disable automatic deployment for this exact review branch, following [Vercel's branch deployment configuration](https://vercel.com/docs/project-configuration/git-configuration). Main's deployment setting is unchanged.

## Transaction trace

- Wallet: `0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0`.
- Chain / wallet chain / signer chain: `1 / 1 / 1`.
- LP: `0x7f0183D7C1B0365A3580ecBdB2f0D8DB2D693c5E`.
- Router and approval spender: `0xFF8EBf8edf1C533A02d066f852788773BdCD631C`.
- Pair factory and router factory: `0x149EE9245E5eD52a89Ea777d19AD3A5D87873680`; factory.getPair resolves to that LP.
- token0 / argument A: MARCO `0x5911Dc98a9E1A4FfFD802C3A57cdA6bbd26Cdb76`.
- token1 / argument B / router WETH: `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`.
- Wrapped output: `removeLiquidity(token0, token1, liquidity, amountAMin, amountBMin, owner, deadline)`, selector `0xbaa2abde`, value 0. There is no swap path array. Approve path, no permit.
- Native output: `removeLiquidityETH(MARCO, liquidity, marcoMin, ethMin, owner, deadline)` also succeeds in eth_call against the real forked router.
- Browser MAX removal: liquidity `150000499999999999`, amountAMin `14361330321023162235`, amountBMin `1551240845808774`, slippage 50 bips. Explicit deadline and complete calldata are saved in each browser evidence JSON.
- Standalone simulation uses 50% and a deadline 1200 seconds after the fork's latest block. See `fork-evidence.json` for exact amounts, calldata, estimate and results.

## Evidence and validation

The standalone proof resets an Anvil fork to Ethereum block 26013025, verifies client and chain, and impersonates the supplied holder only locally. It first reads the original max allowance, resets allowance to zero on Anvil, requires the positive `ds-math-sub-underflow` EVM revert, then mines approve with status 1 and verifies allowance becomes max. Both wrapped and native removal eth_calls succeed. No public transaction is submitted.

Browser fixture mounts the actual Remove runtime, approval/allowance hooks, panel and confirmation modal. In `?fork=1` mode, position balances/reserves/supply, approval, allowance, router gas estimation, calldata, eth_call and submitted transactions use real contracts on local Anvil. The unavailable application reader is a deterministic reproduction of the observed Ankr rejection. Discovery, unrelated dependencies, local pending bookkeeping and display-only USD values remain fixture dependencies; this is not an attached live wallet session.

- Before: main's hook stays at Approving after the fork approval receipt has status 1 and allowance max. `browser-evidence/before-1-1440-stuck.png` and JSON.
- After: Ethereum desktop 1440×1000 and mobile 390×844 pass Approve → Approving → Review → real router payload → confirmed local removal. Receipt, raw arguments, payload and eth_call result are recorded.
- BSC desktop/mobile pass the same UI sequence using explicitly synthetic wallet/router fixtures, not a BSC fork certification.
- Hook regression before fix: **4 failed / 10 passed**. After: **14 passed**, including unavailable public RPC, wrong signer chain, delayed confirmation, timeout, account change and shared defaults.
- Focused suites: **79 passed across 7 files** (approval, reducers, Ethereum and BSC call construction, runtime math and Remove UI checks).
- Typecheck: **1114 baseline / 1114 fixed diagnostics**, identical normalized file/message multiset; zero added diagnostics. Existing repository debt remains.
- Production `next build`: completed (114/114 pages). Existing `next/babel` ESLint configuration warning remains; build skips type validation, so the separate baseline comparison above is required.
- Final review HEAD is recorded in the PR description.

## Reproduction

Use installed repository dependencies, Foundry Anvil, Playwright and Chrome. All writable RPC traffic is restricted to localhost; never substitute a public URL.

```sh
anvil --fork-url https://ethereum-rpc.publicnode.com --fork-block-number 26013025 --chain-id 1 --host 127.0.0.1 --port 18545 --silent
node acceptance/eth-remove/fork-proof.cjs
yarn vite --config acceptance/lp-approval/vite.config.ts
# Playwright must be resolvable through node_modules or NODE_PATH.
node acceptance/eth-remove/browser-proof.cjs
```

The fixture server uses port 4180 with strictPort enabled; an occupied port fails without terminating another process. Browser tests restore a local snapshot after each case. The standalone proof resets the local fork; do not run the two proofs concurrently.

For the before browser proof, temporarily restore only `useTokenAllowance.ts` from base main in an isolated checkout, run `browser-proof.cjs --before`, then restore the fix. This flag asserts that a mined local approval remains blocked.

Stop at draft. No merge, deployment or public transaction without Founder gate.
