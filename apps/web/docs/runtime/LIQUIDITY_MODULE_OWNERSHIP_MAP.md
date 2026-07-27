# Melega DEX Liquidity — Module Ownership Map

**Architecture:** `LIQUIDITY_ARCHITECTURE_000`  
**Routes:** `/liquidity` (classic nav) · `/liquidity-studio` (Studio)  
**Product model:** Liquidity center with two primary journeys

Visual source of truth:  
`apps/web/docs/runtime/liquidity-architecture-000/liquidity-founder-mockup-lock.png`

Live routes continue to mount:

- `/liquidity` → `views/Pool`
- `/liquidity-studio` → `views/LiquidityStudio/LiquidityStudioScreen` → `UnifiedLiquidityPage`

as **LEGACY_IMPLEMENTATION** until modular cutover.  
ARCHITECTURE_000 introduces **no UI cutover**.

Prior one-page reports (`LIQUIDITY_MODULE_001`–`007`) are **historical** and superseded as product architecture by this map.

---

## Architecture owner

| | |
| --- | --- |
| **Owner** | Organ 01 — Melega DEX Product Architecture |
| **Owns** | Module plan, primary journeys, shared runtime model, migration/certification gates, mockup freeze |
| **Does not own** | Pair Factory deployment, Router ownership, wallet connection chrome, Farms/Pools product surfaces, Treasury authority |

---

## Shared boundaries (all modules)

| Area | Ownership |
| --- | --- |
| Global Header | Frozen — `app-shell` / `MelegaGlobalHeader` |
| Trending Bar | Frozen — existing AppShell trending ribbon only |
| Wallet presence | Shared account hook only — no per-module wallet stacks |
| Mint / remove writes | Single action host boundary (`liquidityRuntime` bridges until replaced) |
| Pair inventory / LP classification | Shared liquidity runtime + adapters — modules consume, do not fork |
| Forbidden files | `exchange.ts`, `contracts.ts`, router, wallet core, swap, **farms core**, **pools core**, MasterChef, NFT, token lists, Treasury authority |

---

## Primary journeys (first level)

Only these first-level product journeys:

1. **Provide liquidity manually**
2. **Use Melega AI Liquidity Builder**

Hero, Actions, Pool Discovery, Market Snapshot, Positions, Analytics, and Visual Polish support those journeys — they are not alternate first-level IA.

Delivery sequence: **000 → 001 → 002 → 003 → 004 → 005 → 006 → 007 → 008 → 009 → 010**

---

## MODULE 000 — Architecture Lock (this mission)

| | |
| --- | --- |
| **Owned artifacts** | `LIQUIDITY_ARCHITECTURE_000_REPORT.md`, this ownership map, `LIQUIDITY_RUNTIME_BOUNDARIES.md`, `LIQUIDITY_MODULE_DEPENDENCIES.md`, `liquidityArchitecture000Contracts.ts`, `liquidity-architecture-000/*` evidence |
| **Forbidden** | CSS, React UI, route cutover, mockup numbers in production UI |
| **Depends on** | Founder-approved mockup freeze |

---

## MODULE 001 — Hero

| | |
| --- | --- |
| **Responsibility** | Introduce Liquidity; brand-level framing; name the two journeys; no execution |
| **Owned components** | `LiquidityStudio/modules/LiquidityHeroModule.tsx`, `LiquidityHeroArtwork.tsx`, `LiquidityHeroTrustPanel.tsx`, `liquidityHeroTokens.ts` |
| **Mount** | `pages/liquidity.tsx` mounts Module 001 **above** legacy `views/Pool` (`LEGACY_IMPLEMENTATION`). Studio shell unchanged in this mission. |
| **Evidence** | `apps/web/docs/runtime/liquidity-module-001-hero/` |
| **May consume** | Static product copy only |
| **Forbidden** | Inventing live KPIs / TVL / volume; owning wallet/LP state; Add Liquidity form; AI Builder execution; Modules 002–010; editing `views/Pool` / `liquidityRuntime` / contracts |
| **Depends on** | ARCHITECTURE_000 certified |

---

## MODULE 002 — Liquidity Actions

| | |
| --- | --- |
| **Responsibility** | Journey chooser between Manual Add and Melega AI Liquidity Builder (navigation + explanation only) |
| **Owned components** | `LiquidityStudio/modules/LiquidityActionsModule.tsx`, `liquidityActionsTokens.ts` |
| **Mount** | `pages/liquidity.tsx` mounts Module 002 **immediately after** Module 001 Hero, **above** legacy `views/Pool` |
| **Evidence** | `apps/web/docs/runtime/liquidity-module-002-actions/` |
| **May consume** | Journey routing intent + static availability flag only |
| **Forbidden** | Add Liquidity form / execution; AI Builder execution; mint math; pool registry; KPIs / fake numbers; Modules 003–010; editing Module 001 / `views/Pool` / `liquidityRuntime` / contracts |
| **Depends on** | MODULE 001 |

---

## MODULE 003 — Pool Discovery

| | |
| --- | --- |
| **Responsibility** | Discover / search / filter / sort liquidity pools; factual metrics only; navigation to `/add` |
| **Owned components** | `LiquidityStudio/modules/LiquidityPoolDiscoveryModule.tsx`, `LiquidityPoolDiscoveryCard.tsx`, `useLiquidityPoolDiscovery.ts`, `liquidityPoolDiscoveryModel.ts`, `liquidityPoolDiscoveryTokens.ts` |
| **Mount** | `pages/liquidity.tsx` mounts Module 003 **after** Module 002 Actions, **above** legacy `views/Pool` |
| **Evidence** | `apps/web/docs/runtime/liquidity-module-003-pool-discovery/` + `LIQUIDITY_MODULE_003_POOL_DISCOVERY_REPORT.md` |
| **May consume** | Factory indexer (`useMelegaFactoryPools` / `/api/indexer/pairs`), subgraph `usePoolDatasSWR` when present, address logo resolver |
| **Forbidden** | Parallel pair scanners; inventing TVL/volume/fees; deposits / approvals / mint; Modules 004–010; editing Modules 001–002 / `views/Pool` / contracts |
| **Depends on** | MODULE 002 |

---

## MODULE 004 — Add Liquidity

| | |
| --- | --- |
| **Responsibility** | Manual provide-liquidity path: pair select, amounts, ratio, slippage, approve, mint CTA |
| **Owned components** | `LiquidityStudio/modules/LiquidityAddModule.tsx`, `liquidityAddTokens.ts`, `liquidityAddCta.ts` |
| **Mount** | `pages/liquidity.tsx` mounts Module 004 **after** Module 003 Pool Discovery, **above** legacy `views/Pool` |
| **Evidence** | `apps/web/docs/runtime/liquidity-module-004-add-liquidity/` + `LIQUIDITY_MODULE_004_ADD_LIQUIDITY_REPORT.md` |
| **May consume** | Shared mint action host (`LiquidityRuntimeProvider` / `useLiquidityMintRuntime`), existing slippage (`useUserSlippageTolerance` via Settings), address logos |
| **Forbidden** | Second mint engine; second slippage model; AI Builder ownership; AMM/Router/Factory/contracts edits; Modules 005–010; editing Modules 001–003 |
| **Depends on** | MODULE 003 |

---

## MODULE 005 — Market Snapshot

| | |
| --- | --- |
| **Responsibility** | Compact factual ecosystem visibility: Total Liquidity, Active Pools, 24H Volume, Liquidity Providers (when sourced) |
| **Owned components** | `LiquidityStudio/modules/LiquidityMarketSnapshotModule.tsx`, `useLiquidityMarketSnapshot.ts`, `buildLiquidityMarketSnapshot.ts`, `liquidityMarketSnapshotTokens.ts` |
| **Mount** | `pages/liquidity.tsx` mounts Module 005 **after** Module 004 Add Liquidity, **above** legacy `views/Pool` |
| **Evidence** | `apps/web/docs/runtime/liquidity-module-005-market-snapshot/` + `LIQUIDITY_MODULE_005_MARKET_SNAPSHOT_REPORT.md` |
| **May consume** | `useProtocolDataSWR` (TVL / 24H volume), `useMelegaFactoryPools` (active pool count) — read-only |
| **Forbidden** | Fake TVL/volume/users/APR; “Awaiting Indexer”; mint runtime / Router / Factory / contracts edits; Modules 006–010; editing Modules 001–004 |
| **Depends on** | MODULE 004 |

---

## MODULE 006 — Your Positions

| | |
| --- | --- |
| **Responsibility** | Wallet-scoped LP positions: review, manage, remove entry points |
| **Owned components** | `LiquidityStudio/modules/LiquidityMyPositionsModule.tsx`, `liquidityMyPositionsTokens.ts`, `liquidityMyPositionsModel.ts` |
| **Mount** | `pages/liquidity.tsx` mounts Module 006 **after** Module 005, inside shared `LiquidityRuntimeProvider` with Module 004 |
| **Evidence** | `apps/web/docs/runtime/liquidity-module-006-my-positions/` + `LIQUIDITY_MODULE_006_MY_POSITIONS_REPORT.md` |
| **May consume** | Shared LP rows (`useLiquidityPositions` via runtime), `useLiquidityPositionDetails`, `openRemoveModal` / `setMode` / currency seed |
| **Forbidden** | Second wallet LP scan; Farms/Pools duplication; new transaction logic; Modules 007–010; editing mint runtime / Router / contracts |
| **Depends on** | MODULE 002 (journey); page composition after MODULE 005 |

---

## MODULE 007 — Analytics

| | |
| --- | --- |
| **Responsibility** | Read-only liquidity behavior: growth, pool distribution, LP mint/burn activity, provider honesty |
| **Owned components** | `LiquidityStudio/modules/LiquidityAnalyticsModule.tsx`, `liquidityAnalyticsTokens.ts`, `buildLiquidityAnalytics.ts`, `useLiquidityAnalytics.ts` |
| **Mount** | `pages/liquidity.tsx` mounts Module 007 **after** Module 006, **outside** `LiquidityRuntimeProvider` |
| **Evidence** | `apps/web/docs/runtime/liquidity-module-007-analytics/` + `LIQUIDITY_MODULE_007_ANALYTICS_REPORT.md` |
| **May consume** | `useProtocolDataSWR`, factory indexer pairs, `useProtocolTransactionsIndexer` (mint/burn only) |
| **Forbidden** | Fake TVL/growth/providers/projections; swap dashboards; editing Add/Positions runtime; Router/Factory writes; Farms/Pools staking; Treasury/KERL/Economics; Modules 008–010 |
| **Depends on** | MODULE 004–006 data availability |

---

## MODULE 008 — Visual Polish

| | |
| --- | --- |
| **Responsibility** | Style layer only: shadows, borders, radii, hover, focus, transitions, skeletons, a11y chrome |
| **Owned components** | `LiquidityVisualPolishModule.tsx`, `LiquidityVisualPolishStyle.tsx`, `liquidityVisualPolishTokens.ts` |
| **Mount** | `pages/liquidity.tsx` mounts Module 008 as CSS-only layer (`data-liquidity-studio-screen` scope) |
| **Evidence** | `apps/web/docs/runtime/liquidity-module-008-final-visual-polish/` + `LIQUIDITY_MODULE_008_FINAL_VISUAL_POLISH_REPORT.md` |
| **May consume** | Modules 001–007 composition (existing `data-testid`s only) |
| **Forbidden** | Geometry / runtime / query / provider / Add Liquidity / analytics logic changes; inventing data; Modules 009–010 |
| **Depends on** | MODULE 001–007 composition |

---

## MODULE 009 — Integration (future)

| | |
| --- | --- |
| **Responsibility** | Canonical route cutover; retire `views/Pool` nav ambiguity and `UnifiedLiquidityPage` peer-panel IA |
| **Forbidden** | Parallel action hosts |

---

## MODULE 010 — Certification (future)

| | |
| --- | --- |
| **Responsibility** | Full liquidity-center certification across required viewports |
| **Forbidden** | New features / redesign during certification |

---

## AI Liquidity Builder ownership note

**Journey 2** entry is owned by **MODULE 002 (Liquidity Actions)**.  
The Builder flow surface is delivered as a journey implementation under Actions (and may reuse existing `liquidityBuilding/*` bridges until Integration 009).  
It must **not** reappear as a peer dashboard panel competing with Manual Add.
