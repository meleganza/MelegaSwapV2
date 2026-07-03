# DEX Implementation Matrix

**Status:** ACTIVE — constitutional UI freeze in effect  
**Effective:** 2026-07-03  
**Authority:** [`DEX_CONSTITUTION.md`](./DEX_CONSTITUTION.md)  
**Staging:** https://v2.melega.finance (`design-system-foundation`)  
**Production:** https://www.melega.finance (`main` — legacy UI, unchanged)  
**Amendment rule:** Every future implementation **must** update this matrix before merge.

---

## Mission

The Melega DEX user interface is **constitutionally frozen**.

From this point onward, development priority moves from UI creation to **runtime integration**.

**No new major pages** should be designed unless constitutionally required.

### Priority order

1. **REAL DATA**
2. **AI**
3. **RUNTIME**
4. **ECONOMIC ACTIVATION**

---

## Status legend

| Symbol | Meaning |
|--------|---------|
| ⬜ | Not started |
| 🟨 | Partial — UI or legacy hooks exist; studio surface not fully wired to live data/runtime |
| 🟩 | Complete — meets acceptance for this layer on staging |

---

## Implementation gate (mandatory before any feature work)

Before implementing anything, answer:

1. **Does the UI already exist?**
2. **Does runtime already exist?**
3. **Does AI already exist?**
4. **Does production already exist?**

If UI is 🟩 and runtime is ⬜ → work is **runtime integration only**, not new UI.

---

## TRADE

| Layer | Status | Notes |
|-------|--------|-------|
| UI | 🟩 | `HomeTradeScreen`, `TradeTerminalScreen`, `/trade`, `/swap` compat |
| Runtime | 🟩 | R015 — `TradeRuntimeProvider`; mock layers removed; live router/quotes |
| AI | ⬜ | UI affordances only (`aiMode` toggle) |
| Production | ⬜ | Live domain still on legacy `main`; V2 staging on `v2.melega.finance` |

### Runtime requirements

| Requirement | Status | Location / notes |
|-------------|--------|------------------|
| SmartSwap router | 🟩 | `views/Swap/SmartSwap`, `useBestTrade`, `useTradeInfo` |
| Melega Router | 🟩 | Smart + V2 comparison in `TradeRightRail` |
| Route discovery | 🟩 | Live path in `TradeRouteLine` |
| Price impact | 🟩 | `computeTradePriceBreakdown` + runtime summary |
| Slippage | 🟩 | Settings modal + execution instruction |
| Quotes | 🟩 | Live output/min received from `tradeInfo` |
| Token approvals | 🟩 | `useApproveCallback`, `SmartSwapCommitButton` |
| Gas estimation | 🟨 | `useGasPrice` estimate in runtime summary |
| Transaction history | 🟩 | `useProtocolTransactionsSWR` — no mock padding |

### AI (future)

- AI best execution
- AI route suggestion
- AI swap warnings

---

## LIQUIDITY

| Layer | Status | Notes |
|-------|--------|-------|
| UI | 🟩 | `LiquidityStudioScreen` + legacy `/add`, `/remove`, `/liquidity` |
| Runtime | 🟩 | R016 — `LiquidityRuntimeProvider`; studio wired to mint/burn, positions, subgraph |
| AI | ⬜ | — |
| Production | ⬜ | — |

### Runtime requirements

| Requirement | Status | Notes |
|-------------|--------|-------|
| LP positions | 🟩 | `useLiquidityPositions` + My Positions tab |
| Add Liquidity | 🟩 | Studio builder + `ConfirmAddLiquidityModal` |
| Remove Liquidity | 🟩 | Studio burn mode + `ConfirmRemoveLiquidityModal` |
| LP valuation | 🟩 | `useBUSDPrice` in position details |
| Impermanent loss | 🟨 | Heuristic estimate; chart decorative |
| APR | 🟩 | `useLPApr` + subgraph `lpApr7d` |
| Fees generated | 🟩 | Subgraph `lpFees24h` |

### AI (future)

- Optimal LP suggestions
- Risk evaluation

---

## FARMS

| Layer | Status | Notes |
|-------|--------|-------|
| UI | 🟩 | `FarmsStudioScreen` |
| Runtime | 🟨 | Legacy `views/Farms` hooks exist; studio uses `farmsStudioData.ts` static |
| AI | ⬜ | Advisor panel is static copy |
| Production | ⬜ | — |

### Runtime requirements

| Requirement | Status | Notes |
|-------------|--------|-------|
| Farm contracts | 🟨 | `@pancakeswap/farms`, legacy farm pages |
| APR calculation | 🟨 | Live on legacy; static in studio |
| Pending rewards | 🟨 | Legacy stake UI |
| Claim | 🟨 | Legacy |
| Deposit | 🟨 | Legacy |
| Withdraw | 🟨 | Legacy |
| Multipliers | ⬜ | Studio display only |

### AI (future)

- AI APR advisor
- Sustainability estimation

---

## POOLS

| Layer | Status | Notes |
|-------|--------|-------|
| UI | 🟩 | `PoolsStudioScreen` |
| Runtime | 🟩 | R017 — `PoolsRuntimeProvider`; live APR/TVL/stake/claim |
| AI | ⬜ | — |
| Production | ⬜ | — |

### Runtime requirements

| Requirement | Status | Notes |
|-------------|--------|-------|
| Staking contracts | 🟩 | `usePoolsPageFetch` + sousId / vault |
| Rewards | 🟩 | Pending rewards + `CollectModal` |
| Lock periods | 🟩 | `CakeVault` lock label in featured + pool type |
| Unlock | 🟩 | Vault unstake modal |
| APR | 🟩 | `getAprData` live in all cards |

### AI (future)

- AI reward optimization

---

## PROJECTS

| Layer | Status | Notes |
|-------|--------|-------|
| UI | 🟩 | `ProjectsStudioScreen` + `views/Projects` |
| Runtime | 🟨 | `registry/projects`, `getAllProjects()` indexed; external feeds not wired |
| AI | ⬜ | — |
| Production | ⬜ | — |

### Runtime requirements

| Requirement | Status |
|-------------|--------|
| AI project indexing | ⬜ |
| Website discovery | ⬜ |
| Social discovery | ⬜ |
| Contract discovery | 🟨 |
| Liquidity | ⬜ |
| Holders | ⬜ |
| Categories | 🟨 |
| DEX listings | ⬜ |
| CoinMarketCap | ⬜ |
| CoinGecko | ⬜ |
| TokenSniffer | ⬜ |
| GoPlus | ⬜ |
| DexTools | ⬜ |
| DexScreener | ⬜ |
| GitHub | ⬜ |
| Explorer | 🟨 |

### AI (future)

- AI Project Rating, Summary, Reputation, Risk, Classification

---

## TRENDING

| Layer | Status | Notes |
|-------|--------|-------|
| UI | 🟩 | `TrendingStudioScreen` + `TrendingRibbon` / `MelegaTicker` |
| Runtime | 🟨 | Home/trade ticker uses `useHomeTradeData` (live subgraph + farms); studio static |
| AI | ⬜ | — |
| Production | ⬜ | — |

### Runtime requirements

| Requirement | Status | Notes |
|-------------|--------|-------|
| Live ranking | 🟨 | Ticker live; studio cards static |
| Momentum | ⬜ | — |
| Whales | ⬜ | — |
| Volume | 🟨 | Subgraph on trade/home |
| Liquidity | 🟨 | Partial via farm/pool hooks |
| Growth | ⬜ | — |
| Radar integration | ⬜ | — |

---

## RADAR

| Layer | Status | Notes |
|-------|--------|-------|
| UI | 🟩 | `RadarStudioScreen` (console + intelligence layouts) |
| Runtime | ⬜ | `radarStudioData.ts` — static fixtures |
| AI | ⬜ | Copy + mock confidence scores only |
| Production | ⬜ | — |

### Runtime requirements

| Requirement | Status |
|-------------|--------|
| Live scanning | ⬜ |
| Wallet monitoring | ⬜ |
| Contract Intelligence | 🟨 |
| Smart Money | ⬜ |
| Whale Monitor | ⬜ |
| Heatmap | ⬜ |
| Contract Intelligence Preview | 🟨 |

### AI (future)

- Signal integration
- Real AI scoring

---

## COLLECTIBLES

| Layer | Status | Notes |
|-------|--------|-------|
| UI | 🟩 | `CollectiblesStudioScreen` + registry detail |
| Runtime | 🟨 | `registry/collectibles` read model; legacy `/nft/` mint on-chain |
| AI | ⬜ | — |
| Production | ⬜ | — |

### Runtime requirements

| Requirement | Status | Notes |
|-------------|--------|-------|
| NFT collections | 🟨 | Registry + legacy mint |
| Identity verification | ⬜ | — |
| Privileges | 🟨 | Manifest metadata |
| Ownership | 🟨 | Legacy wallet routes |
| Metadata | 🟩 | Registry manifests |
| Utilities | ⬜ | — |

### AI (future)

- Identity scoring

---

## BUILD STUDIO

| Layer | Status | Notes |
|-------|--------|-------|
| UI | 🟩 | `BuildStudioScreen`, `ImportExistingTokenScreen` |
| Runtime | ⬜ | Wizard UI + static timelines; no on-chain create flows wired in studio |
| AI | ⬜ | Advisor copy static |
| Production | ⬜ | — |

### Runtime requirements

| Requirement | Status | Notes |
|-------------|--------|-------|
| Import Existing Token | 🟨 | UI complete; validation runtime partial |
| Create Token | ⬜ | Links to `/launch` intents |
| Create Pool | ⬜ | — |
| Create Farm | ⬜ | — |
| Infrastructure Suggestions | ⬜ | Static |
| Manifest | 🟨 | Registry write paths exist in libs |
| Builder Templates | ⬜ | Static |

### AI (future)

- AI Builder Assistant
- Infrastructure Optimizer

---

## COMMAND CENTER

| Layer | Status | Notes |
|-------|--------|-------|
| UI | 🟩 | Safe 1180px layout, collapsed Machine Summary |
| Runtime | ⬜ | `commandCenterData.ts` — static fixtures; `chains=[]` safe mode |
| AI | 🟨 | Briefing + recommendations are static narrative (not live AI) |
| Production | ⬜ | Route 404 on production `main` |

### Runtime requirements

| Requirement | Status | Notes |
|-------------|--------|-------|
| Wallet | ⬜ | Static KPIs |
| Assets | ⬜ | Static cards |
| Pools | ⬜ | Static |
| Farms | ⬜ | Static |
| Liquidity | ⬜ | Static |
| Collectibles | ⬜ | Static |
| Infrastructure | ⬜ | Static |
| Reports | ⬜ | Static |
| Notifications | ⬜ | Static |
| Timeline | ⬜ | Static |
| Machine Summary | 🟨 | JSON manifest static; expand/collapse UI 🟩 |

### AI (future)

- AI Daily Briefing (live)
- AI Recommendations (live)
- AI Actions

---

## GLOBAL

| Area | Status | Notes |
|------|--------|-------|
| Design System | 🟩 | `design-system/melega` — tokens, shell, components |
| Global Visual Fix | 🟨 | Command Center + trade stabilization done; full audit pending |
| Responsive Audit | 🟨 | Phase 2 passed 390×844 on key routes; not exhaustive |
| Accessibility | ⬜ | — |
| Performance | ⬜ | No production perf budget sign-off |
| Production | ⬜ | `melega.finance` on legacy `main`; V2 on `v2.melega.finance` only |

### Shared runtime infrastructure (cross-cutting)

| Capability | Status | Location |
|------------|--------|----------|
| Execution layer | 🟨 | `lib/execution-layer`, `lib/routing-layer` |
| Wallet / wagmi | 🟩 | `utils/wagmi.ts`, `MelegaAppShell` |
| Subgraph / protocol txs | 🟨 | `state/info/hooks`, used on home/trade |
| Project registry | 🟨 | `registry/projects` |
| Economic read models | 🟨 | `lib/homepage-live`, surface map, readiness gates |
| KIRI / labs pipelines | 🟨 | Mission libs — not DEX-studio wired |

---

## Next phase (priority order)

| Priority | Workstream | Matrix trigger |
|----------|------------|----------------|
| **1** | **Trade Runtime** | Replace `tradeMockData` rails; wire live router status, assets, watchlist |
| **2** | **Liquidity Runtime** | ✅ R016 complete — studio live |
| **3** | **Pools Runtime** | ✅ R017 complete — studio live |
| **4** | **Farms Runtime** | Wire `FarmsStudio` → `useFarms` / stake actions |
| **5** | **Projects AI Runtime** | External discovery feeds + indexing pipeline |
| **6** | **Radar Runtime** | Replace `radarStudioData` with live event intake |
| **7** | **Build Studio Runtime** | Import token validation + create flows |
| **8** | **Command Center Runtime** | Wallet + positions + live briefing feed |
| **9** | **Global Visual Freeze** | Responsive + a11y + perf audit; no new UI scope |

---

## Production migration tracker

| Milestone | Status | Ref |
|-----------|--------|-----|
| Staging `v2.melega.finance` | 🟩 | Phase 1 complete |
| Phase 2 automated QA | 🟩 | MERGE_ALLOWED (wallet manual pending) |
| PR `design-system-foundation` → `main` | 🟨 | [#2](https://github.com/meleganza/MelegaSwapV2/pull/2) open, not merged |
| Production cutover `melega.finance` | ⬜ | Blocked — explicit approval required |
| Homepage policy | 🟩 | Trade-first `HomeTradeScreen` (not Civilization Entry Point) |

---

## Change log

| Date | Change |
|------|--------|
| 2026-07-03 | R017 Pools Runtime — studio wired to staking infra; Pools Runtime 🟩 |
| 2026-07-03 | R016 Liquidity Runtime — studio wired to LP infra; Liquidity Runtime 🟩 |
| 2026-07-03 | R015 Trade Runtime — mock layers removed; Trade Runtime 🟩 |
| 2026-07-03 | Initial matrix — UI freeze; runtime priorities; codebase audit statuses |

---

## Rule (repeat)

**No new feature** without updating this matrix.

When status changes, edit the row **and** add a line to **Change log**.
