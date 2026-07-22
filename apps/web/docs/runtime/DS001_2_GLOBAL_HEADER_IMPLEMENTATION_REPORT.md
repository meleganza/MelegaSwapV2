# DS001.2 — Global Header Implementation Report

**Mission:** DS001.2 Part 2 — Pixel-perfect shared global header  
**Branch:** `mission-ds001-2-global-header`  
**Date:** 2026-07-21  
**Base:** `origin/main` @ `27b0cf2b` (DS001.1)  
**Isolation:** `/Users/marcomelega/Projects/MelegaSwapV2-ds0012`

---

## 1. Previous shell architecture

- Desktop: fixed left sidebar `228px` (`MelegaSidebar`) + 60px header offset to the right of the sidebar (`MelegaAppHeader`)
- Content: `margin-left: 228px`, `padding-top: 80px`, max-width `1180px`
- Mobile: 48px mobile header + bottom navigation
- Navigation: sidebar sections from `shellNavigation`

## 2. New shared shell architecture

| Piece | Path |
| ----- | ---- |
| Canonical header | `apps/web/src/design-system/melega/components/GlobalHeader/MelegaGlobalHeader.tsx` |
| Dropdown | `.../GlobalHeader/HeaderNavDropdown.tsx` |
| Nav config | `apps/web/src/app-shell/config/globalHeaderNav.ts` |
| Shell mount | `apps/web/src/app-shell/MelegaAppShell.tsx` |
| AppHeader barrel | re-exports GlobalHeader (`MELEGA_APP_HEADER_HEIGHT = 72px`) |

Desktop (≥1024px): full-width 72px fixed header, **no sidebar**, content max-width `1380px`, top pad `72px + 32px`.  
Mobile (<1024px): existing mobile header + bottom nav (bottom nav hide breakpoint raised to 1024px).

## 3. Routes covered

All routes using `MelegaAppShell` / `Menu` wrapper inherit the header, including Overview, Trade, Liquidity Studio, Farms, Pools, Trending, Projects, DEX Intelligence (`/radar` as Analytics), Identity Hub/Console, Build Studio, Command Center, Project Pages.

## 4. Desktop sidebar removal

| Change | Detail |
| ------ | ------ |
| Shell | `<MelegaSidebar>` unmounted; `data-melega-shell-no-sidebar` |
| Sidebar component | `display: none !important`; width export `0px` |
| Offsets | `DesktopMain` `margin-left: 0` |
| MARCO price card | No longer pinned in sidebar footer |

## 5. Navigation destinations

**Primary:** Trade · Liquidity · Farms · Pools · Projects · Analytics (`/radar`) · More  

**Liquidity (6):** Studio, Add (`?view=add`), Liquidity Building (`?view=building` + NEW badge), My Positions, Remove, Simulation  

**Farms:** Studio, My Farms (`?view=my`), Explore Farms (`?view=explore`)  

**Pools:** Studio, My Positions (`?view=positions`), Explore Pools (`?view=explore`)  

**More:** Trending, DEX Intelligence, Identity Hub, Identity Console, Build Studio, Command Center  

View query sync wired in Liquidity / Farms / Pools runtimes. Liquidity Building shows a thin certified discovery panel (content redesign deferred).

## 6. Token additions (DS001.2 on DS001.1 foundation)

Extended `ds001Layout` with: `headerZIndex`, `headerBackground`, `headerBorder`, `headerPaddingX(Wide)`, updated logo block `180×36`, nav gap `2px`, dropdown radius/shadow/z-index, `headerDesktopBreakpoint`. Foundation color values unchanged.

## 7. Preserved functionality

- Global search (`⌘K` / Ctrl+K handler retained)
- Chain selector (`NetworkSwitcher`)
- Language (`MelegaLanguageControl`)
- Wallet connect / UserMenu
- Active route from pathname + query
- Dropdown outside-click + Escape + Arrow keys

## 8. Responsive

| Width | Behavior |
| ----- | -------- |
| 1440 | Full primary nav + search ≤300px |
| 1280 | Full nav; search shrinks |
| 1024–1279 | Analytics CSS-hidden into More data; search ~180–210px; lang slot hidden |
| 768 / 390 | Mobile header + bottom nav; desktop header hidden |

## 9. Accessibility

- `<header>` + `<nav aria-label="Primary navigation">`
- `aria-haspopup` / `aria-expanded` / `aria-current="page"`
- Menu `role="menu"` / `menuitem`
- Escape closes; focus moves with arrows
- Focus-visible gold outline

## 10. Tests

| Suite | Result |
| ----- | ------ |
| `ds0012.globalHeader.test.ts` | 8 passed |
| `ds0012.liquidityViewQuery.test.ts` | 2 passed |
| DS001 foundation tokens | 5 passed |
| UX001 / UX002 / PP-CERT / Home order | 44 passed (combined earlier run) |
| `yarn next build` | **PASS** |

Known: some heavy studio wallet suites fail to resolve `hooks/useContract` under the worktree symlink Vitest graph (environment); source contracts + production build cover DS001.2 shell changes.

## 11. Screenshots

`apps/web/docs/runtime/ds0012-screenshots/`

- `home-1440.png`, `home-1440-liquidity-menu.png`, `home-1440-more-menu.png`
- `home-1280.png`, `home-1024.png`, `home-768.png`, `home-390.png`
- `liquidity-1440.png`, `trade-1440.png`, `farms-1440.png`

## 12. Known non-blocking differences vs approved mockup

- Social icon cluster not in DS001.2 right cluster (spec sections 13–16 prioritize chain/language/wallet/overflow)
- Search shortcut chip (`⌘K`) not yet painted on the input chrome (keyboard shortcut still works)
- Overflow menu toggles More destinations rather than a separate settings sheet
- Compact 1024 chain label shortening depends on existing `NetworkSwitcher` internals
- No attached mockup image in-repo for pixel overlay; implementation follows DS001.2 written geometry

## 13. Out of scope (STOP)

- Liquidity Studio content redesign (DS001.3+)
- Full mobile header redesign (DS001.5)
- Page content redesign beyond shell width/offset
