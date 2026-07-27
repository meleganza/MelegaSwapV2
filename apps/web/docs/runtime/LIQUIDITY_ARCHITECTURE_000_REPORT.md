# LIQUIDITY_ARCHITECTURE_000_REPORT

## 1. Verdict

**LIQUIDITY_ARCHITECTURE_000_CERTIFIED**

## 2. Branch

`liquidity-architecture-000`

## 3. Commit

_(stamped at mission commit)_

## 4. Mission scope

Lock the Founder-approved Liquidity product architecture for a complete rebuild.  
**No production UI changes. No CSS. No React redesign.**  
**No feature / contract / liquidity execution / router / economics changes.**

Architecture, freeze, ownership, shared model, migration, mockup lock, and certification strategy only.

## 5. Production baseline

`origin/main` @ `ff6d6179`

Worktree: `/Users/marcomelega/Projects/MelegaSwapV2-liquidity-arch000`

## 6. Current legacy analysis

| Item | Finding |
| --- | --- |
| Nav route | `/liquidity` → `pages/liquidity.tsx` → `views/Pool` |
| Studio route | `/liquidity-studio` → `LiquidityStudioScreen` → `UnifiedLiquidityPage` |
| Studio tree | `views/LiquidityStudio/*` + `liquidityRuntime/*` + `liquidityBuilding/*` + `onePage/*` |
| Prior modules | LIQUIDITY_MODULE_001–007 one-page cards (historical — superseded as product architecture) |
| Composition today | Hero/header + AI Liquidity Builder + Manual Add + pool selector + positions + analytics + indexer/education peer panels |
| Docs debt | Runtime/one-page/LB reports exist; **no ARCHITECTURE_000 ownership lock** before this mission |

### Structural failure modes (why replacement is authorized)

1. **No journey hierarchy** — AI Liquidity Builder, Manual Add Liquidity, pool selector, positions, analytics, indexer status, and education compete as peers.
2. **Dashboard composition** — multi-panel studio reads as an ops console, not a premium DEX liquidity center.
3. **Split mounts** — classic `/liquidity` (`views/Pool`) vs Studio `/liquidity-studio` without a single product IA.
4. **Duplicated LP paths** — mint/remove/portfolio logic spans Studio runtime, LB product, Add/Remove pages, and classic Pool.
5. **Prior modules insufficient** — MODULE 001–007 improved card ownership inside the one-page stack but did not redefine the product around two primary journeys.
6. **Maintenance impossibility** — Founder review: the current Liquidity surface is not a refinement target.

**Classification:** current Liquidity + Liquidity Studio = `LEGACY_IMPLEMENTATION`.

## 7. Reasons for replacement

- Founder review: complete product architecture redesign required.
- Product model mismatch: Liquidity is a **two-journey liquidity center**, not a panel dashboard.
- Certified Melega methodology (Pools / Farms / Passport Architecture 000) requires one-responsibility modules + shared runtime boundaries.
- Founder mockup defines premium DEX hierarchy for surgical delivery.

## 8. Founder-approved mockup lock

| | |
| --- | --- |
| Path | `apps/web/docs/runtime/liquidity-architecture-000/liquidity-founder-mockup-lock.png` |
| SHA-256 | `c14eea98d6c15e4d9012378597fb6d7414ad9be2595c0ae9acd764053d35147d` |
| Bytes | 101108 |
| Dimensions | 1024 × 528 |
| Format | JPEG JFIF (stored at mission `.png` path; **not** recompressed) |
| Byte-identical to Cursor asset | **yes** |
| Source asset | `MELEGADEX_-_LIQUIDITY_STUDIO_1-2ca5dd55-6712-4860-a602-9dc3ce7f6f24.png` |

**Visual direction:** dark surfaces · gold accents · compact cards · Apple-like hierarchy.  
**Avoid:** dashboards · database tables · empty panels.

**Honesty note:** Mockup metrics (TVL, APR, volume, fees) are illustrative only — never production data.

Evidence: `liquidity-architecture-000/mockup-integrity.json`

## 9. New product model

Liquidity answers:

1. How do I provide liquidity manually?
2. How do I use Melega AI Liquidity Builder?
3. Which pools can I join?
4. Which LP positions are mine?
5. What market context supports my next action?

**Primary journeys (first level only):**

1. **Provide liquidity manually**
2. **Use Melega AI Liquidity Builder**

Everything else (discovery, snapshot, positions, analytics, polish) supports these journeys.

## 10. Module decomposition

| Module | Name | Role |
| --- | --- | --- |
| 000 | Architecture | Lock (this mission) |
| 001 | Hero | Introduce Liquidity Studio (no invented live KPIs) |
| 002 | Liquidity Actions | Journey chooser + Add / Remove / My Positions / Simulation domains |
| 003 | Pool Discovery | Ranked / tradeable pool discovery feeding journeys |
| 004 | Add Liquidity | Manual provide-liquidity path |
| 005 | Market Snapshot | Compact factual market context |
| 006 | Your Positions | Wallet-scoped LP positions |
| 007 | Analytics | Preview / activity / derived metrics when factual |
| 008 | Visual Polish | Style layer only |
| 009 | Integration | Route cutover; retire legacy mounts |
| 010 | Certification | Full liquidity-center certification |

Contracts: `views/LiquidityStudio/liquidityArchitecture000Contracts.ts`  
Ownership: `LIQUIDITY_MODULE_OWNERSHIP_MAP.md`  
Boundaries: `LIQUIDITY_RUNTIME_BOUNDARIES.md`  
Dependencies: `LIQUIDITY_MODULE_DEPENDENCIES.md`

## 11. Shared runtime

| Concern | Rule |
| --- | --- |
| Runtime | One liquidity orchestration context |
| Wallet LP | One portfolio adapter |
| Pair inventory | One Factory / discovery model |
| Actions | One mint / remove action host |
| APR / fees / IL | Derived; never invented |
| Layout | No duplicated page shells per module |

Unavailable derived fields show `—` / Unavailable — never invent.

## 12. Migration strategy

1. Freeze legacy mounts (`/liquidity`, `/liquidity-studio` one-page) as `LEGACY_IMPLEMENTATION`.
2. Deliver modules 001→008 sequentially under this ownership map.
3. Integrate (009): cut over canonical route; retire peer-panel IA and classic Pool nav ambiguity.
4. Certify (010).

Evidence: `liquidity-architecture-000/migration-strategy.json`

## 13. Certification strategy

ARCHITECTURE_000 gates: mockup SHA lock · ownership/boundaries/deps · legacy freeze · no production UI · tests · build.  
Per-module and final gates: `liquidity-architecture-000/certification-strategy.json`

## 14. Explicit non-goals (this mission)

- No production UI / CSS / React redesign
- No SmartSwapForm / Router / Route Engine / fees / Treasury / KERL changes
- No liquidity execution or contract changes
- No merge / no deploy

## 15. Validation

| Check | Result |
| --- | --- |
| Mockup lock test | PASS |
| Focused architecture tests | PASS |
| `next build` | PASS |
| Production UI modified | NO |
| Forbidden files touched | NO |

## 16. Final

```
LIQUIDITY_ARCHITECTURE_000_CERTIFIED
```
