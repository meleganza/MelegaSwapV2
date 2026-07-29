# POOLS_ARCHITECTURE_000_REPORT

## 1. Verdict

**POOLS_ARCHITECTURE_000_CERTIFIED**

## 2. Branch

`pools-architecture-000-mockup-lock`

## 3. Commit

_(filled after commit)_

## 4. Mission scope

Lock the Founder-approved Pools redesign workflow.  
**No production UI changes. No CSS. No React redesign.**  
Architecture, freeze, ownership, shared model, migration, and certification strategy only.

## 5. Production baseline

`origin/main` @ `ff6d6179` (contains certified runtime-recovery ancestry `8f336d9e` / `2e8f6c2e`).

Worktree: `/Users/marcomelega/Projects/MelegaSwapV2-pools-arch000`

## 6. Current legacy analysis

| Item | Finding |
| --- | --- |
| Canonical route | `/pools` → `pages/pools/index.tsx` → `PoolsStudioScreen` |
| Studio tree | `views/PoolsStudio/*` + `poolsRuntime/*` |
| Write path | Still bridges to legacy `views/Pools` modals/hooks (`PoolsActionHost`) |
| History / mp | `/pools/history`, `/_mp/pools` still mount classic `views/Pools` |
| State | `state/pools/*` + `config/constants/pools.tsx` |
| Classification | `/api/pools/classification` + SmartChef discovery |
| Docs debt | Runtime/activation/recovery reports exist; **no MODULE ownership map** before this mission |

### Structural failure modes (why replacement is authorized)

1. **Split brain** — Studio presentation vs legacy write/history surfaces.
2. **Unstable hierarchy** — featured hero, card grid, filters, analytics, and advisor compete as peer “pages inside a page,” not a staking-center IA.
3. **Duplication** — wallet portfolio builders parallel Farms/Liquidity; modals duplicated under `Modals/` and `PoolCard/Modals/`.
4. **Mixed concepts** — LP / stake / vault / campaign history / Cake-era naming collide without a canonical status model.
5. **Unstable rendering** — Founder-reported cards appearing/disappearing and inconsistent runtime presentation cannot be repaired incrementally inside the legacy composition.
6. **Maintenance impossibility** — further feature work inside the current page is unauthorized.

**Classification:** current Pools = `LEGACY_IMPLEMENTATION`.

## 7. Reasons for replacement

- Founder review: unstable rendering, confusing hierarchy, poor usability.
- Last large surface still on pre-modular architecture.
- Product model mismatch: Pools is a **staking center**, not a list of cards.
- Certified Melega methodology requires one-responsibility modules + shared runtime boundaries (as with Liquidity modules / Passport ARCHITECTURE_000).

## 8. Founder-approved mockup lock

| | |
| --- | --- |
| Path | `apps/web/docs/runtime/pools-architecture-000/pools-founder-mockup-lock.png` |
| SHA-256 | `549ca3bb663315730945de4ada9bc36559399cf3e9ce72a59de4d10f89558d4f` |
| Bytes | 166617 |
| Dimensions | 934 × 1024 |
| Format | JPEG JFIF (stored at mission `.png` path; **not** recompressed) |
| Byte-identical to Cursor asset | **yes** |

Evidence: `pools-architecture-000/mockup-integrity.json`

## 9. New product model

Pools answers:

1. What pools exist?
2. Which pools belong to me?
3. Which pools finished?
4. Which rewards are claimable?
5. Which withdrawals are available?

**Primary domains (first level only):** My Positions · Explore Pools · Finished

## 10. Module decomposition

| Module | Name | Role |
| --- | --- | --- |
| 000 | Architecture | Lock (this mission) |
| 001 | Hero | Positioning + Create Pool / How it Works |
| 002 | Overview KPIs | Read-only ecosystem + my claimable strip |
| 003 | My Positions | Wallet-owned stakes + Claim / Manage |
| 004 | Explore Pools | Public registry, filters, Stake |
| 005 | Finished Pools | Ended / withdraw-only archive |
| 006 | Reward Advisor | Sidebar recommendations (honest heuristics) |
| 007 | Analytics | Distribution / summary charts |
| 008 | Visual Polish | Mockup fidelity / legend / footer band |
| 009 | Integration | Route cutover; retire legacy mount |
| 010 | Certification | Full staking-center certification |

Contracts: `views/PoolsStudio/poolsArchitecture000Contracts.ts`  
Ownership: `POOLS_MODULE_OWNERSHIP_MAP.md`

## 11. Ownership map

See `apps/web/docs/runtime/POOLS_MODULE_OWNERSHIP_MAP.md`.

Architecture owner: Organ 01 — Melega DEX Product Architecture.  
Module owners: as listed per MODULE 001–010.  
Shared boundaries: single wallet/reward/status/action-host owners.  
Forbidden: `exchange.ts`, `contracts.ts`, router/wallet/swap/farms cores, NFT, token lists, Treasury authority.

## 12. Shared runtime model

| Concern | Rule |
| --- | --- |
| Inventory | One fetch/orchestration path |
| Wallet positions | One portfolio adapter |
| Status | Canonical vocabulary only (below) |
| Actions | One action host for stake/unstake/claim/withdraw |
| APR / classification | Shared rules; modules present, do not fork |
| Layout | No duplicated page shells per module |

Canonical status:

`ACTIVE` · `ENDED` · `WITHDRAW_ONLY` · `EMERGENCY` · `UNAVAILABLE` · `PARTIAL` · `LOADING`

Evidence: `pools-architecture-000/shared-runtime-model.json`, `canonical-pool-status.json`

## 13. Certification strategy

1. ARCHITECTURE_000 locks mockup + ownership + contracts (this mission).
2. Each MODULE_00X mission implements **one** responsibility against the mockup.
3. Predecessor modules become byte/geometry frozen after certification.
4. No module may reintroduce card-grid-as-page IA or duplicate wallet/reward logic.
5. Integration (009) is the only mission authorized to cut `/pools` away from `LEGACY_IMPLEMENTATION`.
6. Certification (010) requires live wallet positions, explore registry, finished withdraw path, honest unavailable/partial states, build + focused tests, no production mock numbers.

Evidence: `pools-architecture-000/certification-strategy.json`

## 14. Migration strategy

| Phase | Action |
| --- | --- |
| Now | Freeze legacy; critical bugfixes only; no feature work in Studio/legacy Pools UI |
| 001–008 | Build modular composition **off-route** or behind non-default mounts if needed; default `/pools` stays legacy until Integration |
| 009 | Cutover `/pools` to modular shell; keep write-path safety; retire history/mp debt on schedule |
| 010 | Full certification; archive legacy trees |

Evidence: `pools-architecture-000/migration-strategy.json`  
Freeze record: `pools-architecture-000/legacy-implementation-freeze.json`

## 15. What this mission did **not** do

- No CSS / React UI / visual redesign
- No route cutover
- No changes to stake/harvest contracts or wallet
- No merge, no deploy

## 16. Tests

`poolsArchitecture000.mockupLock.test.ts` — mockup SHA, contracts, ownership map, legacy freeze, route still on Studio.

## 17. Build

`yarn next build` — required pass (docs/contracts only; no UI delta).

## 18. Exact next mission

**POOLS_MODULE_001_HERO**

Implement Hero only against the Founder mockup. Preserve `/pools` on `LEGACY_IMPLEMENTATION`. Do not rebuild Explore/Positions in 001.

---

## Roadmap

1. MODULE 001 — Hero  
2. MODULE 002 — Overview KPIs  
3. MODULE 003 — My Positions  
4. MODULE 004 — Explore Pools  
5. MODULE 005 — Finished Pools  
6. MODULE 006 — Reward Advisor  
7. MODULE 007 — Analytics  
8. MODULE 008 — Visual Polish  
9. MODULE 009 — Integration  
10. MODULE 010 — Certification  
