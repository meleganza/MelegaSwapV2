# Smart Swap — Fee Authority Map

Architecture 000 lock. Audit of **who owns what today**. No economic changes.

## Authority matrix

| Fee / allocation | Computes | Settles / enforces | Notes |
| --- | --- | --- | --- |
| AMM LP fee (25 bps `BASE_FEE`) | Pair / trade math | On-chain pair swap | Never enters FSC-01 |
| Protocol fee rate (30 / 20 bps) | D87 ratified policy | Policy constant | Buy-MARCO → 20 bps |
| Protocol fee amount (ADAPTER) | `computeProtocolFeeAmounts` / adapter | Metadata only today | Not FSC-01 split |
| Protocol fee collection (WRAPPER target) | Wrapper contract | On-chain to treasury collector | Phase target |
| FSC-01 waterfall | Treasury Runtime | Treasury Runtime | DEX forwards gross only |
| Referral (SRD-01) | Referral / Treasury Runtime | Runtime | `localImplementation: false` on DEX |
| Buyback allocation | Treasury Runtime | Runtime | Forbidden on DEX handoff payload |
| Strategic allocation | Treasury Runtime | Runtime | Forbidden on DEX handoff payload |
| UI fee split display (`info.ts` LP/Treasury/buyback %) | Presentation constants | Display only | Not settlement authority |
| Liquidity Building fee sink | LB contracts / LB runtime | On-chain LB path | Separate from D87 swap |

## D87 swap fee policy (ratified)

Source: `apps/web/src/lib/d87-pricing/codex/ratified.ts`

| Rule | Value |
| --- | --- |
| Standard protocol fee | 30 bps |
| Buy MARCO protocol fee | 20 bps |
| Buy MARCO rule | `output_token_is_marco` |
| LP fee policy | Unaffected — LP fees never enter FSC-01 |
| DEX fee-split policy | `forward_protocol_fee_only` |

## FSC-01 splits (Treasury Runtime)

| Destination | % |
| --- | --- |
| treasury_melega | 52.5 |
| civilization_treasury | 22.5 |
| buyback_and_burn | 10 |
| referral_distribution | 10 |
| strategic_allocation | 5 |

## DEX forbidden settlement fields

From `lib/treasury-handoff/ownership.ts`:

`settlement_id`, `lp_amount`, `treasury_amount`, `buyback_amount`, `referral_amount`, `waterfall`, `amounts`, …

## Phase implications

| Phase | Protocol fee reality |
| --- | --- |
| ADAPTER (current) | Fee metadata prepared; user calls underlying Smart Router; wrapper collection not the live mainnet entrypoint |
| WRAPPER (target) | On-chain fee pull before underlying router; collector receives protocol fee |

## Receipt generation

| Artifact | Owner |
| --- | --- |
| Swap tx hash / execution receipt | Chain + DEX tx tracking |
| Treasury handoff payload | DEX (receipt-only fields) |
| Settlement ID / normalized settlement | Treasury Runtime |

## Audit conclusion

Fee **policy** is locked in D87/FSC-01 codex. Fee **waterfall settlement** is Treasury Runtime. Smart Swap / Instant Swap UIs may display fees but must not become a second economic authority.
