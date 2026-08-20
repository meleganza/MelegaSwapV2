# FINAL_REPORT

MELEGASWAP_V2_SMARTSWAP_M6_BLOCKED_PREFLIGHT_DRIFT

Founder authorization was present for one limited BNB canary. Preflight failed. **No mainnet mutation.**

| field | value |
|-------|--------|
| Branch | `mission-smartswap-universal-engine-m6-bnb-mainnet-canary` |
| Baseline | `83e019b7670be87725c106f05f19baee156936f9` |
| Executor address | not deployed |
| Deployment transaction | none |
| Approval transaction | none |
| Canary transaction | none |
| Fresh structural route cost | 25 bps |
| Selected SmartSwap fee bps | 20 (policy; not broadcast) |
| Expected protocol fee | `20000000000000` WBNB (not collected) |
| Actual Treasury delta | n/a (no tx) |
| User output | n/a |
| Minimum received | n/a |
| Gas used | n/a |
| Atomicity | n/a |
| Trapped balances | n/a |
| Fee state before | `FEE_ENFORCEABLE` |
| Fee state after | `FEE_ENFORCEABLE` (not `FEE_VERIFIED`) |
| Legacy production state | `LEGACY_PRODUCTION` |
| UX_DIFF | ZERO |
| Evidence path | `apps/web/docs/runtime/smartswap-universal-engine-m6-bnb-mainnet-canary/` |

Primary stop: local compile bytecode keccak ≠ M5-certified hashes, with `SmartSwapExecutorV1.sol` unchanged. Independent stops: no unlockable deployer key; known deployer WBNB = 0.

HARD STOP. No second attempt, no bytecode repair, no amount increase.
