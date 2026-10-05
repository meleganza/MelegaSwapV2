# Liquidity multichain stability gate

Mission: `MELEGA-LIQUIDITY-MULTICHAIN-TVL-AND-STABILITY-GATE`

Base: `origin/main` at `050e030b0c8cd6a02c34d8cb1490137987042a70`
Branch: `mission/liquidity-multichain-tvl-stability`

## Result

The connected wallet now has one chain-independent Liquidity directory. Reads run in parallel against every LIVE, swap-capable Melega factory in the canonical chain registry. Wallet network selection is not part of the read cache key and no discovery path requests a wallet network switch.

The current canonical registry yields six queried chains:

- BNB Smart Chain (`56`)
- Base (`8453`)
- Polygon (`137`)
- Ethereum (`1`)
- Arbitrum (`42161`)
- Avalanche (`43114`)

This intentionally follows current repository capability truth. Arbitrum and Avalanche are included because both are currently `LIVE`, swap-enabled, and factory-bound in that registry.

## Read and batching architecture

For each supported chain the existing `/api/indexer/liquidity-positions` endpoint supplies the read model. It uses environment/public read-only RPC fallbacks and Multicall3 chunks. The chain flow is:

1. load the existing BSC indexed pair universe or enumerate the canonical factory on the other chains;
2. batch `balanceOf(wallet)` over LP tokens;
3. discard zero balances;
4. batch token addresses, reserves, total supply, symbols, and decimals only for owned pairs;
5. aggregate successful chain results by `chainId:normalizedPairAddress`.

All chain requests run concurrently and settle independently. States are `READY`, `EMPTY`, `UNAVAILABLE`, `ERROR`, or `TIMED_OUT`. A failed chain does not erase healthy-chain positions; the UI shows a small partial-read notice while preserving known rows.

The directory cache key is wallet + retry nonce. Active wallet chain is deliberately absent. Wallet switching remains behind the existing action confirmation for Manage/Add More/Remove only.

## TVL and deterministic ordering

TVL source is the full on-chain pair reserves returned by the existing batch endpoint multiplied by the existing canonical USD price graph. Stablecoin anchors come from the repository token registry; BSC also reuses canonical BNB and featured-token market prices. Raw reserve/share arithmetic is decimal-safe (`CurrencyAmount`, `BigInt`, and `bignumber.js`).

No price is invented. If both token prices cannot be resolved, pool TVL remains unknown.

The global pipeline is:

`all owned multichain rows -> chain+pair dedupe -> factual TVL enrichment -> search -> global TVL sort -> 20-row pagination`

Sort rules:

1. known whole-pool TVL before unknown;
2. known TVL descending;
3. pair label ascending;
4. chain ID ascending;
5. normalized pair address ascending.

The wallet's position value is computed separately and never controls ordering. Multichain rows use batch-hydrated total supply and value data, avoiding per-card RPC reads. APR remains unknown for those rows until a shared/batched authoritative source exists rather than creating one historical request per card.

## AARON/MARCO

The BSC LP `0xc6f6f0a9525d43d68ab3fc27a731c01b10f320fa` has no hard-coded promotion. Its rank is determined only by factual whole-pool TVL; if its canonical USD price cannot be resolved it enters the deterministic unknown-TVL section. Symbol and exact LP-address search are covered. This mission did not fabricate or snapshot a live USD value/rank for that wallet.

## Verification

### Liquidity type gate

- Repository baseline: `1,164` TypeScript diagnostics.
- Baseline diagnostics whose file is under active `LiquidityStudio/**`: `26`.
- Final repository count: `1,138`.
- Final diagnostics under `LiquidityStudio/**`: `0`.
- Touched-file type gate: `0`.

The 26 removed diagnostics were bounded root-cause fixes:

- incorrect portfolio summary field and CSS string arithmetic;
- ES5-incompatible bigint exponentiation and an impossible discovery-state comparison;
- literal/default and discriminated-union narrowing errors;
- references to nonexistent Info pool change fields, which now remain truthfully unavailable;
- router method/override typings without changing transaction arguments or fee/economic rules;
- test-only Node import, module marker, union narrowing, and intentional fixture-cast errors.

Classification: active product/type debt `A+B = 26 -> 0`.

### Liquidity tests

- Baseline complete historical Liquidity path: `50 failed / 395 passed` in `23 failed / 35 passed` files.
- Final complete historical Liquidity path: `50 failed / 411 passed` in `23 failed / 37 passed` files.
- Focused active runtime/browser gate: `36/36 PASS`.
- New multichain read-model and directory tests: `16/16 PASS`.

The unchanged 50 failures are category `C`: historical byte/hash locks, missing archived mockup/evidence documents, and source-text expectations for superseded layouts/routes. They do not import or execute the production runtime and were already failing identically on `origin/main`. They are retained rather than disabled or rewritten for a vanity count. Current behavior is covered by imported pure-model tests and rendered component acceptance. No remaining category A/B Liquidity failure was identified.

The deterministic matrix proves:

- Base $10M, Ethereum $5M, Polygon $2M, BSC $1M global order;
- known-before-unknown and deterministic equal-TVL fallback;
- search before TVL sort;
- 199 identities appear exactly once across pages;
- identical pair addresses on two chains remain two positions;
- a timed-out chain preserves healthy positions;
- active-chain changes preserve the current multichain page;
- a non-active-chain action retains the exact row and requests the correct target chain;
- TVL uses the whole pool ($400 fixture) rather than the wallet share ($40 fixture).

### Browser acceptance

The deterministic 25-position product fixture was rendered through the real My Positions component and production build at `1440x900` and `390x844`. It shows multiple chain badges together, TVL order, 20-row first-page pagination, and the mobile count/search layout without horizontal clipping.

- [Desktop 1440x900](./evidence/liquidity-multichain-desktop.png)
- [Mobile 390x844](./evidence/liquidity-multichain-mobile.png)

### Cross-product regression smoke

The same bounded suite was run on detached `origin/main` and on this branch:

- Swap CTA: 8
- SmartSwap gas display: 3
- Farms actions: 3
- Pools actions: 3
- Bridge API path: 2
- Trending tier model: 8

Baseline: `27/27 PASS`. Final: `27/27 PASS`. New critical failures: `0`.

### Build and diff

- Production repository build: PASS (`8/8` tasks, Next.js compiled successfully).
- `git diff --check`: PASS.
- Real approvals/transactions: none.
- Deploy/merge: none.

## Remaining repository debt

The repository-wide TypeScript count is `1,138`, explicitly outside this Liquidity-only mission. It includes errors in other product/test/generated surfaces and is not described as clean here. This report makes no claim that those errors are harmless or non-production; only the active Liquidity dependency surface was brought to zero as required.
