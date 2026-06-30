# Home Art Direction Pass 01

**Branch:** `home-trade-screen-redesign`  
**Scope:** Presentation-only visual refinement. No changes to contracts, router, wallet, swap execution, farms, pools, token lists, or NFT logic.

## Before / After Screenshots

| Viewport | Before | After |
|----------|--------|-------|
| Desktop 1440×900 | `docs/screenshots/home-art-direction-01/before/desktop-1440x900.png` | `docs/screenshots/home-art-direction-01/after/desktop-1440x900.png` |
| Mobile 390×844 | `docs/screenshots/home-art-direction-01/before/mobile-390x844.png` | `docs/screenshots/home-art-direction-01/after/mobile-390x844.png` |

*Before = pixel-perfect correction pass (`c49fe68`). After = this pass.*

---

## 01 — Swap Module

- Desktop card locked to **500×360px**, padding **20px** (16px vertical on desktop for fit).
- Global CSS compacts embedded `SmartSwapForm`:
  - Inputs **76px** (`#swap-currency-input/output`)
  - Token selector **38px**
  - Switch **30px**
  - Swap / Connect button **44px** with press + gold hover
  - Hidden: toolbar strip, balance row, percent chips, common bases, details dropdown, stable-swap checkbox
  - Amount font **20px** (down from 28px)
- Swap reads as a designed module, not a raw Pancake embed.

## 02 — Hero Area

- Hero row **max-height 360px**, grid **45fr / 55fr** (trade / cinematic).
- Reduced vertical padding across main content (~20% density increase).

## 03 — Cinematic Panel

- Stronger planet glow bottom-right, richer dark sky gradient.
- Star speckle layer + 5 subtle gold particles.
- Slow **9s** glow pulse animation on horizon layer.

## 04 — Trending Ribbon

- Desktop: infinite horizontal scroll (**48s** loop), duplicated items.
- Pauses on hover and pointer drag.
- Soft fade-in + hover elevation on cards.

## 05 — Top Cards (Quick Market)

- Decorative elements per card: sparkline mask, trend arrow, live badge, progress line.
- Hover elevation + border glow.

## 06 — List Your Project

- Premium dark wireframe cube (inner glow, reflection, dashed frame).
- Card padding **24px**.
- Buttons **46px** height, equal width grid.

## 07 — Earn Opportunities

- Rows use fixed **3-column grid**: pair | APR | TVL (TVL only when real data present).
- Row height **30px**, right-aligned APR/TVL.

## 08 — Live Activity

- Timeline layout: icon pill, event, context, time.
- Gold dividers between rows.
- Staggered insertion animation.

## 09 — Intelligence

- Thumbnails occupy **~45%** of card height (radar rings, horizon glow, chart bars).
- Hover elevation.

## 10 — Search Bar

- Height **42px**, radius **12px**, padding **16px**.
- Lighter placeholder (`#6B6B6B`), subtler ⌘K pill.

## 11 — Connect Wallet

- Height **40px**, horizontal padding **20px**, font **14/700**, nowrap.

## 12 — Sidebar

- Section spacing **32px**, nav item spacing **10px**.
- Premium breathing room, no heavy separators.

## 13 — Logos

- `MelegaBrandLockup` + MARCO card: `onError` → gold gradient placeholder (no broken images).
- Official MARCO token URI retained.

## 14 — Micro Animations

- Card hover elevation + border glow.
- Gold button hover / press (swap + wallet).
- Ribbon ticker scroll.
- Timeline row fade-in.
- Cinematic glow pulse + particle drift.

## 15–17 — Density, Typography, Grid

- **12-column** content grid with **14px** gutters.
- Section titles: **Orbitron 18px**; body **14px**; meta **12px**.
- Tighter section margins site-wide.

---

## Build & Tests

```
yarn build  → success
homepage-live.test.ts → 2/2 passed
```

## Runtime Checks (production)

| Check | Result |
|-------|--------|
| Hero height | 360px max |
| Swap input height | 76px |
| `MelegaSwap` text | absent |
| Page errors | none |

## Files Changed

- `apps/web/src/views/HomeTrade/homeTradeTokens.ts`
- `apps/web/src/views/HomeTrade/HomeTradeScreen.tsx`
- `apps/web/src/views/HomeTrade/HomeSwapPanel.tsx`
- `apps/web/src/views/HomeTrade/HomeTradeGlobalStyle.tsx`
- `apps/web/src/views/HomeTrade/CinematicEconomyPanel.tsx`
- `apps/web/src/views/HomeTrade/TrendingRibbon.tsx`
- `apps/web/src/views/HomeTrade/QuickMarketStrip.tsx`
- `apps/web/src/views/HomeTrade/ListProjectCta.tsx`
- `apps/web/src/views/HomeTrade/EarnOpportunities.tsx`
- `apps/web/src/views/HomeTrade/LiveActivityFeed.tsx`
- `apps/web/src/views/HomeTrade/IntelligencePanel.tsx`
- `apps/web/src/views/HomeTrade/HomeTopBar.tsx`
- `apps/web/src/views/HomeTrade/HomeSidebar.tsx`
- `apps/web/src/views/HomeTrade/MelegaBrandLockup.tsx`
- `docs/HOME_ART_DIRECTION_PASS_01.md`
- `docs/screenshots/home-art-direction-01/**`

## Forbidden Files

Untouched: `exchange.ts`, `contracts.ts`, `wagmi.ts`, router, swap execution, wallet, farms, pools, token lists, NFT logic.

## Remaining Deviations

1. Embedded swap still uses Pancake/UIKit DOM — CSS overrides approximate spec; slippage row hidden on home (available via settings gear).
2. Cinematic uses CSS-only planet (no raster asset).
3. Search bar is visual-only (no command palette wired).
4. Ribbon auto-scroll uses CSS transform (not drag-to-scroll on desktop).
