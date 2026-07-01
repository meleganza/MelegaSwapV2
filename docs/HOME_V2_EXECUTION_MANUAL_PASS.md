# Home V2 Cockpit Evolution — Pixel Manual Execution Pass

**Mission:** Home V2 Pixel-Perfect Implementation Manual  
**Branch:** `design-system-foundation`  
**Commit:** Home V2 Pixel Manual Execution

---

## Summary

Evolved the DS-003 HomeTrade implementation to match the attached Home V2 cockpit reference (desktop 1440×900, mobile 390×844). Presentation-only changes across design-system tokens, shell spacing, and HomeTrade composition. Swap execution, wallet, farms, pools, and data hooks are unchanged.

---

## Token updates (exact manual colors)

| Token | Value |
|-------|-------|
| Background | `#050505` |
| Canvas | `#000000` |
| Surface 1/2/3 | `#0D0D0D` / `#151515` / `#1C1C1C` |
| Gold / Light / Glow | `#D4AF37` / `#F4C542` / `#FFD55A` |
| Text | `#FFFFFF` / `#B3B3B3` / `#707070` |
| Success / Error | `#22C55E` / `#EF4444` |

Typography locked to **Inter** (Orbitron removed from brand fallback). Cockpit section titles: 24px / 850 weight desktop, 22px mobile.

---

## Shell corrections (DS-002 evolution)

### Sidebar (230px)
- Padding `24px 14px 14px`; logo row 44px; section gap 18px; item height 30px
- Active item: gold left border + `rgba(212,175,55,0.13)` background
- MARCO card: 70px height, 28px logo, `#0A0A0A` surface
- Removed EN label from sidebar footer; social icons remain in header only

### Header (64px)
- Search: 500×42px, `#080808` fill, `⌘K` shortcut 32×24px
- Right group gap 18px: Telegram, X, Discord, Globe, network, Connect Wallet, settings
- Connect Wallet: gold gradient, 800 weight, no wrap

### Content offset
- Main padding top: `calc(64px + 12px)` → content starts at y≈76px inside shell

---

## HomeTrade cockpit layout

| Row | Spec | Implementation |
|-----|------|----------------|
| Ticker | 44px desktop / 36px mobile, `melegaTicker` 45s | `MelegaTicker` |
| Cockpit | 500px swap + cinematic, 360px height, 14px gap | `MelegaSwapPanelShell` + `MelegaCinematicPanel` |
| Market strip | 5-col grid, 76px cards, sparkline decor | `MelegaStatCard` + `QuickMarketStrip` |
| Lower grid | 1.15fr / 1fr × 2 rows | `HomeTradeScreen` `LowerRow` |
| Footer | 54px, muted links | `MelegaFooter` wrapper |

### Swap panel (visual only)
- 500×360px, 18px radius, gold border gradient shell
- Token fields 74px (104px mobile); button 46px (52px mobile)
- Legacy toolbar/balance/percent chips hidden via `HomeTradeGlobalStyle`
- Settings + refresh icon buttons in shell toolbar
- Slippage inside details row — not clipped

### Cinematic panel
- Planet horizon at 82%/88%, `melegaPlanetGlow` 9s, star twinkle 7s
- Live market pulse overlay (real ribbon/market data only)
- Badges: Live on BNB Chain + Canonical MARCO Economy

### CTA / Earn / Activity / Intelligence
- List project CTA: 190px, 120px glass cube, updated copy
- Earn: dot + pair + APR grid rows (30px)
- Live activity: compact empty state with 1.5s pulse
- Intelligence: 3 tiles, horizontal scroll on mobile (150×104px)

---

## Assets

- Official Melega logo: `apps/web/public/images/melega.png` (from melega.finance)
- Brand lockup fallback: black circle, white **MM**, gold ring (Inter)

---

## Validation

| Check | Result |
|-------|--------|
| `yarn build` | Pass |
| `homepage-live` tests | Pass |
| Design system tests | Pass |

---

## Screenshots

| Viewport | Path |
|----------|------|
| Desktop 1440×900 | `docs/screenshots/home-v2-pixel-manual/desktop-1440x900.png` |
| Desktop 1728×1117 | `docs/screenshots/home-v2-pixel-manual/desktop-1728x1117.png` |
| Mobile 390×844 | `docs/screenshots/home-v2-pixel-manual/mobile-390x844.png` |

---

## Files changed (high level)

- `design-system/melega/tokens/*` — V2 color, typography, animation, radius
- `design-system/melega/components/*` — Sidebar, header, ticker, swap shell, cinematic, stat/section/cta cards
- `app-shell/*` — Shell padding, connect wallet gradient, MARCO footer
- `views/HomeTrade/*` — Layout grid, global swap overrides, content wrappers
- `apps/web/public/images/melega.png` — Official logo asset

---

**Status:** HOME_V2_PIXEL_MANUAL_EXECUTION_READY
