# Factual V2 price impact

MISSION=MELEGA-SMARTSWAP-P0-FACTUAL-PRICE-IMPACT

BASE_MAIN_SHA=a6e178c2ce6be73c38faf67a5a8fe0665f1ab17e

BRANCH=p0-smartswap-factual-price-impact

Continued Grok's existing uncommitted implementation and tests on this branch. No reset, rebase, checkout or stash. The existing temporary harness and unrelated untracked files remain in place, outside the commit.

## Behavior

`createFactualV2QuoteSource` previously returned `priceImpactPercent: null`. It now reads each hop's pair from the quoted router's certified factory, verifies the pair tokens, orients the reserves, and attaches the factual impact to that exact quote. The existing adapters, winner selection, execution plan, preview and pinned confirmation carry it through without changes.

For net venue input A, actual router output Q, and oriented reserves:

```
M = A × product(reserveOut / reserveIn)
LP = 1 − product(1 − lpFeeBps / 10000)
priceImpactPercent = 100 × ((M − Q) / M − LP)
```

The formula uses exact BigInt rational arithmetic before truncating to six decimal places of percentage points. This preserves `computeTradePriceBreakdown.priceImpactWithoutFee`: subtract the compounded LP fee (25 bps per hop for both certified BSC venues). The 20 bps SmartSwap fee is excluded because A is already `netVenueInputRaw`. Neither slippage nor USD prices enter the calculation.

Only immutable pair/token metadata is cached, bounded to 256 entries. Reserves are always reread. Before attaching impact, the reserves must reproduce the actual quoted output using the certified V2 fee; incoherent reads across blocks return null. Failed/missing factories or pairs, bad tokens, invalid reserves, RPC errors, and reserve timeout also return null without invalidating a successful router quote.

The reserve deadline is 750 ms **from request start**, within the existing 1200 ms adapter deadline. Starting the deadline after the router returned could lose a valid slow quote; a regression test covers this. The initial 250 ms budget failed the public-node check; 750 ms passed all six cases. Routing candidates, ranking, fee policy, contracts, wallet flow and UI behavior are unchanged. Extra RPC work can still affect network load; unavailable impact is deliberately shown as the existing dash.

Existing pair helpers were inspected. `usePairs` is a React/multicall hook using the SDK's Melega pair derivation, unsuitable for fetching another venue's factory pairs inside this plain quote source. The implementation reuses certified venue LP fees and the canonical Melega factory registry, with a small read-only ABI helper.

## Validation

- 16 focused tests: one hop, two hops, legacy LP-fee convention, orientation, reverse direction with cached metadata, refreshed reserves, absent pairs, reserve RPC errors, malformed tokens, unknown router, mismatched reserves, near-deadline router success, SmartSwap-fee isolation, routing neutrality and display plumbing.
- 349 tests passed in 27 SmartSwap suites; the opt-in read-only suite skips without its RPC environment variable. Existing fork deployment/execution suites and Grok's temporary harness are excluded from this unit regression run.
- The opt-in read-only suite passed six cases on the existing BSC fork at block 124483691 and on the app's public BSC endpoint, starting at block 124486658. It restricts RPC methods to `eth_call`, `eth_chainId`, and `eth_blockNumber`; checks the router factories; and asserts winner impact reaches preview and confirmation. The public run uses moving latest blocks, not a pinned snapshot.
- Independent `cast call` reads plus Python exact fractions agreed with all 12 venue quotes on the fixed fork. All router outputs and mid outputs matched; impact differed by less than 0.000001 percentage point due to truncation.
- Touched-file typecheck: zero diagnostics across the four TypeScript files with ES2020 and real imported dependencies. The checker reports 130 dependency diagnostics separately. Full repository `tsc --noEmit --incremental false` is not green: existing configuration targets ES5 despite BigInt code, alongside unrelated module/type errors. No claim of a clean full-repository typecheck.
- `git diff --check`: passed.

Public-node results (percentage units):

- USDC → BNB: Pancake V2, direct USDC → WBNB. Inputs 5 / 50 / 500 USDC: 0.003225% / 0.032241% / 0.321483%.
- BLION → MARCO: Pancake V2, BLION → WBNB → MARCO. Inputs 1 / 1000 BLION: 0.000025% / 0.000010%.
- EYED → MARCO: Melega V2, EYED → WBNB → MARCO. Input 100 EYED: 0.000009%.

These are point-in-time read-only quote observations. Small nonzero values display `Low (0.00%)` under the existing two-decimal UI convention; no display formatting was changed. The JSON evidence contains token identities, paths, raw inputs/outputs, reserves and display values. This validates display plumbing, not a newly deployed browser build.

## Reproduce

From `apps/web`, with dependencies already installed:

```sh
./node_modules/.bin/vitest --run src/lib/smartswap-universal-engine/__tests__/v2FactualPriceImpact.test.ts --threads=false
SMARTSWAP_READONLY_RPC=http://127.0.0.1:8547 SMARTSWAP_READONLY_REPORT=/tmp/factual-impact.json ./node_modules/.bin/vitest --run src/lib/smartswap-universal-engine/__tests__/v2FactualPriceImpactReadonly.test.ts --threads=false
node ../../docs/smartswap-factual-price-impact/check-touched-types.cjs
```

The read-only suite expects an already available BSC RPC/fork; it does not start a fork, deploy contracts, approve tokens, or send swaps.

## Publication and boundaries

GitHub credentials were verified read-only. No push or PR was created: the preceding branch's GitHub status confirms automatic Vercel previews, and no safe publication path that guarantees no deployment was established. This honors the requested stop before deploy. The result is a local commit ready for review.

REAL_SWAP_EXECUTED=false

REAL_APPROVAL_EXECUTED=false

DEPLOYED=false

MERGED=false

BLOCKERS: No implementation blocker within the tested BSC scope. Publication held to avoid automatic deployment. Full repository typecheck remains affected by unrelated existing errors.

SMARTSWAP_FACTUAL_PRICE_IMPACT_PASS
