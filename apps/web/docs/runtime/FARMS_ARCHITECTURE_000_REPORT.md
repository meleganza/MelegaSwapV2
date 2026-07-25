# FARMS_ARCHITECTURE_000_REPORT

## 1. Verdict

**FARMS_ARCHITECTURE_000_CERTIFIED**

## 2. Branch

`farms-architecture-000`

## 3. Commit

`bd6551909c126e0665751da74da7d1a5f111f809`

## 4. Mission scope

Lock the Founder-approved Farms redesign workflow.  
**No production UI changes. No CSS. No React redesign.**  
Architecture, freeze, ownership, shared model, migration, and certification strategy only.

## 5. Production baseline

Worktree from certified Pools V1 tip `99258574`.  
Worktree: `/Users/marcomelega/Projects/MelegaSwapV2-farms-arch000`

## 6. Current legacy analysis

| Item | Finding |
| --- | --- |
| Canonical route | `/farms` → `pages/farms/index.tsx` → `FarmsStudioScreen` |
| Studio tree | `views/FarmsStudio/*` + `farmsRuntime/*` |
| Write path | Bridges to legacy `views/Farms` hooks via `FarmsActionHost` |
| History / mp | `/farms/history`, `/_mp/farms` still mount classic Farms |
| Composition today | Header → Your Farms → KPI row → Featured + AI Advisor → filters → grid → activity table |
| Docs debt | Runtime/screenshot reports exist; **no MODULE ownership map** before this mission |

### Structural failure modes (why replacement is authorized)

1. **Confusing LP presentation** — pair identity, logos, and formatted amounts are inconsistent; raw uint256-class values still surface.
2. **Duplicated controls** — Stake / Details / filter chips / advisor CTAs compete without a single action vocabulary.
3. **Unstable hierarchy** — featured farm, AI advisor, grid, and side lists behave as peer “pages inside a page.”
4. **Weak active vs historical separation** — Finished / My Farms / Explore are not first-class domains.
5. **Pools inconsistency** — Farms and Pools share Earn IA but not a modular shared-boundary methodology.
6. **Maintenance impossibility** — Founder review: further feature work on the legacy Farms page is unauthorized.

**Classification:** current Farms = `LEGACY_IMPLEMENTATION`.

## 7. Reasons for replacement

- Founder review: legacy architecture cannot be evolved incrementally.
- Product model mismatch: Farms is an **LP yield farming center**, not a list of cards.
- Certified Melega methodology (Liquidity / Passport / Pools Architecture 000) requires one-responsibility modules + shared runtime boundaries.
- Mockup defines a clear modular composition for surgical delivery.

## 8. Founder-approved mockup lock

| | |
| --- | --- |
| Path | `apps/web/docs/runtime/farms-architecture-000/farms-founder-mockup-lock.png` |
| SHA-256 | `a19e506f7d7a5194050d52481f0b220bad30e4a774e3fde2529b37e830db848a` |
| Bytes | 148024 |
| Dimensions | 1024 × 682 |
| Format | JPEG JFIF (stored at mission `.png` path; **not** recompressed) |
| Byte-identical to Cursor asset | **yes** |
| Source asset | `MELEGADEX_FARMS_PAGE-5f95d1a6-4ebf-4e87-acea-2d86624f08ea.png` |

**Honesty note:** Mockup metrics (TVL, APR, counts) are illustrative only — never production data.  
Mockup “AI Yield Advisor” maps to product **Yield Advisor** (deterministic / factual only).

Evidence: `farms-architecture-000/mockup-integrity.json`

## 9. New product model

Pools = Single-token staking.  
Farms = LP token staking.

Farms answers:

1. Which LP farms exist?
2. Which LP farms belong to me?
3. Which LP farms finished?
4. Which LP rewards are claimable?
5. Which LP should I farm next?

**Primary domains (first level only):** My Farms · Explore Farms · Finished Farms

## 10. Module decomposition

| Module | Name | Role |
| --- | --- | --- |
| 000 | Architecture | Lock (this mission) |
| 001 | Hero | Introduce LP Yield Farming (no runtime data) |
| 002 | Overview KPIs | TVL · Active Farms · Rewards · Highest APR · Wallet Claimable |
| 003 | My Farms | Wallet LP positions · Harvest / Withdraw / Manage |
| 004 | Explore Farms | ACTIVE LP registry · search / filters / Stake |
| 005 | Finished Farms | Wallet-scoped ended LP archive |
| 006 | Yield Advisor | Deterministic priorities (no AI / prediction) |
| 007 | Analytics | Distribution / participation / farm health |
| 008 | Final Visual Polish | Style layer only |
| 009 | Integration | Route cutover; retire legacy mount |
| 010 | Certification | Full farming-center certification |

Contracts: `views/FarmsStudio/farmsArchitecture000Contracts.ts`  
Ownership: `FARMS_MODULE_OWNERSHIP_MAP.md`  
Boundaries: `FARMS_RUNTIME_BOUNDARIES.md`  
Dependencies: `FARMS_MODULE_DEPENDENCIES.md`

## 11. Shared runtime

| Concern | Rule |
| --- | --- |
| Inventory | One farms orchestration path |
| Wallet LP positions | One portfolio adapter |
| Status | Canonical vocabulary only |
| Actions | One ActionHost |
| APR / TVL | Derived; never invented |
| Layout | No duplicated page shells per module |

Canonical status:

`ACTIVE` · `ENDED` · `WITHDRAW_ONLY` · `EMERGENCY` · `PARTIAL` · `UNAVAILABLE` · `LOADING`

## 12. Wallet / reward / LP ownership

| Concern | Owner |
| --- | --- |
| Wallet presence | Shared account hook |
| LP balances | Source of truth via farms portfolio adapter |
| Pending rewards / emissions | Source of truth via farm contracts + shared formatters |
| Stake / Harvest / Withdraw / Emergency | Single ActionHost |
| APR / TVL / Advisor / Analytics | Derived presenters only |

## 13. Migration strategy

| Phase | Action |
| --- | --- |
| Now | Freeze legacy; critical bugfixes only |
| 001–008 | Modular missions; `/farms` stays legacy until Integration |
| 009 | Cutover `/farms` to modular shell |
| 010 | Full certification |

Evidence: `farms-architecture-000/migration-strategy.json`  
Freeze record: `farms-architecture-000/legacy-implementation-freeze.json`

## 14. Certification strategy

1. ARCHITECTURE_000 locks mockup + ownership + contracts (this mission).
2. Each MODULE_00X implements **one** responsibility.
3. Predecessor modules freeze after certification.
4. Integration (009) is the only cutover mission.
5. Certification (010) requires live LP positions, explore registry, finished withdraw/harvest, honest unavailable/partial, build + focused tests, no production mock numbers.

Evidence: `farms-architecture-000/certification-strategy.json`

## 15. What this mission did **not** do

- No CSS / React UI / visual redesign
- No route cutover
- No changes to MasterChef / harvest contracts or wallet
- No merge, no deploy

## 16. Tests

`farmsArchitecture000.mockupLock.test.ts` — mockup SHA, contracts, ownership map, runtime boundaries, dependencies, legacy freeze, route still on Studio.

## 17. Exact next mission

**FARMS_MODULE_001_HERO**

Implement Hero only against the Founder mockup. Preserve `/farms` on `LEGACY_IMPLEMENTATION`. Do not rebuild Explore/My Farms in 001.

---

## Roadmap

1. MODULE 001 — Hero  
2. MODULE 002 — Overview KPIs  
3. MODULE 003 — My Farms  
4. MODULE 004 — Explore Farms  
5. MODULE 005 — Finished Farms  
6. MODULE 006 — Yield Advisor  
7. MODULE 007 — Analytics  
8. MODULE 008 — Final Visual Polish  
9. MODULE 009 — Integration  
10. MODULE 010 — Certification  
