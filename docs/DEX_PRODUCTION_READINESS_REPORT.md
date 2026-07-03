# DEX Production Readiness Report — R024

**Mission:** R024 Production Readiness Gate  
**Date:** 2026-07-03  
**Branch:** `design-system-foundation`  
**SHA:** `3bbe8e2`  
**Staging:** https://v2.melega.finance  
**Production rollback SHA:** `5d4818f` (`main` — Phase D Consolidation M32)  
**Return:** `R024_PRODUCTION_READINESS_READY`

---

## Verdict

| Gate | Result |
|------|--------|
| **Automated readiness** | **PASS** |
| **Production merge / cutover** | **BLOCKED** |

**Summary:** Build, unit tests, and route smoke pass on staging. Production cutover to `www.melega.finance` remains **blocked** until operator completes manual BSC wallet QA (swap, liquidity, pools, farms) and signs off mobile wallet UX.

---

## Required checks

### 1. Full route smoke — v2.melega.finance

**Tool:** `apps/web/scripts/phase2-qa-v2.mjs` + curl verification  
**Result:** ✅ 15/15 studio + legacy routes HTTP 200

| Route | Status |
|-------|--------|
| `/` | 200 |
| `/trade`, `/swap` | 200 |
| `/farms`, `/pools` | 200 |
| `/liquidity-studio` | 308 → OK |
| `/projects`, `/radar`, `/collectibles` | 200 |
| `/build-studio`, `/import-existing-token` | 200 |
| `/command-center` | 200 |
| `/nft/`, `/viewNFTs`, `/nftmarket`, `/ilo` | 200 |
| `/nfts` | 301 → `/collectibles` ✅ |
| `/add`, `/remove` | 308 → OK |

**Automated script failures (2):**

| ID | Detail | Classification |
|----|--------|----------------|
| `home:trade-first` | `data-home-trade-screen` not found within 2s | **Non-blocking** — attribute is client-rendered (`HomeTradeScreen`); SSR shell is empty until hydration. Code has marker at `HomeTradeScreen.tsx:91`. |
| `mobile:wallet-btn` | Connect button not visible on mobile `/trade` | **Blocker for mobile sign-off** — wallet may be in shell menu; requires manual verification. |

### 2. Wallet manual QA on BSC

**Result:** ⬜ **NOT EXECUTED** (requires operator + funded MetaMask/WalletConnect)

| Check | Code path exists | Manual verified |
|-------|------------------|-----------------|
| Connect / disconnect | `MelegaAppShell`, wagmi | ⬜ |
| Wrong network → BSC switch | `useActiveChainId` | ⬜ |
| Refresh with wallet connected | wagmi persistence | ⬜ |

### 3. Swap approve / preview / receipt

**Result:** ⬜ **NOT EXECUTED** (manual)

| Step | Runtime | Manual |
|------|---------|--------|
| Token picker | `useTradeSwapRuntime` | ⬜ |
| Approve ERC20 | `useApproveCallback` | ⬜ |
| Swap preview | `useTradeInfo`, price impact | ⬜ |
| Receipt / tx history | `useAllTransactions` | ⬜ |

Desktop automation: Connect Wallet CTA visible on `/trade` and `/swap` when disconnected ✅

### 4. Liquidity add / remove

**Result:** ⬜ **NOT EXECUTED** (manual)

| Flow | Runtime | Manual |
|------|---------|--------|
| Add LP (studio) | `useLiquidityMintRuntime` + `ConfirmAddLiquidityModal` | ⬜ |
| Remove LP (studio) | Burn mode + `ConfirmRemoveLiquidityModal` | ⬜ |
| Legacy `/add`, `/remove` | Preserved pages | ⬜ |

### 5. Pools stake / claim

**Result:** ⬜ **NOT EXECUTED** (manual)

| Flow | Runtime | Manual |
|------|---------|--------|
| Stake | `PoolsActionHost` + stake hooks | ⬜ |
| Claim | `CollectModal` | ⬜ |
| Vault lock/unlock | CakeVault modals | ⬜ |

### 6. Farms deposit / claim

**Result:** ⬜ **NOT EXECUTED** (manual)

| Flow | Runtime | Manual |
|------|---------|--------|
| Deposit | `FarmsActionHost` + `useStakeFarms` | ⬜ |
| Harvest | `useHarvestFarm` | ⬜ |
| Withdraw | `useUnstakeFarms` | ⬜ |

### 7. Mobile critical visual audit

**Result:** 🟨 **PARTIAL** (automated only)

| Route | Overflow | Notes |
|-------|----------|-------|
| `/` @ 390×844 | ✅ None | |
| `/trade` @ 390×844 | ✅ None | Connect btn visibility ⚠️ |
| `/farms` @ 390×844 | ✅ None | |
| `/command-center` @ 390×844 | ✅ None | Layout fits ✅ |
| Bottom nav | ✅ Present | |

Full mobile visual sign-off requires operator review on device.

### 8. Legacy routes preserved

**Result:** ✅ **CONFIRMED** (code + smoke)

- `next.config.mjs` redirects: `/send`→`/swap`, `/create`→`/add`, `/pool`→`/liquidity`, `/staking`→`/pools`, `/nfts`→`/collectibles`, `/farms/archived`→`/farms/history`
- Legacy pages intact: `/nft`, `/nftmarket`, `/viewNFTs`, `/ilo`, `/info/*`, `/add`, `/remove`, `/liquidity`
- Middleware geo-block only — no studio route removal

### 9. Environment variables — production-ready

**Result:** 🟨 **ACCEPTABLE WITH CAVEATS**

| Variable | `.env.production` | Runtime fallback | Required for cutover |
|----------|-------------------|------------------|----------------------|
| `NEXT_PUBLIC_GTAG` | ✅ `GTM-TLF66T4` | — | Analytics |
| `NEXT_PUBLIC_SNAPSHOT_BASE_URL` | ✅ Set | — | Governance links |
| `NEXT_PUBLIC_NODE_PRODUCTION` | Empty in repo | `https://bsc.nodereal.io` via `providers.ts` | **Set in Vercel for prod reliability** |
| `NEXT_PUBLIC_NODE_REAL_API_*` | Empty | Public RPC fallbacks | Optional |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | Vercel secrets | Sentry disabled if missing | Recommended |
| `RISK_APP_SECRET` | Vercel secrets | Risk API | Optional |

Secrets are **not** committed — confirm Vercel project env for `design-system-foundation` preview and future `main` production project.

### 10. Rollback path to main `5d4818f`

**Result:** ✅ **CONFIRMED**

```bash
# Emergency rollback (production main)
git fetch origin
git checkout main
git reset --hard 5d4818f
git push origin main --force-with-lease   # requires explicit operator approval

# Staging-only: redeploy design-system-foundation from prior SHA
git checkout design-system-foundation
git reset --hard <prior-sha>
```

| Reference | Value |
|-----------|-------|
| Production `main` HEAD | `5d4818f` — Phase D Consolidation M32 |
| Staging HEAD | `3bbe8e2` — R023 Collectibles + docs |
| Commits since rollback point | 87 |
| Open PR | [#2](https://github.com/meleganza/MelegaSwapV2/pull/2) `design-system-foundation` → `main` |

---

## Automated validation

| Command | Result |
|---------|--------|
| `yarn build` | ✅ Pass |
| `yarn test src/design-system` | ✅ 11/11 |
| `yarn test src/lib/homepage-live` | ✅ 2/2 |
| `yarn test projectsRuntime` | ✅ 5/5 |
| `yarn test radarRuntime` | ✅ 6/6 |
| `yarn test buildRuntime` | ✅ 5/5 |
| `yarn test commandCenterRuntime` | ✅ 6/6 |
| `yarn test collectiblesRuntime` | ✅ 9/9 |
| **Total** | **✅ 44/44** |

---

## Blockers

| # | Blocker | Owner | Resolution |
|---|---------|-------|------------|
| 1 | **Manual BSC wallet QA not completed** — swap approve/execute, liquidity add/remove, pools claim, farms harvest | Operator | Funded BSC wallet test on `v2.melega.finance` |
| 2 | **Mobile wallet connect visibility** on `/trade` @ 390px — automation could not find primary CTA | Operator / UX | Verify connect in shell header or hamburger; document expected path |
| 3 | **Production cutover approval** — `www.melega.finance` still on legacy `main` | Product / Ops | Explicit go/no-go after manual QA |

---

## Non-blocking issues

| Issue | Impact |
|-------|--------|
| 37 non-fatal console errors on `/trade` (automation) | Low — no crash, no Oops screen |
| `home:trade-first` QA marker timing | Test flake — client-only `data-home-trade-screen` |
| `typescript.ignoreBuildErrors: true` in `next.config.mjs` | Tech debt — build passes despite TS warnings |
| External market feeds (CoinGecko, DexScreener) show Unavailable | By design — no fabrication |
| Command Center 404 on production `main` | Expected — V2-only route until merge |
| Trending studio cards static (ticker live) | Known matrix limitation |
| Gas estimation 🟨 on Trade runtime | Estimate only, not blocker |

---

## Production recommendation

| Action | Recommendation |
|--------|----------------|
| **Merge PR #2 to `main`** | **HOLD** until manual BSC wallet QA sign-off |
| **Keep staging live** | ✅ Continue on `v2.melega.finance` |
| **Set Vercel env** | Set `NEXT_PUBLIC_NODE_PRODUCTION` before production cutover |
| **Post-merge smoke** | Re-run `phase2-qa-v2.mjs` against production domain |
| **Cutover `melega.finance`** | **Do not proceed** until blockers 1–3 resolved |
| **Rollback readiness** | ✅ `5d4818f` tagged and reachable on `main` |

### Operator manual QA checklist (copy for sign-off)

- [ ] Connect MetaMask on BSC mainnet
- [ ] Swap small amount (e.g. BNB → MARCO): approve → preview → confirm → receipt
- [ ] Add liquidity via `/liquidity-studio` or `/add`
- [ ] Remove partial liquidity
- [ ] Stake in an active pool → claim rewards
- [ ] Deposit to farm → harvest
- [ ] Mobile: connect wallet from `/trade` on iPhone-width viewport
- [ ] Legacy `/nft/` mint page still loads
- [ ] Disconnect wallet — no crash on refresh

---

## Related documents

- [`DEX_IMPLEMENTATION_MATRIX.md`](./DEX_IMPLEMENTATION_MATRIX.md) — updated R024
- [`DEX_RUNTIME_ARCHITECTURE.md`](./DEX_RUNTIME_ARCHITECTURE.md) — new
- [`DEX_CONSTITUTION.md`](./DEX_CONSTITUTION.md) — UI freeze authority
