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
| Runtime | 🟩 | R018 — `FarmsRuntimeProvider`; live APR/TVL/stake/claim |
| AI | ⬜ | Heuristic advisor from live metrics |
| Production | ⬜ | — |

### Runtime requirements

| Requirement | Status | Notes |
|-------------|--------|-------|
| Farm contracts | 🟩 | `usePollFarmsWithUserData` + MasterChef |
| APR calculation | 🟩 | `getFarmApr` live in all cards |
| Pending rewards | 🟩 | `userData.earnings` + claim button |
| Claim | 🟩 | `useHarvestFarm` |
| Deposit | 🟩 | `DepositModal` via `FarmsActionHost` |
| Withdraw | 🟩 | `WithdrawModal` via `FarmsActionHost` |
| Multipliers | 🟩 | Live `farm.multiplier` in cards |

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
| Runtime | 🟩 | `projectsRuntime/` + `registry/projects`; source availability matrix |
| AI | 🟨 | Heuristic rating, summary, health, recommendations (no ML) |
| Production | ⬜ | — |

### Runtime requirements

| Requirement | Status |
|-------------|--------|
| AI project indexing | 🟩 |
| Website discovery | 🟩 |
| Social discovery | 🟩 |
| Contract discovery | 🟩 |
| Liquidity | 🟨 |
| Holders | 🟨 |
| Categories | 🟩 |
| DEX listings | 🟨 |
| CoinMarketCap | 🟨 |
| CoinGecko | 🟨 |
| TokenSniffer | 🟨 |
| GoPlus | 🟨 |
| DexTools | 🟨 |
| DexScreener | 🟨 |
| GitHub | 🟩 |
| Explorer | 🟩 |

### AI (R019)

- AI Project Rating (heuristic 0–100), Summary, Health, Recommendations — rule-based, no fabrication

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
| Runtime | 🟩 | `radarRuntime/` consumes Projects Runtime — no duplicate registry |
| AI | 🟨 | Heuristic opportunity score, summary, heatmap, recommendations |
| Production | ⬜ | — |

### Runtime requirements

| Requirement | Status |
|-------------|--------|
| Live scanning | 🟩 |
| Wallet monitoring | 🟨 |
| Contract Intelligence | 🟩 |
| Smart Money | 🟨 |
| Whale Monitor | 🟨 |
| Heatmap | 🟩 |
| Contract Intelligence Preview | 🟩 |

### AI (R020)

- Opportunity score, event summaries, health warnings — rule-based via Projects Runtime; whale/smart money unavailable until wallet feeds

---

## COLLECTIBLES

| Layer | Status | Notes |
|-------|--------|-------|
| UI | 🟩 | `CollectiblesStudioScreen` + registry detail |
| Runtime | 🟩 | ✅ R023 — `collectiblesRuntime/` registry + DNFT wallet ownership + identity privileges |
| AI | 🟨 | Rule-based advisor, health, membership heuristics — no ML |
| Production | ⬜ | — |

### Runtime requirements

| Requirement | Status | Notes |
|-------------|--------|-------|
| NFT collections | 🟩 | Registry canonical (3 collectibles) |
| Identity verification | 🟨 | Registry + wallet ownership for indexed DNFT |
| Privileges | 🟩 | Category-derived from runtime — no hardcoded badges |
| Ownership | 🟩 | `useWalletCollectibleOwnership` — single source |
| Metadata | 🟩 | Registry manifests — no placeholders |
| Utilities | 🟨 | Active/Inactive/Pending from ownership + registry status |

### AI (R023 partial)

- AI Collection Advisor — heuristic suggestions (Genesis, Builder, AI Passport)
- Identity health score — rule-based green/yellow/red dimensions
- Machine profile — `melega.collectibles-identity.v1` JSON export

---

## BUILD STUDIO

| Layer | Status | Notes |
|-------|--------|-------|
| UI | 🟩 | `BuildStudioScreen`, `ImportExistingTokenScreen` |
| Runtime | 🟩 | ✅ R021 — `buildRuntime/` orchestrates Projects + Radar + Pools + Farms; preparation only |
| AI | 🟨 | Rule-based advisor, score, suggestions, manifest — no ML |
| Production | ⬜ | — |

### Runtime requirements

| Requirement | Status | Notes |
|-------------|--------|-------|
| Import Existing Token | 🟩 | Contract → Projects → Radar → score → suggestions |
| Create Token | 🟩 | Preparation preview — deploy suppressed in studio |
| Create Pool | 🟩 | Pools Runtime preview — create suppressed |
| Create Farm | 🟩 | Farms Runtime preview — create suppressed |
| Infrastructure Suggestions | 🟩 | From Projects `buildAiRecommendations` |
| Manifest | 🟩 | Runtime-generated JSON — copy/download |
| Builder Templates | 🟩 | 6 templates + config JSON + execution preview |

### AI (R021 partial)

- AI Build Advisor — rule-based next action from live runtimes
- Infrastructure Score — heuristic 0–100 (Projects + Radar + capabilities)
- Infrastructure Optimizer — future (external feed integration)

---

## COMMAND CENTER

| Layer | Status | Notes |
|-------|--------|-------|
| UI | 🟩 | Safe 1180px layout, collapsed Machine Summary |
| Runtime | 🟩 | ✅ R022 — `commandCenterRuntime/` aggregates Trade/Liquidity/Pools/Farms/Projects/Radar/Build |
| AI | 🟨 | Rule-based briefing + recommendations from live runtimes — no ML |
| Production | ⬜ | Route 404 on production `main` |

### Runtime requirements

| Requirement | Status | Notes |
|-------------|--------|-------|
| Wallet | 🟩 | Trade runtime + wagmi account |
| Assets | 🟩 | Trade runtime assets |
| Pools | 🟩 | Pools runtime user stakes |
| Farms | 🟩 | Farms runtime user stakes |
| Liquidity | 🟩 | Liquidity runtime positions |
| Collectibles | 🟩 | `collectiblesRuntime/` — shared wallet ownership + identity summary |
| Infrastructure | 🟩 | Build runtime score + extensions |
| Reports | 🟩 | Build extensions (audit/space) |
| Notifications | 🟩 | Runtime transaction events |
| Timeline | 🟩 | Multi-runtime activity |
| Machine Summary | 🟩 | Runtime JSON v2 — copy/download |

### AI (R022 partial)

- AI Daily Briefing — operational bullets from connected runtimes
- AI Recommendations — Projects + Radar + Build suggestions
- AI Actions — future (execution layer)

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

### R024 production gate (2026-07-03)

| Check | Status |
|-------|--------|
| Automated build + 44 tests | 🟩 PASS |
| Route smoke (15 routes) | 🟩 PASS |
| Manual BSC wallet QA | ⬜ BLOCKED — operator sign-off required |
| Mobile wallet UX | 🟨 Partial — overflow OK; connect CTA needs manual verify |
| Rollback `main` @ `5d4818f` | 🟩 Confirmed |
| Production cutover | ⬜ BLOCKED — see `DEX_PRODUCTION_READINESS_REPORT.md` |

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
| **4** | **Farms Runtime** | ✅ R018 complete — studio live |
| **5** | **Projects AI Runtime** | ✅ R019 — registry runtime + heuristic AI; external feed APIs next |
| **6** | **Radar Runtime** | ✅ R020 — Projects Runtime integration + live event engine |
| **7** | **Build Studio Runtime** | ✅ R021 — infrastructure orchestrator; Projects/Radar/Pools/Farms integration |
| **8** | **Command Center Runtime** | ✅ R022 — personal operational hub; aggregates all studio runtimes |
| **9** | **Global Visual Freeze** | Responsive + a11y + perf audit; no new UI scope |

---

## Production migration tracker

| Milestone | Status | Ref |
|-----------|--------|-----|
| Staging `v2.melega.finance` | 🟩 | Phase 1 + R024 automated gate PASS |
| Phase 2 automated QA | 🟩 | 42/44 checks PASS — 2 flaky/client-render (see R024 report) |
| R024 production readiness | 🟨 | Automated PASS; cutover BLOCKED pending manual BSC QA |
| PR `design-system-foundation` → `main` | 🟨 | [#2](https://github.com/meleganza/MelegaSwapV2/pull/2) open — HOLD until wallet sign-off |
| Production cutover `melega.finance` | ⬜ | Blocked — explicit approval + manual QA required |
| Homepage policy | 🟩 | Trade-first `HomeTradeScreen` (not Civilization Entry Point) |

---

## Change log

| Date | Change |
|------|--------|
| 2026-07-03 | R024 Production Readiness Gate — automated PASS; cutover BLOCKED pending manual BSC QA |
| 2026-07-03 | R023 Collectibles Runtime — Digital Identity layer; Collectibles Runtime 🟩, AI 🟨 |
| 2026-07-03 | R021 Build Studio Runtime — orchestration layer; Build Studio Runtime 🟩, AI 🟨 |
| 2026-07-03 | R020 Radar Runtime — Projects integration + live events; Radar Runtime 🟩 |
| 2026-07-03 | R019 Projects AI Runtime — registry runtime + heuristic AI; Projects Runtime 🟩 |
| 2026-07-03 | R017 Pools Runtime — studio wired to staking infra; Pools Runtime 🟩 |
| 2026-07-03 | R016 Liquidity Runtime — studio wired to LP infra; Liquidity Runtime 🟩 |
| 2026-07-03 | R015 Trade Runtime — mock layers removed; Trade Runtime 🟩 |
| 2026-07-03 | Initial matrix — UI freeze; runtime priorities; codebase audit statuses |

---

## Rule (repeat)

**No new feature** without updating this matrix.

When status changes, edit the row **and** add a line to **Change log**.
