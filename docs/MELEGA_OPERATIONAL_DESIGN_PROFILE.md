# Melega Operational Design Profile (MODP)

**Version:** 1.0  
**Status:** Operational implementation profile  
**Product:** Melega DEX  
**Scope:** How Melega DEX applies the Civilization Design Language in production UI

---

## Authority

This Operational Profile adopts — and does not redefine:

| Document | Role |
|----------|------|
| **Kiri Codex** | Civilization doctrine and constitutional truth |
| **KCG** (Kiri Civilization Governance) | Governance and policy bounds |
| **Civilization Design Language (CDL)** | Visual constitution — color, typography, motion, depth, emotion, hierarchy |

**No principle is redefined locally.**

For philosophy, emotions, tokens, spacing rhythm, motion language, depth layers, iconography, and background life — **see CDL**.

For doctrine and civilization identity — **see Kiri Codex**.

MODP describes **only** how Melega DEX operational surfaces implement CDL.

---

## Implementation Rule (Cursor)

Every UI implementation must read in order:

```
Kiri Codex
    ↓
Civilization Design Language (CDL)
    ↓
Melega Operational Design Profile (MODP)
    ↓
Implement UI
```

If MODP conflicts with CDL, **CDL wins**.  
If CDL conflicts with Kiri Codex, **Codex wins**.

---

## Canonical Economy Profile

The Civilization currently owns **one Canonical Economy**.

| Field | Value |
|-------|-------|
| **Canonical Chain** | BNB Chain |
| **Canonical Asset** | MARCO |
| **Status** | LIVE |

**Rules**

- The Canonical Economy widget is **always visible** on the Operational Home and any Melega command surface that presents economic identity.
- These three fields are **constitutional** — never removed, demoted, or replaced by marketing copy.
- **All future chains** deployed on Melega DEX represent **Economic Presence**, not Canonical Economy.
- Economic Presence surfaces (Ethereum, Polygon, Base, etc.) must be labeled as presence/extension — never as canonical replacement.

---

## Legacy Compatibility Profile

Melega DEX preserves the full legacy economic stack:

| Layer | Policy |
|-------|--------|
| **Contracts** | Preserved — no breaking changes via UI |
| **Liquidity** | Preserved — existing pools and positions remain valid |
| **Wallets** | Preserved — existing connect/auth flows remain functional |
| **Routing** | Preserved — Melega Router and legacy routes remain operational |
| **Farms / Pools / MasterChef** | Preserved — business logic untouched by presentation |

**Legacy visual language has no authority.**

PancakeSwap-derived layout, sidebar navigation, marketing homepage patterns, and pre-MDL MelegaSwap skins are **deprecated for new surfaces**. Legacy routes may retain transitional chrome until migrated; **Operational Home and new surfaces follow MODP + CDL only**.

---

## Operational Center — Swap

- **Swap is always the operational center** — visual and functional heart of the application.
- Swap is implemented via existing **`SmartSwapForm`** logic inside **`SwapFeaturesProvider`**.
- **Presentation may change; swap/routing/contracts logic may not.**
- Desktop: swap occupies the **center column** with greatest width and visual weight (engine glow per CDL).
- Mobile: **swap is first** — first interactive region below header on initial viewport.

---

## Canonical Economy Widget

Always visible. Fixed fields:

```
Canonical Economy
  Chain:    BNB Chain
  Asset:    MARCO
  Status:   LIVE
```

- Link to project registry (`/projects/melega-dex`) as economy overview — not a marketing CTA.
- Widget is an **instrument panel**, not a dashboard card.

---

## Execution Panel

Always present on Operational Home:

```
Execution Engine
  Current Router:    Melega Router — ACTIVE
  Smart Execution:   COMING NEXT
  Slippage:          from live user preference (never invented)
```

- Router status reflects **live routing availability** — never fake latency or fake route counts.
- **Smart Execution** is a **placeholder** until the smart execution layer ships — display `COMING NEXT`, not speculative features.

---

## Registry Surfaces

Six operational economic surfaces — **not menu buttons**, not sidebar items:

| Surface | Route |
|---------|-------|
| Projects | `/projects` |
| Assets | `/assets` |
| Venues | `/venues` |
| Events | `/events` |
| Graph | `/graph` |
| Query | `/query` |

**Presentation rules**

- Desktop: horizontal registry links in header (Orbitron nav per CDL).
- Mobile: fixed bottom registry strip — six surfaces, equal weight.
- Never render as Pancake-style left sidebar primary navigation on Operational Home.

---

## Economic Presence

- Non-canonical chains (Ethereum, Polygon, Base, Solana bridge links, etc.) are **Economic Presence** — extensions of the civilization economy.
- Presence may appear in network switcher, venue bindings, and registry data — never as Canonical Economy replacement.
- Presence labels must not use LIVE for canonical status unless registry explicitly marks live coordination on that chain.

---

## Smart Execution Placeholder

Until Smart Execution ships:

- Show **COMING NEXT** in Execution panel.
- Do not simulate AI routing, auto-execution, or agent actions in UI.
- Do not invent performance metrics for smart routing.

---

## Operational Home Layout

**Route:** `/`  
**Layout mode:** `IndexPage.pure = true` — **no global Pancake/MelegaSwap sidebar** on homepage.

### Desktop (≥ 1025px)

```
┌──────────────────────────────────────────────────────────────┐
│ HEADER — logo · registry surfaces · BNB CHAIN • LIVE · wallet│
├─────────────┬────────────────────────────┬───────────────────┤
│ LEFT        │ CENTER — INSTANT SWAP      │ RIGHT             │
│ Canonical   │ (SmartSwapForm engine)     │ Economic Intel    │
│ Execution   │                            │ Query Preview     │
│ Marco Venues│                            │                   │
├─────────────┴────────────────────────────┴───────────────────┤
│ FOOTER — system status · block time · gas · network          │
└──────────────────────────────────────────────────────────────┘
```

- **Max width:** 1600px centered.
- **Left column:** Canonical Economy, Execution Engine, Marco Venues (registry-linked).
- **Center column:** Instant Swap — SWAP | LIMIT tabs (LIMIT = coming next).
- **Right column:** Economic Intelligence (registry counts), Query Preview (registry queries).
- **Footer:** system telemetry strip — real or `Not indexed`.

### Module location

```
apps/web/src/views/Home/EconomicCommandConsole/
```

Homepage composition wired in `apps/web/src/pages/index.tsx` only — legacy `views/Home/index.tsx` remains in repo but is not routed.

---

## Mobile Priorities

Order below header:

1. **Instant Swap** (engine)
2. Canonical Economy + Execution + Marco Venues
3. Economic Intelligence + Query Preview
4. Footer status
5. Bottom registry surface strip (Projects · Assets · Venues · Events · Graph · Query)

Swap must be visible without scrolling past registry stats or decorative hero blocks.

---

## Component Priorities (viewport hierarchy)

| Priority | Component |
|----------|-----------|
| 1 | Swap engine |
| 2 | Canonical Economy widget |
| 3 | Execution panel |
| 4 | Registry surface access (header / bottom bar) |
| 5 | Economic Intelligence |
| 6 | Query Preview |
| 7 | Marco Venues |
| 8 | System footer telemetry |

One gold primary action per region. Constitutional data never below decorative content.

---

## Melega Logo Usage

| Rule | Detail |
|------|--------|
| **Canonical asset** | `apps/web/public/images/melega/melega-logo.png` |
| **Never** | Redraw, regenerate, recolor, restyle, or substitute |
| **Never** | Change proportions, circle geometry, or mark shape |
| **Never** | Apply glow, gradient, or shadow to the mark |
| **Header** | Logo + `MELEGA DEX` + subtitle `AI Economic Command Console` |
| **Clear space** | ≥ 1× logo diameter |

---

## Data Policy (Melega surfaces)

Inherited from Codex/CDL — operational enforcement:

| Never invent | If unavailable |
|--------------|----------------|
| TVL, APR, volume, users, treasury, liquidity, tx counts, fees | **Not indexed** or omit field |

| Allowed sources | Examples |
|-----------------|----------|
| Registry graph | project/asset/venue/event counts, edges |
| Registry venues | MARCO-linked venue list |
| Registry query | preset result counts |
| Live farm hook | APR from `useGetTopFarmsByApr` only |
| Gas price hook | `useGasPrice` on active chain only |

Query Preview shows **registry query results** — not fabricated volume rankings.

---

## Forbidden Implementation Touch (Melega DEX)

UI work must **not** modify:

- `exchange.ts`, `contracts.ts`, `pools.tsx`, `wagmi.ts`
- Token lists
- Swap/routing logic, MasterChef, pools, farms business logic
- Contract configs

---

## Review Gate

No commit to Operational Home without:

- [ ] Authority chain read (Codex → CDL → MODP)
- [ ] Swap central; mobile swap-first
- [ ] Canonical Economy widget visible (BNB Chain / MARCO / LIVE)
- [ ] Execution panel with ACTIVE + COMING NEXT
- [ ] Registry surfaces — not Pancake sidebar
- [ ] No fake metrics
- [ ] Canonical logo unchanged
- [ ] Legacy economic stack untouched

---

## Document Status

**MODP_READY**

This document is an **implementation profile**, not a second constitution.
