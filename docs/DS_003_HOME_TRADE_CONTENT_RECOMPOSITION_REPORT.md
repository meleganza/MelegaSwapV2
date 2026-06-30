# DS-003 Home Trade Content Recomposition Report

**Mission:** DS-003 — Recompose HomeTrade content using Melega Design System  
**Branch:** `design-system-foundation`  
**Commit:** DS-003 Home Trade Content Recomposition

---

## Summary

Refactored **only** the HomeTrade content area inside the DS-002 global shell. All presentation modules now compose from `design-system/melega` components and tokens. Swap wiring (`SmartSwapForm`, `SwapFeaturesProvider`, settings modal) is unchanged; only the panel shell and global embed overrides were migrated to design-system tokens.

**Not touched:** `MelegaAppShell`, `MelegaSidebar`, `MelegaAppHeader`, `MelegaBottomNavigation`, `useHomeTradeData`, swap execution, wallet, farms/pools logic.

---

## Layout (inside shell, max-width 1180px)

### Desktop (≥768px)

| Row | Content |
|-----|---------|
| 1 | Trending ticker (`MelegaTicker`) |
| 2 | Swap panel (`MelegaSwapPanelShell`) + cinematic hero (`MelegaCinematicPanel`) — 500×360 swap, hero fills remainder |
| 3 | Market strip — 4× `MelegaStatCard` grid |
| 4 | List project CTA (`MelegaCtaCard` + `MelegaProjectCube`) + earn (`MelegaSectionCard` + `MelegaFeedRow`) |
| 5 | Live activity (`MelegaSectionCard` + `MelegaTimelineRow` / `MelegaEmptyState`) + intelligence (`MelegaIntelligenceTile`) |

### Mobile (<768px)

Ticker → swap → market strip (horizontal scroll) → list CTA → earn → live activity → intelligence. Cinematic panel hidden on mobile (DS component behavior).

---

## Design system extensions (DS-003)

| Component | Purpose |
|-----------|---------|
| `MelegaSwapPanelShell` | Swap card chrome (title, toolbar, 500×360 desktop box) |
| `MelegaCinematicPanel` | Desktop cinematic economy hero with `MelegaBadge` |
| `MelegaProjectCube` | List-project CTA visual |
| `MelegaSectionCard` | Section wrapper with `MelegaSectionTitle` |
| `MelegaIntelligenceTile` | Intelligence grid tiles (radar / space / chart variants) |

### Component enhancements

- `MelegaCtaCard` — `href` support on primary/secondary actions via Next.js `Link`
- `MelegaButton` — `as` prop for link-wrapped buttons

---

## HomeTrade modules refactored

| Module | Design system usage |
|--------|---------------------|
| `HomeTradeScreen` | DS tokens for typography/color; layout constants from `homeTradeLayout` |
| `TrendingRibbon` | `MelegaTicker` |
| `HomeSwapPanel` | `MelegaSwapPanelShell`, `MelegaButton` (settings/refresh toolbar) |
| `QuickMarketStrip` | `MelegaStatCard` grid + mobile scroll |
| `ListProjectCta` | `MelegaCtaCard`, `MelegaProjectCube` |
| `EarnOpportunities` | `MelegaSectionCard`, `MelegaFeedRow` |
| `LiveActivityFeed` | `MelegaSectionCard`, `MelegaTimelineRow`, `MelegaEmptyState` |
| `IntelligencePanel` | `MelegaSectionCard`, `MelegaIntelligenceTile` |
| `HomeTradeFooter` | `MelegaFooter` (desktop only) |
| `HomeTradeGlobalStyle` | DS `colors` tokens for embedded Pancake swap overrides |

`CinematicEconomyPanel.tsx` is superseded by `MelegaCinematicPanel` (imported directly in `HomeTradeScreen`). Orphaned pre-DS-002 shell files remain in repo but are not mounted on `/`.

---

## Swap constraints preserved

- Desktop panel: 500×360px (`MelegaSwapPanelShell`)
- Slippage / info row visible (`HomeTradeGlobalStyle` — no clip on `[class*='Info']`)
- Swap button styled and inside panel
- Legacy toolbar, balance row, percent chips hidden; Details hidden desktop, shown mobile

---

## Validation

| Check | Result |
|-------|--------|
| `yarn build` | Pass |
| `homepage-live` tests | Pass (2 tests) |
| Design system tests | Pass (3 tests) |

---

## Screenshots

| Viewport | Path |
|----------|------|
| Desktop 1440×900 | `docs/screenshots/ds-003-home-trade/desktop-1440x900.png` |
| Desktop 1728×1117 | `docs/screenshots/ds-003-home-trade/desktop-1728x1117.png` |
| Mobile 390×844 | `docs/screenshots/ds-003-home-trade/mobile-390x844.png` |

---

## Files changed

### New (design system)

- `apps/web/src/design-system/melega/components/SwapPanelShell/*`
- `apps/web/src/design-system/melega/components/CinematicPanel/*`
- `apps/web/src/design-system/melega/components/ProjectCube/*`
- `apps/web/src/design-system/melega/components/SectionCard/*`
- `apps/web/src/design-system/melega/components/IntelligenceTile/*`

### Modified

- `apps/web/src/design-system/melega/components/Button/MelegaButton.tsx`
- `apps/web/src/design-system/melega/components/CtaCard/MelegaCtaCard.tsx`
- `apps/web/src/design-system/melega/components/index.ts`
- `apps/web/src/views/HomeTrade/*` (content modules listed above)
- `docs/screenshots/ds-003-home-trade/*`

---

**Status:** DS_003_HOME_TRADE_CONTENT_RECOMPOSITION_READY
