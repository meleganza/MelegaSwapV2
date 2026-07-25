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
| **Owned components (future)** | `FarmsMyFarms*` |
| **May consume** | Shared farm portfolio + `FarmsActionHost` |
| **Forbidden** | Second wallet LP scan; Pools SmartChef ownership; Modules 004–010 content |
| **Depends on** | MODULE 002 |

---

## MODULE 004 — Explore Farms

| | |
| --- | --- |
| **Responsibility** | Public registry of currently ACTIVE LP farms: search, filters, sort, Stake, Details |
| **Owned components (future)** | `FarmsExploreFarms*` |
| **May consume** | Shared farm inventory + APR rules + ActionHost |
| **Forbidden** | Ended / historical farms; inventing APR/TVL; Modules 005–010 |
| **Depends on** | MODULE 003 |

---

## MODULE 005 — Finished Farms

| | |
| --- | --- |
| **Responsibility** | Wallet-scoped ended archive: Withdraw / Emergency Withdraw / remaining claim |
| **Owned components (future)** | `FarmsFinishedFarms*` |
| **May consume** | Shared farm portfolio + ActionHost |
| **Forbidden** | ACTIVE explore farms; historical farms without wallet ownership; Modules 006–010 |
| **Depends on** | MODULE 004 |

---

## MODULE 006 — Yield Advisor

| | |
| --- | --- |
| **Responsibility** | Deterministic priorities: harvest, withdraw ended LP, emergency, high APR opportunity |
| **Owned components (future)** | `FarmsYieldAdvisor*` |
| **May consume** | Shared portfolio + ActionHost + APR rules |
| **Forbidden** | AI / predicted advice; dead actions; modifying Modules 001–005; Modules 007–010 |
| **Depends on** | MODULE 003–005 |
| **Note** | Mockup may label this “AI”; rebuild product name is **Yield Advisor** — factual only |

---

## MODULE 007 — Analytics

| | |
| --- | --- |
| **Responsibility** | Distribution / reward tokens / participation / farm health — factual only |
| **Owned components (future)** | `FarmsAnalytics*` |
| **May consume** | Shared aggregation from inventory |
| **Forbidden** | Mock charts; estimates/projections; Modules 008–010 |
| **Depends on** | MODULE 004 |

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
