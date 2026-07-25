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
| **Owned components (future)** | `PoolsStudio/modules/PoolsHero*` |
| **May consume** | Static product copy; Create Pool deep-link target when certified |
| **Forbidden** | Inventing live KPIs; owning wallet/reward state; redesigning Global Header |
| **Depends on** | ARCHITECTURE_000 certified |

---

## MODULE 002 — Overview KPIs

| | |
| --- | --- |
| **Responsibility** | Read-only ecosystem health strip (TVL, pools discovered, rewarding, 24h rewards, highest APR, my claimable) |
| **Owned components (future)** | `PoolsOverviewKpis*` |
| **May consume** | Shared pools aggregation + wallet claimable summary |
| **Forbidden** | Duplicating Explore table logic; fabricating percentages; wallet write paths |
| **Depends on** | MODULE 001 |

---

## MODULE 003 — My Positions

| | |
| --- | --- |
| **Responsibility** | Pools that belong to the connected wallet: staked, APR, rewards, claimable, Claim / Manage |
| **Owned components (future)** | `PoolsMyPositions*` |
| **May consume** | Shared wallet portfolio builder + single action host |
| **Forbidden** | Second wallet portfolio implementation; embedding Explore registry; Farms positions |
| **Depends on** | MODULE 002 |

---

## MODULE 004 — Explore Pools

| | |
| --- | --- |
| **Responsibility** | Public registry: search, filters, category tabs, pool rows, Stake entry |
| **Owned components (future)** | `PoolsExplore*`, filters, table/list presentation |
| **May consume** | Shared inventory + status resolver + action host |
| **Forbidden** | Mixing Finished into Explore without status discipline; inventing APR; duplicating My Positions cards |
| **Depends on** | MODULE 003 |

---

## MODULE 005 — Finished Pools

| | |
| --- | --- |
| **Responsibility** | Ended / withdraw-only archive: withdraw path, honest ended status |
| **Owned components (future)** | `PoolsFinished*` |
| **May consume** | Shared status resolver (`ENDED`, `WITHDRAW_ONLY`) + action host withdraw |
| **Forbidden** | Showing ended pools as Active; hiding withdrawable stakes |
| **Depends on** | MODULE 004 |

---

## MODULE 006 — Reward Advisor

| | |
| --- | --- |
| **Responsibility** | Compact advisory sidebar: strategy selector, top recommendation, analyze CTA |
| **Owned components (future)** | `PoolsRewardAdvisor*` |
| **May consume** | Shared live pool metrics only; must disclose heuristic/partial when incomplete |
| **Forbidden** | Fabricated AI certainty; second APR engine; purchase/stake execution outside action host |
| **Depends on** | MODULE 003–004 data availability |

---

## MODULE 007 — Analytics

| | |
| --- | --- |
| **Responsibility** | Distribution / summary analytics for the staking center (e.g. type mix, totals) |
| **Owned components (future)** | `PoolsAnalytics*` |
| **May consume** | Shared aggregation from inventory |
| **Forbidden** | Mock charts; conflicting totals vs Overview KPIs without provenance |
| **Depends on** | MODULE 004 |

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
