# Home Art Direction Pass 02

**Branch:** `home-trade-screen-redesign`  
**Scope:** Presentation-only surgical refinement to match approved desktop (1440×900) and mobile (390×844) references. No changes to contracts, router, wallet, swap execution, farms, pools, token lists, or NFT logic.

## Visual Similarity Estimate

| Viewport | Score /100 | Notes |
|----------|------------|-------|
| Desktop 1440×900 | **82** | Sidebar density, ticker strip, social icons in header, cinematic horizon, 500×360 swap card, 52/48 grid all aligned. Swap embed still shows legacy Pancake internals when inspected; desktop Details row hidden to fit 360px. |
| Desktop 1728×1117 | **84** | Same components with more breathing room; first viewport shows full hero + market strip + CTA row start. |
| Mobile 390×844 | **80** | Bottom nav, compact header, horizontal market scroll, stacked modules. Minor spacing deltas vs reference on Earn row alignment. |

*Not claiming 95+ — embedded SmartSwapForm chrome and token-area proportions still differ subtly from static mock.*

---

## Screenshots

| Viewport | Path |
|----------|------|
| Desktop 1440×900 | `docs/screenshots/home-art-direction-02/desktop-1440x900.png` |
| Desktop 1728×1117 | `docs/screenshots/home-art-direction-02/desktop-1728x1117.png` |
| Mobile 390×844 | `docs/screenshots/home-art-direction-02/mobile-390x844.png` |

**Reference images:** `assets/MELEGA_DEX_INSTRUCTIONS-*.png`, `assets/MELEGA_DEX_MOBILE_INSTRUCTIONS-*.png`

---

## Changes Summary

### Sidebar (230px)
- Fixed width 230px, padding 22/14/18, section spacing 22px, nav items 32px
- Official Melega logo via `SafeLogo` with MM fallback (no broken images)
- MARCO card 72px with real price when available
- Social icons **removed** from sidebar bottom

### Top bar
- Social icons (Telegram, X, Discord, Globe) moved to header right before network selector
- Search 500×42px, Connect Wallet gold gradient 40px nowrap

### Trending ticker
- Replaced boxed cards with 46px premium strip (45s scroll, pause on hover)
- Gold gradient background, dot separators, no rigid card boxes

### Swap card (500×360)
- Title **Swap**, subtitle per spec, settings + refresh icons in header
- Lighter token surfaces, pill selectors, gold switch button
- Legacy embedded toolbar hidden; slippage/quote row visible
- Connect Wallet button fits inside 360px (`btnInPanel: true` verified)

### Cinematic panel
- Layered black sky, stars, gold horizon ellipse lower-right, 9s glow
- Inter headline 38px/800, badges top-left

### Market strip
- Desktop 74px cards, 4-column grid; mobile horizontal scroll 156×112
- Optional 5s rotation when >4 real cards

### Below-hero grid
- 52% / 48% two-column: List CTA + Earn, then Live Activity + Intelligence

### Mobile
- 50px header, 40px wallet icon, 78px bottom nav with gold active indicator
- Full-width stacked modules, 14px body padding

### Motion
- Ticker 45s linear, cinematic 9s glow, stars 7s twinkle, market rotator 5s
- `prefers-reduced-motion` respected

---

## Remaining Differences

1. Embedded `SmartSwapForm` DOM still drives input layout — not a fully custom swap component.
2. Desktop Details dropdown hidden inside 360px card (shown on mobile).
3. Input height 70px on desktop (spec 74px) — tradeoff for button fit without clipping.
4. Intelligence thumbnails improved but still CSS/SVG approximations vs reference art.
5. Earn Opportunities two-column desktop layout may wrap on narrow right column.

---

## Files Changed

```
apps/web/src/views/HomeTrade/CinematicEconomyPanel.tsx
apps/web/src/views/HomeTrade/EarnOpportunities.tsx
apps/web/src/views/HomeTrade/HomeMobileHeader.tsx
apps/web/src/views/HomeTrade/HomeSidebar.tsx
apps/web/src/views/HomeTrade/HomeSwapPanel.tsx
apps/web/src/views/HomeTrade/HomeTopBar.tsx
apps/web/src/views/HomeTrade/HomeTradeGlobalStyle.tsx
apps/web/src/views/HomeTrade/HomeTradeScreen.tsx
apps/web/src/views/HomeTrade/IntelligencePanel.tsx
apps/web/src/views/HomeTrade/ListProjectCta.tsx
apps/web/src/views/HomeTrade/LiveActivityFeed.tsx
apps/web/src/views/HomeTrade/MelegaBrandLockup.tsx
apps/web/src/views/HomeTrade/MobileBottomNav.tsx
apps/web/src/views/HomeTrade/QuickMarketStrip.tsx
apps/web/src/views/HomeTrade/TrendingRibbon.tsx
apps/web/src/views/HomeTrade/homeTradeShared.tsx (new)
apps/web/src/views/HomeTrade/homeTradeTokens.ts
docs/HOME_ART_DIRECTION_PASS_02.md
docs/screenshots/home-art-direction-02/*
```

## Forbidden Files Untouched

- `exchange.ts`, `contracts.ts`, `wagmi.ts`
- Router, wallet, swap execution, liquidity, farms, pools, token lists, NFT logic

---

## Build & Test Results

```
yarn build (apps/web) → success
vitest src/lib/homepage-live/__tests__/homepage-live.test.ts → 2/2 passed
```

### Runtime verification (Playwright @ 1440×900)

| Check | Result |
|-------|--------|
| Swap panel 500×360 | ✅ |
| Sidebar 230px | ✅ |
| Social in header | ✅ |
| No "MelegaSwap" text | ✅ |
| Connect button inside panel | ✅ |
| Trending ticker visible | ✅ |
