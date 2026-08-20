# SECURITY_REVIEW

Internal adversarial review. **Not a third-party audit.**

| Attack | Mitigation |
|--------|------------|
| feeBps = 0 | On-chain `FeeBypass`; TS seal refuses override |
| Underpayment (lie structural cost) | Engine ECDSA binds structural + fee; contract checks `feeBps == authorizedFeeBps(structural)` |
| Overcharge | Floor math; `feeAmount` must match formula; max 25 bps |
| Beneficiary substitution | Immutable `treasury`; intent.beneficiary must match |
| Router substitution | Allowlist + venueId match |
| Calldata / route substitution | No arbitrary call; `routeHash` over path + native flags |
| Replay | `usedNonce[user][nonce]` |
| Cross-chain replay | `intent.chainId == block.chainid` |
| Reentrancy | `nonReentrant`; nonce set before external calls |
| Approval theft | Approve router for net only, then 0 |
| Arbitrary external call | Not implemented |
| Malicious ERC20 | FOT/rebase/hooks classified `UNSUPPORTED_FOR_FEE_ENFORCED_EXECUTION` |
| Native trapping | Excess `msg.value` refunded to user; insufficient value reverts |
| Refund theft | Refund only to `intent.user` |
| Recipient manipulation | Router `to` is `intent.user` |
| Signature misuse | Digest is full intent hash; `msg.sender == intent.user` |
| Double fee | Single transfer of `feeAmount` |
| Stale quote | `deadline` |
| Front-running | User min-out on post-fee input; not a complete MEV shield |

Production adapters still `EXECUTE = false`. Compromised frontend without `intentSigner` cannot lower the fee. Compromised `intentSigner` is an operational key risk — rotation/pause via owner `pause()` / `setRouter(..., false)`.
