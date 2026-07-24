# DEX V1 — Pools Mobile Live Data Repair Report

## 1. Final verdict

**DEX_V1_POOLS_MOBILE_LIVE_DATA_REPAIR_CERTIFIED**

## 2. Branch

`dex-v1-pools-mobile-live-data-repair`

## 3. Mission commit

See tip after mission commit (filled in follow-up docs commit).

## 4. Certified base

- Seal: `MELEGA_DEX_V1_CERTIFIED`
- Tip: `f69088af`
- Ancestry: verified

## 5. Worktree

`/Users/marcomelega/Projects/MelegaSwapV2/MelegaSwapV2-pools-repair`

## 6. Founder-reported defects

Missing mobile bottom nav on `/pools`; trapped navigation; Trending/MARCO price appears static; Pools not connected to Melega Factory discovery; mock/hardcoded market values; CTA destinations.

## 7. Reproduced behavior

Documented in `dex-v1-pools-mobile-live-data-repair/founder-defect-reproduction.md`.

## 8. Root cause of missing bottom navigation

`PoolsStudioGlobalStyle` demoted shared `nav[aria-label='Main navigation']` from `fixed` to `sticky`, placing it after page content.

## 9. Mobile-shell repair

Removed Pools-only sticky/grid chrome overrides. `/pools` now uses the same fixed `MelegaBottomNavigation` as `/liquidity-studio`.

## 10. Safe-area behavior

Shared bottom nav safe-area tokens retained; Pools no longer overrides positioning.

## 11. Pools active-navigation state

Header + bottom match `/pools`; validated at 390/430.

## 12. Melega Factory verification

Canonical `MELEGA_FACTORY_BSC` = `0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C` (matches Founder input).

## 13. Pool discovery source

Existing `/api/indexer/pairs` (`factory-allPairs-enumeration`) via new `useMelegaFactoryPools`.

## 14. Pool read model

Factory pairs mapped to preview cards with honest Unavailable valuation; staking producers retained for wallet portfolio.

## 15. Token metadata behavior

Symbols used when present; otherwise shortened addresses; logos remain registry-driven where available.

## 16. Wallet LP-position source

`buildPoolsWalletPortfolio` from real staking producers (unchanged path); copy repaired for disconnect/empty.

## 17. Masterbuilder-position behavior

No new Masterbuilder invention; staking portfolio path unchanged; limitation documented where AMM LP stake mapping is not certified here.

## 18. Pool count behavior

KPI **Pools Discovered** uses factory discovery states: loading `—`, unavailable `—`, factual zero `0` with secondary, ready factual total.

## 19. TVL and valuation policy

No fabricated AMM USD TVL; shows Unavailable / Valuation unavailable when not certified.

## 20. Trending Bar root cause

Shared ribbon; empty ranking still labeled “Trending”; prices live-formatted (no `0.00036` literal).

## 21. Trending factual source

`useDexTrendingRankings` (tier metrics, pairs, candles, BUSD prices).

## 22. Trending semantic policy

Empty → **Live on Melega DEX**; ranked → **Trending on Melega DEX**.

## 23. MARCO price behavior

No hardcoded `$0.00036`; unavailable → `—`; tickers deep-link to `/swap?outputCurrency=` or `/@slug`.

## 24. Action and deep-link repairs

- Add Liquidity / Create Pool → `/liquidity-studio?view=add`
- Explore Pools → scroll to explorer + ALL filter
- AMM card CTA → Add Liquidity

## 25–29. Loading / empty / unavailable / unsupported / partial

Factory hook states cover loading, empty, unavailable, unsupported_chain; failed queries do not become zero.

## 30. Production mock-data removals

No `0.00036` literal; UX fixture remains opt-in only (`NEXT_PUBLIC_POOLS_UX_FIXTURE=1`).

## 31. Files changed

- `PoolsStudioGlobalStyle.tsx`
- `poolsRuntime/useMelegaFactoryPools.ts` (new)
- `poolsRuntime/usePoolsStakingRuntime.ts`
- `components/PoolsStudioPageHeader.tsx`
- `components/YourPoolsSection.tsx`
- `components/PoolGridCard.tsx`
- `HomeTrade/TrendingRibbon.tsx`
- `HomeTrade/useDexTrendingRankings.ts`
- tests + docs/evidence

## 32. Certified-file exceptions

None for Passport / List / Liquidity geometry modules.

## 33. Desktop regression

Desktop bottom nav remains hidden ≥1024px by design; header nav + factual data updates only.

## 34. Mobile validation

390/430: bottom nav fixed + visible; destinations work (`responsive-measurements.json`).

## 35. Accessibility

Ticker links are real `href`s; Explore/Create are actionable.

## 36. Tests

Focused suites PASS (21 tests) — see `test-summary.json`.

## 37. Typecheck

Mission-scoped via vitest + successful `next build`.

## 38. Build

`yarn next build` — PASS.

## 39. Production-seal regression

Ancestry `f69088af`; Passport freeze intact; IA nav contracts pass.

## 40. Evidence paths

`apps/web/docs/runtime/dex-v1-pools-mobile-live-data-repair/`

## 41. Remaining honest limitations

- AMM USD valuation / TVL not certified → Unavailable  
- Wallet section still staking-portfolio based; pure AMM LP wallet inventory remains Liquidity Studio ownership  
- True trending requires ranking signals; otherwise Live label  

## 42. Factual blockers

None blocking CERTIFIED for scoped repair.

## 43. Working-tree status

Clean after push.

## 44. Exact recommended next action

Optional: unify wallet AMM LP positions on Pools via Liquidity Studio position adapter (separate mission).

---

**DEX_V1_POOLS_MOBILE_LIVE_DATA_REPAIR_CERTIFIED**
