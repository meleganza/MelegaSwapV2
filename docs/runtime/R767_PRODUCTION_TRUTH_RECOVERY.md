# R767 — Production Truth Recovery

**Verdict:** `PRODUCTION_TRUTH_RECOVERY_BLOCKED`  
**Production URL:** https://melega-swap-v2-web.vercel.app  
**Production SHA:** `69c9c98de9a46dd6859b843c12f8390d77da6c80`  
**Deployment ID:** `5395000165` (2026-07-10T17:10:21Z)

---

## A. Root cause of missing prior fixes

| Claimed fix | Changed file | Used in production | Local commit | Remote before | Prod SHA before | Visible before | Root cause |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Canonical socials | `config/constants/social.ts` | Header `MelegaSocialIcons` | uncommitted | `b2bbe3a` | `346d1fd` | no | Never committed/deployed |
| Sidebar BUILD cleanup | `navigation.ts` | `MelegaAppShell` sidebar | uncommitted | `b2bbe3a` | `346d1fd` | no | Never committed/deployed |
| Build card | `ListProjectCta.tsx`, `MelegaCtaCard.tsx` | Homepage | uncommitted | `b2bbe3a` | `346d1fd` | no | Never committed/deployed |
| No "No sustainable pool" | `formatTrendingLabels.ts` | Homepage trending | uncommitted | `b2bbe3a` | `346d1fd` | no | Never committed/deployed |
| Market Pulse honest states | `useMarketPulseData.ts` | Homepage | uncommitted | `b2bbe3a` | `346d1fd` | no | Old prod fallback `'Indexing'` |
| Live Activity | indexer hooks | Homepage | uncommitted | `b2bbe3a` | `346d1fd` | no | Subgraph absent; no RPC fallback in prod |
| Liquidity/Farms Batch 2 | LiquidityStudio/FarmsStudio | `/liquidity-studio`, `/farms` | uncommitted | `b2bbe3a` | `346d1fd` | no | Never deployed |

**Primary root cause:** R765/R763B fixes lived in an uncommitted working tree on `design-system-foundation` while production tracked `main` @ `346d1fd`.

**Secondary root cause:** `NEXT_PUBLIC_MELEGA_SUBGRAPH_URL` unset → permanent indexing states; mitigated partially with BSC RPC log indexer (blocked on Vercel public RPC rate limits).

**Deploy regression (fixed in `69c9c98`):** `HomeMarketOverview` + nested `styled(MelegaStudioGhostBtn)` triggered styled-components error #12 → global error boundary on all routes. Hotfix applied.

---

## B. On-chain discovery results

Registry: `apps/web/public/registry/onchain/bsc-mainnet.json` (block 109,204,452)

| Dataset | Count |
| --- | --- |
| AMM pairs (Factory `allPairs`) | **516** (505 active reserves) |
| SmartChef pools (inventory verified) | **241** (1 active visible) |
| MasterChef farms (`poolInfo`) | **387** (66 with alloc > 0) |
| RPC swap events (prod API) | **0** — `limit exceeded` on Vercel |
| Latest indexed block (registry) | 109,204,452 |
| Indexer lag (registry) | 0 at generation time |

---

## C. Files changed (high signal)

- Social/navigation/home UX: `social.ts`, `navigation.ts`, `HomeTrade/*`, `MelegaCtaCard.tsx`
- Runtime indexing: `useProtocolTransactionsIndexer.ts`, `fetchRpcProtocolTransactions.ts`, `rpcLogReader.ts`
- API routes: `pages/api/runtime/swaps.ts`, `chart.ts`, `holder-count.ts`
- On-chain registry: `public/registry/onchain/bsc-mainnet.json`, `scripts/r767-onchain-discovery.mjs`
- Hotfixes: `HomeQuickActions.tsx`, `HomeMarketOverview.tsx`

---

## D. Tests and build

```
vitest: 6 passed (formatTrendingLabels, social, founderBatch2)
yarn build (apps/web): PASS
```

---

## E. Commit and push evidence

| Item | SHA |
| --- | --- |
| Branch | `main` |
| R767 primary commit | `838674794265ef1a9ec859d7616e4329f9370045` |
| RPC span fix | `d5d6ae9` |
| Chunked RPC indexer | `3020aaf` |
| Production crash hotfix | `69c9c98de9a46dd6859b843c12f8390d77da6c80` |
| Remote | pushed to `origin/main` |

---

## F. Production deployment evidence

| Field | Value |
| --- | --- |
| URL | https://melega-swap-v2-web.vercel.app |
| Environment | Production |
| Deployment ID | 5395000165 |
| SHA | 69c9c98 |
| Vercel status | success |
| Verified | Homepage loads (no error boundary); no "No sustainable pool"; no "Indexing activity" string |

---

## G. Production screenshot paths

All under `docs/runtime/screenshots/r767/`:

1. `01-homepage-header-socials.png`
2. `02-homepage-build-with-melega.png`
3. `03-homepage-top-farm-pool.png`
4. `04-homepage-market-pulse.png`
5. `05-homepage-live-activity.png`
6. `06-sidebar-build-section.png`
7. `07-trade-amount-inputs.png`
8. `08-trade-chart.png`
9. `09-trade-pair-statistics.png`
10. `10-trade-recent-swaps.png`
11. `11-trade-route-finite.png`
12. `12-liquidity-position-preview.png`
13. `13-liquidity-intelligence-panels.png`
14. `14-pools-discovery.png`
15. `15-farms-discovery.png`

---

## H. Remaining external blockers

| Blocker | Gate impact |
| --- | --- |
| `NEXT_PUBLIC_MELEGA_SUBGRAPH_URL` not set in Vercel | Chart, protocol-wide swaps, token USD metrics |
| Public BSC RPC rate limits from Vercel (`limit exceeded`) | `/api/runtime/swaps` returns error in production |
| `NEXT_PUBLIC_BSCSCAN_API_KEY` not set | Holder counts unavailable |
| `BSC_RPC_URL` (dedicated node) not set in Vercel | Reliable server-side log indexing |
| UI pool visibility gate (`listUsablePools`) | Registry has 516 pairs but UI still filters to live APR subset |

---

## Validation gates

| Gate | Status |
| --- | --- |
| Deployment discrepancy explained | PASS |
| Canonical socials in production | PASS |
| Sidebar clean (Build Studio only) | PASS |
| Build card correct | PASS |
| BNB-only network surface | PASS |
| Complete pair discovery (registry) | PASS |
| Complete SmartChef/MasterChef discovery | PASS |
| No "No sustainable pool" | PASS |
| No permanent "Indexing activity" on homepage | PASS |
| Market Pulse no permanent "BNB Price Indexing" | PASS (CoinGecko live) |
| Trade quote no NaN | PASS (when wallet connected; route shows finite or empty) |
| **Chart real data** | **BLOCKED** — subgraph + RPC API error |
| **Recent swaps real events** | **BLOCKED** — RPC API `limit exceeded` |
| Production SHA documented | PASS |
| Screenshots from production URL | PASS |

---

## Final verdict

**PRODUCTION_TRUTH_RECOVERY_BLOCKED**

Failing gates: **chart real data**, **recent swaps real events**, **holders** (requires BscScan API), **complete pools visible in UI** (visibility gate vs 516-pair registry).

Configure in Vercel Production: `NEXT_PUBLIC_MELEGA_SUBGRAPH_URL`, `NEXT_PUBLIC_BSCSCAN_API_KEY`, `BSC_RPC_URL` (paid/low-limit node), then redeploy.
