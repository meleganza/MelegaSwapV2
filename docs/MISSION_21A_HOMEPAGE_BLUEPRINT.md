# Mission 21A — Homepage Blueprint / Civilization Entry Point

**Date:** 2026-06-29  
**Basis:** Mission 21 AI Agent Experience Audit (D87 score 60/100)  
**Branch reference:** `mainnet-consolidation-m20`  
**Type:** Blueprint specification only — no UI implementation  
**Verdict:** `APPROVED_BLUEPRINT`  
**Machine manifest:** `/registry/blueprints/homepage-entry-point.json`

---

## 1. Homepage Purpose

The Melega DEX homepage (`/`) must become the **Civilization Entry Point** — not a PancakeSwap-era marketing carousel with embedded NFT minting.

In **under 10 seconds**, a human or AI agent must understand:

| Question | Answer surface |
|----------|----------------|
| What is Melega DEX? | Value proposition + constitutional banner |
| What does MARCO on BNB Chain represent? | Canonical Economy — LIVE, immutable |
| What can I do immediately? | **CORE four:** Swap, Workspace, Launch, Map |
| Where to swap? | `/swap` — primary CTA |
| Where to create? | `/launch` — never `/ilo` |
| Where to manage? | `/workspace` |
| Where to understand the system? | `/map` + secondary registry strip |

The homepage is an **orientation layer**, not an execution layer. On-chain actions happen on dedicated routes; the home orients and routes honestly.

---

## 2. Human User Journey

```
Land on / (Civilization Entry Point)
  → Read: MARCO on BNB Chain · Canonical Economy · LIVE
  → Read: Melega DEX = swap + economic OS
  → Click: Map (understand all surfaces)
  → OR Click: Swap (immediate action)
  → OR Click: Workspace (manage indexed activity)
```

**Success:** User never sees ILO as active launch or NFT mint as homepage hero.  
**Failure mode today:** ILO carousel, NFT mint block, pool banner overload — all removed in Mission 22.

---

## 3. AI Agent Journey

```
GET /
  → Discover manifest links in machine discovery section
  → GET /registry/blueprints/homepage-entry-point.json
  → GET /registry/surfaces/index.json
  → GET /registry/readiness/mainnet-gate.json
  → Traverse /graph for relationships
  → Route live execution to /swap (never /execution for on-chain)
```

**Success:** Agent orients without scraping legacy Pancake DOM or mistaking `/ilo` for launch.  
**Requirement:** Stable hrefs, visible JSON manifest URLs, constitutional fields aligned with presence registry.

---

## 4. Project Creator Journey

```
Homepage → Launch (/launch)
  → Capability index (honest statuses)
  → Activation preview (/new-project) — advanced, preview badge
  → Presence (/presence) — secondary strip
  → Workspace (/workspace) — manage
```

**Critical:** Homepage and menu must **never** route creators to `/ilo`. Launch is the creation index; ILO is legacy compat only.

---

## 5. Liquidity Provider Journey

```
Homepage → Swap (/swap) or Liquidity (/liquidity)
  → Farms / Pools (secondary — Earn, not homepage hero)
  → Workspace (/workspace) — venue index without fake TVL
```

**Critical:** Remove pool-carousel dominance from homepage. LP users need Swap/Liquidity paths, not 17 pool banner images.

---

## 6. Surface Hierarchy (Refined)

### CORE — Homepage hero CTAs

| Surface | Route | Role |
|---------|-------|------|
| **Swap** | `/swap` | Immediate on-chain exchange |
| **Workspace** | `/workspace` | Manage economic activity |
| **Launch** | `/launch` | Creation capability index |
| **Map** | `/map` | Civilization compass |

### SECONDARY — Registry strip below hero

| Surface | Route | Role |
|---------|-------|------|
| Projects | `/projects` | Project identity |
| Assets | `/assets` | UAI / MARCO bindings |
| Graph | `/graph` | Relationship explorer |
| Presence | `/presence` | Economic presence (NOT canonical) |

*Liquidity, Farms, Pools remain reachable via Swap area / global Earn menu — not duplicate homepage heroes.*

### ADVANCED — Collapsed / footer

| Surface | Route | Role |
|---------|-------|------|
| Query | `/query` | Agent query console |
| Execution | `/execution` | Illustrative only — warning badge |
| Identity | `/identity` | Economic identity read model |
| Collectibles | `/collectibles` | Civilization collectibles |
| Activation | `/new-project` | Preview runtime — not launch pad |

### LEGACY — Footer compat only

| Surface | Route | Homepage treatment |
|---------|-------|-------------------|
| ILO (retired) | `/ilo` | Footer link + supersession note |
| NFT mint | `/nft` | **Remove from home** — menu submenu |
| NFT market | `/nftmarket` | Footer legacy link |
| NFT wallet | `/viewNFTs` | Footer legacy link |

---

## 7. Homepage Sections (top → bottom)

1. **Constitutional Economy Banner** — MARCO · BNB Chain · LIVE · immutable  
2. **What Is Melega DEX** — One paragraph: DEX + Economic OS  
3. **Core Actions** — Four cards: Swap, Workspace, Launch, Map  
4. **Understand the System** — Secondary strip: Projects, Assets, Graph, Presence  
5. **Advanced & Agents** — Collapsible/footer: Query, Execution, Identity, Collectibles, Activation  
6. **Legacy Compatibility** — Small print: ILO retired, NFT legacy links  
7. **Machine Discovery** — Manifest URLs for agents  

---

## 8. What Must Be Removed from Homepage

- BabyMarco NFT mint UI (`MintModal`, `Timer`, quota controls)
- ILO carousel banner (`/ilo` image link)
- Primary AliceCarousel with legacy apply/ILO banners
- Pool subbanner carousel dominance (17+ pool images)
- Pancake-era `CakeDataRow` as primary hero metric
- Homepage component exported as `Nft`
- IFO success toast copy on home

---

## 9. What Must Be Promoted

- **Swap** — primary on-chain CTA  
- **Workspace** — manage economy  
- **Launch** (`/launch`) — honest creation index  
- **Map** — civilization compass  
- **Constitutional MARCO banner**  
- **Assets + Graph** in secondary strip  

---

## 10. What Must Stay Secondary

- Projects, Assets, Graph, Presence (registry strip — not hero)  
- Liquidity, Farms, Pools (global menu / Swap context — not home carousel)  
- Venues, Events (reachable via Graph/Workspace — not homepage)  

---

## 11. What Must Remain Legacy-Compatible

| Route | Treatment |
|-------|-----------|
| `/ilo` | Retirement page preserved; footer link only |
| `/nft` | Mint page preserved; menu submenu only |
| `/nftmarket` | Market preserved; footer link |
| `/viewNFTs` | Wallet view preserved; footer link |

**No route deletion.** Only homepage and menu **prominence** changes.

---

## 12. Copywriting Direction

- Lead with **Civilization / Economic OS** — not PancakeSwap fork  
- State **MARCO on BNB Chain** as Canonical Economy — immutable, LIVE  
- Action verbs: **Swap · Manage · Launch · Explore Map**  
- ILO: always **"Legacy ILO retired"** if mentioned  
- BabyMarco: **"Collectibles"** — never homepage mint CTA  
- Read models: **"indexed"**, **"read-only"**, **"no fake balances"**  
- Agent footer: explicit manifest URLs  
- Tone: operational, constitutional, honest — no hype TVL  

---

## 13. Machine-Readable Homepage Requirements

- Visible links to `/registry/blueprints/homepage-entry-point.json`  
- Visible links to `/registry/surfaces/index.json`  
- Visible links to `/registry/readiness/mainnet-gate.json`  
- CORE four hrefs must match surface map ids (stable paths)  
- SSR/static-friendly CORE routes (no client-only entry)  
- Constitutional block fields aligned with presence/activation manifests  
- Legacy surfaces link manifests with `replacementRoute` where retired  

---

## 14. Recommended Mission 22 Implementation Plan

| Phase | Action |
|-------|--------|
| 1 | Replace `views/Home` content — remove NFT mint, ILO carousel, pool banner dominance |
| 2 | Implement Civilization Entry Point sections (`melegaOperational` tokens) |
| 3 | Wire CORE four CTAs: Swap, Workspace, Launch, Map |
| 4 | Add constitutional MARCO banner + registry secondary strip |
| 5 | Menu: alias Launch → `/launch`; add Map + Workspace to menu or footer |
| 6 | Legacy compat footer (ILO retired, NFT legacy links) |
| 7 | Publish `homepage-entry-point.json`; update `.well-known` discovery |
| 8 | Vercel validation — **no changes** to swap/liquidity/farms/pools logic |

**Out of scope for Mission 22:** Global Pancake menu redesign, contract/router changes, fake metrics.

---

## Surfaces Promoted / Demoted

**Promoted:** swap, workspace, launch, map, assets, graph  

**Demoted:** ilo, nft_mint, execution (homepage), activation (homepage), pool carousels, pancake metrics  

---

## Production Logic Confirmation

Mission 21A created **blueprint artifacts only**. No changes to homepage code, menu, routes, swap, liquidity, farms, pools, wallet, contracts, router, NFT logic, or translations.

---

**MISSION_21A_HOMEPAGE_BLUEPRINT_READY**
