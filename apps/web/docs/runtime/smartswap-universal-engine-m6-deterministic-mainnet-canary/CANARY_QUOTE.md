# CANARY_QUOTE

Fresh read-only quotes at block **117294691**. **Not sealed.** Do not execute against these numbers after they age.

| | |
|--|--|
| Route | WBNB → USDT |
| Venue | PancakeSwap V2 |
| Router | `0x10ED43C718714eb63d5aA57B78B54704E256024E` |
| Structural cost | 25 bps |
| Policy | `SMARTSWAP_REVENUE_POLICY_V1` → **20 bps** (not forced; derived) |
| Input | `10000000000000000` |
| Fee | `20000000000000` |
| Venue input | `9980000000000000` |
| Gross out | `6716633193307164580` |
| Net out | `6703198952135505081` |

Seal `minUserOut` only after deploy + runtime cert + `setRouter`, using a **new** `getAmountsOut` on the venue input. Historical 20 bps remains the derived band because structural cost is still 25. If structural cost changes before seal: **STOP**.
