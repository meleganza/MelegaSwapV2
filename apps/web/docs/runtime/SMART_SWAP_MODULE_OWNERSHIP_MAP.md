# Smart Swap — Module Ownership Map

Architecture 000 lock. Modules listed below are **future**. Do not implement in this mission.

## Product surfaces (current, frozen as dual-surface IA)

| Surface | Owner files (current) | Responsibility |
| --- | --- | --- |
| Instant Swap | `views/HomeTrade/DexHomeScreen.tsx`, `HomeSwapPanel.tsx` | Compact entry; same engine |
| Smart Swap terminal | `views/Trade/TradeTerminalScreen.tsx`, `TradeCockpit.tsx` | Full trade UX |
| Shared engine | `views/Swap/SmartSwap/*` | Quote + commit + router calls |
| Routing facade | `lib/routing-layer/*` | Package route decisions (`swap-smart`) |
| Execution | `lib/execution-layer/*`, SmartSwap hooks | Wallet submission only |
| Fee / adapter policy | `lib/melega-smart-router/*`, `lib/d87-pricing/*` | D87 metadata + registries |
| Treasury handoff | `lib/treasury-handoff/*`, `treasuryHandoffUpdater.tsx` | Receipt forward only |
| KERL (testnet) | `lib/kerl-constitutional/*` | Routing authority on chain 97 |

## Future modular plan

| Module | Code | Responsibility | Depends on |
| --- | --- | --- | --- |
| 000 | Architecture Lock | This mission — boundaries, ownership, freezes | Global Product seal |
| 001 | `SMART_SWAP_MODULE_001_HERO` | Hero / brand entry for Smart Swap | 000 |
| 002 | `SMART_SWAP_MODULE_002_ROUTE_ENGINE` | Route discovery presentation + comparison UI | 000, routing runtime |
| 003 | `SMART_SWAP_MODULE_003_EXECUTION_PREVIEW` | Pre-trade answers (why route, pools, impact, output, confidence) | 002 |
| 004 | `SMART_SWAP_MODULE_004_FEE_TRANSPARENCY` | LP + protocol fee display; no local splits | 000 fee authority |
| 005 | `SMART_SWAP_MODULE_005_HISTORY` | User swap / settlement reference history | handoff refs |
| 006 | `SMART_SWAP_MODULE_006_AI_ASSISTANCE` | Assistance only — never invent routes or fees | 002–004 |
| 007 | `SMART_SWAP_MODULE_007_ANALYTICS` | Factual volume / fee analytics (no prediction) | indexer + handoff |
| 008 | `SMART_SWAP_MODULE_008_FINAL_POLISH` | Visual polish only | 001–007 |

## Cross-product ownership (must not leak)

| Action | Owner product |
| --- | --- |
| Add Liquidity | Liquidity Studio |
| Stake LP | Farms |
| Single-token stake | Pools |
| Token onboarding | List |
| Swap execution UX | Instant / Smart Swap surfaces |
| Project identity | Project Registry |
| Professional identity | SPACE |

## Non-goals for all modules

- Second DEX / second router identity  
- Custody  
- Local FSC-01 waterfall  
- Fabricated “best price guaranteed” claims  
- Changing `MELEGA_SMART_ROUTER_ARCHITECTURE` without a dedicated phase mission  
