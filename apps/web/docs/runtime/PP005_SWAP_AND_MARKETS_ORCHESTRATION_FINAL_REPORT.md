# PP005 — Swap and Markets Orchestration — Final Report

## 1. Executive verdict

**PP005_SWAP_AND_MARKETS_ORCHESTRATION_CERTIFIED**

PP005 adds project-scoped Swap and Markets orchestration to the Melega DEX Project Page. Markets and swap destinations are resolved from certified venue/project registry inputs, deep-link into the existing `/trade` surface with supported query parameters only, and never introduce a second swap, quotes, calldata, or fabricated market metrics.

## 2. PP001–PP004 dependency audit

| Dependency | Commit | Status |
|---|---|---|
| PP001 Canonical Project Identity Shell | `4b4f2e66` | Frozen — reused |
| PP002 Provenance and Evidence | `ba58f41b` | Frozen — reused |
| PP003 Readiness and Trust Snapshot | `70514297` | Frozen — reused |
| PP004 Wallet Relationship Layer | `65441288` | Frozen — reused |

Branch base: `65441288`.

## 3. Existing Swap architecture audit

- Pages: `/swap` and `/trade` both render `TradeTerminalScreen`
- URL init: `queryParametersToSwapState` + `useTradeDefaultsFromURL`
- Execution authority remains Trade / Smart Router stack (unchanged)

## 4. Existing route and query-parameter audit

Supported params reused: `inputCurrency`, `outputCurrency`, `chain`, `chainId`, `exactAmount`, `exactField`, `recipient`.

Canonical deep-link route chosen: **`/trade`** (legacy `/swap` remains untouched).

Token currency IDs must be addresses (or native symbol). Symbols for ERC-20 are not accepted by the parser.

## 5. Existing token and chain selection audit

- Chain via `chain=<slug>` preferred (`bsc`, `ethereum`, …)
- Native via chain native symbol (e.g. `BNB`)
- Wrapped native (WBNB) mapped to native URL currency for buy destinations

## 6. Existing router and quote pipeline audit

Not duplicated. PP005 emits navigation context only.

## 7. Existing pair and market reader audit

- Certified venue registry: `getVenuesByProjectSlug` / `spot_lp` venues
- Featured pair constants confirm MARCO/WBNB LP `0x7286…` (not used for live metrics in PP005)
- Project `resources.liquidityPools` currently empty; bare addresses without token sides are not promoted

## 8. Project asset and market mapping audit

- Melega DEX primary assets: MARCO on 56/1/137/8453
- Bound swap market: venue `marco-bnb-lp` → project `melega-dex`
- Farm/stake venues excluded from swap markets

## 9. Canonical market model

Module: `apps/web/src/registry/projects/identity/markets/`  
Schema: `melega.project-markets.v1`  
Resolver revision: `PP005_SWAP_MARKETS_V1`  
Implemented market type: `AMM_V2_PAIR` only.

## 10. Market identity strategy

`marketId = mkt_${fingerprint(projectId, marketType, unorderedPairKey, venue, pairContract)}`

## 11. Asset-order normalization

`canonicalizeAmmV2PairKey` sorts token addresses lexicographically before hashing.

## 12. Chain and venue separation

Chain ID and venue string are identity inputs — distinct chains/venues cannot collide.

## 13. Market source and attribution

Primary source: **VENUE_REGISTRY** with project binding + project asset address intersection.

Rejected: symbol-only, name-only, social, unverified list matching.

## 14. Market status semantics

`ACTIVE | INACTIVE | PAUSED | DEPRECATED | UNRESOLVED` derived from venue lifecycle + swap capability cell.

## 15. Availability semantics

Certified vocabulary reused. Paused/deprecated/conflicted markets do not emit READY CTAs.

## 16. Project asset roles

Reuses PP001 `projectRole` (`primary` / secondary). Preferred trading asset = primary on BSC when present.

## 17. Preferred-market policy

Centralized in `selectPreferredMarkets`:

1. ACTIVE + AVAILABLE only  
2. Prefer connected chain when provided  
3. Prefer BSC among remaining chains  
4. Prefer `melega-dex` venue  
5. Expose all remaining equals (`MULTIPLE_EQUAL_PREFERRED_MARKETS`)

No liquidity/volume/price ranking.

## 18. Live market-data boundary

No price, volume, TVL USD, market cap, holders, charts, or APY exposed. Pair address + status/source only.

## 19. Shared market resolver

`buildProjectMarketsDocument` / `loadProjectMarketsDocument` — single path for page + APIs.

## 20. Swap destination descriptor

Navigation-only: route, query params, availability, reason codes. No quote, calldata, approval, or tx request fields.

## 21. Deep-link contract

Example:

`/trade?chain=bsc&inputCurrency=BNB&outputCurrency=0x963556de0eb8138e97a85f0a86ee0acd159d210b`

Validated against existing Trade URL parser. No private wallet data in URLs.

## 22. Public Markets API

`GET /api/public/projects/{slug}/markets/`  
Cache: `public, s-maxage=300, stale-while-revalidate=600`  
404 for unknown/malformed slugs. Alias parity via PP001 resolver.

## 23. PP001 project API extension

Additive `marketsSummary` via `toMarketsSummaryForProjectApi` — wallet-independent.

## 24. Capability integration

Document capabilities: `VIEW_MARKETS`, `SWAP`, `BUY_PROJECT_ASSET`, `SELL_PROJECT_ASSET` — availability only, non-executable.

## 25. PP004 wallet-context integration

PP004 semantics unchanged. Markets section does not duplicate balances. Optional connected-chain preference accepted by resolver context (public API omits wallet identity).

## 26. Project Page UX implementation

`ProjectMarketsSection` under Participate. Hero primary action `Open Swap` when a READY destination exists.

## 27. Participate navigation behavior

Nav injects Participate after Overview. Shell order: Identity → Wallet → Overview → Participate → Trust → Ecosystem…

## 28. Preferred-market UX

Shows pair label, chain, venue, status/availability/source, pair contract, Open Swap CTA.

## 29. Additional-markets UX

Compact disclosure list with per-row destinations.

## 30. No-market behavior

Neutral copy: “No Melega DEX market is currently registered for this project.”

## 31. Partial and conflicted behavior

Warnings disclosure; partial ≠ empty when some destinations remain READY. Multi-chain primary assets without venue pairs emit `ASSET_TRADABLE_WITHOUT_REGISTERED_MARKET` destinations.

## 32. Hero action integration

Single primary `Open Swap` when READY destination exists; absent when unavailable.

## 33. Machine-readable contract

Agents can read markets[], preferredMarkets[], swapDestinations[], capabilities, warnings, limitations without prose parsing.

## 34. Warning and reason codes

Controlled codes including `PROJECT_HAS_NO_REGISTERED_MARKETS`, `ASSET_TRADABLE_WITHOUT_REGISTERED_MARKET`, `MULTIPLE_EQUAL_PREFERRED_MARKETS`, `MARKET_PAUSED`, etc.

## 35. Security controls

- Identifier normalization/validation  
- Only supported query keys  
- No mutation endpoints  
- No tx construction  
- Public-safe data only  

## 36. Accessibility validation

Semantic headings, status text, keyboard disclosures, 44px CTA targets, aria-labels with pair context.

## 37. Responsive validation

Compact list; word-break on contracts; no trader table or charts.

## 38. Performance and live-call analysis

For `/@melega-dex/`:

| Call | Type |
|---|---|
| Venue registry read | In-process static (`getVenuesByProjectSlug`) |
| Project normalize | In-process |
| RPC / factory scan | **None introduced** |

Identity SSG remains independent of wallet RPC.

## 39. Tests added or changed

`markets/__tests__/pp005.markets.test.ts` — identity, attribution, destinations, API/summary privacy, UX contracts, PP001–PP004 + frozen regressions.

## 40. Exact commands executed

```bash
yarn test src/registry/projects/identity/{,__tests__/pp001.identity.test.ts,evidence/__tests__/pp002.evidence.test.ts,readiness/__tests__/pp003.readiness.test.ts,walletRelationship/__tests__/pp004.walletRelationship.test.ts,markets/__tests__/pp005.markets.test.ts}

npx tsc --noEmit -p tsconfig.json  # PP005 paths filtered — zero errors

yarn next build
```

## 41. Unit-test results

PP005: **13 passed**  
Combined PP001–PP005: **108 passed**

## 42. Integration-test results

Resolver/API/page share `buildProjectMarketsDocument`. Alias/canonical parity covered. No fabricated production metrics added.

## 43. Production-build result

`yarn next build` — **PASS** (pre-existing `next/babel` lint warning retained).  
Route: `/api/public/projects/[slug]/markets`.

## 44. Lint baseline comparison

Repository-wide `next/babel` ESLint load failure unchanged from PP001–PP004. No config weakening.

## 45. TypeScript baseline comparison

Filtered PP005 path diagnostics: **zero errors**. Repo-wide pre-existing unrelated errors unchanged in class.

## 46. PP001 regression results

Identity shell, public project API, SEO/JSON-LD, `/@` rewrite intact. Additive `marketsSummary` + markets alternate link only.

## 47. PP002 regression results

Evidence API + Trust Evidence panel intact.

## 48. PP003 regression results

Readiness API + Trust Snapshot hierarchy after Participate intact.

## 49. PP004 regression results

Wallet relationship resolver/API/UX unchanged (disconnected regression covered).

## 50. Existing Swap regression results

`pages/swap` and `pages/trade` present and unmodified.

## 51. Frozen-surface regression results

Command Center, Liquidity/Farms/Pools studios, Liquidity Building paths present; no behavioral edits.

## 52. Files created

- `apps/web/src/registry/projects/identity/markets/*`
- `apps/web/src/pages/api/public/projects/[slug]/markets.ts`
- `apps/web/src/views/ProjectPage/ProjectMarketsSection.tsx`
- `apps/web/docs/runtime/PP005_SWAP_AND_MARKETS_ORCHESTRATION_FINAL_REPORT.md`

## 53. Files modified

- `identity/index.ts`, `normalizeProject.ts`
- `pages/api/public/projects/[slug].ts`
- `pages/project-hq/[slug].tsx`
- `views/ProjectPage/ProjectIdentityShell.tsx`

## 54. Known limitations

- Only `AMM_V2_PAIR` from bound `spot_lp` venues
- Multi-chain MARCO without venue pairs → asset-level destinations only
- No live reserve observation in PP005
- Preference context chain is optional; public API is wallet-agnostic

## 55. Unsupported market types

`AMM_V3_POOL`, `STABLE_POOL`, `AGGREGATED_ROUTE`, `EXTERNAL_MARKET` — not implemented (no empty stubs).

## 56. Unsupported market metrics

Price, volume, market cap, FDV, holders, candles, APY, liquidity USD — unavailable / not rendered.

## 57. Deferred PP006+ work

Liquidity, Farms and Pools Orchestration (PP006) — not started.

## 58. Exact routes manually inspected

- `/project-hq/melega-dex` (`/@melega-dex`)
- `/api/public/projects/melega-dex/markets/`
- `/api/public/projects/melega-dex/`
- `/trade` / `/swap`
- `/projects`, Command Center, Liquidity/Farms/Pools studios

## 59. Runtime or screenshot evidence

Build lists markets API route; unit tests cover melega-dex venue market + deep links. Live Trade execution remains on existing swap surface.

## 60. Final certification verdict

Every exposed market/destination is traceable to:

1. canonical project,
2. canonical asset mapping,
3. chain-aware market identity,
4. certified venue (or honest asset-tradable fallback),
5. existing supported swap destination.

**PP005_SWAP_AND_MARKETS_ORCHESTRATION_CERTIFIED**
