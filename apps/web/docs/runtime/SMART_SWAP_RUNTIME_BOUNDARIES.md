# Smart Swap — Runtime Boundaries

Architecture 000 lock. No implementation in this document.

## Layer ownership

| Layer | Owner | May | Must never |
| --- | --- | --- | --- |
| **UI surfaces** | Instant Swap (Home) / Smart Swap (Trade `/swap`) | Present quotes, fees, impact, CTAs | Invent routes or balances |
| **Routing intelligence** | Smart Swap runtime (`lib/routing-layer`, `useBestTrade`, package `@pancakeswap/smart-router/evm`) | Discover / package route decisions | Call settlement APIs or mutate fees |
| **KERL routing (KRMP 97)** | KERL constitutional runtime | Own route discovery when enforced | Be bypassed by DEX discovery on chain 97 |
| **Execution** | Execution layer + wallet (`lib/execution-layer`, `useSwapCallback`) | Submit wallet-signed Router/Wrapper calls | Re-route or settle |
| **Adapter / policy** | `lib/melega-smart-router` | Resolve D87 fee metadata, registries, civilization route matrix | Execute FSC-01 splits |
| **Settlement** | Treasury Runtime (external) | Normalize settlement, FSC-01 waterfall | Be replaced by DEX-local truth |
| **Token identity** | Canonical Token Registry | Address / symbol / decimals / logo | Product-local token copies |
| **Liquidity truth** | On-chain pair reserves + DEX indexer | Supply factual reserves / inventory | Fabricate pools |

## Instant vs Smart ownership

| Surface | Route / mount | Runtime engine | Notes |
| --- | --- | --- | --- |
| Instant Swap | `/?focus=swap` via Home `HomeSwapPanel` | `SmartSwapForm` | Compact UX; same engine |
| Smart Swap (terminal) | `/swap` → `TradeTerminalScreen` / `TradeCockpit` | `SmartSwapForm` | Full explanation + router comparison |
| Trade alias | `/trade` → redirect `/?focus=swap` | Instant surface | Documented redirect — not a second engine |
| Project swap | Project page `ProjectSwapCard` | `SmartSwapForm` | Same engine |

## Routing authority by chain

| Chain | Routing owner | Execution call |
| --- | --- | --- |
| BSC mainnet (56) | DEX Smart Swap runtime (`useBestTrade`) | Wallet → Smart Router `0xC666…` (ADAPTER) |
| KRMP testnet (97) | KERL (`isKerlRoutingAuthorityEnforced`) | Wallet → Wrapper path (constitutional) |
| Other | Existing chain config / unsupported UX | Must not invent liquidity |

## Supported route classes (documented)

| Class | Status |
| --- | --- |
| Direct V2 | Supported via smart-router pair graph |
| Multi-hop | Supported when reserves allow |
| Stable routes | Via stable-swap derived info hooks where configured |
| Native / WNATIVE | Via standard bases |
| Exact-output | **Unsupported** on D87 adapter path |
| Fee-on-transfer | **Unsupported** on D87 adapter path |
| Referral local routes | **Blocked** until Referral Runtime |
| Narrative / AI service routes | **Blocked** in civilization matrix until wrappers exist |

## Failure / protection boundaries

| Concern | Authority |
| --- | --- |
| Slippage protection | User settings + Router min-out calldata |
| Price impact | Computed from trade math (`computeTradePriceBreakdown`) — display, not fabrication |
| Gas estimation | Wallet / provider estimation at send time |
| Execution simulation | Optional tooling / testnet probes — not a second market |
| Missing registry (MARCO / collector / router) | Adapter blocks plan |

## Phase boundary

| Phase | Meaning |
| --- | --- |
| `ADAPTER` (current) | Metadata + handoff prepared; wallet still calls underlying Smart Router |
| `WRAPPER` (target) | On-chain fee pull → treasury collector → net to underlying router |

Modules must not silently advance phase without a dedicated mission.

## Integration APIs (DEX side)

| Path | Role |
| --- | --- |
| `/api/treasury/settlement-events` | Proxy handoff of execution receipts |
| `treasuryHandoffUpdater` | Post-confirm receipt submission |
| `FORBIDDEN_HANDOFF_PAYLOAD_FIELDS` | Prevents DEX settlement ownership |

## Security invariants

1. No custody  
2. No private keys in app runtime  
3. No execution outside wallet + contracts  
4. No human-controlled route injection as “truth”  
5. No hidden fee modification by UI modules  
6. No opaque route replacement without user-visible preview (future Module 003)  
