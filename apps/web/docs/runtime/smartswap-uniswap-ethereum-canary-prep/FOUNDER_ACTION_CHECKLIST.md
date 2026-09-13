# Founder action checklist — Uniswap Ethereum canary

Status: **blocked**. No signing. No broadcast. No approval. No deploy. No canary execute.

Verdict: `UNISWAP_ETHEREUM_CANARY_PREP_BLOCKED`

Single required decision:

**Uniswap Ethereum canary pair + maximum notional.**

Do not use the SHADOW quote example (`WETH → USDC`, `1000000000000000000`) as the canary size. That request is quote-readiness only.

## Already prepared (non-irreversible)

- Certified `SmartSwapExecutorV1` source is reusable on Ethereum without source changes.
- Creation bytecode keccak `0xaa68423fc2a7e4fb80b54516bed42dccda8978ff4a5dd1d24180c5add2ad0791`.
- Deployed template keccak `0x22b936d04dda69aa1fc31e031793ce922a18013fa9c2f0587043a627e75da0e1`.
- Constructor frozen fields: Treasury `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b`, WETH `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`.
- Router allowlist target: Uniswap V2 `0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D`.
- Fee band is derived: Uniswap V2 structural 30 bps → SmartSwap 15 bps via `SMARTSWAP_REVENUE_POLICY_V1`.
- Production remains `LEGACY_PRODUCTION` / `SHADOW` / `cutover=false`.

## Subsequent missing fact (not the verdict)

Canonical Ethereum deployer is undefined. The BSC M6 deployer `0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0` must not be assumed on chain 1. Predicted CREATE address and nonce-bound packages stay blocked until that fact exists.

## Minimum Founder actions after the pair/notional decision

1. Decide pair + maximum notional.
2. Define the canonical Ethereum deployer.
3. Rebuild the nonce-bound unsigned CREATE. If nonce drifts, STOP. No auto-retry.
4. Sign/broadcast CREATE only after artifact keccak matches the lock above.
5. Rebuild nonce-bound unsigned `setRouter(Uniswap V2, keccak256("uniswap"), true)`.
6. Seal exact-in intent from policy. No fee override. Treasury unchanged.
7. Founder-authorized canary execute only. No global activation.
