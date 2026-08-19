# VENUE_ADAPTER_SPEC

Canonical interface: `SmartSwapVenueAdapter`.

Every future venue must conform. Unsupported capability is explicit (`false`), never implied.

## Identity

- `venueId`, `label`
- `executionDomain` (`EVM` | `SOLANA`)
- `networks[]`

## Capabilities (machine-readable)

`QUOTE` `EXACT_IN` `EXACT_OUT` `EXECUTE` `SIMULATE` `SPLIT_ROUTE` `EVM` `SOLANA` `CROSS_CHAIN`

M1 Melega DEX: `QUOTE`, `EXACT_IN`, `EXACT_OUT`, `EVM`.  
`EXECUTE` = false. `SOLANA` = false. `CROSS_CHAIN` = false.

## Methods

| Method | Required if |
|--------|-------------|
| `quote` | `QUOTE` |
| `estimateGas` | optional |
| `simulate` | `SIMULATE` |
| `prepareExecution` | `EXECUTE` (M1: always refuse) |
| `execute` | `EXECUTE` (M1: always refuse) |
| `verifyReceipt` | optional; must not claim fee collected without proof |
| `health` | always |

## Quote output

`NormalizedQuote` — venue-independent. Missing fields stay `null`. Do not invent.

## Health

`HEALTHY` | `DEGRADED` | `UNAVAILABLE` | `DISABLED`

Disabled ≠ crashed. External M1 venues are `DISABLED`.

## Isolation

Per-adapter timeout + abort signal. Circuit breaker after repeated failures. One adapter timeout must not freeze the cycle.
