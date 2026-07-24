# DEX_V1_FULL_INDEXING_SWAP_LIQUIDITY_RUNTIME_RECOVERY_REPORT

## 1. Final verdict

**DEX_V1_FULL_INDEXING_SWAP_LIQUIDITY_RUNTIME_RECOVERY_BLOCKED**

Substantial runtime smoking-gun fixes landed and are pushed, but certification remains blocked by missing live browser evidence, mainnet read proof, and end-to-end transaction construction validation.

## 2. Branch

`dex-v1-full-indexing-swap-liquidity-runtime-recovery`

## 3. Mission commit

`77f82aee`

## 4. Certified base

`dex-v1-legacy-asset-and-liquidity-recovery` @ `76556b83` (implementation `8a984bf8`)

## 5. Worktree

`/Users/marcomelega/Projects/MelegaSwapV2/MelegaSwapV2-runtime-recovery`

## 6. Founder defect summary

Home advertised ~275 indexed tokens while interactive surfaces felt disconnected; Farms showed raw wei; Pools looked empty / “Awaiting indexer”; TVL/Volume KPIs always NA; ticker showed a false “Liquidity” accent; Instant Swap inputs were CSS-locked when disconnected; Smart Swap was not on Home; Liquidity pair control only cycled MARCO/BNB presets; LB reserved an 860px empty shell; logos failed on case-sensitive hosts because filenames are EIP-55 checksummed.

## 7. Root-cause summary

Dual token stacks (canonical KPI vs `useAllTokens`), logo path casing, farm `toString()` wei formatting, identical Manage/Open routes, SmartChef vs AMM factory conflation, KPI cards never emitting TVL/Volume labels, ticker accent misuse, Instant Swap `pointer-events: none` when disconnected, pair select cycling presets only, LB fixed-height empty state.

## 8–12. Token / logo reconciliation (exact)

| Metric | Count |
| --- | ---: |
| Historical token-list entries (all chains) | 326 |
| BSC list entries / unique addresses | 273 |
| Local logo PNGs | 536 |
| Checksummed logo filenames | 514 |
| BSC list tokens with local logo | 272 |
| BSC list without local logo | 1 (`AETX`) |
| Home “Indexed Tokens” ≈ | unique BSC surface assets (~275) |

Primary identity: **address**. Resolver: `lib/token-logo/localTokenLogoPath.ts` (checksum then lowercase) consumed by `resolveTokenLogoSources` and `resolveAssetLogo`.

## 13–14. Factory / pairs

| Metric | Count |
| --- | ---: |
| On-disk registry AMM pairs | 516 |
| Active AMM pairs | 505 |
| API page size cap | 100 |
| `useMelegaFactoryPools` | **paginated** (mission) |
| `useFactoryLiquidityTokenPairs` | paginated (prior) |

AMM Factory: `0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C`  
SmartChef factory (historical pool contract): `0x4c33eb3d40c78461dd1a079150fcac6da3c701cf` — **not** interchangeable with AMM pairs.

## 15–17. Farms / pools

| Metric | Count |
| --- | ---: |
| Unique farm pids in `packages/farms/constants/56.ts` | 385 |
| Registry MasterChef farms / active | 387 / 66 |
| Unique sousIds in `pools.tsx` | 241 |
| Registry SmartChef / active | 241 / 1 |

Stake/reward display uses `getBalanceNumber` formatting. Duplicate Manage/Open footer removed (`openRoute: null`).

## 18–19. Wallet portfolio

Shared `WalletPortfolio` / normalized model retained. LP discovery remains factory∪tracked balance-gated. Staked LP still via farm/pool userData (not falsely merged). Live wallet proof **not** captured this session.

## 20–23. Swap / Smart Swap / Home

- Instant Swap: disconnected input/token select **enabled**; Connect remains execution gate.
- Smart Swap: Home CTA + panel link → `/trade` (same SmartSwap engine; not a fake second router).
- Home Instant Swap is no longer CSS-decorative when disconnected.

## 24–27. Liquidity

- Pair select opens full `CurrencySearchModal`.
- Optional “Cycle suggestions” keeps BNB/MARCO as suggestion only.
- Add/Create/Remove still use existing mint/remove runtimes — **construction not gas-simulated here**.

## 28–32. TVL / Volume / Home / Ticker

- TVL KPI: partial sum of farm `liquidity` USD when available.
- 24H Volume: partial — USD when `amountUSD>0`, else indexed swap count label.
- Ticker: up to 24 assets; live price for MARCO/WBNB; others `—`; **no “Liquidity” accent**.
- Empty farm/pool rows no longer say “Awaiting indexer”.

## 33–36. Search / Farms UX / Pools UX / LB layout

- Logos converge via shared resolver (search/swap consumers inherit).
- Farms: decimal formatting + single manage route.
- Pools: paginated factory discovery + honest SmartChef classification.
- LB: `compactInactive` geometry exception — inactive card is not an 860px empty shell.

## 37. Mock-data removals

Removed ticker accent `"Liquidity"` as a pseudo market item. Historical lists/contracts retained (factual configuration).

## 38–41. Validation

| Gate | Result |
| --- | --- |
| Focused tests | **36 passed** |
| `next build` | **passed** |
| `tsc --noEmit` | **failed** (pre-existing Trade/Trending/tokens errors) |
| Mainnet Factory read | **not executed** |
| Screenshot pack | **not captured** |
| Mobile 390/430 | **not browser-validated** |

## 42–43. Accessibility / files

Reduced-motion ticker behavior unchanged (existing). Mission files under HomeTrade, Liquidity Studio, Pools factory hook, token-logo, portfolio cutover, trending accent, docs/runtime evidence.

## 44. Frozen-file exceptions

- Liquidity Building inactive compact geometry (`data-lb-compact`).
- Liquidity module tests updated for compact + pair search.

Forbidden cores (`exchange.ts`, token-list JSON, farms/pools config constants, router contracts) untouched.

## 45–47. Tests / typecheck / build

See evidence `tests-summary.json`, `build-summary.json`.

## 48. Evidence

`apps/web/docs/runtime/dex-v1-full-indexing-swap-liquidity-runtime-recovery/`  
Report: this file.

## 49–51. Honest limitations / blockers

1. No Playwright/runtime screenshot pack.
2. No on-chain `allPairsLength` live probe in this session.
3. Indexed swap `amountUSD` still 0 → volume often count-only.
4. Transaction execution not certified (simulate/gas only remaining).
5. Repo-wide typecheck red from pre-existing debt.
6. Full wallet reconstruction needs a connected known-balance wallet against prod registry load.

## 52. Working-tree status

Clean after push.

## 53. Exact next action

1. Start apps/web against mainnet-read RPC.  
2. Capture the required screenshot set.  
3. Probe Factory `allPairsLength` vs API total.  
4. Simulate Router quote/addLiquidity calldata for MARCO/WBNB + one non-default pair.  
5. Re-open certification only when blockers clear.
