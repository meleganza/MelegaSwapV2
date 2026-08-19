# QUOTE_NORMALIZATION

One canonical adapter contract: `SmartSwapVenueAdapter` (M1). Pancake and Uniswap use `createExternalEvmVenueAdapter`. Melega uses the M1 mapper.

## Fields

| Field | Melega | PancakeSwap V2 | Uniswap V2 |
|-------|--------|----------------|------------|
| venue identity | `melega-dex` | `pancakeswap` | `uniswap` |
| execution domain | EVM | EVM | EVM |
| chain | snapshot chainId | certified router chain only | certified router chain only |
| input / output asset | canonical identity | canonical identity | canonical identity |
| input amount | snapshot | request | request |
| gross / quoted output | legacy expected output | `getAmountsOut` last amount | `getAmountsOut` last amount |
| structural venue fee | 25 bps LP | 25 bps LP | 30 bps LP |
| venue fee semantics | **embedded in quoted output** | **embedded in quoted output** | **embedded in quoted output** |
| explicit venueFeeRaw | null (not double-counted) | null | null |
| gas estimate | snapshot gasUnits if present | null unless source supplies | null unless source supplies |
| price impact | snapshot if present | null unless source supplies | null unless source supplies |
| minimum received | slippage on gross | slippage on gross | slippage on gross |
| route hops | path from snapshot | single-venue hop | single-venue hop |
| quote timestamp | snapshot freshness | observation `quotedAt` | observation `quotedAt` |
| expiry / staleness | `LatencyBudget.staleQuoteMs` | same | same |
| health | M1 + scoped M3 tracker | scoped by venue:chain:QUOTE | scoped by venue:chain:QUOTE |
| confidence | 70 | 50 SYNTHETIC / 70 FACTUAL | 50 SYNTHETIC / 70 FACTUAL |
| fee enforcement | FEE_PREVIEW_ONLY | FEE_PREVIEW_ONLY | FEE_PREVIEW_ONLY |
| productionExecutionCapable | false | false | false |

## SmartSwap shadow fee

`SMARTSWAP_REVENUE_POLICY_V1` applied to structural LP bps. Gas excluded from band selection.

- Melega / Pancake 25 bps structural → **20 bps** SmartSwap shadow fee
- Uniswap V2 30 bps structural → **15 bps** SmartSwap shadow fee

Net user output = gross − SmartSwap fee amount. Embedded LP is **not** subtracted again.

## Price impact

If a venue cannot supply a definition that is comparable, the field stays `null`. M3 does not fabricate impact.

## Gas

Same-chain comparison requires gas cost already expressed in output units. Raw gas units alone are `GAS_UNCOMPARABLE_NO_OUTPUT_CONVERSION`. No cross-chain gas comparison.

## Split / cross-chain

One candidate = one venue route. Mixed hops throw `SPLIT_ROUTE_FORBIDDEN`. Different input/output chain IDs throw `CROSS_CHAIN_FORBIDDEN`.
