# Epic B — Human Core Experience Report

**Project:** Melega DEX UX Renaissance  
**Epic:** B — Human Core Experience  
**Authority:** UX Constitution v1.2  
**Branch:** `epic-b-human-core-experience`  
**Date:** 2026-06-26  
**Scope:** Human-facing presentation rebuild — no economic logic changes.

---

## Executive Summary

Epic B rebuilds the primary human journeys as a **live DEX cockpit** with intent-first navigation, data-ready dynamic modules, and clear separation between human surfaces and machine-readable AI layers.

**Visual consistency score: 86 / 100** (up from 78 post–Epic A)

---

## Pages Changed

| Page | Route | Changes |
|------|-------|---------|
| **Home** | `/` | Live DEX cockpit: trending ribbon, swap entry, listing CTA, farms/pools/projects/assets feeds, live swaps, Explore/My Economy |
| **Swap** | `/swap` | Human page header, LIVE badge |
| **Liquidity** | `/liquidity` | Human page header + Add liquidity CTA |
| **Farms** | `/farms` | Earn nav tabs, human header, removed legacy auction banner |
| **Pools** | `/pools` | Staking Pools framing, Earn nav, MARCO holder CTA |
| **Create** | `/launch` | Intent grid, listing CTA, MARCO staking paths; registry in AI layer |
| **My Economy** | `/workspace` | Human-first sections; technical/future in AI layer |
| **Explore** | `/projects` | Human header, listing CTA; manifest in AI layer |
| **Assets** | `/assets` | Explore sub-entry header; manifest in AI layer |
| **Navigation** | global | Home · Swap · Earn · Create · Explore · My Economy · AI |

---

## Human UX Improvements

### Home — live DEX cockpit
- Trending ribbon from indexed projects/assets (real registry data)
- Prominent **Swap now** entry card (routes to `/swap`, no embedded swap logic)
- **List your project on Melega DEX** CTA
- Top farms / staking pools from venue registry (names only, no fake APR)
- Trending projects & assets from static registry
- **Latest swaps** from subgraph when indexed; honest empty state otherwise
- Quick links: Earn, Create, Explore, My Economy

### Create (`/launch`)
- **What do you want to create?** intent tiles
- Recommended **Reward MARCO holders** / staking pool paths
- Capability registry collapsed into **AI agent details**

### My Economy (`/workspace`)
- Human activity sections first
- Constitutional/future/manifest content in AI layers

### Earn
- Unified **Farms | Staking Pools** tab navigation
- Human copy: stake LP vs stake token
- MARCO staking CTA on pools header

### Explore
- Projects presented as **Explore** hub
- Assets as sub-entry with consistent header
- Machine discovery JSON behind AI layer toggle

### Navigation
- Human intent labels: **Create**, **Explore**, **My Economy**
- Separate **AI** entry grouping Map, Pipeline, Runtime, Review, Orchestrator, Dry Run
- No Trade/Swap duplication

---

## Machine Readability Preserved

| Resource | Status |
|----------|--------|
| `/registry/*` JSON manifests | Untouched |
| Homepage `<link rel="alternate">` manifest hints | Preserved in `<Head>` |
| AI agent details layers | Collapsed by default on all rebuilt pages |
| AI nav routes | Existing paths (`/map`, `/pipeline`, etc.) |
| UX Constitution manifest | Linked from home AI layer |

Humans do not see manifest URIs in first viewport on Explore/Assets/Create/Workspace/Home.

---

## Dynamic Sections

| Section | Data source | Empty behavior |
|---------|-------------|----------------|
| Trending ribbon | Project + asset registry | Hidden if empty |
| Top farms | Venue registry (`farm` type) | Honest empty message |
| Staking pools | Venue registry (`stake_pool`) | Honest empty message |
| Trending projects | `getAllProjects()` | Honest empty message |
| Trending assets | `getAllAssets()` | Honest empty message |
| Latest swaps | `useProtocolTransactionsSWR()` | Honest empty + Swap CTA |

**No fake TVL, volume, APR, or swap activity.**

---

## New Components & Libraries

| Path | Purpose |
|------|---------|
| `views/HumanCore/*` | Shared human UI: headers, CTAs, feeds, intent grid, earn nav |
| `lib/homepage-live/` | Registry-backed homepage section resolver |
| `views/UserLaunch/create-intents.ts` | Create flow intent definitions |

---

## Remaining Legacy Visuals (Epic C)

| Item | Notes |
|------|-------|
| Swap form internals (UIKit card, inputs) | Shell updated; inner components Epic C |
| Farm/pool cards & tables | Header/shell only |
| NFT / ILO pages | Not in human nav; full reskin Epic C |
| Info analytics | Unchanged |
| Mobile bottom navigation bar | Constitution spec; UIKit top nav still |
| Inline Pancake copy in translation keys | Values render Melega DEX |

---

## Mobile Readiness

- Home grid collapses to single column
- Swap entry card full width on mobile
- Intent grid responsive auto-fill
- All 6 human nav items `showItemsOnMobile: true`
- Earn tabs touch-friendly (44px+ padding)
- Dedicated bottom bar → Epic C

---

## Validation

- ✅ `next build` passed
- ✅ `homepage-live` + `ux-constitution` tests passed
- ✅ Forbidden files untouched
- ✅ No new routes or economic behavior
- ✅ No fake metrics

---

## Recommended Epic C

1. **Swap / Liquidity internal reskin** — token inputs, buttons inside card
2. **Farm & pool row components** — card-list mobile, table desktop
3. **Mobile bottom navigation** — constitution 6-item bar
4. **NFT / legacy module visual retirement**
5. **Info section reskin or demotion**
6. **Live homepage APR/TVL** — only when indexer provides real values

---

**Epic B status: COMPLETE — ready for Epic C.**
