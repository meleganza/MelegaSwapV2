# BNB_FORK_RECERTIFICATION

Fork only. No mainnet broadcast.

Artifact-deployed canary (`testForkCanaryFromDeterministicArtifact`):

| | |
|--|--|
| Chain | 56 |
| Runtime vs template | equal after zeroing immutable address words |
| Treasury | `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` |
| Router allowlist | Pancake V2 `0x10ED43…024E` / `keccak256("pancakeswap")` |
| Route | WBNB → USDT, 0.01 WBNB |
| Structural cost used | 25 bps (Pancake V2 LP) |
| Derived SmartSwap fee | `authorizedFeeBps(25) == 20` |
| Fee to Treasury | `20000000000000` WBNB exact |
| Venue input | `9980000000000000` |
| User output | `6463583388417442046` USDT (`>= minOut`) |
| Executor WBNB/USDT/BNB after | 0 / 0 / 0 |
| FEE_VERIFIED | 0 (still `FEE_ENFORCEABLE`) |

Fee bypass and replay still revert on the artifact-deployed instance.

Original source-compiled fork canary also passed (`userOutput 6464024913536923332`, same fee/venue input). Quote drift between the two fork runs is expected; both satisfied `>= minOut` at their own seal-time quote.
