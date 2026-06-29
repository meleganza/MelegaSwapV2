# Mission 21 — AI Agent Experience Audit (D87)

**Date:** 2026-06-29  
**Branch audited:** `mainnet-consolidation-m20`  
**Type:** Architecture, navigation, and cognition audit only — no code behavior changes  
**Verdict:** `CONDITIONAL_D87`  
**Overall D87 score:** **60 / 100**  
**Machine manifest:** `/registry/audit/ai-agent-experience.json`

---

## Executive Summary

Melega DEX now operates as a **dual-stack product**: a production-safe legacy PancakeSwap execution core (swap, liquidity, farms, pools) and a rich **constitutional read-model layer** (registry, workspace, launch, identity, map). Machine readability is **strong** — JSON manifests, surface map, and graph/query give AI agents a credible discovery path. Human navigation is **misaligned**: the global menu still reflects pre-Mission-15 reality (Launch → `/ilo`, NFT mint prominent, no `/map` or `/workspace`), and the homepage embeds legacy ILO/NFT flows that contradict the Economic OS narrative.

**D87 readiness is conditional:** agents can orient via `/map` and `/registry/*` if they know the URLs; humans cannot converge economically without Mission 22 navigation wiring.

---

## D87 Dimension Scores (0–100)

| Dimension | Score | Assessment |
|-----------|-------|------------|
| **Human UX** | 52 | Menu/homepage do not reflect Missions 09–18 stack |
| **AI UX** | 68 | Strong manifests; weak top-level discovery index |
| **Machine readability** | 74 | 20+ registry JSON files, surface map, well-known partial |
| **Economic flow** | 58 | Journeys break at Launch→/ilo and missing /map entry |
| **Navigation** | 45 | 15+ surfaces absent from global menu |
| **Civilization convergence** | 62 | Stack exists; not wired to human entry points |
| **D87 alignment** | 61 | Honest read models; EIE not implemented; no fake data |
| **Overall D87** | **60** | Conditional — merge safe, convergence incomplete |

---

## Critical Findings

1. **Menu "Launch" → `/ilo` (retired)** — should alias to `/launch`
2. **Homepage carousel promotes `/ilo`** as active launch — Mission 15 retirement invisible on Home
3. **Homepage embeds BabyMarco NFT mint** — conflicts with Civilization Collectibles (`/collectibles`)
4. **15+ Economic OS routes not in global menu** — `/map`, `/workspace`, `/launch`, `/identity`, `/graph`, etc.
5. **`/map` is the best orientation surface** but undiscoverable from menu/homepage
6. **`melega-dex-manifest.json` is placeholder** (`phase_2_pending`) — weak agent bootstrap
7. **Missing .well-known** for workspace, identity, surfaces, launch, execution, readiness
8. **Workspace ↔ Identity duplication** — same registry sections listed twice for agents

---

## Per-Surface Audit

| Surface | Route | Class | Menu | Manifest | AI | Human | Rec |
|---------|-------|-------|------|----------|-----|-------|-----|
| Projects | `/projects` | read_model | ✓ | ✓ | 90 | 78 | keep |
| Assets | `/assets` | read_model | ✗ | ✓ | 92 | 70 | promote |
| Venues | `/venues` | read_model | ✗ | ✓ | 88 | 65 | move |
| Events | `/events` | read_model | ✗ | ✓ | 85 | 60 | merge→graph |
| Graph | `/graph` | read_model | ✗ | ✓ | 95 | 68 | promote |
| Query | `/query` | read_model | ✗ | ✓ | 90 | 55 | merge→graph |
| Activation | `/new-project` | preview | ✗ | ✓ | 82 | 62 | move |
| Execution | `/execution` | read_model | ✗ | ✓ | 85 | 50 | keep (advanced) |
| Presence | `/presence` | read_model | ✗ | ✓ | 92 | 72 | promote |
| Launch | `/launch` | read_model | ✗* | ✓ | 90 | 75 | **alias** |
| Workspace | `/workspace` | read_model | ✗ | ✓ | 88 | 80 | promote |
| Collectibles | `/collectibles` | read_model | ✗ | ✓ | 86 | 70 | keep |
| Identity | `/identity` | read_model | ✗ | ✓ | 90 | 68 | merge→workspace |
| Map | `/map` | read_model | ✗ | ✓ | 98 | 85 | **promote** |
| Swap | `/swap` | production | ✓ | ✗ | 90 | 95 | keep |
| Liquidity | `/liquidity` | production | ✓ | ✗ | 88 | 90 | keep |
| Farms | `/farms` | production | ✓ | ✗ | 85 | 88 | keep |
| Pools | `/pools` | production | ✓ | ✗ | 85 | 85 | keep |
| ILO Retirement | `/ilo` | retired | ✓* | ✓ | 88 | 75 | alias/retire menu |
| NFT Legacy | `/nft` | legacy | ✓ | ✓ | 72 | 75 | move→collectibles |

\*Menu "Launch" points to `/ilo`, not `/launch`.

---

## Economic Journey Audits

### New Human User (score: 48/100)

```
Homepage (/)           → BROKEN — Pancake-era, ILO banner, NFT mint
Connect Wallet         → CLEAR
Understand Platform    → MISSING — no /map link
Create Project         → INDIRECT — /projects in menu, no create flow
Launch Asset           → BROKEN — menu → /ilo retirement
Manage Economy         → MISSING — /workspace not in menu
```

### Existing Liquidity Provider (score: 72/100)

```
Liquidity (/liquidity) → CLEAR — Trade menu
Workspace (/workspace) → MISSING — direct URL only
Execution (/execution) → INDIRECT — cross-links
Identity (/identity)   → INDIRECT — cross-links
```

### AI Agent (score: 76/100)

```
Registry Discovery     → CLEAR — /registry/surfaces/index.json
Graph (/graph)         → CLEAR
Execution (/execution) → CLEAR — illustrative only; route to /swap
Workspace (/workspace) → CLEAR
Identity (/identity)   → CLEAR — agent-readiness
Economic Decision      → CLEAR — /swap for on-chain
```

### Project Creator (score: 55/100)

```
Launch (/launch)       → BROKEN — menu → /ilo
Activation (/new-project) → INDIRECT
Presence (/presence)   → INDIRECT
Workspace (/workspace) → MISSING
```

---

## Homepage Audit

| Tier | Modules |
|------|---------|
| **CORE** | Swap, Liquidity, Farms, Pools, **Surface Map** (`/map`) |
| **SECONDARY** | Launch (`/launch`), Workspace (`/workspace`), Projects (`/projects`) |
| **ADVANCED** | Graph, Query, Presence, Execution, Identity, Collectibles, Activation |
| **HIDDEN** | Homepage NFT mint block, ILO carousel (`/ilo`), external apply banner, unused Pancake metrics |

**Current homepage problems:** Component exports as `Nft`; carousel links `/ilo` and `/farms`; `CakeDataRow` and pool carousels dominate; zero links to Economic OS (`/map`, `/workspace`, `/launch`).

---

## Navigation Audit

| Surface | Action | Rationale |
|---------|--------|-----------|
| Launch | **alias** | Menu `/ilo` → `/launch` |
| Map | **promote** | Primary orientation — menu or footer |
| Workspace | **promote** | Operator hub |
| Assets | **promote** | Registry submenu under Projects |
| Graph | **promote** | Advanced registry nav |
| ILO | **retire** (menu) | Keep route; remove primary menu placement |
| NFT | **move** | Under Collectibles legacy submenu |
| Identity | **merge** | Workspace tab; keep `/identity` URL |
| Query | **merge** | Into Graph for humans |
| Events | **merge** | Graph timeline facet |
| Venues | **move** | Registry submenu |
| Swap/Liquidity/Farms/Pools | **keep** | Production core |

---

## Surfaces to Merge (not delete)

- **Graph + Query** — single Registry Explorer for humans; separate manifests for agents
- **Identity → Workspace** — tab or section; preserve `/identity` route
- **Events → Graph** — timeline facet; preserve `/events` route

## Surfaces to Retire

**None removed.** Retire **menu prominence** of `/ilo` and homepage ILO CTA. Alias Launch label to `/launch`.

---

## Machine Discoverability Inventory

### Registry manifests (sample)

`/registry/projects/`, `/registry/assets/`, `/registry/venues/`, `/registry/events/`, `/registry/graph/`, `/registry/query/`, `/registry/activation/`, `/registry/execution/`, `/registry/presence/`, `/registry/launch/`, `/registry/workspace/`, `/registry/collectibles/`, `/registry/identity/`, `/registry/surfaces/`, `/registry/readiness/`, `/registry/audit/`

### Well-known (partial)

`melega-dex-projects.json`, `assets.json`, `venues.json`, `events.json`, `graph.json`, `query.json`, `presence.json`, `collectibles.json`, `discovery.json`, `manifest.json` (placeholder)

### Gaps

No well-known for: workspace, identity, surfaces/map, launch, execution, readiness gate.

---

## Recommended Mission 22

**Navigation & Homepage Convergence**

1. Alias menu Launch → `/launch`; demote `/ilo` to legacy submenu or remove from menu
2. Add `/map` and `/workspace` to menu or site footer (minimal change — no full redesign)
3. Remove homepage ILO banner and demote NFT mint block; add Map CTA
4. Publish unified `.well-known/melega-dex-discovery.json` index → `/map`, `/registry/surfaces/index.json`, `/registry/readiness/mainnet-gate.json`
5. Do **not** modify swap/router/contracts/wallet

---

## Production Logic Confirmation

This mission created **audit artifacts only**:

- `docs/MISSION_21_AI_AGENT_EXPERIENCE_AUDIT.md`
- `apps/web/public/registry/audit/ai-agent-experience.json`
- `apps/web/src/lib/experience-audit/` (read-only)
- `apps/web/scripts/write-ai-agent-experience-audit.ts`

**No changes** to: `exchange.ts`, `contracts.ts`, `pools.tsx`, `wagmi.ts`, router, wallet, swap, farms, pools, MasterChef, token lists, NFT logic, UI pages, or global menu.

---

**MISSION_21_AI_AGENT_EXPERIENCE_READY**
