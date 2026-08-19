# POTENTIAL_REVENUE_ANALYSIS

This is **POTENTIAL_PROTOCOL_REVENUE** only. It is not earned, collected, or realized. Protocol fee enforcement is not active (`SMARTSWAP_PROTOCOL_FEE_ENFORCEMENT_GAP`). V2 cannot collect a fee in M3.

## Factual (PancakeSwap BSC, 20 bps band on 25 bps LP)

| pair | gross output raw | fee bps | POTENTIAL_PROTOCOL_REVENUE raw | note |
|------|------------------|---------|--------------------------------|------|
| WBNB→USDC 0.01 | 6251779553612704946 | 20 | 12503559107225409 | ~0.0125 USDC on this notional |
| WBNB→USDT 0.01 | 6263924129396514873 | 20 | 12527848258793029 | ~0.0125 USDT on this notional |

n = 2. No Uniswap factual sample. No Melega simultaneous sample.

## Band distribution (factual)

| band | share |
|------|-------|
| 25 bps | INSUFFICIENT_SAMPLE |
| 20 bps | 2/2 of Pancake factual quotes only — **INSUFFICIENT_SAMPLE** for a venue mix |
| 15 bps | INSUFFICIENT_SAMPLE |
| 10 bps | INSUFFICIENT_SAMPLE |
| 5 bps | INSUFFICIENT_SAMPLE |

## Shadow win rates (factual)

| metric | value |
|--------|-------|
| Melega shadow win rate | INSUFFICIENT_SAMPLE |
| Pancake shadow win rate | INSUFFICIENT_SAMPLE (no head-to-head vs Melega/Uniswap) |
| Uniswap shadow win rate | UNAVAILABLE |
| NO_ROUTE rate | INSUFFICIENT_SAMPLE |
| timeout rate | INSUFFICIENT_SAMPLE |

## Synthetic

Test fixtures apply the same bands. They must not be summed into potential revenue.
