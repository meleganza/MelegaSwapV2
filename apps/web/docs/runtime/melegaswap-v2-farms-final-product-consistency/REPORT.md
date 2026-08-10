# MELEGASWAP_V2_FARMS_FINAL_PRODUCT_CONSISTENCY

## Baseline

- Integrated tip: `mission-release-lineage-integration` @ `37996bbc`
- Mission branch: `mission-farms-final-product-consistency`

## What shipped

Farms-only final product consistency (mirrors Pools final pattern):

| Area | Change |
|------|--------|
| My Farms preview | Up to **4** cards; 4-col ≥1280, 2×2 ≤1279, 1-col mobile; hidden when empty/disconnected |
| View all | Exact **View all my farms** → inline expand; **Show less**; Cards \| List |
| My Farms List | Full headers + logos + Multiplier; Harvest / Stake More / Withdraw → ActionHost |
| Explore toolbar | Compact Search + Filters ▾ + Cards\|List |
| Explore cards/list | Manage removed; Stake / View Farm / View LP; multiplier metric slot; sparkline reserved |
| Data honesty | Participants always `—`; Duration `Ongoing` when live+multiplier; Volume/Fees uncertified `—` |
| Create Farm | First-open stability; pair selector portal (`melegaZIndex.overlayStacked`); improved indexing |

## Forbidden

Untouched: MasterChef/MasterBuilder contracts, Farm contracts, AMM, Router, Smart Swap, Treasury, fees formulas, wallet signing architecture, Global Data Truth formulas, Project Page V7, Pools, Liquidity, Home Top Farms sources.

## Verdict

`MELEGASWAP_V2_FARMS_FINAL_PRODUCT_CONSISTENCY_COMPLETE`
