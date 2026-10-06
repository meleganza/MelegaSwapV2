# Lint semantic safety 01

## Mission and baseline

- Mission: `MELEGA-DEX-LINT-SEMANTIC-SAFETY-01`
- Base main: `25736c587627c03eb1c30764d81360398200d0c1`
- Branch: `mission/lint-semantic-safety-01`
- Baseline lint: **1,736 errors / 2,063 warnings**
- Baseline typecheck: **0 diagnostics**
- Baseline certification: **29 suites / 271 tests passed**
- Baseline production build: **8/8 tasks passed**

The exact 695-candidate inventory is preserved in [SEMANTIC_BEFORE.md](./SEMANTIC_BEFORE.md). It covers React hooks, async/promise control, module integrity, loop closures, consistent returns, constant conditions, and React state diagnostics. Reachability uses the existing active-production classifier; it reported 1,533 reachable files.

## Classification

| Class | Before | Fixed | Remaining |
| --- | ---: | ---: | ---: |
| S1 confirmed semantic/runtime defect | 2 | 2 | 0 |
| S2 genuine bounded safety smell | 34 | 34 | 0 |
| N1 stylistic despite rule name | 67 | — | 67 |
| N2 intentional sequencing/control flow | 158 | — | 158 |
| N3 test/tooling-only | 397 | — | 397 |
| N4 contextual false positive | 37 | — | 37 |

`S1` counts the two ESLint reports produced by one root defect: `useMasterchef` and `useSousChef` were called on opposite branches of a conditional expression. `S2` counts individual lint findings, not root-cause files.

## S1/S2 corrections

- Made both Pool unstake contract hooks unconditional, preserving React hook order across `sousId` changes.
- Added `chainId` to the SousChef contract memoization so a network change cannot retain a contract bound to the prior chain.
- Corrected stale dependencies for Pool transaction refreshes, Farm LP selectors, swap pair identity, Project claim detection, Boost target/history callbacks, and pool approval/claim/stake callbacks.
- Memoized the chain-bound pool-address list before using it as a refresh dependency, preventing a render-triggered refresh loop.
- Captured the MARCO Connect host element inside its effect and stabilized the Passport-open callback, preventing cleanup from targeting a later host and avoiding stale ready/failure state.
- Bound Liquidity Building labels and series to the current chain/card/program snapshot.
- Converted the Pools route cleanup into an explicitly rejection-handled promise.
- Removed ambiguous duplicate barrel exports from the data-truth and featured-placement modules. Canonical exports remain unchanged.

No suppression, global rule change, broad `any`, skipped test, timeout increase, mass dependency insertion, or mass parallelization was introduced.

## Reviewed findings retained intentionally

- All 160 `no-await-in-loop` findings were reviewed through the inventory. Active sequential operations are nonce-, fallback-, retry-, checkpoint-, or rate-limit-sensitive and remain sequential (`N2`).
- Active `void` uses with explicit `.catch`, bounded internal error handling, event dispatch, or intentional UI fire-and-forget behavior remain `N2`. The one lost router rejection in the corrected scope was fixed.
- Conditional JSX modal nodes are guarded by request keys and intentionally feed `useModal`; memoizing them would add churn without changing the guarded presentation semantics (`N4`).
- Stable router/runtime objects and deliberate memo invalidation dependencies remain contextual (`N4` or `N1`).
- Dynamic drawer preloading creates a statically reported provider/drawer cycle but executes only after provider initialization; it is retained as `N4`.
- Duplicate imports and named/default identity warnings without demonstrated runtime ambiguity remain `N1` for the next module-integrity tranche.

The final retained inventory is in [SEMANTIC_AFTER.md](./SEMANTIC_AFTER.md). `SEMANTIC_COUNTS.json` is the machine-readable classification summary.

## Tests and acceptance

- Focused semantic regression: **8 files / 55 tests passed**.
- Pool action, wallet-first, and indexing regressions: passed.
- MARCO Connect: 8 tests passed.
- Boost authority: 7 tests passed; Boost funnel: 5 tests passed.
- Global TVL deterministic regression: 5 tests passed.
- Data-truth focused regression: passed.
- Desktop browser, 1440×900: Pools mounted, no overflow, no modal/state oscillation.
- Mobile browser, 390×844: observed for 10 seconds; no overflow, modal loop, flicker, or state oscillation.

Two broad historical data-truth tests were also sampled and exposed stale pre-existing source-text/navigation expectations (`clientReady` boot-shell text and the current Bridge navigation item). Neither file or behavior was modified by this mission; these tests are outside certification and are recorded as baseline historical test debt rather than new failures.

## Final lint status

- Full repository lint: **1,720 errors / 2,043 warnings**.
- S1 remaining: **0**.
- S2 remaining: **0**.
- New ESLint suppressions: **0**.
- No semantic-only CI gate was added. The existing ESLint architecture does not provide a clean severity/rule subset without duplicating configuration, and global lint remains intentionally non-blocking.

## Certified behavior freeze

No contracts, fees, Treasury behavior, economics, SmartSwap routing, global TVL semantics, Boost authority policy, deployment configuration, or product UX were changed. Changes are limited to semantic safety, stable runtime dependencies, rejection handling, and unambiguous module exports.

Recommended next tranche after architect review: `MELEGA-DEX-LINT-MODULE-INTEGRITY-02`.
