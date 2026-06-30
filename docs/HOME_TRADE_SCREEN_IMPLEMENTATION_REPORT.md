# Home / Trade Screen Implementation Report

**Project:** Melega DEX Product Renaissance  
**Branch:** `home-trade-screen-redesign`  
**Date:** 2026-06-30  
**Scope:** Home / Trade screen only — presentation layer

---

## Summary

Implemented the approved Home / Trade cockpit per desktop and mobile reference images. The app opens into **Trade** at `/` with embedded swap, live data modules, intent sidebar (desktop), and bottom navigation (mobile). Default Pancake menu is hidden on home via `IndexPage.pure = true`.

---

## Files Changed

### New (`apps/web/src/views/HomeTrade/`)

| File | Role |
|------|------|
| `HomeTradeScreen.tsx` | Main layout orchestrator |
| `homeTradeTokens.ts` | Approved color tokens |
| `MelegaBrandLockup.tsx` | Melega DEX brand lockup |
| `HomeSidebar.tsx` | Desktop left rail (260px) |
| `HomeTopBar.tsx` | Desktop search / network / wallet |
| `HomeMobileHeader.tsx` | Mobile header |
| `TrendingRibbon.tsx` | Live trending ribbon |
| `HomeSwapPanel.tsx` | Trade panel + embedded `SmartSwapForm` |
| `CinematicEconomyPanel.tsx` | Desktop cinematic visual |
| `QuickMarketStrip.tsx` | Top pair / farm / pool / project cards |
| `ListProjectCta.tsx` | List your project CTA |
| `EarnOpportunities.tsx` | Top farms & staking pools |
| `LiveActivityFeed.tsx` | Live activity feed |
| `MobileBottomNav.tsx` | Five-intent bottom nav |
| `HomeTradeFooter.tsx` | Desktop footer |
| `HomeTradeGlobalStyle.tsx` | Swap panel presentation overrides |
| `useHomeTradeData.ts` | Real data aggregation hook |
| `index.ts` | Barrel export |

### Updated

| File | Change |
|------|--------|
| `apps/web/src/views/Home/index.tsx` | Renders `HomeTradeScreen` |
| `apps/web/src/pages/index.tsx` | `IndexPage.pure = true` (no global Menu on home) |

---

## Desktop Layout

- Fixed sidebar 260px (`#050505`) with TRADE / EARN / FIND / BUILD / PORTFOLIO groups
- Sticky top bar: search (⌘K pill), network, Connect Wallet, settings
- Trending ribbon (5-column grid, real items only)
- Hero row: swap panel (43%) + cinematic MARCO economy panel (57%)
- Quick market strip (4 columns)
- List project CTA + Earn opportunities (2-column)
- Live activity card
- Footer with Docs / Status / Operator Mode

---

## Mobile Layout

- Brand header + network + wallet icon
- Horizontal scrolling trending ribbon
- Full-width swap panel first (cinematic hidden)
- Horizontal quick market cards
- List project CTA
- Earn opportunities (stacked)
- Live activity
- Fixed bottom nav: Trade · Earn · Find · Build · Portfolio
- Safe-area padding bottom 96px

---

## Dynamic Sections — Data Behavior

| Section | Source | Hidden when |
|---------|--------|-------------|
| Trending ribbon | Top farm LP, latest subgraph swap, registry pool/project | No items resolve |
| Quick market | Farms APR/TVL, pools APR/TVL, latest project | All cards empty |
| Earn opportunities | `useGetTopFarmsByApr`, `useGetTopPoolsByApr` | No APR/TVL rows |
| Live activity | `useProtocolTransactionsSWR` | Shows honest empty text |
| MARCO price (sidebar) | `useCakeBusdPrice` | Price omitted if unavailable |
| Intelligence | — | **Hidden** (no live Radar/Space feed) |

**No fake APR, TVL, timestamps, or rankings.** Timestamps only from subgraph `timestamp` field.

---

## Swap Logic

- `SmartSwapForm` embedded unchanged inside `SwapFeaturesProvider`
- `CurrencyInputHeader` hidden via scoped CSS only
- No changes to swap execution, router, approval, or state hooks

---

## Forbidden Files

| File | Touched? |
|------|----------|
| `exchange.ts` | No |
| `contracts.ts` | No |
| `wagmi.ts` | No |
| Token lists | No |
| Router / wallet / MasterChef | No |
| NFT minting | No |

---

## Validation

| Check | Result |
|-------|--------|
| `next build` | Pass |
| Constitution + homepage-live tests | 10/10 pass |
| MelegaSwap in public home UI | Not shown |
| Mobile 390px layout | Bottom nav + swap first |
| Desktop 1440px layout | Sidebar + hero grid |

---

## Known Deviations

| Item | Notes |
|------|-------|
| Universal search ⌘K | Visual search bar only — command palette not wired (out of scope) |
| Intelligence section | Hidden — Radar/Space not indexed (per data rules) |
| Logo asset | Uses `melega.finance/favicon.ico` in circular frame until local raster provided |
| Sparkline on Top Pair | Decorative gradient bar only — no fake price series |
| Operator Mode footer link | Points to `/orchestrator` (existing route) |

---

## Recommended Follow-ups

1. Wire ⌘K universal search index  
2. Enable Intelligence when Radar/Space feeds are live  
3. Replace favicon with bundled round Melega logo asset  
4. Extend `pure` layout pattern to other intent screens
