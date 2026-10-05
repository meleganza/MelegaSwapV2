# Global TVL reconciliation

Mission: `MELEGA-DEX-P0-GLOBAL-TVL-RECONCILIATION`

Baseline: `e5925b6b3983d279f3116e2e5f2dfb561ce7a271`

## Previous $33.1K source and root cause

The previous top-line value came from `useProtocolDataSWR()` and the legacy protocol overview's chain-local `liquidityUSD`. `buildLiquidityMarketSnapshot` preferred that aggregate over factory reserves. Its fallback and Explore discovery were BSC-only, and Explore enriched only `pairAddresses.slice(0, 80)`. The external overview exposes an aggregate, not its contributing pair membership, so the exact contributing pair count is not auditable from that response. This opacity is itself why it cannot be the canonical global source.

The first divergence was therefore the data-source selection, before rendering or pagination: the KPI read a legacy chain-specific aggregate while Explore read a capped BSC factory subset. Pricing failures were also not disclosed as unpriced pool liquidity.

## Canonical definition and architecture

Global DEX liquidity is the decimal-safe sum of whole-pool reserve TVL for every unique `chainId + normalizedPairAddress` returned by every current public Melega trading factory. Raw reserves remain integer strings/BigNumbers; JavaScript `Number` is not used for reserve arithmetic.

The new flow is:

`public trading-chain registry → complete factory census → batched metadata/reserves → bounded factual pricing → canonical cached snapshot → global KPI + Explore search/sort/pagination`

The public trading selector defines BSC, Base, Polygon, and Ethereum. Arbitrum and Avalanche remain available to other internal liquidity-position surfaces but are not in the approved public trading switcher and are therefore not included in this public DEX TVL. Bridge-only chains are not inferred to be DEX chains.

The server endpoint is `/api/indexer/global-liquidity`. It caches a complete snapshot for 120 seconds, publishes `sourceTimestamp`, and supports an explicit read-only force refresh. A partial chain failure marks the snapshot `partial`; the KPI deliberately displays unavailable rather than labelling the surviving subtotal “TOTAL LIQUIDITY”.

## Read-only factory and pair census

All values below came from read-only JSON-RPC calls. No approval, signature, or transaction was made.

| Chain | Factory | Factory pairs | Read | With liquidity | Priced | Unpriced | Zero | Failed | Priced subtotal USD |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| BSC | `0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C` | 517 | 517 | 506 | 333 | 184 | 11 | 0 | 82,788.50300011978042333450918135887834349196 |
| Base | `0x78fA7Fa39CF6544DD9768A75d8Ad8C45854aE530` | 46 | 46 | 45 | 28 | 18 | 1 | 0 | 151.0120072163266946560069078295307065432 |
| Polygon | `0x2541DBEa199a22501D75EA141627776Bd4EefC80` | 50 | 50 | 50 | 29 | 21 | 0 | 0 | 1,532.79582966489520401390258563384621838095 |
| Ethereum | `0x149EE9245E5eD52a89Ea777d19AD3A5D87873680` | 6 | 6 | 6 | 6 | 0 | 0 | 0 | 74.4088702487339493302164803344817937235 |

Global unique pairs: **619**. Priced pairs: **396**. Pools with non-zero liquidity but no defensible USD path: **223**. Global priced TVL: **$84,546.71970724973627133463515515673706213961**.

Pricing is deliberately bounded: stablecoin anchors are $1; wrapped-native USD derives from the deepest stable/native Melega pair; a pool with a priced stable or wrapped-native side can be valued from that reserve. Arbitrary token-to-token paths are not promoted into an oracle. Unknown values remain `UNPRICED`, never known `$0`; factual zero-reserve pools remain reachable and contribute `$0`.

## Screenshot-pair reconciliation

| Pair | Chain | Current whole-pool TVL USD |
|---|---|---:|
| USDT / MGC | BSC | 28,529.702679891773101206 |
| USDT / MARCO | BSC | 4,059.604120662252137276 |
| USDC / MARCO | BSC | 293.899633715486996066 |
| USDC / MARCO | Ethereum | 0.115246 |
| USDC / MARCO | Polygon | 0.007698 |
| USDC / MARCO | Base | 0.000002 |
| CUBY / BUSD | BSC | 86.206409759885182162 |
| SUSU / BUSD | BSC | 17.820384927591122874 |

The global first page now starts with WBNB/MGC (~$32.4K), USDT/MGC (~$28.5K), USDT/MARCO (~$4.1K), MARCO/WBNB (~$3.7K), and WBNB/BEFX (~$2.0K). Polygon's WPOL/KONG (~$1.4K) appears in global order ahead of lower-TVL BSC pools, proving the list is not chain-local or factory-index ordered.

## Explore reachability, search, and ordering

KPI and Explore consume the same 619-pair snapshot. Sorting is known TVL descending, followed by unknown TVL, with pair label, chain ID, and pair address as deterministic fallbacks. Search runs over the full snapshot before filtering/sorting/pagination and covers symbols, names when available, token addresses, pair address, and pair label. Pagination occurs last. Browser acceptance confirmed `CUBY` returns CUBY/WBNB, CUBY/BUSD ($86.21), CUBY/USDT, and CUBY/MARCO from beyond a ten-card page.

## Farm reconciliation and double-count proof

The Farms page's roughly `$147.8K` is not an additional DEX-liquidity source. `useFarmsStakingRuntime.enrichFarmsWithApr` assigns `farm.liquidity` from configured LP total-in-quote-token times quote price, representing the underlying whole pool for each farm configuration. `buildFarmsOverviewKpis` then sums that per-farm field, so duplicated LP configurations and legacy pricing can inflate the Farms display metric.

Read-only MasterChef LP balances reconciled against LP total supplies and the canonical pool TVLs produce **$14,923.196984** of priced farm-held LP value across 104 priced holdings. Every dollar is a share of reserves already included in global pool TVL. Examples include USDT/MARCO (99.031626% of LP, ~$4,020.29) and MARCO/WBNB (99.406524%, ~$3,678.58). It is not added again.

The deterministic fixture asserts a $100K pool with two farm holdings totalling 40% has $40K farm-held LP value while global DEX liquidity remains $100K, not $140K.

## Verification

- Aggregation/order/farm tests: 5/5 focused global-liquidity tests pass; 14/14 with the bounded liquidity-position consumer suite.
- Permanent full-funnel gate: `yarn test:certification` — 29 files, 271 tests, PASS.
- Active-production classifier: 2,254 reachable files; 0 active production diagnostics.
- Repository-wide diagnostics: 438 baseline legacy diagnostics (212 category C tests/historical; 226 category D tooling/dead/non-runtime).
- Production build: PASS. The repository's pre-existing ESLint config lookup warning is non-fatal; Next compilation, page generation, and build completed successfully.
- Browser, production build: 1440×900 and 390×844 PASS. KPI showed `$84.5K` and 4 chains; global TVL order, cross-chain identity, search, progressive pagination, and responsive layout were verified. A pre-existing React hydration recovery message remains observable in the page shell, but it does not prevent truthful rendering and was not introduced by the global snapshot code.
- `git diff --check`: PASS.

## Remaining limitations

The KPI is intentionally “priced TVL”, accompanied by the unpriced-pool count in source/supporting data; it does not invent values for 223 pools lacking a bounded canonical USD path. The exact historic pair membership behind the opaque legacy `$33.1K` aggregate cannot be recovered from that aggregate response. Public-chain policy remains unchanged; adding Arbitrum/Avalanche to the trading switcher is a separate product decision.
