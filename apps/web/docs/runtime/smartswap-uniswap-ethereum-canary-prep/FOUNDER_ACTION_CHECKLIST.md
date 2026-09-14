# Founder action checklist — Uniswap Ethereum canary

Status: **founder action ready**. No signing. No broadcast. No approval. No deploy. No canary execute.

Verdict: `UNISWAP_ETHEREUM_CANARY_FOUNDER_ACTION_READY`

Remaining architecture/founder input:

**`FOUNDER_ETHEREUM_DEPLOYER_SELECTION_REQUIRED`**

No repository/config value defines a canonical Ethereum deployer. Reconnaissance of `0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0` on Ethereum is **not** authorization to use the BSC M6 deployer on chain 1.

## Architect-certified canary (no longer a missing decision)

| Field | Value |
| --- | --- |
| Chain | Ethereum mainnet `1` |
| Venue | Uniswap V2 `0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D` |
| Pair | WETH `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2` → USDC `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` |
| Input | exactly `2000000000000000` wei (0.002 WETH) |
| Structural venue cost | 30 bps (factual Uniswap V2) |
| SmartSwap fee | 15 bps via `SMARTSWAP_REVENUE_POLICY_V1` → fee `3000000000000` wei |
| Venue input | `1997000000000000` wei |
| Exact-in | yes |
| Count | exactly one canary |
| Retry | none |
| Production activation | none |

Do not use the SHADOW quote example of 1 WETH as the canary size.

## Already prepared (non-irreversible)

- Certified `SmartSwapExecutorV1` source is reusable on Ethereum without source changes.
- Creation bytecode keccak `0xaa68423fc2a7e4fb80b54516bed42dccda8978ff4a5dd1d24180c5add2ad0791` reproduced byte-for-byte via pinned solc `0.8.20+commit.a1b79de6`.
- Deployed template keccak `0x22b936d04dda69aa1fc31e031793ce922a18013fa9c2f0587043a627e75da0e1`.
- Constructor frozen fields: Treasury `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b`, WETH `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`.
- Router allowlist target: Uniswap V2 `0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D`.
- Fee band is derived: Uniswap V2 structural 30 bps → SmartSwap 15 bps via `SMARTSWAP_REVENUE_POLICY_V1`.
- Fork simulation of the certified 0.002 WETH→USDC path is prepared against the stored artifact. Fresh `getAmountsOut` / min-out methodology: refresh at sign; live haircut uses existing 50 bps `computeMinimumReceived`; fork uses exact same-block quote.
- Production remains `LEGACY_PRODUCTION` / `SHADOW` / `cutover=false`.

## Candidate Founder EOA reconnaissance (Ethereum only, not authorization)

Address `0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0` at snapshot block `25974201`:

| Field | Value |
| --- | --- |
| ETH | `4204826624717374` wei (`0.004204826624717374` ETH) |
| WETH | `0` |
| nonce | `39` |

This wallet does **not** currently hold the 0.002 WETH canary input. If later selected as Ethereum deployer, Founder must fund ETH for CREATE + `setRouter` gas plus 0.002 WETH (or ETH to wrap) and canary execution gas. Do not ask for or transmit private keys.

## Minimum Founder actions (only remaining irreversible path)

1. **Select** the canonical Ethereum deployer in writing. Do not assume the BSC M6 deployer/nonce.
2. **Fund** that deployer on Ethereum for CREATE + `setRouter` + wrap/approve/canary gas, and place exactly 0.002 WETH (or ETH to wrap) in the canary user wallet.
3. Rebuild the nonce-bound unsigned CREATE from the selected deployer + live nonce. If nonce drifts, STOP. No auto-retry.
4. Sign/broadcast CREATE only after artifact keccak matches `0xaa68423fc2a7e4fb80b54516bed42dccda8978ff4a5dd1d24180c5add2ad0791`.
5. Rebuild nonce-bound unsigned `setRouter(Uniswap V2, keccak256("uniswap"), true)`. Sign/broadcast only after CREATE is mined at the predicted address.
6. Refresh `getAmountsOut(1997000000000000, [WETH, USDC])` immediately before sign. Bind `minUserOut` via `computeMinimumReceived(quotedOut, 50)`. Seal exact-in intent from policy. No fee override. Treasury unchanged.
7. Founder-authorized one-shot canary execute only. No retry. No global activation.

Nothing in this checklist requests a private key. Founder signs in their own wallet.
