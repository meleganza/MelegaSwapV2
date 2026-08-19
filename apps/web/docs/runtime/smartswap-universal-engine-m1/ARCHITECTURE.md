# ARCHITECTURE

SmartSwap Universal Engine M1 — foundation only.

## Operating states

| State | M1 |
|-------|----|
| `LEGACY_PRODUCTION` | Authoritative user execution (`SmartSwapForm` → router tx) |
| `SHADOW` | V2 normalize / compare / diagnose |
| `CANARY` | Not activated |
| `PRODUCTION` | Not activated; cutover forbidden |

Code: `apps/web/src/lib/smartswap-universal-engine/operatingMode.ts`

## Conceptual flow (interfaces exist; execution not live)

```
SmartSwap Request
  → Asset Normalization
  → Capability Registry
  → Venue Discovery
  → Parallel Quote Collection (bounded)
  → Quote Normalization
  → Route Validation
  → Net Execution Comparison
  → Route Selection (shadow only)
  → Protocol Fee Validation
  → Execution Plan
  → Execution Adapter
  → Wallet          ← V2 MUST NOT reach here in M1
  → Receipt / Verification
```

## Layers

| Layer | Owns | Must not own |
|-------|------|----------------|
| Engine | identity, quote model, adapters, health, selection, fee states | UX, wallet prompts, production broadcast |
| Widget | frozen SmartSwapForm + Studio | routing policy |
| Host | wallet session, network, requested assets | quote math |

## UX freeze (constitutional)

Engine adapts to UX. UX does not adapt to engine.

No venue/DEX/chain routing controls, tabs, badges, or extra route UI.

Solana wallet UX: **interface boundary only**. Do not implement.

Freeze contract: `ux-freeze.manifest.json` + `m1Foundation.test.ts`.

## First adapter

Melega DEX maps existing legacy quote snapshots → `NormalizedQuote`.  
`EXECUTE` capability is false. `execute()` / `prepareExecution()` throw `V2_SHADOW_EXECUTION_FORBIDDEN`.

## External venues / Solana

Catalogued as disabled. No Pancake/Uniswap/Jupiter/Raydium/Orca/Robinhood integration.  
Robinhood = `FEASIBILITY_REQUIRED`.

## Code root

`apps/web/src/lib/smartswap-universal-engine/`

Not imported by `SmartSwapForm`, `TradeCockpit`, or `useSwapCallback`.
