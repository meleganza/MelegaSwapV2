# FIRST_CANARY_PAIR

Selected: **WBNB → USDT** on PancakeSwap V2, BNB Smart Chain.  
Not the M4 planning pair WBNB→USDC. USDT is the deeper standard V2 pool.

| field | value |
|-------|--------|
| Chain | 56 |
| Venue | pancakeswap |
| Input | WBNB `0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c` decimals 18 |
| Output | USDT `0x55d398326f99059fF775485246999027B3197955` decimals 18 |
| Pair | `0x16b9a82891338f9bA80E2D6970FddA79D1eb0daE` |
| Factory | `0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73` |
| Router | `0x10ED43C718714eb63d5aA57B78B54704E256024E` |
| Route | `[WBNB, USDT]` direct V2 |
| Token class | wrapped native / standard ERC-20. Not fee-on-transfer, rebasing, or reflection. |
| Liquidity evidence | `getReserves` via `bsc.publicnode.com` during M5: WBNB `67425765726157723935393` (~67,426), USDT `43204811157586703447468079` (~43.2M) |
| Fork confirmation | `factory.getPair(WBNB, USDT) == PAIR` on BNB mainnet fork |

## Why this pair

Standard tokens, official router, deep reserves, reliable `getAmountsOut`, and small 0.01 WBNB size does not stress the pool. An ecosystem/branding token was not used.

USDT (not USDC) is the first-canary pair because the WBNB-USDT V2 pool is the high-confidence liquid route. M4’s WBNB→USDC remains a later candidate.
