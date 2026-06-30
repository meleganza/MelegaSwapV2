# DS-002 App Shell Migration Report

**Mission:** DS-002 — Migrate global application shell to Melega Design System  
**Branch:** `design-system-foundation`  
**Commit:** DS-002 App Shell Migration

---

## Summary

Replaced the legacy Pancake UIkit `Menu` shell with a new `MelegaAppShell` built exclusively from `design-system/melega` components. The homepage now uses the global shell (removed `hideMenu`) while **HomeTrade content modules** (swap card, cinematic, market strip, CTA, earn, activity, intelligence) remain unchanged.

---

## Shell Components Migrated

| Area | Before | After |
|------|--------|-------|
| Global menu | `@pancakeswap/uikit` Menu | `MelegaAppShell` |
| Desktop sidebar | HomeTrade-local / UIkit | `MelegaSidebar` + `MelegaSidebarSection` + `MelegaSidebarItem` |
| Desktop header | HomeTrade `HomeTopBar` / UIkit | `MelegaAppHeader` + `MelegaSearchBar` |
| Social icons | Sidebar bottom / scattered | `MelegaSocialIcons` in desktop header |
| MARCO card | HomeTrade sidebar | `MelegaMarcoCard` in sidebar footer |
| Brand | HomeTrade `MelegaBrandLockup` | `MelegaBrandLockup` (design system) |
| Mobile header | HomeTrade `HomeMobileHeader` | Shell `MobileHeader` + DS brand |
| Mobile bottom nav | HomeTrade `MobileBottomNav` | `MelegaBottomNavigation` |
| Connect wallet | UIkit Button styling | `ConnectWalletButton` + shell CSS neutralizer |
| Main wrapper | Per-page offsets | `DesktopMain` 230px offset, 1180px max content |

### Design system extensions (DS-002)

- `MelegaBrandLockup`
- `MelegaSocialIcons`
- `MelegaMarcoCard`
- `MelegaSidebar` (+ `MELEGA_SIDEBAR_WIDTH`)
- `MelegaAppHeader` (+ `MELEGA_APP_HEADER_HEIGHT`)
- `MelegaSidebarItem` — `forwardRef` for Next.js `Link`

---

## Files Changed

### New
- `apps/web/src/app-shell/MelegaAppShell.tsx`
- `apps/web/src/app-shell/AppShellStyles.tsx`
- `apps/web/src/app-shell/hooks/useAppShellData.ts`
- `apps/web/src/app-shell/config/navigation.ts`
- `apps/web/src/app-shell/icons.tsx`
- `apps/web/src/app-shell/index.ts`
- `apps/web/src/design-system/melega/components/BrandLockup/*`
- `apps/web/src/design-system/melega/components/SocialIcons/*`
- `apps/web/src/design-system/melega/components/MarcoCard/*`
- `apps/web/src/design-system/melega/components/Sidebar/*`
- `apps/web/src/design-system/melega/components/AppHeader/*`
- `apps/web/src/design-system/melega/constants/brand.ts`

### Modified
- `apps/web/src/components/Menu/index.tsx` — delegates to `MelegaAppShell`
- `apps/web/src/pages/index.tsx` — removed `hideMenu` (uses global shell)
- `apps/web/src/views/HomeTrade/HomeTradeScreen.tsx` — removed duplicate shell; content only
- `apps/web/src/design-system/melega/components/index.ts`
- `apps/web/src/design-system/melega/components/SidebarItem/MelegaSidebarItem.tsx`
- `apps/web/src/design-system/melega/components/BottomNavigation/MelegaBottomNavigation.tsx`
- `apps/web/src/design-system/melega/index.ts`

### HomeTrade shell files (unused by homepage, retained)
- `HomeSidebar.tsx`, `HomeTopBar.tsx`, `HomeMobileHeader.tsx`, `MobileBottomNav.tsx` — not deleted; no longer mounted on `/`

---

## Screenshots

| Viewport | Path |
|----------|------|
| Desktop 1440×900 | `docs/screenshots/ds-002-app-shell/desktop-1440x900.png` |
| Desktop 1728×1117 | `docs/screenshots/ds-002-app-shell/desktop-1728x1117.png` |
| Mobile 390×844 | `docs/screenshots/ds-002-app-shell/mobile-390x844.png` |

---

## Validation Checklist

| # | Check | Result |
|---|-------|--------|
| 1 | Sidebar compact, no overlap | ✅ 230px width |
| 2 | Social icons in header | ✅ `data-melega-social-icons` |
| 3 | MARCO logo fallback | ✅ `MelegaMarcoCard` with onError |
| 4 | Brand “Melega DEX” | ✅ No “MelegaSwap” in shell |
| 5 | Connect Wallet nowrap | ✅ shell CSS `white-space: nowrap` |
| 6 | Mobile no sidebar | ✅ sidebar `display:none` &lt;768px |
| 7 | Mobile bottom nav | ✅ `MelegaBottomNavigation` |
| 8 | HomeTrade content renders | ✅ `data-home-trade-screen` present |
| 9 | Swap execution untouched | ✅ `HomeSwapPanel` not modified |
| 10 | Forbidden files untouched | ✅ exchange, contracts, wagmi |

---

## Build & Tests

```
yarn build (apps/web) → success
vitest src/design-system/melega/__tests__/ → 8/8 pass
```

---

## Forbidden Files Untouched

- `exchange.ts`, `contracts.ts`, `wagmi.ts`
- `HomeSwapPanel.tsx`, `useHomeTradeData.ts`
- Swap / liquidity / farms / pools execution logic
- Routes (no new routes; `hideMenu` removed on index only)

---

## Remaining Shell Deviations

1. **Wallet / network** — Still uses existing `ConnectWalletButton`, `UserMenu`, `NetworkSwitcher` (wallet logic untouched); styled via shell-level CSS neutralizer only.
2. **Settings** — Still uses legacy `GlobalSettings` modal; icon area neutralized to 36×36 grey (no purple).
3. **Other pages** — Farms, swap, pools, etc. now inherit new shell via `Menu` but page bodies still use legacy Pancake layouts (out of scope).
4. **`pure` pages** — Operator pages (`/workspace`, `/launch`, etc.) still bypass shell via `hideMenu`/`pure` flag (intentional).
5. **Search** — `MelegaSearchBar` is visual only; ⌘K shortcut not wired (no route/search logic in this mission).
6. **HomeTrade shell files** — Orphaned components remain in repo; cleanup deferred.

---

## Next Steps (out of scope)

- DS-003+: Migrate individual page bodies to design system components.
- Remove orphaned HomeTrade shell files once all routes use global shell.
- Wire search command palette.
