# Home Trade Pixel Perfect Correction Report

**Branch:** `home-trade-screen-redesign`  
**Date:** 2026-06-30  
**Scope:** Presentation-only correction pass — no business logic, swap execution, contracts, router, wallet, farms, pools, token lists, or NFT logic touched.

## Critical fix: swap panel clipping

**Root cause:** `HomeSwapPanel` used `height: 350px` and `SwapBody { overflow: hidden }`, clipping the embedded `SmartSwapForm` (To field, quote row, Swap button, Details).

**Correction:**
- Removed fixed height; desktop `min-height: 360px`, mobile `min-height: auto`
- Set `overflow: visible` on panel and swap body
- Expanded `HomeTradeGlobalStyle` to hide toolbar strip, style token inputs (90px desktop / 96px mobile), compress gaps, and size the gold Swap/Connect button (46px desktop / 48px mobile)
- Hero row uses `min-height: 360px` (not fixed height)

**Verified:** At 1440×900 and 390×844, swap panel height ~524–532px; Connect Wallet / Swap button fully inside panel (`btnInPanel: true`).

## Visual corrections applied

### Layout tokens (`homeTradeTokens.ts`)
- Sidebar width: `260px` → `240px`
- Content max width: `1280px` → `1180px`
- Active nav background: `rgba(212,175,55,0.13)`
- Inactive nav text: `#A0A0A0`
- Added official MARCO logo URI

### Desktop (1440px)
| Area | Correction |
|------|------------|
| Sidebar | 240px, `#050505`, padding 24×16, logo 42px, Inter 22px brand |
| Main | margin-left 240px, padding 18/28px, max-width 1180px |
| Top bar | height 48px, search 500×40, wallet 138×42, `white-space: nowrap` |
| Trending ribbon | 5-col grid, gap 10, height 58px, icon 34px |
| Hero row | `500px 1fr`, gap 14, min-height 360px |
| Swap panel | 500px wide, min-height 360px, gradient `#111→#090`, overflow visible |
| Cinematic | Spec radial planet glow + speckle stars, headline 42px at left 44 / top 120 |
| Quick market | 4-col grid, 88px cards |
| List CTA + Earn | 2-col, 142px height, styled wireframe cube |
| Intelligence | Premium CSS thumbnails (radar / horizon / bars) |
| Footer | height 56px |

### Mobile (390px)
| Area | Correction |
|------|------------|
| Body | padding 14px, bottom 96px + safe-area |
| Header | 48px, logo 38px, wallet icon-only 42×42 (no wrapped text) |
| Sidebar | `display: none` |
| Trending | horizontal scroll, 72px height, 170px cards |
| Swap | full width, auto height, no clipping |
| Quick market | 2-col grid, min-height 116px |
| Bottom nav | fixed 78px + safe-area, 5 items, gold active indicator 56×3 |

### Content
- Sidebar nav: TRADE → Swap (active on `/`), no “Home” entry
- Intelligence nav links to `/query`
- Social row: SVG icons (Telegram, X, Discord) — removed `TG` / `X` / `DC` text placeholders
- MARCO card uses official round token logo
- Earn rows: APR only when real; TVL labels removed
- Brand lockup: **Melega DEX** everywhere (no MelegaSwap)

## Screenshot verification

| Viewport | File | Dimensions |
|----------|------|------------|
| Desktop | `docs/screenshots/home-trade-correction/desktop-1440x900.png` | 1440×900 |
| Mobile | `docs/screenshots/home-trade-correction/mobile-390x844.png` | 390×844 |

### Runtime checks (production build, port 3003)

| Check | Desktop | Mobile |
|-------|---------|--------|
| `[data-home-trade-screen]` | ✅ | ✅ |
| Sidebar visible | ✅ (`display: block`) | ✅ hidden (`display: none`) |
| Mobile header | hidden | ✅ visible |
| Bottom nav | hidden (CSS) | ✅ visible |
| Swap button in panel | ✅ | ✅ |
| MelegaSwap text | ❌ absent | ❌ absent |
| Raw social placeholders | ❌ absent | ❌ absent |
| Page errors | none | none |

## Build & tests

```
yarn build  → success (compiled successfully)
homepage-live.test.ts → 2/2 passed
```

## Files changed

- `apps/web/src/views/HomeTrade/homeTradeTokens.ts`
- `apps/web/src/views/HomeTrade/HomeTradeScreen.tsx`
- `apps/web/src/views/HomeTrade/HomeSwapPanel.tsx`
- `apps/web/src/views/HomeTrade/HomeTradeGlobalStyle.tsx`
- `apps/web/src/views/HomeTrade/HomeSidebar.tsx`
- `apps/web/src/views/HomeTrade/MelegaBrandLockup.tsx`
- `apps/web/src/views/HomeTrade/HomeTopBar.tsx`
- `apps/web/src/views/HomeTrade/TrendingRibbon.tsx`
- `apps/web/src/views/HomeTrade/CinematicEconomyPanel.tsx`
- `apps/web/src/views/HomeTrade/QuickMarketStrip.tsx`
- `apps/web/src/views/HomeTrade/ListProjectCta.tsx`
- `apps/web/src/views/HomeTrade/EarnOpportunities.tsx`
- `apps/web/src/views/HomeTrade/IntelligencePanel.tsx`
- `apps/web/src/views/HomeTrade/LiveActivityFeed.tsx`
- `apps/web/src/views/HomeTrade/HomeMobileHeader.tsx`
- `apps/web/src/views/HomeTrade/MobileBottomNav.tsx`
- `apps/web/src/views/HomeTrade/HomeTradeFooter.tsx`
- `docs/HOME_TRADE_PIXEL_PERFECT_CORRECTION_REPORT.md`
- `docs/screenshots/home-trade-correction/desktop-1440x900.png`
- `docs/screenshots/home-trade-correction/mobile-390x844.png`

## Forbidden files untouched

`exchange.ts`, `contracts.ts`, `wagmi.ts`, router, swap execution, wallet, farms, pools, token lists, NFT logic — **no changes**.

## Remaining deviations from reference

1. **Embedded SmartSwapForm** — inherits PancakeSwap/UIKit DOM; global CSS overrides approximate spec but token selector internal padding may differ by ±2px from Figma.
2. **Cinematic panel** — CSS gradients only (no raster planet asset); close to spec but not photographic.
3. **List project cube** — CSS wireframe cube (no 3D asset); improved from flat yellow square.
4. **Search bar** — visual placeholder only (⌘K); no command palette wired.
5. **Swap panel height** — grows beyond 360px to fit full form (~524px); intentional to prevent clipping.
6. **Connect Wallet on desktop** — uses shared `ConnectWalletButton`; styled to 138×42 but connected-state label may truncate on very narrow wallet names.
