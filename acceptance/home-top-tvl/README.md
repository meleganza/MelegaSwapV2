# Home Top Farms / Top Pools: minimum $250 TVL

Applies the same finite numeric USD TVL >= 250 rule to all chains, before ranking and truncation in both Home data hooks, with a final guard in HomeTrade row construction. Existing APR sorting is preserved. Unknown/non-finite TVL and all values below 250 are excluded. Empty results retain the existing empty state and do not pad from low-TVL inventory. Full Farms/Pools listings are unchanged.

Validation: 25 focused tests passed, including exact boundary/invalid data checks, actual Home hooks on Ethereum, BSC, Polygon, Arbitrum, Avalanche and Base, low-TVL high-APR exclusion before top-N, empty eligible inventories, and existing Home pool canonical-selector tests. Replacing the hooks with unchanged main makes all six chain regression cases fail (14 predicate checks still pass).

Run from apps/web:
`../../node_modules/.bin/vitest run src/views/Home/hooks/__tests__/homeTopYieldTvl.test.tsx src/lib/__tests__/homeTopPoolsCanonical.test.ts`

No full build or browser run for this selector-only change. Both Vercel configurations disable this exact branch's deployment. Draft PR only; architect review / Founder gate before merge or deployment.
