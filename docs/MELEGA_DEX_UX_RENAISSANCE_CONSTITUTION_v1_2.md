# Melega DEX UX Renaissance — Master UX Constitution v1.2

**Status:** Approved — Canonical Design Authority  
**Document version:** 1.2  
**Approved:** 2026-06-26  
**Authority:** `canonical_design_authority`  
**Machine manifest:** `/registry/design/melega-dex-ux-constitution-v1-2.json`  
**Scope:** Architecture and UX specification only. Implementation follows this document.

---

## Amendment History

| Version | Date | Summary |
|---------|------|---------|
| 1.0-draft | 2026-06-26 | Initial Master UX Constitution |
| 1.1-amended | 2026-06-26 | Live DEX homepage, listing funnel, CME/Space layer, brand rule, nav update |
| 1.2-amended | 2026-06-26 | Staking pool creation, MARCO visibility incentive, Earn dual tab |

---

# 1. Master UX Constitution

## 1.1 Product Definition

**Melega DEX is the Economic Operating System of the Kiri Civilization.**

It must feel like a **living Web3 DEX** — not a descriptive landing page, not documentation, not a module directory, not a PancakeSwap fork.

The product must communicate:

> *"Things are happening here now."*

## 1.2 Foundational Principles

| ID | Principle |
|----|-----------|
| P1 | **Intent over inventory** — navigation by what the user wants to do |
| P2 | **Human first, always** — Human Mode is default; AI Mode is opt-in |
| P3 | **One design system** — one visual language across all surfaces |
| P4 | **Real data only** — no fake TVL, volume, APR, swaps, rankings, or activity |
| P5 | **Progressive disclosure** — human info first; technical info in AI Mode |
| P6 | **Preserve economics, redesign experience** — swap, liquidity, farms, pools, wallet, router, contracts unchanged |
| P7 | **Mobile defines the product** — design at 375px; desktop is progressive enhancement |

## 1.3 Mode Architecture

### Human Mode (default)

Contains ONLY:

- Home
- Swap
- Liquidity (inside Swap on mobile; primary or sub-nav on desktop)
- Earn (Farms + Staking Pools)
- Launch
- Workspace
- Discover
- Settings

### AI Mode (opt-in, isolated)

Contains ONLY:

- Runtime
- Pipeline
- Submission
- Review
- Decision Events
- Intake
- Orchestrator
- Map
- Manifest Explorer
- Registry Explorer
- Dry Run
- Readiness

**Rules:**

- AI surfaces live under `/ai/*` or equivalent namespace
- Human users never see AI surfaces unless AI Mode is enabled
- Settings → Advanced → "Enable AI Mode" (off by default)
- Manifest URLs (`/registry/*`) resolve always; Human users see bridge: *"Open in AI Mode?"*

## 1.4 Information Hierarchy (every Human page)

1. **Where am I?** — page title, one line
2. **What is this?** — one sentence, no jargon
3. **What can I do?** — primary action, visible immediately
4. **What should I do next?** — optional guided step
5. **Everything else** — below fold, collapsed, or in Discover

## 1.5 Fundamental Principle

The user must never think: *"Which page do I need?"*  
The user must think: *"I want to do this."*

---

# 2. Brand Rule

## 2.1 Public UI — mandatory

The public-facing product name is **only**:

**Melega DEX**

## 2.2 Forbidden in all user-visible surfaces

**"MelegaSwap"** must not appear in:

- Header / logo
- Navigation / menu
- Homepage
- Buttons and CTAs
- Page titles and meta titles
- Public user-facing copy
- Footer
- Wallet connect flows
- Error pages
- Toasts and notifications

## 2.3 Permitted outside public UI

- Repository names (`MelegaSwapV2`)
- Internal code comments
- Historical file paths
- Git history
- Developer documentation not rendered in the app

**Rule:** If a human user can see it in the browser, it says **Melega DEX**.

---

# 3. Navigation Constitution

## 3.1 Human Mode — Primary Navigation

**Priority order:**

| Order | Item | Route | Intent |
|-------|------|-------|--------|
| 1 | **Home** | `/` | Live DEX pulse + swap + trending |
| 2 | **Swap** | `/swap` | Exchange tokens |
| 3 | **Earn** | `/farms` | Farms + Staking Pools (tabbed) |
| 4 | **Launch** | `/launch` | Create + list your project |
| 5 | **Discover** | `/discover` | Explore civilization |
| 6 | **Workspace** | `/workspace` | My economy |

**Liquidity:**

| Breakpoint | Placement |
|------------|-----------|
| Desktop (≥1024px) | Primary nav if space allows, or sub-item under Swap |
| Mobile / tablet | Inside Swap (tab: Swap \| Liquidity) |

**Settings:** wallet / gear menu only.

## 3.2 Forbidden Navigation

- Trade (duplicate of Swap)
- Trade + Swap coexistence
- Map, Projects, Assets as standalone Human nav → **Discover**
- AI surfaces in Human nav
- Mixed legacy prominence (NFT, ILO in primary nav)

## 3.3 Mobile Bottom Bar

```
Home | Swap | Earn | Launch | Discover | Workspace
```

Liquidity: one tap inside Swap. Settings: gear icon.

## 3.4 AI Mode Navigation

When enabled: secondary rail (desktop) or bottom sheet (mobile) with Map, Runtime, Pipeline, Submission, Review, Decision Events, Intake, Orchestrator, Dry Run, Readiness, Manifest Explorer, Registry Explorer.

---

# 4. Design Tokens Constitution

## 4.1 Color Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `canvas` | `#000000` | Page background |
| `surface-primary` | `#111111` | Cards, panels |
| `surface-secondary` | `#1A1A1A` | Elevated cards, inputs |
| `border-subtle` | `rgba(255,255,255,0.06)` | Card borders |
| `border-accent` | `rgba(212,175,55,0.20)` | Hover, focus |
| `gold` | `#D4AF37` | Primary accent, CTAs |
| `text-primary` | `#FFFFFF` | Titles, values |
| `text-secondary` | `#9E9E9E` | Descriptions |
| `status-live` | `#22C55E` | LIVE, READY, ACTIVE only |

**Forbidden:** Pancake teal `#1FC7D4`, decorative green, blue/purple accents, neon gradients.

## 4.2 Typography

| Role | Family |
|------|--------|
| Display | Orbitron |
| Body | Inter |

Sentence case everywhere. Maximum two title levels per viewport.

## 4.3 Layout

- Content max-width: **1400px**
- Reading max-width: **680px**
- Base spacing unit: **4px**

---

# 5. Homepage — Live DEX Architecture

## 5.1 Purpose

The homepage is the **front door of a live DEX**, not an institutional brochure.

It must communicate: *"Things are happening here now."*

## 5.2 Mandatory Content

- Central Swap access (embedded or direct)
- Top farms
- Top pools
- Trending projects
- Trending assets
- Latest swaps
- Strong listing CTA: **"List your project on Melega DEX"**
- Latest ecosystem activity
- Space / CME intelligence feed (if available)
- Radar discoveries (if available)

## 5.3 Section Order

1. Live trending ribbon
2. Compact hero — Swap primary CTA
3. Embedded or direct Swap module
4. **List your project on Melega DEX** CTA
5. Top farms
6. Top pools
7. Trending projects / assets
8. Latest swaps / activity feed
9. Discover / Space / Radar intelligence
10. Workspace entry ("My economy")
11. Footer

## 5.4 Listing CTA Copy

**Headline:** List your project on Melega DEX

**Supporting line:** List your token, add liquidity, create a farm, or reward MARCO holders with a staking pool.

## 5.5 Dynamic Data Rules

| If data is… | Then… |
|-------------|--------|
| Available | Show module |
| Unavailable | Hide module or honest empty state |
| Never | Fake TVL, volume, APR, activity |

## 5.6 Homepage Must NOT Show

- Manifest links in first viewport
- Capability matrices
- Pipeline / runtime / review links
- NFT mint blocks, ILO carousels
- "MelegaSwap" anywhere

---

# 6. List Your Project — Listing Funnel

## 6.1 Primary CTA

**"List your project on Melega DEX"**

Routes to: Launch → Submission flow (human-readable).

## 6.2 Human Listing Funnel

| Step | Action |
|------|--------|
| 1 | Start listing |
| 2 | Add token details |
| 3 | Upload logo & metadata |
| 4 | Add website & social links |
| 5 | Add liquidity (existing safe flow) |
| 5b | **Optional growth tools:** Create farm · Create staking pool · Reward MARCO holders |
| 6 | Submit for review |
| 7 | Get listed |
| 8 | Appear in Discover, Workspace, Trending, Earn, registry |

**Step 5b rules:** Clearly labeled optional — not required to list. Recommended tool highlighted: Reward MARCO holders.

## 6.3 Listing Rules

- No automatic approval
- No fake listing
- No registry mutation without review
- No contract execution from UX spec
- Liquidity routes to existing safe liquidity flow
- User never sees schemas or review queue internals in Human Mode

## 6.4 Human Journey H-LIST

```
Home → List your project → Launch → Submission → Token details → Logo/metadata
  → Website/social → Liquidity → [Optional growth tools] → Submit for review
  → Listing approved → Discover → Workspace → Trending eligibility
```

---

# 7. Launch — "What Do You Want to Create?"

## 7.1 Intent Tiles

- Token
- Liquidity pool
- Farm
- Collectible
- Project
- **Create staking pool**
- **Reward MARCO holders**
- Something else (legacy with warning)

## 7.2 Staking Pool — Two-Path Model

### Recommended (visually emphasized)

**Stake MARCO → Earn your token**

Primary message: *"Create a staking pool for MARCO holders."*

Supporting copy: *"Let MARCO holders stake MARCO and earn your token. This gives your project visibility inside the Melega DEX ecosystem and connects your launch to the canonical MARCO economy."*

Short CTA: **"Reward MARCO holders"**

### Advanced

**Custom staking pool** — any supported token configuration if available.

## 7.3 Staking Rules

- Do not imply every project must use MARCO staking
- Do not hide custom options if supported
- No fake MARCO holder counts — use "MARCO holders" unless indexed count exists
- If indexed: "Reach X MARCO holders"
- No automatic pool creation
- No contract execution from UX spec
- Existing contract/farm/pool logic untouched

---

# 8. Earn — Dual Tab Model

## 8.1 Structure

```
Earn
├── Farms          →  Stake LP tokens, earn rewards.
└── Staking Pools  →  Stake a token, earn rewards.
```

## 8.2 Staking Pools — User Presentation

**MARCO pools:** "Earn new tokens by staking MARCO."

**Other pools:** "Stake [token] → Earn [token]" (real pair only)

## 8.3 Staking Pools — Creator Template

**Preferred:** Stake MARCO → Earn [project token]

Featured row at top when indexed pools exist. No fake APR.

---

# 9. Workspace — "My Economy"

Personal economic cockpit. No technical language.

Sections: Portfolio summary · Recent activity · Your projects · Your liquidity · Your farms & pools · Explore more → Discover

No manifest explorer. No pipeline/runtime links in Human Mode.

---

# 10. Discover

Consolidates: Projects · Assets · Trending · Radar · Space · Collectibles · Presence (as context on Assets)

Map and Graph become Discover sub-views or AI Mode tools.

---

# 11. Economic Communication Layer (CME / Space)

## 11.1 Definition

Downstream automation turning **real economic events** into CME / Space communication signals. **Not** a replacement for review.

## 11.2 Eligible Source Events

- New project listed
- New token metadata approved
- New liquidity pool created
- New farm created
- New pool created
- Project enters trending
- Top project by liquidity / trading activity
- Labs narrative → listed project
- **New MARCO staking pool created**
- **Project rewards MARCO holders**
- **Top MARCO staking pools this week**
- **New token available for MARCO stakers**

## 11.3 Communication Outputs

- Daily / weekly recap
- Top 10 listed projects
- Top 10 by liquidity / trading activity
- New farms / pools recap
- MARCO staking opportunities recap
- Space article draft
- CME social/news signal
- Direct project links

## 11.4 Rules

- Real indexed data only
- No fake ranking or listing
- No social post without source event
- Downstream of review — never bypasses approval

---

# 12. AI Agents Visibility Policy

## 12.1 Separation

AI Mode remains separate. Human Mode does not expose manifests, schemas, or review queues by default.

## 12.2 AI-Originated Objects

Projects, tokens, farms, pools, or narratives from AI agents, Labs, or Orchestrator are **not hidden forever**.

| State | Human visibility |
|-------|------------------|
| Technical / unreviewed | Hidden |
| Submitted, under review | Owner status in Workspace only |
| Validated + indexed + safe | Fully visible in Human Mode |
| Listed + approved | Discover, Trending, Homepage, Earn eligibility |

## 12.3 Staking Pool Registry Metadata (AI Mode)

| Field | Notes |
|-------|-------|
| `staking_token` | e.g. MARCO |
| `reward_token` | e.g. project token |
| `project_id` | Linked project |
| `pool_status` | draft \| submitted \| under_review \| approved \| live \| rejected |
| `review_status` | mirrors review queue |
| `pool_template` | `marco_recommended` \| `custom` |
| `discover_eligible` | true after approval + indexing |
| `earn_eligible` | true when live |
| `communication_eligible` | true when live + indexed |

No fake APR, pool status, or rewards in metadata.

---

# 13. Component & Responsive Summary

- Buttons: Primary (gold), Secondary (border), Ghost, Danger
- Cards: Action, Status, Feed, Detail — one question per card
- Mobile min touch target: 44×44px
- Breakpoints: xs 0–374 · sm 375–767 (baseline) · md 768–1023 · lg 1024–1439 · xl 1440+
- Motion: calm, 150–350ms, no gaming effects; respect `prefers-reduced-motion`

---

# 14. Implementation Roadmap

| Phase | Focus | Duration |
|-------|-------|----------|
| 1 — Foundation | Tokens, shell, nav, brand sweep (MelegaSwap → Melega DEX) | 2 weeks |
| 2 — Live Homepage | Swap module, trending, farms/pools, activity feed | 3 weeks |
| 3 — Human Core | Swap / Earn reskin, Liquidity in Swap, Settings | 2 weeks |
| 4 — Discover | Consolidated explore, Search, Trending | 2 weeks |
| 5 — Workspace | "My economy" redesign | 2 weeks |
| 6 — AI Mode | `/ai/*`, console migration, boundary enforcement | 2 weeks |
| 7 — Legacy & Polish | Legacy demotion, mobile QA, a11y | 1 week |
| **Phase X — Project Listing & Communication Loop** | **See below** | **3 weeks** |
| 8 — Launch | Staged rollout, validation, sign-off | 1 week |

## Phase X — Project Listing & Communication Loop

- Listing CTA (homepage + Launch + Discover)
- Submission funnel (8-step + optional growth tools)
- Metadata / logo journey
- Liquidity routing to existing flow
- Review integration + honest waiting states
- Listing event on approval
- CME / Space event emission
- Daily / weekly recap model
- Trending eligibility model
- **MARCO staking pool growth template**
- **Custom staking pool template**
- **Earn visibility for approved staking pools**
- **CME / Space recap for MARCO staking opportunities**

**Total estimated:** ~16 weeks. No implementation until this constitution is approved.

---

# 15. Approval Checklist

- [x] Master UX Constitution approved
- [x] Navigation: Home, Swap, Earn, Launch, Discover, Workspace approved
- [x] Homepage as live DEX approved
- [x] List your project funnel approved
- [x] Economic Communication Layer approved
- [x] AI agents visibility policy approved
- [x] Brand rule: Melega DEX only approved
- [x] Staking pool / MARCO visibility incentive approved
- [x] Earn dual tab: Farms + Staking Pools approved
- [x] Phase X in roadmap approved

---

# 16. Governance

This document is the **single source of truth** for Melega DEX UX Renaissance.

Any implementation that contradicts it requires a constitution amendment.

Amendments are versioned: v1.0 → v1.1 → v1.2 → …

**Authority:** `canonical_design_authority`  
**Status:** `approved`
