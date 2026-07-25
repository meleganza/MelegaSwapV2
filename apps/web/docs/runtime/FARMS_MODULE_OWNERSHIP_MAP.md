# Melega DEX Farms — Module Ownership Map

**Architecture:** `FARMS_ARCHITECTURE_000`  
**Route:** `/farms`  
**Product model:** LP Yield Farming center (not a card grid)

Visual source of truth:  
`apps/web/docs/runtime/farms-architecture-000/farms-founder-mockup-lock.png`

Live route continues to mount `views/FarmsStudio/FarmsStudioScreen.tsx` as  
**LEGACY_IMPLEMENTATION** until modular cutover.  
ARCHITECTURE_000 introduces **no UI cutover**.

---

## Architecture owner

| | |
| --- | --- |
| **Owner** | Organ 01 — Melega DEX Product Architecture |
| **Owns** | Module plan, primary domains, canonical status vocabulary, shared runtime model, migration/certification gates |
| **Does not own** | On-chain farm deployment, MasterChef ABIs, wallet connection chrome, Pools/Liquidity product surfaces |

---

## Shared boundaries (all modules)

| Area | Ownership |
| --- | --- |
| Global Header | Frozen — `app-shell` / `MelegaGlobalHeader` |
| Trending Bar | Frozen — existing AppShell trending ribbon only |
| Canonical status | Shared runtime status resolver (future single module) — vocabulary locked in ARCHITECTURE_000 |
| Wallet presence | Shared account hook only — no per-module wallet stacks |
| Stake / harvest / withdraw writes | Single action host boundary (`FarmsActionHost` + `views/Farms/hooks` until replaced) |
| Farm inventory / APR / LP classification | Shared farms state + adapters — modules consume, do not fork |
| Forbidden files | `exchange.ts`, `contracts.ts`, router, wallet core, swap, **pools core**, MasterChef ownership changes, NFT, token lists, Treasury authority |

---

## Primary domains (first level)

Only these first-level product domains:

1. **My Farms**
2. **Explore Farms**
3. **Finished Farms**

Hero, KPIs, Yield Advisor, and Analytics support those domains — they are not alternate first-level IA.

---

## MODULE 000 — Architecture Lock (this mission)

| | |
| --- | --- |
| **Owned artifacts** | `FARMS_ARCHITECTURE_000_REPORT.md`, this ownership map, `FARMS_RUNTIME_BOUNDARIES.md`, `FARMS_MODULE_DEPENDENCIES.md`, `farmsArchitecture000Contracts.ts`, `farms-architecture-000/*` evidence |
| **Forbidden** | CSS, React UI, route cutover, mockup numbers in production UI |
| **Depends on** | Founder-approved mockup freeze |

---

## MODULE 001 — Hero

| | |
| --- | --- |
| **Responsibility** | Introduce LP Yield Farming; primary framing CTAs (Explore Farms / How Farming Works when factual) |
| **Owned components** | `FarmsStudio/modules/FarmsHeroModule.tsx`, `FarmsHeroArtwork.tsx`, `FarmsHeroTrustPanel.tsx`, `farmsHeroTokens.ts` |
| **Mount point** | `FarmsStudioScreen` prepends `<FarmsHeroModule />`; legacy `FarmsStudioPageHeader` superseded for title/CTAs; legacy body (Your Farms / KPIs / Featured / Explore / Grid) retained until Integration 009 |
| **May consume** | Static product copy only; reserved `#explore-farms` Module 004 anchor (temporary legacy band) |
| **Forbidden** | Inventing live KPIs; owning wallet/reward state; redesigning Global Header; Modules 002–010 |
| **Depends on** | ARCHITECTURE_000 certified |
| **Status** | Implemented on `farms-module-001-hero` |

---

## MODULE 002 — Overview KPIs

| | |
| --- | --- |
| **Responsibility** | Read-only strip: Total Farm TVL, Active Farms, Active Farmers, 24H Rewards, Highest Sustainable APR, My Harvestable |
| **Owned components** | `FarmsStudio/modules/FarmsOverviewKpisModule.tsx`, `useFarmsOverviewKpis.ts`, `buildFarmsOverviewKpis.ts`, `farmsOverviewKpisTokens.ts`, `farmsOverviewKpisTypes.ts` |
| **Mount point** | `FarmsStudioScreen` mounts `<FarmsOverviewKpisModule />` directly under Hero; legacy `FarmsKpiRow` superseded for this strip |
| **May consume** | Shared farms runtime / APR display / wallet pending rewards / cake price |
| **Forbidden** | Invented zeros; emission projections as 24H rewards; unique-farmer estimates; Pools TVL; Modules 003–010; Module 001 edits |
| **Depends on** | MODULE 001 |
| **Status** | Implemented on `farms-module-002-overview-kpis` |

---

## MODULE 003 — My Farms

| | |
| --- | --- |
| **Responsibility** | Wallet-scoped LP positions: stake, pending rewards, Harvest / Withdraw / Manage |
| **Owned components** | `FarmsMyFarmsModule.tsx`, `FarmsMyFarmCard.tsx`, `farmsMyFarmsTokens.ts`, `farmsMyFarmsTypes.ts`, `buildFarmsWalletPositions.ts`, `useFarmsWalletPositions.ts` |
| **Mount point** | `FarmsStudioScreen` directly after Module 002; supersedes legacy `YourFarmsSection` for the My Farms surface. The View all destination temporarily scrolls to `#explore-farms`. |
| **May consume** | Shared farm portfolio + `FarmsActionHost` |
| **Forbidden** | Second wallet LP scan; Pools SmartChef ownership; Modules 004–010 content |
| **Depends on** | MODULE 002 |
| **Status** | Implemented on `farms-module-003-my-farms` |

---

## MODULE 004 — Explore Farms

| | |
| --- | --- |
| **Responsibility** | Public registry of currently ACTIVE LP farms: search, filters, sort, Stake, Details |
| **Owned components** | `FarmsExploreFarmsModule.tsx`, `FarmsExploreFarmCard.tsx`, `farmsExploreFarmsTokens.ts`, `farmsExploreFarmsTypes.ts`, `buildFarmsExploreFarms.ts`, `useFarmsExploreFarms.ts` |
| **Mount point** | `FarmsStudioScreen` directly after Module 003; owns `#explore-farms`. Supersedes legacy `FarmsFilterRow` + `FarmsGrid` active browser (files retained). |
| **May consume** | Shared farm inventory + APR rules + ActionHost |
| **Forbidden** | Ended / historical farms; inventing APR/TVL; Modules 005–010 |
| **Depends on** | MODULE 003 |
| **Status** | Implemented on `farms-module-004-explore-farms` |

---

## MODULE 005 — Finished Farms

| | |
| --- | --- |
| **Responsibility** | Wallet-scoped ended archive: Withdraw / Emergency Withdraw / remaining claim |
| **Owned components** | `FarmsFinishedFarmsModule.tsx`, `FarmsFinishedFarmCard.tsx`, `farmsFinishedFarmsTokens.ts`, `farmsFinishedFarmsTypes.ts`, `buildFarmsFinishedFarms.ts`, `useFarmsFinishedFarms.ts` |
| **Mount point** | `FarmsStudioScreen` directly after Module 004; owns `#finished-farms`. Supersedes legacy Finished-chip / history-grid presentation of wallet recovery positions (files retained; `/farms/history` remains available via Show closed history). |
| **May consume** | Shared farm portfolio + ActionHost |
| **Forbidden** | ACTIVE explore farms; historical farms without wallet ownership; Modules 006–010 |
| **Depends on** | MODULE 004 |
| **Status** | Implemented on `farms-module-005-finished-farms` |

---

## MODULE 006 — Yield Advisor

| | |
| --- | --- |
| **Responsibility** | Deterministic action priorities from factual wallet farm state: emergency withdraw, withdraw finished, harvest finished/active, inactive attention, or all-clear / unavailable |
| **Owned components** | `FarmsYieldAdvisorModule.tsx`, `FarmsYieldAdvisorCard.tsx`, `farmsYieldAdvisorTokens.ts`, `farmsYieldAdvisorTypes.ts`, `buildFarmsYieldAdvisor.ts`, `useFarmsYieldAdvisor.ts` |
| **Mount point** | `FarmsStudioScreen` after Module 005; portals into Module 003 reserved `[data-farms-module-006-slot="reserved"]` (424×360). Inline below Finished Farms at ≤1199px. Supersedes legacy `AIYieldAdvisorPanel` in the Featured/Advisor grid (file retained). |
| **May consume** | Shared portfolio + `FarmsActionHost` (Harvest / Withdraw / Emergency Withdraw only) |
| **Forbidden** | AI / predicted advice; APR opportunity recommendations; future earnings; modifying Modules 001–005; Modules 007–010 |
| **Depends on** | MODULE 003–005 |
| **Status** | Implemented on `farms-module-006-yield-advisor` |
| **Note** | Mockup may label this “AI”; rebuild product name is **Yield Advisor** — factual only |

---

## MODULE 007 — Analytics

| | |
| --- | --- |
| **Responsibility** | Factual LP farm ecosystem summary: Farm Distribution, Reward Distribution, Participation, Farm Health |
| **Owned components** | `FarmsAnalyticsModule.tsx`, `FarmsAnalyticsPanel.tsx`, `farmsAnalyticsTokens.ts`, `farmsAnalyticsTypes.ts`, `buildFarmsAnalytics.ts`, `useFarmsAnalytics.ts` |
| **Mount point** | `FarmsStudioScreen` after Module 006 Yield Advisor; desktop band 1376×240 with four 330px panels and 18px gaps |
| **May consume** | Shared `portfolioFarms` aggregation only (no second indexer) |
| **Forbidden** | Mock charts; estimates/projections; predicted APR/TVL; modifying Modules 001–006; Module 008 |
| **Depends on** | MODULE 004 inventory (+ 001–006 composition freeze) |
| **Status** | Implemented on `farms-module-007-analytics` |

---

## MODULE 008 — Final Visual Polish

| | |
| --- | --- |
| **Responsibility** | Style-layer polish only |
| **Forbidden** | Geometry changes; runtime / queries / contracts; Modules 009–010 cutover logic |
| **Depends on** | MODULE 001–007 certified composition |

---

## MODULE 009 — Integration

| | |
| --- | --- |
| **Responsibility** | Wire modular shell to `/farms`; retire LEGACY_IMPLEMENTATION mount; preserve write safety |
| **Forbidden** | Parallel live mounts; leaving duplicate action hosts |
| **Depends on** | MODULE 001–008 |

---

## MODULE 010 — Certification

| | |
| --- | --- |
| **Responsibility** | End-to-end product certification of the LP farming center |
| **Depends on** | MODULE 009 |

---

## Delivery order

`000 → 001 → 002 → 003 → 004 → 005 → 006 → 007 → 008 → 009 → 010`

---

## Legacy freeze

| Surface | Status |
| --- | --- |
| `/farms` → `FarmsStudioScreen` | `LEGACY_IMPLEMENTATION` — feature work FORBIDDEN |
| `/farms/history`, `/_mp/farms` | Legacy — critical bugfixes only |
| Classic `views/Farms/*` write hooks | Retained for ActionHost until Integration |

---

## Relationship to Pools

| Product | Domain |
| --- | --- |
| **Pools** | Single-token staking |
| **Farms** | LP token staking |

Farms modules must not own Pools SmartChef inventory, Pools ActionHost, or Pools status vocabulary forks.
