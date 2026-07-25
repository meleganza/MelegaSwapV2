# Melega DEX Pools — Module Ownership Map

**Architecture:** `POOLS_ARCHITECTURE_000`  
**Route:** `/pools`  
**Product model:** Complete staking center (not a card grid)

Visual source of truth:  
`apps/web/docs/runtime/pools-architecture-000/pools-founder-mockup-lock.png`

Live route continues to mount `views/PoolsStudio/PoolsStudioScreen.tsx` as  
**LEGACY_IMPLEMENTATION** until modular cutover.  
ARCHITECTURE_000 introduces **no UI cutover**.

---

## Architecture owner

| | |
| --- | --- |
| **Owner** | Organ 01 — Melega DEX Product Architecture |
| **Owns** | Module plan, primary domains, canonical status vocabulary, shared runtime model, migration/certification gates |
| **Does not own** | On-chain pool deployment, MasterChef/SousChef ABIs, wallet connection chrome, Farms/Liquidity product surfaces |

---

## Shared boundaries (all modules)

| Area | Ownership |
| --- | --- |
| Global Header | Frozen — `app-shell` / `MelegaGlobalHeader` |
| Trending Bar | Frozen — existing AppShell trending ribbon only |
| Canonical status | Shared runtime status resolver (future single module) — vocabulary locked in ARCHITECTURE_000 |
| Wallet presence | Shared account hook only (`useAccount` / existing wallet modal) — no per-module wallet stacks |
| Stake / unstake / harvest writes | Single action host boundary (legacy `PoolsActionHost` + `views/Pools/hooks` until replaced) |
| Pool inventory / APR / classification | Shared pools state + classification adapters — modules consume, do not fork |
| Forbidden files | `exchange.ts`, `contracts.ts`, router, wallet core, swap, farms core, MasterChef ownership changes, NFT, token lists, Treasury authority |

---

## Primary domains (first level)

Only these first-level product domains:

1. **My Positions**
2. **Explore Pools**
3. **Finished**

Hero, KPIs, Reward Advisor, and Analytics are modules that support those domains — they are not alternate first-level IA.

---

## MODULE 000 — Architecture Lock (this mission)

| | |
| --- | --- |
| **Owned artifacts** | `POOLS_ARCHITECTURE_000_REPORT.md`, this ownership map, `poolsArchitecture000Contracts.ts`, `pools-architecture-000/*` evidence |
| **Forbidden** | CSS, React UI, route cutover, mockup numbers in production UI |
| **Depends on** | Founder-approved mockup freeze |

---

## MODULE 001 — Hero

| | |
| --- | --- |
| **Responsibility** | Staking-center positioning, primary CTAs (Create Pool / How it Works), why-stake framing |
| **Owned components** | `PoolsStudio/modules/PoolsHeroModule.tsx`, `PoolsHeroArtwork.tsx`, `PoolsHeroTrustPanel.tsx`, `poolsHeroTokens.ts` |
| **Mount point** | `PoolsStudioScreen` prepends `<PoolsHeroModule />`; legacy `PoolsStudioPageHeader` superseded for title/CTAs; legacy body (positions/KPIs/explore/create) retained until Integration 009 |
| **May consume** | Static product copy; `#create-pool` / Build Studio staking intent |
| **Forbidden** | Inventing live KPIs; owning wallet/reward state; redesigning Global Header; Modules 002–010 |
| **Depends on** | ARCHITECTURE_000 certified |
| **Status** | Implemented on `pools-module-001-hero` |

---

## MODULE 002 — Overview KPIs

| | |
| --- | --- |
| **Responsibility** | Read-only ecosystem health strip (TVL, pools discovered, rewarding, 24h rewards, highest APR, my claimable) |
| **Owned components** | `PoolsStudio/modules/PoolsOverviewKpisModule.tsx`, `usePoolsOverviewKpis.ts`, `poolsOverviewKpisTokens.ts`, `poolsOverviewKpisTypes.ts` |
| **Mount point** | `PoolsStudioScreen` immediately after Module 001 Hero; legacy `PoolsKpiRow` superseded |
| **May consume** | Shared pools runtime / classification / `poolsAprRules` / wallet pending rewards |
| **Forbidden** | Factory pair counts as Pools Discovered; inventing 24H rewards from emission projections; false `$0` for unavailable valuation; Modules 003–010 |
| **Depends on** | MODULE 001 |
| **Status** | Implemented on `pools-module-002-overview-kpis` |

---

## MODULE 003 — My Positions

| | |
| --- | --- |
| **Responsibility** | Pools that belong to the connected wallet: staked, rewards, claimable, Claim / Manage / Withdraw |
| **Owned components** | `PoolsStudio/modules/PoolsMyPositionsModule.tsx`, `PoolsMyPositionCard.tsx`, `usePoolsWalletPositions.ts`, `buildPoolsWalletPositions.ts`, `poolsMyPositionsTokens.ts`, `poolsMyPositionsTypes.ts` |
| **Mount point** | `PoolsStudioScreen` immediately after Module 002 Overview KPIs; legacy `YourPoolsSection` superseded for the My Positions surface (file retained for legacy tests) |
| **May consume** | Shared `portfolioPools` + `PoolsActionHost` (`requestModal`); wallet connect button |
| **Forbidden** | Second wallet portfolio scan; Farms / LP / Factory ownership; Modules 004–010 content; mutating Hero / KPI geometry |
| **Depends on** | MODULE 002 |
| **Status** | Implemented on `pools-module-003-my-positions` |

---

## MODULE 004 — Explore Pools

| | |
| --- | --- |
| **Responsibility** | Public registry of currently ACTIVE stakeable pools: search, filters, sort, Stake entry |
| **Owned components** | `PoolsStudio/modules/PoolsExplorePoolsModule.tsx`, `PoolsExplorePoolCard.tsx`, `usePoolsExplorePools.ts`, `buildPoolsExplorePools.ts`, `poolsExplorePoolsTokens.ts`, `poolsExplorePoolsTypes.ts` |
| **Mount point** | `PoolsStudioScreen` immediately after Module 003; supersedes legacy `PoolsViewToolbar` + `PoolsGrid` explorer surface |
| **May consume** | Shared `portfolioPools` + `poolsAprRules` + `PoolsActionHost` |
| **Forbidden** | Ended / withdraw-only / historical pools; Factory AMM as staking pools; inventing APR/TVL; Modules 005–010 |
| **Depends on** | MODULE 003 |
| **Status** | Implemented on `pools-module-004-explore-pools` |

---

## MODULE 005 — Finished Pools

| | |
| --- | --- |
| **Responsibility** | Wallet-scoped ended archive: Withdraw / Emergency Withdraw / remaining claim |
| **Owned components** | `PoolsStudio/modules/PoolsFinishedPoolsModule.tsx`, `PoolsFinishedPoolCard.tsx`, `usePoolsFinishedPools.ts`, `buildPoolsFinishedPools.ts`, `poolsFinishedPoolsTokens.ts`, `poolsFinishedPoolsTypes.ts` |
| **Mount point** | `PoolsStudioScreen` immediately after Module 004 Explore Pools |
| **May consume** | Shared `portfolioPools` + `PoolsActionHost`; amount formatters from Module 003 (read-only import) |
| **Forbidden** | ACTIVE explore pools; historical pools without wallet ownership; Modules 006–010 |
| **Depends on** | MODULE 004 |
| **Status** | Implemented on `pools-module-005-finished-pools` |

---

## MODULE 006 — Reward Advisor

| | |
| --- | --- |
| **Responsibility** | Factual priority advisor: claim / withdraw / emergency / ending soon / high APR |
| **Owned components** | `PoolsStudio/modules/PoolsRewardAdvisorModule.tsx`, `PoolsRewardAdvisorCard.tsx`, `usePoolsRewardAdvisor.ts`, `buildPoolsRewardAdvisor.ts`, `poolsRewardAdvisorTokens.ts`, `poolsRewardAdvisorTypes.ts` |
| **Mount point** | Portals into Module 003 reserved `data-pools-module-006-slot`; tablet/mobile inline after Module 005 |
| **May consume** | Shared `portfolioPools` + `PoolsActionHost` + `poolsAprRules` |
| **Forbidden** | AI / predicted advice; dead actions; modifying Modules 001–005; Modules 007–010 |
| **Depends on** | MODULE 003 reserved slot + MODULE 005 |
| **Status** | Implemented on `pools-module-006-reward-advisor` |

---

## MODULE 007 — Analytics

| | |
| --- | --- |
| **Responsibility** | Factual ecosystem analytics: pool distribution, reward share, participation, pool health |
| **Owned components** | `PoolsStudio/modules/PoolsAnalyticsModule.tsx`, `PoolsAnalyticsPanel.tsx`, `usePoolsAnalytics.ts`, `buildPoolsAnalytics.ts`, `poolsAnalyticsTokens.ts`, `poolsAnalyticsTypes.ts` |
| **Mount point** | `PoolsStudioScreen` immediately after Module 006 Reward Advisor |
| **May consume** | Shared `portfolioPools` + classification rewarding count |
| **Forbidden** | Mock charts; estimates/projections; animated graphs; modifying Modules 001–006; Modules 008–010 |
| **Depends on** | MODULE 004–006 inventory |
| **Status** | Implemented on `pools-module-007-analytics` |

---

## MODULE 008 — Visual Polish

| | |
| --- | --- |
| **Responsibility** | Cross-module visual fidelity to Founder mockup; spacing, legend, footer CTA band |
| **Forbidden** | Geometry changes to certified modules without recert; production mock numbers |
| **Depends on** | MODULE 001–007 desktop composition |

---

## MODULE 009 — Integration

| | |
| --- | --- |
| **Responsibility** | Wire modular shell to `/pools`; retire LEGACY_IMPLEMENTATION mount; preserve write safety |
| **Forbidden** | Parallel live mounts; leaving duplicate action hosts |
| **Depends on** | MODULE 001–008 |

---

## MODULE 010 — Certification

| | |
| --- | --- |
| **Responsibility** | End-to-end product certification of the staking center |
| **Depends on** | MODULE 009 |

---

## Shared runtime model (single owners)

| Concern | Single owner (future) | Must not be reimplemented per module |
| --- | --- | --- |
| Pool inventory fetch | Shared pools runtime | Explore / KPIs / Advisor / Analytics |
| Wallet positions | Shared portfolio adapter | My Positions / KPIs claimable |
| Status resolution | Shared status resolver | Explore / Finished / cards |
| Reward claim / stake / unstake / withdraw | Single action host | All modules |
| APR presentation rules | Shared APR rules | Explore / Positions / Advisor |
| Classification (LP / Stake / …) | Shared classification | Explore filters / Analytics |

---

## Legacy freeze

| Surface | Status |
| --- | --- |
| `views/PoolsStudio/**` (current screen) | **LEGACY_IMPLEMENTATION** — maintenance / critical bugfix only |
| `views/Pools/**` (hooks, modals, history) | **LEGACY_WRITE_PATH** — retained until action-host replacement |
| `pages/pools/index.tsx` | Continues mounting Studio until MODULE 009 |
| `pages/pools/history.tsx` / `_mp/pools` | Legacy — schedule retirement in Integration |

---

## Regression rule

No later module may modify:

- previously certified module component files;
- previously certified shared runtime contracts for earlier modules;
- Global Header / Trending Bar;
- Farms / Liquidity / Swap / wallet / contracts / exchange cores;
- Architecture_000 mockup bytes or SHA.

Certification dependency chain:  
`000 → 001 → 002 → 003 → 004 → 005 → 006 → 007 → 008 → 009 → 010`
