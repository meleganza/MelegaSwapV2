# Lint safe import hygiene 05A

## Mission and baseline

- Mission: `MELEGA-DEX-LINT-SAFE-IMPORT-HYGIENE-05A`
- Starting ref: `0db1415a36162537a5052f0af55432c15b440b1f` (merge of #125)
- Branch: `cursor/melega-dex-lint-safe-import-hygiene-05a-4e0a`
- Baseline lint: **1,632 errors / 1,389 warnings**
- Baseline target rules: `import/order` **300** (193 files), `import/no-duplicates` **86** (41 files), `import/no-named-as-default` **116** (54 files)
- Baseline typecheck: **0 diagnostics**
- Baseline certification: **29 files / 271 tests**
- Baseline global TVL: **5/5**
- Baseline Boost authority: **4 files / 24 tests**
- Baseline Boost service-modal source lock: growth hub compact-grid assertions passed inside that authority suite
- Baseline production build: **8/8 tasks**

No repository-wide autofix was accepted. Import edits were applied in bounded passes, then each diff was checked so non-import statements stayed byte-identical.

## Scope reviewed

| Rule | Reviewed | Fixed | Left | Why left |
| --- | ---: | ---: | ---: | --- |
| `import/order` | 300 | 270 | 30 | 14 blocked by side-effect or global-style barriers; 16 sit in SHA-frozen SmartSwap UX files |
| `import/no-duplicates` stylistic/test (N1+N3) | 42 | 42 | 0 | — |
| `import/no-duplicates` historical (N4) | 44 | 0 | 44 | Already classified historical/unreachable in tranche 02; not this style pass |
| `import/no-named-as-default` contextual (N2+N3) | 34 | 1 | 33 | Value default spelling is load-bearing for vitest `default` mocks and for `export default memo(...)` |
| `import/no-named-as-default` historical (N4) | 82 | 0 | 82 | Historical/unreachable; not a contextual spelling fix |

`import/order` uses the Airbnb grouping `[['builtin', 'external', 'internal']]`. Every other import type shares the next rank, so the safe fix is a stable partition: non-relative imports before relative imports, with original order kept inside each rank.

## Side-effect decisions

Bare imports, CSS imports, and global style/registration modules were treated as immovable barriers. A binding import was not moved across:

- `import '…'` / `import '….css'`
- paths under `/style/` or `/styles/`, or polyfill/side-effect paths
- bindings whose names are global style surfaces (`GlobalStyle`, `ResetCSS`, `*Overrides`, `*VisualStyle`)

That left these order findings in place:

- `FullMyApp.tsx`: `reset.css`, `ResetCSS`, and global style imports sit between absolute imports and `../../next-seo.config`
- `AddToWalletButton.tsx`: bare `../Logo/constants`
- `StakedAction.tsx`: bare `hooks/useActiveWeb3React`
- `Stake.tsx`: bare vault registration imports
- `PoolStatsInfo.tsx`: bare `@pancakeswap/utils/bigNumber`
- `useHomeTradeData.ts`: bare `lib/data-truth/compute24hPriceChange`
- `DexHomeScreen.tsx`, `BuildStudioScreen.tsx`, `CollectiblesStudioScreen.tsx`, `RadarStudioScreen.tsx`: `*GlobalStyle` modules
- `MelegaBottomNavigation.tsx`, `MelegaTokenSelector.tsx`: style-object imports kept as barriers

`config/constants/ifo.ts` had a later bare `import '@pancakeswap/sdk'` after `import { Token } from '@pancakeswap/sdk'`. The module is already evaluated by the earlier binding import, so the later side-effect statement was removed. No other side-effect import was removed.

SHA-frozen SmartSwap UX files were restored after import reordering changed their hashes. Those 16 `import/order` findings stay:

- `views/Swap/SmartSwap/index.tsx`
- `views/Swap/SmartSwap/components/SmartSwapCommitButton.tsx`
- `views/SmartSwapStudio/modules/SmartSwapExecutionPreview/SmartSwapExecutionPreviewModule.tsx`
- `views/Trade/TradeCockpit.tsx`

`TradeTerminalScreen.tsx` is on the same freeze list and was restored with it.

## Named-as-default

Thirty-three contextual value imports were proved to bind the same symbol as `export const Name` / `export default Name`, then restored. Switching them to named imports changed which mock binding vitest supplied. `publicPoolCreationHidden` failed because `PoolsActionHost` was mocked as `default` only. `HomeTradeDataRuntime` is also `export default memo(HomeTradeDataRuntime)`, so the default and the named function are not the same runtime value. That case was never rewritten.

One type-only spelling change was kept: `HomeTradeDataContext.tsx` now uses `import type { useHomeTradeData }`. The type and the value are the same function, and the import is erased.

## Files

197 files under `apps/web/src` changed (146 production, 51 tests), plus this report. No public export, barrel, contract, fee, or economic symbol changed. No ESLint suppression or rule change was added. `git diff --check` is clean.

## Verification

- Typecheck: PASS, 0 diagnostics.
- Certification: PASS, 29 files / 271 tests.
- Global TVL deterministic regression: PASS, 5/5.
- Boost authority regression: PASS, 4 files / 24 tests.
- Boost service-modal source regression: PASS. The growth-hub suite still locks the compact service grid. Browser geometry was not re-run because no layout or side-effect import order changed.
- Production build: PASS, 8/8 tasks.
- Final lint: **1,319 errors / 1,389 warnings**.
- Final target rules: `import/order` **30**, `import/no-duplicates` **44**, `import/no-named-as-default` **115**.
- No other lint rule count moved.
- Pre-existing SmartSwap UX freeze hash on `views/Swap/SmartSwap/index.tsx` still differs from `ux-freeze.manifest.json` at the starting ref. This tranche restored that file and did not add a new mismatch.

## Certified behavior freeze

No contracts, fees, Treasury behavior, economics, SmartSwap routing, global TVL semantics, Boost authority, or Boost service-modal layout changed.

Recommended next tranche after architect review: the remaining style/policy rules (`no-non-null-assertion`, `no-continue`, `no-await-in-loop`, `no-void`, `prefer-destructuring`). It was not started.
