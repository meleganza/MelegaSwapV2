# My Melega Positions Drawer — Data Binding

## Adapter

`apps/web/src/lib/data-truth/myMelegaPositions.ts`

Single lightweight selector. No independent indexer.

## Sources reused

| Domain | Source | Notes |
|---|---|---|
| Liquidity | `usePortfolioRuntime` → `model.liquidity` (`PassportLiquidityPosition`, `source === 'wallet-lp'`) | Same VM as Portfolio Studio |
| Farms | `usePortfolioRuntime` → `model.farms` (`FarmsWalletPosition`) | Same as Farms My Farms / Portfolio |
| Pools | `usePortfolioRuntime` → `model.pools` (`PoolsWalletPosition`) | Same as Pools My Positions |
| Claimables | `usePortfolioRuntime` → `model.claimables` (`buildClaimables`) | Aggregate USD when parseable |
| Liquidity Builder | `useLbOwnerPrograms(address)` | Owner program inventory count |
| Chain | `model.chainId` + per-position `chainId` / `chainLabel` | Filter chips scope counts |

Hook: `components/MyMelega/useMyMelegaPositions.ts`

## Identity keys

Where relevant: `chainId` + token/pair address + wallet address (inherited from upstream VMs via `positionId` / `id`).

## Destination routes

| Count row | Route | Notes |
|---|---|---|
| Liquidity | `/liquidity-studio?view=positions` | Canonical |
| Farms | `/farms?view=my` | Canonical |
| Pools | `/pools?view=positions` | Canonical (`view=my` is not the Pools deep-link) |
| Liquidity Builder | `/liquidity-studio?view=building` | Closest existing surface — no dedicated LB positions deep-link |
| View Full Portfolio | `/portfolio` | Secondary analytics; route preserved |
| Quick Actions | add / create farm / create pool / swap | Existing product surfaces |

## Multichain honesty

Portfolio runtime hydrates primarily against the **active wallet chain**.  
Drawer filter “All Chains” shows all loaded rows; per-chain chips filter by `chainId` / `chainLabel` when present.  
Liquidity Builder count is owner-inventory scoped (active connection); not silently multi-chain aggregated.

## Missing metrics

Dash `—`. Never `"Unavailable"`.

## Progressive hydration

Drawer shell opens from context state immediately.  
Position details reuse already-mounted Portfolio / LB query state; no blocking RPC gate on open.
