# FIRST_CANARY_VENUE_DECISION

Selected: **PancakeSwap V2 on BNB Smart Chain**  
Rejected for first canary: **Melega DEX**

Not a branding choice.

## Comparison

| criterion | PancakeSwap V2 BSC | Melega DEX V2 BSC |
|-----------|--------------------|-------------------|
| Router | Official `0x10ED43C718714eb63d5aA57B78B54704E256024E` (M3 factual quotes) | Production `0xc25033218D181b27D4a2944Fbb04FC055da4EAB3` |
| Quote evidence | M3 `eth_call` `getAmountsOut` succeeded | M3/M4 Melega quotes for 0.01 WBNB were materially worse (USDC ~1.75 vs Pancake ~6.37; USDT ~0.78 vs Pancake ~6.39) |
| Liquidity | Deep WBNB-USDT V2 pool | Thinner on the same notional |
| Failure isolation | Isolated from production Melega router | Same router production SmartSwap uses today |
| Approval | Standard ERC-20 to executor, then executor to Pancake for net only | Same model, but a revert would sit on the live Melega path |
| Receipt / simulation | Standard V2 `swapExactTokensForTokens` | Same interface, higher operational coupling |

## Decision

First fee-enforced canary uses **Pancake V2** so a failed or paused canary cannot stall the live Melega router, and so the route has certified depth plus M3 factual quote proof.

Melega remains an eligible future execution target. It is not the first canary.
