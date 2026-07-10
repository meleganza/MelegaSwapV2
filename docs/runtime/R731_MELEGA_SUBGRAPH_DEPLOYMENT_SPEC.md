# R731 — Melega BSC Subgraph Deployment Spec

**Target:** `melega.finance` mainnet (BSC chain 56)  
**Schema URI:** `subgraph://melega/bsc-v2`  
**Frontend env:** `NEXT_PUBLIC_MELEGA_SUBGRAPH_URL=<HTTPS GraphQL endpoint>`

---

## Status

| Item | Value |
| --- | --- |
| Deployed HTTP endpoint | **None found** in repo, env, or Vercel local pull |
| Legacy fallback | `https://proxy-worker.pancake-swap.workers.dev/bsc-exchange` — **404 dead** (not used after R731) |
| Frontend blocker | `BLOCKED_SUBGRAPH_NOT_DEPLOYED` until env is set |

---

## Canonical BSC contract addresses (from repo)

| Contract | Address | Source |
| --- | --- | --- |
| **V2 Factory** | `0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C` | `packages/swap-sdk/src/constants.ts` |
| **V2 Router** | `0xc25033218D181b27D4a2944Fbb04FC055da4EAB3` | `apps/web/src/config/constants/exchange.ts` |
| **Init code hash** | `0x5547397b1a1ae1e97b89728e7a77fdc2a6b167647566f81793b3b72fb8fde0f5` | `packages/swap-sdk/src/constants.ts` |
| **MARCO token** | `0x963556de0eb8138E97A85F0A86eE0acD159D210b` | `design-system/melega/constants/brand.ts` |
| **MARCO/WBNB pair** | `0x7286c16c3c05d4c17b689be7948ec4fa4e861d1e` | `public/registry/venues/marco-bnb-lp.json` |
| **MasterChef (pools)** | `0x41D5487836452d23f2c467070244E5842B412794` | `config/constants/contracts.ts` |

On-chain verification (2026-07-08): factory `allPairsLength()` = **516** pairs at BSC block ~108,845,000.

---

## Recommended indexer

Deploy via **The Graph Studio**, **Goldsky**, or **Subsquid** using PancakeSwap V2–compatible ABIs already in repo:

| ABI | Path |
| --- | --- |
| Pair | `packages/swap-sdk/src/abis/IPancakePair.json` |
| Factory | Standard Uniswap V2 `PancakeFactory` (PairCreated event) |
| ERC20 | `apps/web/src/config/abi/erc20.json` |

---

## Start block

**Verify on BscScan** before production deploy:

1. Open [Factory on BscScan](https://bscscan.com/address/0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C) → Contract Creation block.
2. Alternative: first `PairCreated` log on the factory.

**Conservative lower bound** from pool config history: **26,000,000** (oldest sousChef `startBlock` in `docs/pools-canonical-inventory.json` is ~26,223,084).

---

## Required indexed entities

Must satisfy existing frontend GraphQL queries in `apps/web/src/state/info/`:

| Entity | Fields (minimum) |
| --- | --- |
| **Swap** | `id`, `timestamp`, `transaction { id }`, `pair`, `sender`, `amount0In/Out`, `amount1In/Out`, `amountUSD` |
| **Mint** | `id`, `timestamp`, `pair`, `to`, `amount0`, `amount1`, `amountUSD` |
| **Burn** | `id`, `timestamp`, `pair`, `sender`, `amount0`, `amount1`, `amountUSD` |
| **Pair** | `id`, `token0`, `token1`, `reserve0`, `reserve1`, `reserveUSD`, `volumeUSD`, `txCount` |
| **Token** | `id`, `symbol`, `name`, `decimals`, `derivedBNB`, `tradeVolumeUSD`, `totalLiquidityUSD`, `txCount` |
| **Bundle** | `bnbPrice` (for USD conversion) |

Reference query: `apps/web/src/state/info/queries/protocol/transactions.ts` (`overviewTransactions`).

---

## Required events (V2 AMM)

| Contract | Event | Handler |
| --- | --- | --- |
| Factory | `PairCreated(token0, token1, pair, pairIndex)` | Create Pair + Token templates |
| Pair | `Swap(sender, amount0In, amount1In, amount0Out, amount1Out, to)` | Swap entity |
| Pair | `Mint(sender, amount0, amount1)` | Mint entity |
| Pair | `Burn(sender, amount0, amount1, to)` | Burn entity |
| Pair | `Sync(reserve0, reserve1)` | Update reserves, TVL, token prices |

---

## Post-deploy wiring

1. Deploy subgraph to The Graph / Goldsky / Subsquid.
2. Obtain HTTPS GraphQL URL.
3. Set in Vercel project **`melega-swap-v2-web`** (Production + Preview):
   ```
   NEXT_PUBLIC_MELEGA_SUBGRAPH_URL=https://<your-subgraph-endpoint>
   ```
4. Set locally in `apps/web/.env.local`.
5. Redeploy frontend.
6. Validate: Home Live Activity, Trade Recent Swaps, Liquidity Activity show real indexed events (not `BLOCKED_SUBGRAPH_NOT_DEPLOYED`).

---

## Validation query

```graphql
query R731SubgraphHealth {
  swaps(first: 1, orderBy: timestamp, orderDirection: desc) {
    id
    timestamp
    amountUSD
    pair { id token0 { symbol } token1 { symbol } }
  }
  mints(first: 1, orderBy: timestamp, orderDirection: desc) { id timestamp }
  burns(first: 1, orderBy: timestamp, orderDirection: desc) { id timestamp }
}
```

Pass criteria: non-empty `swaps`, `mints`, or `burns` with valid Unix `timestamp` fields.
