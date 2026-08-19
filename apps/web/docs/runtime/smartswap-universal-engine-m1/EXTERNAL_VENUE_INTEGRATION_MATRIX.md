# EXTERNAL_VENUE_INTEGRATION_MATRIX

M1: **no external venue is implemented or production-enabled.**

| Venue | Domain | Chains (eventual) | Quote interface | Execution interface | Permission / API | On-chain direct? | Latency | Fee compatibility | SmartSwap protocol-fee compatibility | Wallet | Integration risk | M1 status |
|-------|--------|-------------------|-----------------|---------------------|------------------|------------------|---------|-------------------|--------------------------------------|--------|------------------|-----------|
| Melega DEX | EVM | BSC Smart Router; other EVM via V2 | Existing `useBestTrade` / smart-router | Wallet-signed router | None beyond RPC | Yes | In-process | LP 25 bps; protocol fee **not collected** | Preview only until wrapper | EVM wallet already in UX | Low (current production) | Shadow adapter only |
| PancakeSwap | EVM | BNB and forks | Smart router / pools | Router | RPC | Yes | Similar to Melega | LP + possible protocol | Must map into fee contract | EVM | Medium — venue overlap / fork heritage | `V2_EXTERNAL_VENUE_NOT_ENABLED` |
| Uniswap | EVM | ETH, L2s | Quoter V2/V3/V4 | Universal router / NFPM | RPC | Yes | Medium | LP + possible UNI fee | Unproven | EVM | High — extra UX/route types must still fit frozen viz | Disabled |
| Jupiter | Solana | Solana | HTTP + on-chain accounts | Swap instructions | API + RPC | Partial | API RTT | Venue fees | Unproven; Solana domain | **Solana wallet UX required — not in M1** | High | Disabled |
| Raydium | Solana | Solana | SDK / AMM | Swap ix | RPC | Yes | Medium | LP | Unproven | Solana wallet — not in M1 | High | Disabled |
| Orca | Solana | Solana | Whirlpool SDK | Swap ix | RPC | Yes | Medium | LP | Unproven | Solana wallet — not in M1 | High | Disabled |
| Robinhood | Unknown | Unknown | **Unknown** | **Unknown** | Likely partner API / custody | Do not assume DEX | Unknown | Unknown | Unknown | Unknown | Very high | **FEASIBILITY_REQUIRED** |

Robinhood must not be modelled as an AMM until integration capabilities are verified.

Solana venues cannot be production-enabled until a separate founder-approved wallet UX extension exists. M1 stops at the domain type.
