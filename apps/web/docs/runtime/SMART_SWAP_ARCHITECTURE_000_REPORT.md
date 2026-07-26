# Smart Swap Architecture 000 — Lock Report

## Final verdict

**SMART_SWAP_ARCHITECTURE_000_CERTIFIED**

## Mission

`SMART_SWAP_ARCHITECTURE_000_LOCK`

## Scope

Architecture boundary lock only.

- No implementation
- No UI redesign
- No routing changes
- No fee / economic modifications
- No contract changes

## Certified base

| Item | Value |
| --- | --- |
| Product seal | `MELEGA_DEX_V1_GLOBAL_PRODUCT_CERTIFIED` |
| Tip | `94d4979a` |
| Production ancestor | `ff6d6179` — `MELEGA_DEX_V1_RUNTIME_RECOVERY_DEPLOYED` |
| Branch | `smart-swap-architecture-000-lock` |
| Worktree | `/Users/marcomelega/Projects/MelegaSwapV2-smart-swap-arch000` |

## Core principle

Smart Swap must never become a second DEX.

| Concern | Canonical owner |
| --- | --- |
| Swap execution | DEX contracts / Router (wallet-signed) |
| Routing intelligence | Smart Swap runtime |
| Token identity | Canonical Token Registry |
| Liquidity discovery | DEX indexed liquidity + on-chain pair reserves |
| Fees | Canonical fee engine (D87 + LP pair fee) |
| Settlement | Treasury Runtime (where applicable) |
| Economic attribution | KERL / civilization economic layer |

## Instant Swap vs Smart Swap

Both surfaces share the **same execution engine** (`SmartSwapForm`). They are product IA surfaces, not dual routers.

| | Instant Swap | Smart Swap |
| --- | --- | --- |
| Purpose | Fast direct execution | Optimized execution + explanation |
| Primary mount | Home widget (`/?focus=swap`) | Trade Terminal (`/swap`) |
| Engine | `SmartSwapForm` | `SmartSwapForm` |
| UX | Minimal explanation | Route / impact / settlement status |
| Redirect note | `/trade` → `/?focus=swap` | Full terminal remains on `/swap` |

## What Smart Swap must answer before execution

1. Why this route?
2. What pools are used?
3. What fees apply?
4. What price impact exists?
5. What is the estimated output?
6. What is the execution confidence?

Future modules (001–008) implement presentation of these answers. This mission freezes the questions and ownership only.

## Forbidden behaviors

Smart Swap must not invent liquidity, fabricate savings, guarantee best price, bypass Router rules, create independent balances, custody funds, become a wallet or market maker, create fake routes, or locally split FSC-01 waterfall amounts.

## Live architecture phase

| Field | Value |
| --- | --- |
| Current | `ADAPTER` (`MELEGA_SMART_ROUTER_ARCHITECTURE`) |
| Target | `WRAPPER` |
| Mainnet call today | User wallet → Smart Router `0xC6665d98…328B0` |
| KRMP testnet (97) | KERL owns routing; wrapper execution path |
| Protocol fee policy | D87 — 30 bps standard / 20 bps buy-MARCO |
| LP fee | On-chain pair `BASE_FEE` 25 bps — never enters FSC-01 |

## Runtime stack (current)

```
UI (Instant | Smart surface)
  → SmartSwapForm
  → useBestTrade / useDerivedSwapInfoWithStableSwap
  → routeSmartSwapQuoteFromTrade (routing-layer, domain: swap-smart)
  → useSmartSwapExecution (execution-layer)
  → useSwapCallArguments + useSwapCallback
  → wallet-signed Router call
  → treasuryHandoffUpdater (receipt only → Treasury Runtime)
```

## Security boundaries

- No custody of user funds
- No private keys in DEX runtime
- Execution authority = user wallet + on-chain Router/Wrapper only
- Routing ≠ execution ≠ settlement (layer ownership contracts)
- DEX must not send forbidden settlement fields (`settlement_id`, waterfall amounts, …)
- Exact-output and fee-on-transfer unsupported in D87 adapter path

## Deliverables

| Document | Path |
| --- | --- |
| Runtime boundaries | `SMART_SWAP_RUNTIME_BOUNDARIES.md` |
| Economic flow | `SMART_SWAP_ECONOMIC_FLOW.md` |
| Module ownership | `SMART_SWAP_MODULE_OWNERSHIP_MAP.md` |
| Data sources | `SMART_SWAP_DATA_SOURCE_MAP.md` |
| Fee authority | `SMART_SWAP_FEE_AUTHORITY_MAP.md` |
| Lock contracts | `src/lib/smart-swap-architecture/smartSwapArchitecture000Contracts.ts` |

## Tests

Architecture Vitest only — lock contracts + doc presence + ownership invariants.

## Mission commit

`PENDING_MISSION_COMMIT`

## Delivery

Push branch only. No merge. No deploy.

---

**SMART_SWAP_ARCHITECTURE_000_CERTIFIED**
