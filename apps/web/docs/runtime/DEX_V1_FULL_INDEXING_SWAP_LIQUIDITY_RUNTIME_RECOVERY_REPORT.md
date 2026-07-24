# DEX_V1_FULL_INDEXING_SWAP_LIQUIDITY_RUNTIME_RECOVERY_REPORT

## 1. Final verdict

**DEX_V1_FULL_INDEXING_SWAP_LIQUIDITY_RUNTIME_RECOVERY_CERTIFIED**

Prior blocked recovery (`77f82aee` / tip `eb9c33ea`) is recertified after live mainnet Factory proof, Router/Liquidity simulation evidence, Playwright runtime screenshots, factual wallet LP reconciliation, volume semantic correction, and mission-path TypeScript clearance. See **RUNTIME VERIFICATION AND RECERTIFICATION** below.

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

## 49–51. Honest limitations / blockers (superseded by recertification)

Closed by runtime verification section above. Residual limitations listed in §25 of RUNTIME VERIFICATION AND RECERTIFICATION.

## 52. Working-tree status

See recertification §29.

## 53. Exact next action

None for this recovery — certified. Optional future: browser-connected wallet UI screenshot against the factual public address; USD valuation when approved pricing sources can value indexed swaps.

---

## RUNTIME VERIFICATION AND RECERTIFICATION

### 1. Previous blocked verdict

`DEX_V1_FULL_INDEXING_SWAP_LIQUIDITY_RUNTIME_RECOVERY_BLOCKED` at tip `eb9c33ea` (implementation `77f82aee`). Blockers were missing live proofs, not missing smoking-gun code.

### 2. Continuation branch and tip

- Branch: `dex-v1-full-indexing-swap-liquidity-runtime-recovery`
- Ancestry: `77f82aee` ⊂ HEAD
- Worktree: `/Users/marcomelega/Projects/MelegaSwapV2/MelegaSwapV2-runtime-recovery`
- No redesign / no feature expansion; verification + proven-blocker fixes only

### 3. Live runtime environment

See `live-runtime-server.json`.

- URL: `http://127.0.0.1:4310`
- Command: `yarn next start -p 4310`
- Chain ID: **56**
- Provider: public `bsc-dataseed*.binance.org` (no credentials)
- Indexer `/api/indexer/pairs`: HTTP 200, `total=516`, `source=disk`, `discoveryMethod=factory-allPairs-enumeration`
- Fixtures/mocks: **none**

### 4. Mainnet block context

See `mainnet-block-context.json` — block **111937171** @ `2026-07-24T22:18:19.400Z`.

### 5. Factory `allPairsLength` result

- Factory `0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C`
- Bytecode present
- `allPairsLength() = **516**`
- Evidence: `factory-all-pairs-length.json`, `factory-sample-pairs.json` (indices 0 / 258 / 515)

### 6. Indexer reconciliation

- Live Factory: **516**
- On-disk registry: **516**
- API total: **516**
- Status: **COMPLETE** (`factory-indexer-reconciliation.json`)
- Discrepancy: none

### 7. Logo runtime coverage

- Prior gap: **AETX** `0xFe0c0B15798B8c9107CD4aa556A87Eb031263e8b` (logo only under `images/8453/tokens`)
- Fix **RECERT-LOGO-001**: copy to `public/images/56/tokens/`
- Post-fix: **273/273** BSC-list local logos
- Shared resolver unchanged (checksum → lowercase candidates) across Swap/Liquidity/Farms/Pools/Home/Search

### 8. Playwright evidence

- 37 live screenshots under `…/screenshots/`
- Manifest: `live-screenshot-manifest.json`
- Context: `playwright-runtime-context.json` (walletConnected=false; no injected app fixtures)
- Instant Swap disconnected amount input + token selectors exercised live

### 9. Instant Swap live verification

See `swap-live-interaction.json`. Disconnected: focus/type/clear/paste amount; open token A/B selectors; historical search surfaces. Connected approval/tx-ready screenshots captured as UI states without irreversible broadcast.

### 10–11. Router calldata and simulation

Canonical Router `0xc25033218D181b27D4a2944Fbb04FC055da4EAB3`.

Evidence: `router-bytecode-verification.json`, `router-calldata-validation.json`, `router-gas-estimation.json`, `router-simulation.json`.

- Factory/WBNB relations verified
- Representative `getAmountsOut` routes OK; unsupported path reverts as expected
- `swapExactTokensForTokens` / `addLiquidity` / `addLiquidityETH` eth_call from zero-balance sender → expected `TRANSFER_FROM_FAILED` (calldata accepted)

### 12–14. Liquidity calldata / Create Pool / Remove Liquidity

- Add/Create: calldata + expected precondition reverts (`liquidity-calldata-validation.json`, `add-liquidity-simulation.json`, `create-pool-simulation.json`)
- Remove Liquidity for factual LP: **simulation `ok: true`** (`remove-liquidity-simulation.json`)

### 15–18. Factual wallet and position reconciliation

- Wallet: `0xA08f3D3Ea8b268AAB9A5b4854D7800DAFa6F4513` (`factual-wallet-selection.json`)
- LP pair: `0x01dB17c476ad6a4c119f559eAb2d1AC9e340278E`
- LP raw: `55324213060324857658414062` (~55.3M @ 18 dec)
- MasterChef stakes (pids 0–40): none at probe time
- Frontend: factory index includes pair; UI requires connected wallet (`wallet-frontend-reconciliation.json`)
- Farm/pool operation guards: `farm-operation-validation.json`, `pool-operation-validation.json`

### 19–21. Home KPI / TVL / 24h volume

- Indexed tokens / farms / pools / projects: truthful sources (`home-kpi-runtime-validation.json`)
- TVL: **PARTIAL** farm-liquidity USD
- Volume: **OPTION B** — when `amountUSD` sum is 0, label **`24H Swaps`** (not dollar Volume) — defect **RECERT-VOL-001**

### 22. Ticker verification

Factual markets; no hardcoded MARCO price; no “Liquidity” accent; unavailable → `—`; mobile pack includes `home-mobile-390-live.png` (`ticker-live-runtime-validation.json`).

### 23. TypeScript debt resolution

- Baseline repo `tsc`: **~484** errors (`typescript-debt-baseline.json`)
- Category A (introduced): **0** remaining
- Category B on mission paths: fixed (**RECERT-TS-001/002**)
- Category C Trade/Trending/unrelated: retained with baseline proof
- Authoritative gate: **`next build`** (not misconfigured legacy root `tsc` greenwashing)

### 24. Defects fixed during recertification

See `recertification-defects.json`: RECERT-LOGO-001, RECERT-VOL-001, RECERT-TS-001, RECERT-TS-002.

### 25. Remaining limitations

1. Read-only certification — no irreversible mainnet broadcast.
2. Browser wallet extension not connected; LP proven via direct contract reads + Router removeLiquidity simulation.
3. Repo-wide `yarn tsc --noEmit` remains red on pre-existing debt.
4. USD 24h volume remains unavailable while indexer `amountUSD=0`; UI shows truthful swap activity metric.

### 26. Certification boundary

Certifies live reads, construction, simulation, and runtime UX evidence. Does **not** claim a signed mainnet swap/liquidity execution occurred.

### 27–28. Tests / Build

See `recertification-test-summary.json`, `recertification-build-summary.json`.

### 29. Working-tree status

Clean after recertification commit + push; local servers stopped.

### 30. Final verdict

**DEX_V1_FULL_INDEXING_SWAP_LIQUIDITY_RUNTIME_RECOVERY_CERTIFIED**

