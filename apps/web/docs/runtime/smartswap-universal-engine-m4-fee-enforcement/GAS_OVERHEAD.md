# GAS_OVERHEAD

Executor overhead is **excluded** from M2 fee-band selection. It may enter `TOTAL_EXECUTION_COST` later.

| Venue | Domain | Kind | Direct gas | Fee-enforced gas | Overhead |
|-------|--------|------|------------|------------------|----------|
| PancakeSwap | BSC mock | LOCAL_SIMULATION | not isolated vs mainnet router | Foundry `testExactInFee20BpsAndAtomicVenueRevert` ~340k gas (includes revert probe) | INSUFFICIENT for mainnet % |
| Melega | BSC mock | LOCAL_SIMULATION | same executor path | same | INSUFFICIENT |
| Uniswap | Ethereum | FORK_UNAVAILABLE | — | — | UNAVAILABLE |

No mainnet `estimateGas` comparison was treated as factual savings. Do not use these units to pick 25/20/15/10/5 bps.
