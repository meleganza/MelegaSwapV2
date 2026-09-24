# BSC SmartSwapExecutorV2 — real mainnet canary evidence

Factual record only. **No runtime activation. No cutover. Ethereum untouched.** Production config unchanged (`enabled: false`).

## Classification

| Gate | Status |
|---|---|
| `CANARY` | `BSC_CANARY_PASS_READY_FOR_CUTOVER_REVIEW` |
| `CANARY_1` (BNB → USDC) | `PASS` |
| `CANARY_2` (USDC → BNB) | `PASS` |
| `PUBLIC_V2_EXECUTION` | `DISABLED` |
| `RUNTIME_CONFIG` | `CONFIGURED` / `enabled: false` (unchanged) |
| `CUTOVER` | `FALSE` |
| `ETHEREUM` | `UNTOUCHED` |

Both canaries were signed and submitted by the Founder's wallet (`0xB6eE…3EE0`) via a local-only harness override. Nothing in this PR enables V2 execution.

Proof method: read-only public RPC (tx, receipt, `eth_getLogs`, `eth_call`, `eth_getBalance`). No transactions sent, no keys used.

## Executor

| Field | Value |
|---|---|
| Address | [`0x7c07082839edd5797737640bba6af47992b9861e`](https://bscscan.com/address/0x7c07082839edd5797737640bba6af47992b9861e) |
| Runtime SHA256 (`eth_getCode`, re-checked post canary) | `81328ab7fcce60fedb386a41fb17adceffcf897b25530a4504a8cff5c389845a` |
| `paused` | `false` |
| Treasury | `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` |

## Canary 1 — BNB → USDC

| Field | Value |
|---|---|
| Tx | [`0x4f167d5b…79a9fe`](https://bscscan.com/tx/0x4f167d5bb5abdf7ac438e596a91ac086ed5fe5b5b7966694b8e48eb28d79a9fe) |
| Block / status | `123812480` / `1` (2026-09-24 21:24:49 CEST) |
| Outer `to` | MetaMask DelegationManager `0xdb9b1e94…7db3` (`redeemDelegations`, `0xcef6d209`), outer value `0` |
| Embedded call | target Executor, value `1000000000000000` |
| Gas | `336588` × `50000000` = `16829400000000` wei |
| Input | `1000000000000000` wei BNB |
| Fee | 20 bps = `2000000000000` wei, wrapped → WBNB → Treasury |
| Net venue input | `998000000000000` |
| Winner / router | `pancakeswap` / `0x10ED43C718714eb63d5aA57B78B54704E256024E` |
| Min out / actual out | `773061674120213652` / `776946406150968495` USDC |
| Nonce | `1790277836205` — consumed (`usedNonce = true`) |

## Canary 2 — USDC → BNB (native out)

### Approval (exact, spender = Executor)

| Field | Value |
|---|---|
| Tx | [`0x04b9f259…4213ae`](https://bscscan.com/tx/0x04b9f2591b3c1d86d8646fc784e5c0afa04ae2d7c794dfa1b16f1b7a5d4213ae) |
| Block / status | `123819642` / `1` (2026-09-24 22:18:32 CEST) |
| Call | `USDC.approve(0x7c07…861e, 388473203075484247)` — direct EOA tx (not via wrapper), **not** MaxUint |
| Gas | `53464` × `50000000` = `2673200000000` wei |

### Execute

| Field | Value |
|---|---|
| Tx | [`0xe5826b8e…f576fa`](https://bscscan.com/tx/0xe5826b8e28c58f3f52ed2b8bd5adfa521a3139e3d4569ccdfad892de6ef576fa) |
| Block / status | `123819660` / `1` (2026-09-24 22:18:40 CEST) |
| Outer `to` | MetaMask DelegationManager `0xdb9b1e94…7db3` (`redeemDelegations`, `0xcef6d209`), outer value `0` |
| Wrapper decode | mode `0x00` (single call); target Executor; value `0`; calldata `execute(...)` byte-identical to the final pre-submit plan |
| Delegation | self-delegation (delegator = delegate = Founder, ROOT authority); two wallet-side balance-change caveats; no platform/Team signer |
| Gas | `363276` × `50000000` = `18163800000000` wei |
| Input | `388473203075484247` USDC (18 dec) |
| Fee | 20 bps = `776946406150968` USDC → Treasury (direct transfer) |
| Treasury delta | `+776946406150968` USDC (same-tx `Transfer` log; treasury balance now `776946406150971` = `3` + fee) |
| Net venue input | `387696256669333279` USDC → Pancake pair `0xd99c7f6c…fc5b` |
| Quotes (pre-submit) | Melega `442813375845862` (0.00044281 BNB) · Pancake `495776198202838` (0.00049578 BNB) |
| Winner / router | `pancakeswap` / `0x10ED43C718714eb63d5aA57B78B54704E256024E` |
| Min user out | `493297317211823` wei |
| Actual user out | `495776198202838` wei BNB (router `swapExactTokensForETH` → user; WBNB `Withdrawal` + Executor event) |
| User BNB delta (block-1 → block) | `+477612398202838` = actual out − gas (exact) |
| Nonce | `1790281105994` — consumed; Canary 1 nonce `1790277836205` still consumed |

### Receipt log sequence (execute tx)

1. USDC `Transfer` Founder → Executor `388473203075484247`; `Approval` Founder → Executor remaining `0`
2. USDC `Transfer` Executor → Treasury `776946406150968`
3. USDC `Approval` Executor → Pancake router `387696256669333279`
4. USDC `Transfer` Executor → Pancake pair `387696256669333279`; router allowance → `0`
5. WBNB `Transfer` pair → router `495776198202838`; pair `Sync` + `Swap`
6. WBNB `Withdrawal` (router) `495776198202838`
7. USDC `Approval` Executor → router reset `0`
8. `SmartSwapExecuted` ×1 (Executor)
9. `RedeemedDelegation` (DelegationManager)

## Post-canary state (read at latest block)

| Check | Value |
|---|---|
| USDC allowance Founder → Executor | `0` |
| USDC allowance Executor → Pancake router | `0` |
| USDC allowance Executor → Melega router | `0` |
| Executor USDC / WBNB / BNB | `0` / `0` / `0` |
| Duplicate execution | `NONE` (1 executor event, 1 swap, 1 venue) |
| Legacy fallback | `NONE` (Founder account nonces 3287 approve, 3288 execute; no other Founder tx after) |
| Platform signature | `NONE` (Executor V2 is user-only) |
| Relayer | `NONE` beyond the MetaMask wallet delegation wrapper |

## Caveats

- Historical `eth_call` at block-1 was unavailable on public RPCs (missing trie / archive token required). Treasury delta is proven by the same-tx `Transfer` log plus the current balance.
- `debug_traceTransaction` was not available. Native delivery is proven by the `Swap`/`Withdrawal` logs, the Executor event `userOutput`, and the Founder's `eth_getBalance` delta (block 123819659 → 123819660), which equals actual out − gas exactly.
- The Melega quote is the off-chain `getAmountsOut` result from the final pre-submit plan. It cannot be re-checked on-chain after the fact.

## Explicit non-goals (this PR)

- No `v2ExecutionRuntimeConfig` edits (BSC stays `enabled: false`)
- No `operatingMode` edits
- No public V2 execution enablement / no cutover
- No Ethereum work
- No harness code or local override files

## Artifacts in this folder

- `evidence.json`: structured record of both canaries
- `README.md`: this file
