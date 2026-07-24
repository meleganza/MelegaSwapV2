# DEX_V1_LEGACY_ASSET_AND_LIQUIDITY_RECOVERY_REPORT

**Mission:** `DEX_V1_LEGACY_ASSET_AND_LIQUIDITY_RECOVERY`  
**Severity:** P0 — post-seal production recovery  
**Certified base:** `DEX_V1_POOLS_MOBILE_LIVE_DATA_REPAIR_CERTIFIED` @ `9b6953e4`  
**Branch:** `dex-v1-legacy-asset-and-liquidity-recovery`  
**Worktree:** isolated (`MelegaSwapV2-legacy-recovery`)

## Summary

Historical Melega token metadata is surfaced through one canonical registry API. Liquidity Studio no longer forces MARCO/BNB. Wallet LP discovery enumerates Factory pairs (balance-gated). Passport, Pools, and Liquidity share the same `WalletPortfolio` → normalized user portfolio model. Production mock position data was not introduced; existing fixtures remain opt-in/test-only.

## Recovered token assets

| Source | Count / note |
| --- | --- |
| Historical token list (`pancake-default.tokenlist.json`) | **326** tokens |
| BSC entries | **273** unique addresses |
| Chains present in list | 56, 8453, 137, 1 |
| Canonical MARCO (BSC) | `0x963556de0eb8138E97A85F0A86eE0acD159D210b` |
| Logos | **326** list `logoURI` entries reused (not recreated) |

Union index continues via `lib/dex-asset-index` (registry projects, venues, farms, pools, packages/tokens, token list). Product code consumes **`lib/canonical-token-registry`** as the single consumer API.

## Recovered logos

- No new logo assets added.
- Registry resolves logos through existing `resolveAssetLogo` + list `logoURI` (e.g. MARCO → `https://www.melega.finance/images/melega.png`).
- Fallback remains `initials` / `generic` when URI missing.

## Recovered metadata

Per token (where available): symbol, name, decimals (from list, default 18), chainId, address, logo, aliases (MARCO/CAKE, WBNB/BNB, USDT), sources, status, surface flags (trade/pool/farm/project/radar/trending), registrySlug.

## Recovered LP

- `useFactoryLiquidityTokenPairs` paginates `/api/indexer/pairs` (Factory `allPairs` enumeration).
- Merged into `useLiquidityPositions` as `discoveryTokenPairs` (tracked ∪ factory, deduped).
- Wallet balances gate visibility — empty historical pairs stay hidden; **owned** historical LPs surface.
- Passport Liquidity already calls `useLiquidityPositions` → inherits Factory discovery.

## Recovered staking pools

- Existing MasterChef / SmartChef path via `usePoolsStakingRuntime` unchanged in core.
- Owned positions include ended pools (`userStaked > 0` or pending rewards).
- `buildPoolsWalletPortfolio` + view engine preserve ENDED ownership.
- New views: `LEGACY`, `WITHDRAW_OPPORTUNITIES`.

## Recovered wallet / historical / withdraw positions

Normalized sections on `melega.normalized-user-portfolio.v1`:

- Tokens (slot reserved; ERC20 wallet scan remains product-specific)
- Liquidity
- Pools
- Farms
- Legacy Positions (`ENDED` / `UNAVAILABLE` / `ARCHIVED`)
- Ended Positions
- Withdraw Opportunities (enabled WITHDRAW / UNSTAKE / REMOVE_LIQUIDITY)

Consumers:

- Liquidity → `selectNormalizedLiquidityPortfolio`
- Pools → `selectNormalizedPoolsPortfolio` / `selectWithdrawPoolPortfolioPositions`
- Passport → `usePassportNormalizedPortfolio`

## Token registry architecture

```
pancake-default.tokenlist.json ─┐
registry/assets + projects ─────┤
packages/tokens + venues ───────┼─► lib/dex-asset-index (implementation)
farm/pool known symbols ────────┘              │
                                               ▼
                              lib/canonical-token-registry  ◄── product imports
                               (decimals, aliases, search)
                                               │
        ┌──────────────┬──────────────┬────────┴────────┬────────────┐
        ▼              ▼              ▼                 ▼            ▼
      Swap          Liquidity       Pools           Passport      Trending
   (useAllTokens)  (SearchModal)  (shared model)  (normalized)  (canonical API)
```

**No duplicated registries.** `dex-asset-index` remains the builder; canonical registry is the consumer façade.

## Liquidity selector fixes

1. **AddLiquidityCard**
   - Wrong MARCO address removed.
   - Token A/B open `CurrencySearchModal` (full list + import path).
   - Pair control cycles **suggestions** only (`cycleSuggestedPair`); BNB/MARCO is default suggestion, not mandatory.
2. **LiquidityBuildingCard**
   - Canonical `MARCO_BSC_ADDRESS`.
   - Custom → full token search (`lb-token-select`).
3. Module freeze tests updated for recovery exception.

## Remaining factual blockers

1. Factory pairs API max page size 100 — recovery paginates up to 40 pages; extremely large inventories may need indexer pagination hardening.
2. Token decimals for factory-discovered pair legs default to 18 until on-chain metadata is hydrated (pair address derivation is address-based).
3. Pre-existing `next build` warnings: `calculateGasMargin` import from `utils/exchange`, smart-router adapter export (untouched; forbidden surface).
4. Pre-existing `buildDexAssetIndex` radar enrichment assertion (`enriched.length > 3`) still fails on tip — unrelated to this mission; not modified.
5. Full ERC20 “Tokens” wallet scan is not a second portfolio producer in this mission — Passport Assets remains its existing factual wallet path; LP/Pools share the normalized WalletPortfolio model.

## Evidence

- `apps/web/docs/runtime/dex-v1-legacy-asset-and-liquidity-recovery/evidence.json`
- Vitest: canonical registry, normalized portfolio, liquidity recovery guards, module 002/003, DEX-LIQ-ONE-002, DS001.4, wallet-portfolio view engine
- `yarn next build` — passed

## Delivery

| Field | Value |
| --- | --- |
| Branch | `dex-v1-legacy-asset-and-liquidity-recovery` |
| Commit | `8a984bf8` |
| Push | `origin/dex-v1-legacy-asset-and-liquidity-recovery` |
| Merge | not performed |
| Deploy | not performed |
| Forbidden files | untouched |

## Final report checklist

- Tests: **67 passed** (mission + related Liquidity/portfolio suite)
- `next build`: **passed**
- Working tree: clean after docs tip fill
- Vercel: not triggered (no deploy)
