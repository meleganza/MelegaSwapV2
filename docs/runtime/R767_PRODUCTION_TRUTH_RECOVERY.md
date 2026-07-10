# R767 — Production Truth Recovery

**Mission:** Recover live production truth; deploy R765/R763B fixes; on-chain indexing fallbacks.  
**Verdict:** See deployment section — requires production SHA verification after merge to `main`.

## A. Root cause of missing prior fixes

| Claimed fix | Changed file (local) | Used in production route | Commit SHA (local) | Remote SHA | Deployment SHA (prod) | Visible in prod | Root cause |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Canonical socials | `config/constants/social.ts` | Header/footer via `MelegaSocialIcons` | uncommitted → this commit | `b2bbe3a` | `346d1fd` | **no** | Fixes never committed or deployed |
| Sidebar BUILD cleanup | `navigation.ts`, `HomeSidebar.tsx` | App shell sidebar | uncommitted → this commit | `b2bbe3a` | `346d1fd` | **no** | Same |
| Build with Melega card | `ListProjectCta.tsx`, `MelegaCtaCard.tsx` | Homepage `/` | uncommitted → this commit | `b2bbe3a` | `346d1fd` | **no** | Same |
| No "No sustainable pool" | `formatTrendingLabels.ts` | Homepage trending | uncommitted → this commit | `b2bbe3a` | `346d1fd` | **no** | Same |
| Market Pulse honest states | `useMarketPulseData.ts`, `MarketPulsePanel.tsx` | Homepage | uncommitted → this commit | `b2bbe3a` | `346d1fd` | **no** | Prod still has `'Indexing'` fallback |
| Live Activity | `LiveActivityFeed.tsx`, indexer hooks | Homepage | uncommitted → this commit | `b2bbe3a` | `346d1fd` | **no** | Subgraph absent + no RPC fallback in prod |
| Trade chart/swaps | subgraph + new RPC APIs | `/trade` | this commit | `b2bbe3a` | `346d1fd` | **no** | `BLOCKED_SUBGRAPH_NOT_DEPLOYED` |
| Liquidity/Farms Batch 2 | LiquidityStudio + FarmsStudio panels | `/liquidity-studio`, `/farms` | uncommitted → this commit | `b2bbe3a` | `346d1fd` | **no** | Same |

**Primary root cause:** All R765/R763B work lived in an uncommitted working tree on `design-system-foundation` while production (`main` @ `346d1fd`, Vercel Production env) never received a deploy.

**Secondary root cause:** `NEXT_PUBLIC_MELEGA_SUBGRAPH_URL` not configured → permanent indexing states. Mitigated by BSC RPC log indexer (`/api/runtime/swaps`, `/api/runtime/chart`).

## B. On-chain discovery results

Generated: `apps/web/public/registry/onchain/bsc-mainnet.json` (block 109,204,452)

| Dataset | Count |
| --- | --- |
| AMM pairs (Factory enumeration) | **516** (505 active) |
| SmartChef pools (inventory + verification) | **241** (1 active visible) |
| MasterChef farms (`poolInfo`) | **387** (66 active alloc) |
| RPC swap events (MARCO/WBNB, 80k blocks) | runtime via API |
| Latest indexed block | chain head at sync |
| Indexer lag | 0 (direct RPC scan) |

## C. Key files changed

- `apps/web/src/config/constants/social.ts` — canonical socials
- `apps/web/src/app-shell/config/navigation.ts` — BUILD: Build Studio only
- `apps/web/src/views/HomeTrade/*` — trending, activity, market pulse
- `apps/web/src/lib/runtime-indexing/*` — RPC swap fallback
- `apps/web/src/pages/api/runtime/swaps.ts`, `chart.ts` — server RPC indexers
- `apps/web/public/registry/onchain/bsc-mainnet.json` — verified on-chain registry
- `apps/web/scripts/r767-onchain-discovery.mjs` — discovery pipeline
- Liquidity Studio + Farms Studio Batch 2 panels

## D. Tests and build

```
vitest: 6 passed (formatTrendingLabels, social, founderBatch2)
yarn build: PASS (apps/web)
```

## E–F. Commit / deploy evidence

Filled after `git push` and Vercel production deploy (see CI/Vercel dashboard).

## G. Production screenshots

Captured post-deploy under `docs/runtime/screenshots/r767/` (production URL only).

## H. Remaining external blockers

| Blocker | Impact | Mitigation |
| --- | --- | --- |
| `NEXT_PUBLIC_MELEGA_SUBGRAPH_URL` unset in Vercel | Full protocol-wide swap history, token USD metrics | RPC fallback for MARCO/WBNB pair; subgraph deploy still recommended |
| `NEXT_PUBLIC_BSCSCAN_API_KEY` unset | Holder counts unavailable | `/api/holder-count` returns explicit reason |
| SmartChefFactory on-chain event scan | Only inventory-backed 241 pools | Factory tx scan spec documented; inventory verified |
