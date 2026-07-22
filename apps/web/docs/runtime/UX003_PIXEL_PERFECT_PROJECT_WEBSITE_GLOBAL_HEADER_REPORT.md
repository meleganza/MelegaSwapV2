# UX003 — Pixel-Perfect Project Website Mode & Global Desktop Header

**Mission:** UX003  
**Branch:** `mission-ux003-project-website-global-header`  
**Date:** 2026-07-21  
**Base:** `origin/main` @ `3ee8c22c` (DS001.2)  
**Isolation:** `/Users/marcomelega/Projects/MelegaSwapV2-ux003`  
**Canonical reference:** `apps/web/docs/runtime/ux003-screenshots/reference/UX003_APPROVED_PROJECT_WEBSITE_MOCKUP.png`

---

## Status

`UX003_PIXEL_PERFECT_PROJECT_WEBSITE_GLOBAL_HEADER_CERTIFIED`

---

## Reality audit (pre-implementation)

| Surface | Finding |
| ------- | ------- |
| `/@marco` consumer | UX002 mobile stack (~720px), Hero → Chart → Buy → About… |
| `/@melega-dex` | Same stack; risk of token framing if not type-aware |
| App shell | DS001.2 already removed desktop sidebar; 72px header |
| Header nav | Trade · Liquidity · Farms · Pools · Projects · Analytics · More |
| Project sticky nav | Large mobile-style pills on all breakpoints |
| Metrics | Sparse 3-cell hero block; no 6-up strip |
| Chart/swap | Stacked vertically, not first-viewport split |
| Tokenomics/roadmap/utility | Full sections only, not compact first-viewport cards |
| Earn | Emoji icons |
| Truthfulness | No live market feed for Price/MC/Volume/etc. |

---

## What shipped

### Global header (mockup-aligned)

- Primary nav: **Trade · Liquidity · Farms · Pools · Projects · Build**
- Build dropdown: Build Studio, DEX Intelligence, Identity Hub, Identity Console, Trending, Command Center
- Header height token: **64px** (mockup / UX003 brief)
- Brand: 38px logo + gold border, 21px wordmark, 30px nav offset
- Search target width up to 320px with ⌘K chip retained
- `<1180px`: Build collapses into overflow menu (accessible dropdown)

### Project Website mode (`ProjectConsumerShell`)

Dense composition:

1. Sticky project nav (desktop underline / mobile chips)  
2. Website hero (logo, claim, badges, contract copy, CTAs, socials)  
3. Metrics strip (6 desktop / 4 mobile primary)  
4. Chart + Buy (or protocol panels) row  
5. Compact Tokenomics · Roadmap · Utility  
6. Earn 4-up (Lucide-style icons)  
7. Updates · Security · Community  
8. Progressive disclosure (About, full tokenomics/roadmap, More)

Template selection via `isTokenProjectTemplate(document)` — primary tradable asset + project type — **no slug hacks**.

### Protocol variant (`/@melega-dex`)

- No Buy Melega DEX / token price / tokenomics framing  
- Protocol metrics labels (markets, chains, …) with truthful values only  
- Chart/Buy replaced by Market Activity + Trade destination panels  

### Truthfulness

- Metrics never copy mockup sample numbers; show **Not available** when uncertified  
- Tokenomics/roadmap unpublished states are honest  
- Security section does not invent “Liquidity Locked / Team Doxxed” claims  

---

## Tests / build

| Gate | Result |
| ---- | ------ |
| `vitest` `ds0012.globalHeader.test.ts` | PASS (8) |
| `vitest` `ux003.projectWebsite.test.ts` | PASS (6) |
| `yarn next build` | PASS |
| Forbidden files | Untouched |

---

## Screenshots

| File | Viewport |
| ---- | -------- |
| `ux003-screenshots/marco-desktop-1440x900.png` | 1440×900 |
| `ux003-screenshots/marco-mobile-390x844.png` | 390×844 |
| `ux003-screenshots/melega-dex-desktop-1440x900.png` | 1440×900 |
| `ux003-screenshots/header-trade-1440.png` | header on Trade |
| `ux003-screenshots/reference/UX003_APPROVED_PROJECT_WEBSITE_MOCKUP.png` | approved source |

---

## Reference Fidelity Audit

Compared implementation screenshots to the approved mockup.

| Area | Match | Intentional deviation | Justification |
| ---- | ----- | --------------------- | ------------- |
| Header primary labels | Yes | — | Trade…Build |
| Header height 64px | Yes | Supersedes DS001.2 72px | Mockup / UX003 brief wins over prior chrome token |
| Brand Melega/DEX split | Yes | Logo border `#D8B328` | Per brief |
| Search + ⌘K | Yes | — | Existing GlobalSearch |
| Chain selector “BNB Smart Chain” | Partial | Compact NetworkSwitcher chrome may not show full label at all widths | Reusing certified NetworkSwitcher; no new chain logic |
| Connected wallet gold border | Partial | Depends on UserMenu connected styles | Existing wallet control retained |
| Header social icons (TG/X/IG) | No | Not added as separate header cluster | Links live on project hero/community; avoid inventing global social chrome without shared asset SSOT |
| Hero logo frame 164 / halo | Yes | Square frame radius 36 (brief) vs circular mockup art | Brief geometry preferred; mockup art is circular content inside frame |
| Hero title 52px + ticker chip | Partial | Ticker chip may omit if registry symbol field unavailable in render path | No invented ticker |
| Hero CTAs Buy / Chart / Website / ⋯ | Yes | — | |
| Join the Community 3×2 | Yes | Only real registry socials (no empty placeholders) | Brief: do not invent empty slots |
| Metrics 6-up layout | Yes | Values = Not available | Mockup numbers illustrative only |
| Chart / Swap ~7/5 split | Yes | Chart may show insufficient history | Real indexer only |
| Timeframes 1H…ALL | Yes | 1W/1M/1Y/ALL disabled until live intervals exist | No synthetic candles |
| Compact info row 3 cards | Yes | Lock illustration omitted when space-tight; honest unpublished copy | No fake milestones/utilities |
| Earn 4-up icons | Yes | Card count depends on registered destinations | No fake earn products |
| Mobile hero centered + 2×2 metrics | Yes | — | |
| Mobile bottom nav Trade/Earn/Find/Build/Own | Yes | UX002 preserved | Frozen |
| Gold `#DDB92F` vs DS001 `#F4C430` | Partial | Project Website surfaces use `#DDB92F`; platform DS001 gold remains for shared chrome where already wired | UX003 local website tokens + DS001 foundation coexistence |
| Display font Orbitron | Partial | Uses existing `PREMIUM_FONT_DISPLAY` (Sora stack) | Brief: do not bundle unapproved fonts |

**Material remaining deltas (<4px target):** chain label typography in header; optional header social cluster; ticker chip when symbol field missing; full lock illustration always visible in tokenomics card.

---

## Frozen systems confirmation

No changes to: PP001–PP014 registries/schemas/APIs, router/quoting/approvals, farms/pools/LB execution, wallet relationship resolver logic, machine contracts, NFT/token-list/core exchange contracts files.

---

## Files touched (mission-scoped)

- `apps/web/src/app-shell/config/globalHeaderNav.ts`
- `apps/web/src/app-shell/MelegaAppShell.tsx` (comment only)
- `apps/web/src/app-shell/__tests__/ds0012.globalHeader.test.ts`
- `apps/web/src/design-system/melega/components/GlobalHeader/MelegaGlobalHeader.tsx`
- `apps/web/src/design-system/melega/tokens/ds001/layout.ts`
- `apps/web/src/views/ProjectPage/consumer/*` (website mode components + tests)
- `apps/web/docs/runtime/ux003-screenshots/**`
- `apps/web/docs/runtime/UX003_PIXEL_PERFECT_PROJECT_WEBSITE_GLOBAL_HEADER_REPORT.md`
