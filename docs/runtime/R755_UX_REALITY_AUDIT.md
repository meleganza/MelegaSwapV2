# R755 — Melega DEX UX Reality Audit

**Date:** 2026-07-09  
**Mission:** Surgical fixing roadmap — audit only, no fixes  
**Constraints:** Smart Router, KERL, Treasury Runtime, Wrapper, contracts — **untouched**

---

## Verdict

**`UX_AUDIT_READY`**

Audit completed from route map, component wiring, `placeholderAudit.ts`, navigation config, and existing screenshot baselines. No deploy/runtime blockers prevented classification.

**Proposed capture folder for fix validation:** `docs/screenshots/r755-ux-reality-audit/`

---

## Surgical Fix Roadmap (priority order)

### Wave 1 — P0 Navigation & trust (1–2 days)

| ID | Fix |
|----|-----|
| R755-001 | Unify social links to single canonical source |
| R755-002 | Point home RADAR card to `/radar` (or label “External”) |
| R755-003 | Mobile bottom nav: expose Trending or rename Find |
| R755-004 | Resolve Identity Hub route naming (`/collectibles` vs `/identity`) |
| R755-005 | Wire Identity Hub hero CTAs or remove |

### Wave 2 — P0 Data honesty (2–3 days)

| ID | Fix |
|----|-----|
| R755-006 | Configure BscScan holder API OR hide holders with reason |
| R755-007 | Fix Trade holder query to use active `chainId` |
| R755-008 | Hide or collapse whale/smart-money panels when `SOURCE_DOES_NOT_EXIST` |
| R755-009 | Retire or redirect dead `/info/*` routes |

### Wave 3 — P1 Typography & labels (1–2 days)

| ID | Fix |
|----|-----|
| R755-010 | Normalize studio page title system (case, size, font) |
| R755-011 | Align nav labels with page H1s (Pools/POOLS, Overview/Trade) |
| R755-012 | Deduplicate FIND nav icons (Trending vs Identity Hub) |

### Wave 4 — P1 Responsive & clipping (2–3 days)

| ID | Fix |
|----|-----|
| R755-013 | Trade terminal mobile overflow audit |
| R755-014 | Pools header live-badge wrap on ≤767px |
| R755-015 | Shell content max-width vs studio max-width alignment |

### Wave 5 — P2 Cleanup (backlog)

| ID | Fix |
|----|-----|
| R755-016 | Delete or archive unused `HomeSidebar` / `MobileBottomNav` |
| R755-017 | Consolidate legacy `/liquidity`, `/swap`, `/pools/history` |
| R755-018 | Home staking activity slot — hide until indexer exists |

---

## Issue Register

### Global — Sidebar / Navigation / Social

#### R755-001 — Conflicting social links (P0)

| Field | Value |
|-------|-------|
| **Page** | Global header |
| **Component** | `MelegaSocialIcons` vs `SocialIcons` in `homeTradeShared.tsx` |
| **Visible problem** | Header shows Telegram `melegacommunity`, X `meleganews`, Instagram. Dead `HomeTopBar` path uses Telegram/X `melegafinance`, Discord, website — four different brand endpoints. |
| **Severity** | P0 |
| **Proposed fix** | Single `socialLinks.ts` consumed by header; remove duplicate `SocialIcons`; delete or repoint `HomeTopBar`. |
| **Pixel notes** | Header icon row: 18×18px, 14px gap, 40px row height (`MelegaSocialIcons.tsx:5-29`). |
| **Files** | `design-system/melega/components/SocialIcons/MelegaSocialIcons.tsx`, `views/HomeTrade/homeTradeShared.tsx`, `views/HomeTrade/HomeTopBar.tsx` |
| **Screenshot** | Baseline: `docs/screenshots/ds-002-app-shell/desktop-1728x1117.png` → capture: `docs/screenshots/r755-ux-reality-audit/global-header-social.png` |

#### R755-003 — Mobile Find tab skips Trending (P0)

| Field | Value |
|-------|-------|
| **Page** | Global bottom nav |
| **Component** | `shellBottomNavItems` → `MelegaBottomNavigation` |
| **Visible problem** | Mobile “Find” lands on `/projects`. Desktop sidebar has separate “Trending” → `/trending`. Users on mobile cannot reach Trending in one tap. |
| **Severity** | P0 |
| **Proposed fix** | Either href `/trending`, or sub-nav sheet on Find long-press, or rename “Find” → “Projects” and add Trending to bottom bar. |
| **Pixel notes** | Bottom nav fixed pad `96px + safe-area` on main (`MelegaAppShell.tsx:30`). |
| **Files** | `app-shell/config/navigation.ts:184-196`, `app-shell/MelegaAppShell.tsx` |
| **Screenshot** | `docs/screenshots/r600-final-excellence/trending-desktop-1440.png` (desktop has Trending); capture mobile: `docs/screenshots/r755-ux-reality-audit/mobile-bottom-nav-find.png` |

#### R755-012 — Duplicate nav icons in FIND (P2)

| Field | Value |
|-------|-------|
| **Page** | Desktop sidebar FIND section |
| **Component** | `shellNavigation` items `trending` + `collectibles` |
| **Visible problem** | Both use `icon: 'star'` — visually indistinguishable in sidebar. |
| **Severity** | P2 |
| **Proposed fix** | Assign distinct icons (`brain`/`folder` pattern) for Trending vs Identity Hub. |
| **Files** | `app-shell/config/navigation.ts:67-76` |
| **Screenshot** | `docs/screenshots/r755-ux-reality-audit/sidebar-find-icons.png` |

#### R755-016 — Dead legacy nav modules (P2)

| Field | Value |
|-------|-------|
| **Page** | N/A (dead code) |
| **Component** | `HomeSidebar.tsx`, `MobileBottomNav.tsx` |
| **Visible problem** | Not mounted in app shell but define conflicting routes: Trending→`/projects`, Intelligence→`/query`, Trade→`/`, Portfolio→`/workspace`. Risk of accidental re-wiring. |
| **Severity** | P2 |
| **Proposed fix** | Delete or move to `archive/` with README. |
| **Files** | `views/HomeTrade/HomeSidebar.tsx`, `views/HomeTrade/MobileBottomNav.tsx` |
| **Screenshot** | N/A |

---

### Home (`/`)

#### R755-002 — RADAR card leaves DEX (P0)

| Field | Value |
|-------|-------|
| **Page** | Home |
| **Component** | `GrowInsideMelegaPanel` |
| **Visible problem** | “RADAR — Discover trends and claim your profile” links to `https://radar.melega.ai` (external). In-app DEX Intelligence lives at `/radar`. |
| **Severity** | P0 |
| **Proposed fix** | `href: '/radar'` for in-app intelligence; keep external only if product-intent is separate Radar product (add “Opens external” badge). |
| **Pixel notes** | Card grid 4-up desktop; gold border hover on ecosystem cards. |
| **Files** | `views/HomeTrade/GrowInsideMelegaPanel.tsx:34-39` |
| **Screenshot** | `docs/screenshots/home-r002h-final-bugfix/home-desktop-1440x900.png` |

#### R755-011a — Nav “Overview” vs swap home (P1)

| Field | Value |
|-------|-------|
| **Page** | Home + sidebar |
| **Component** | `shellNavigation` HOME / `HomeTradeScreen` |
| **Visible problem** | Sidebar says “Overview” but page is swap-forward dashboard with embedded `HomeSwapPanel`. Separate “Trade” → `/trade` full terminal duplicates swap entry. |
| **Severity** | P1 |
| **Proposed fix** | Rename Overview → “Home” or “Dashboard”; clarify Home = summary, Trade = terminal in subtitle/tooltip. |
| **Files** | `app-shell/config/navigation.ts:33`, `views/HomeTrade/HomeTradeScreen.tsx` |
| **Screenshot** | `docs/screenshots/home-r002h-final-bugfix/home-desktop-1440x900.png` |

#### R755-018 — Staking slot always empty (P2)

| Field | Value |
|-------|-------|
| **Page** | Home |
| **Component** | `LiveActivityFeed` |
| **Visible problem** | Staking column shows perpetual empty/indexing copy — no indexer exists (`placeholderAudit` `SOURCE_DOES_NOT_EXIST`). |
| **Severity** | P2 |
| **Proposed fix** | Hide staking slot until indexer wired; or merge into single “Activity” feed. |
| **Files** | `views/HomeTrade/LiveActivityFeed.tsx`, `lib/data-policy/placeholderAudit.ts:21` |
| **Screenshot** | `docs/screenshots/r755-ux-reality-audit/home-live-activity-staking.png` |

#### R755-019 — Quick market indexing copy (P1)

| Field | Value |
|-------|-------|
| **Page** | Home |
| **Component** | `QuickMarketStrip` |
| **Visible problem** | Cards show `—` + “Waiting for indexing” / “No recent activity yet” on cold subgraph — reads as broken DEX. |
| **Severity** | P1 |
| **Proposed fix** | Distinguish loading vs empty vs misconfigured; skeleton → reason badge. |
| **Files** | `views/HomeTrade/QuickMarketStrip.tsx`, `useHomeTradeData.ts` |
| **Screenshot** | `docs/screenshots/home-r002h-final-bugfix/home-desktop-1440x900.png` |

---

### Trade (`/trade`)

#### R755-006 — Holders show em dash (P0)

| Field | Value |
|-------|-------|
| **Page** | Trade |
| **Component** | `TradePairStats` / `useTradeTerminalData` |
| **Visible problem** | Holders stat displays `—` when `NEXT_PUBLIC_BSCSCAN_API_KEY` unset (API returns 503 “Source not configured”). |
| **Severity** | P0 |
| **Proposed fix** | Deploy BscScan key on Vercel OR hide stat with tooltip “Explorer API not configured”. |
| **Files** | `pages/api/holder-count.ts:25-33`, `lib/holder-count/*`, `views/Trade/useTradeTerminalData.ts` |
| **Screenshot** | `docs/screenshots/r600-final-excellence/trade-desktop-1440.png` |

#### R755-007 — Holders query hardcoded to chain 56 (P0)

| Field | Value |
|-------|-------|
| **Page** | Trade |
| **Component** | `useTradeTerminalData` |
| **Visible problem** | `useHolderCount(56, tokenAddress)` ignores active wallet chain (e.g. 97 testnet shows mainnet holder count or wrong empty). |
| **Severity** | P0 |
| **Proposed fix** | Pass `useActiveChainId()` into `useHolderCount`. |
| **Files** | `views/Trade/useTradeTerminalData.ts:115` |
| **Screenshot** | `docs/screenshots/r714-staging-human-review/r714-staging-trade-1440.png` |

#### R755-013 — Trade layout aggressive overflow hidden (P1)

| Field | Value |
|-------|-------|
| **Page** | Trade |
| **Component** | `TradeTerminalGlobalStyle` |
| **Visible problem** | Multiple `overflow: hidden !important` + `text-overflow: ellipsis` rules — pair names, route lines, and chart controls clip on narrow viewports. |
| **Severity** | P1 |
| **Proposed fix** | Audit breakpoints 390/428px; allow chart area `overflow: visible`; test route line wrap. |
| **Pixel notes** | Chart area selector `[data-trade-chart-area]`; mobile cockpit single column. |
| **Files** | `views/Trade/TradeTerminalGlobalStyle.tsx`, `views/Trade/components/TradeRouteLine.tsx` |
| **Screenshot** | `docs/screenshots/trade-r003-terminal/desktop-1440.png`; mobile: `docs/screenshots/r755-ux-reality-audit/trade-mobile-390-clip.png` |

#### R755-020 — Chart/pair stats indexing empty (P1)

| Field | Value |
|-------|-------|
| **Page** | Trade |
| **Component** | `TradePriceChart` / `TradeChartPanel` |
| **Visible problem** | Price shows `—`, change `— (24H)`, chart empty state “pair not indexed” for unindexed pairs. |
| **Severity** | P1 |
| **Proposed fix** | Default pair to indexed MARCO/WBNB; show explicit “Select indexed pair” CTA. |
| **Files** | `views/Trade/components/TradePriceChart.tsx:329-341`, `TradeTerminalScreen.tsx` |
| **Screenshot** | `docs/screenshots/r600-final-excellence/trade-desktop-1440.png` |

#### R755-021 — Token avatar chainId hardcoded 56 (P1)

| Field | Value |
|-------|-------|
| **Page** | Trade |
| **Component** | `TradePriceChart` |
| **Visible problem** | `MelegaTokenAvatar` uses `chainId={... ? MARCO_BSC_CHAIN_ID : 56}` — wrong network badge on testnet/multi-chain. |
| **Severity** | P1 |
| **Proposed fix** | Use active chain from wallet context. |
| **Files** | `views/Trade/components/TradePriceChart.tsx:314-320` |
| **Screenshot** | `docs/screenshots/r755-ux-reality-audit/trade-avatar-chain.png` |

---

### Liquidity Studio (`/liquidity-studio`)

#### R755-010a — Title typography vs studio peers (P1)

| Field | Value |
|-------|-------|
| **Page** | Liquidity Studio |
| **Component** | `LiquidityStudioPageHeader` |
| **Visible problem** | H1 “Liquidity Studio” — 44px/800 Inter. Pools/Trending/Radar use 52–64px display/ALL CAPS. Reads as different product tier. |
| **Severity** | P1 |
| **Proposed fix** | Adopt shared `StudioPageHeader` token: one display font, one case rule per section. |
| **Pixel notes** | Title 44px line-height 1; Farms matches; Pools 64px Orbitron. |
| **Files** | `views/LiquidityStudio/components/LiquidityStudioPageHeader.tsx:23-28`, studio token files |
| **Screenshot** | `docs/screenshots/l001-liquidity-studio-pixel/liquidity-mobile-428x926.png` |

#### R755-022 — Activity table empty state (P1)

| Field | Value |
|-------|-------|
| **Page** | Liquidity Studio |
| **Component** | `LiquidityActivityTable` |
| **Visible problem** | “No liquidity activity” when subgraph empty — indistinguishable from broken indexer. |
| **Severity** | P1 |
| **Proposed fix** | Show indexer status chip from `useProtocolTransactionsIndexer`. |
| **Files** | `views/LiquidityStudio/components/LiquidityActivityTable.tsx` |
| **Screenshot** | `docs/screenshots/r107-global-ux-visual-fix/liquidity-studio-428x926.png` |

#### R755-017a — Legacy `/liquidity` not in nav (P2)

| Field | Value |
|-------|-------|
| **Page** | `/liquidity` |
| **Component** | `pages/liquidity.tsx` → `views/Pool` |
| **Visible problem** | Old positions UI still routable; nav only promotes Liquidity Studio. Deep links/bookmarks hit different UX. |
| **Severity** | P2 |
| **Proposed fix** | Redirect `/liquidity` → `/liquidity-studio` with hash to positions. |
| **Files** | `pages/liquidity.tsx` |
| **Screenshot** | N/A |

---

### Pools (`/pools`)

#### R755-010b — POOLS vs Pools label mismatch (P1)

| Field | Value |
|-------|-------|
| **Page** | Pools |
| **Component** | `PoolsStudioPageHeader` |
| **Visible problem** | Sidebar “Pools” (title case) vs page H1 **“POOLS”** 64px Orbitron; subtitle “Stake assets”. |
| **Severity** | P1 |
| **Proposed fix** | Pick one: nav “Pools” + H1 “Pools”, or nav “POOLS” to match hero. |
| **Pixel notes** | H1 `white-space: nowrap` desktop — can overflow container <1200px before mobile break. |
| **Files** | `views/PoolsStudio/components/PoolsStudioPageHeader.tsx:32-50`, `navigation.ts:60` |
| **Screenshot** | `docs/screenshots/r006-pools-premium-ui/pools-mobile-390x844.png` |

#### R755-014 — Live badge absolute positioning mobile (P1)

| Field | Value |
|-------|-------|
| **Page** | Pools |
| **Component** | `PoolsStudioPageHeader` `Right` block |
| **Visible problem** | Live badge + stats use `position: absolute; right: 0; top: 8px` desktop; on ≤767px switches static but 152px badge can wrap awkwardly with long subtitle. |
| **Severity** | P1 |
| **Proposed fix** | Stack badge below title on mobile with 12px gap; full-width badge max 160px. |
| **Files** | `views/PoolsStudio/components/PoolsStudioPageHeader.tsx:72-87` |
| **Screenshot** | `docs/screenshots/r702-pools-pixel/pools-mobile-390-before.png` |

#### R755-023 — Empty pools grid message (P1)

| Field | Value |
|-------|-------|
| **Page** | Pools |
| **Component** | `PoolsGrid` |
| **Visible problem** | “No sustainable live pools match the current filters.” — accurate but harsh; reads like product failure on testnet. |
| **Severity** | P1 |
| **Proposed fix** | Chain-aware copy: testnet → “No pools on BNB Testnet”; mainnet → filter hint. |
| **Files** | `views/PoolsStudio/components/PoolsGrid.tsx` |
| **Screenshot** | `docs/screenshots/r717-pools-live-cards/pools-r717-390.png` |

---

### Farms (`/farms`)

#### R755-024 — Empty farms on unsupported network (P1)

| Field | Value |
|-------|-------|
| **Page** | Farms |
| **Component** | `FarmsGrid` |
| **Visible problem** | “No farms available on this network.” on chain switch — correct but no CTA to switch network. |
| **Severity** | P1 |
| **Proposed fix** | Inline network switcher prompt when `SUPPORT_FARMS` excludes active chain. |
| **Files** | `views/FarmsStudio/components/FarmsGrid.tsx`, `config/constants/supportChains.ts` |
| **Screenshot** | `docs/screenshots/r005d-farms-data-restore/farms-mobile-428x926.png` |

#### R755-025 — APR “Indexing” state (P2)

| Field | Value |
|-------|-------|
| **Page** | Farms |
| **Component** | `FarmGridCard` |
| **Visible problem** | APR shows “Indexing” during RPC load — fine technically, but indistinguishable from stuck state after >10s. |
| **Severity** | P2 |
| **Proposed fix** | Timeout → “APR unavailable” with retry. |
| **Files** | `views/FarmsStudio/components/FarmGridCard.tsx` |
| **Screenshot** | `docs/screenshots/r730a-indexing-foundation/farms.png` |

---

### Trending (`/trending`)

#### R755-008a — Whale Monitor permanently empty (P0)

| Field | Value |
|-------|-------|
| **Page** | Trending |
| **Component** | `TrendingSidebar` → Whale Monitor |
| **Visible problem** | Large panel shows `—` + “Whale activity feed is not connected to a live data source.” Occupies prime sidebar space with no data path. |
| **Severity** | P0 |
| **Proposed fix** | Collapse panel; replace with “Coming soon” compact row OR wire data source. |
| **Pixel notes** | Section title 22px; empty dash 18px/700 (`TrendingSidebar.tsx:142-146`). |
| **Files** | `views/TrendingStudio/components/TrendingSidebar.tsx`, `lib/data-policy/placeholderAudit.ts:32` |
| **Screenshot** | `docs/screenshots/r600-final-excellence/trending-desktop-1440.png` |

#### R755-008b — Smart Money Tracker permanently empty (P0)

| Field | Value |
|-------|-------|
| **Page** | Trending |
| **Component** | `TrendingSidebar` → Smart Money Tracker |
| **Visible problem** | Same pattern: `—` + “Smart money tracking requires external wallet intelligence.” |
| **Severity** | P0 |
| **Proposed fix** | Same as R755-008a — hide until source exists. |
| **Files** | `views/TrendingStudio/components/TrendingSidebar.tsx:148-152` |
| **Screenshot** | `docs/screenshots/r600-final-excellence/trending-desktop-1440.png` |

#### R755-010c — TRENDING title size inconsistency (P2)

| Field | Value |
|-------|-------|
| **Page** | Trending |
| **Component** | `TrendingStudioPageHeader` |
| **Visible problem** | H1 38px vs Radar 52px / Pools 64px / Identity 56px. |
| **Severity** | P2 |
| **Proposed fix** | Map to studio typography scale tier “FIND”. |
| **Files** | `views/TrendingStudio/components/TrendingStudioPageHeader.tsx:26-31` |
| **Screenshot** | `docs/screenshots/r600-final-excellence/trending-desktop-1440.png` |

---

### Projects (`/projects`)

#### R755-006b — Project KPI holders em dash (P0)

| Field | Value |
|-------|-------|
| **Page** | Projects |
| **Component** | `ProjectsKpiRow` / `formatProjectsRuntime` |
| **Visible problem** | Holders KPI shows `—` across grid when BscScan unavailable. |
| **Severity** | P0 |
| **Proposed fix** | Shared holder policy with Trade (configure or hide). |
| **Files** | `views/ProjectsStudio/projectsRuntime/formatProjectsRuntime.ts:106`, `useProjectsIntelligenceRuntime.ts` |
| **Screenshot** | `docs/screenshots/r111b-projects/projects-desktop-1440x900.png` |

#### R755-026 — Featured chart unavailable (P1)

| Field | Value |
|-------|-------|
| **Page** | Projects |
| **Component** | `FeaturedProjectPanel` |
| **Visible problem** | “Chart unavailable” for non-indexed tokens. |
| **Severity** | P1 |
| **Proposed fix** | Only show chart slot when `useTokenDataSWR` ready; else compact metric row. |
| **Files** | `views/ProjectsStudio/components/FeaturedProjectPanel.tsx` |
| **Screenshot** | `docs/screenshots/r111b-projects/projects-desktop-1440x900.png` |

---

### DEX Intelligence (`/radar`)

#### R755-008c — Radar whale/smart money empty (P0)

| Field | Value |
|-------|-------|
| **Page** | DEX Intelligence |
| **Component** | `RadarOpsLeftColumn` |
| **Visible problem** | “Source not configured — whale activity feed.” / “smart money feed.” in Operational Intelligence column. |
| **Severity** | P0 |
| **Proposed fix** | Same collapse policy as Trending; page title already promises intelligence — empty feeds undermine trust. |
| **Files** | `views/RadarStudio/components/RadarOpsLeftColumn.tsx:74-96` |
| **Screenshot** | `docs/screenshots/r1121-radar/radar-mobile-390x844.png` |

#### R755-010d — Nav vs page title length (P2)

| Field | Value |
|-------|-------|
| **Page** | DEX Intelligence |
| **Component** | `RadarStudioPageHeader` |
| **Visible problem** | Sidebar “DEX Intelligence” (mixed case) vs H1 “DEX INTELLIGENCE” 52px display — wrapping risk in sidebar at 230px width. |
| **Severity** | P2 |
| **Proposed fix** | Shorten nav to “Radar” or “Intelligence”; keep long form in H1 only. |
| **Files** | `navigation.ts:69`, `RadarStudioPageHeader.tsx` |
| **Screenshot** | `docs/screenshots/r009-radar-intelligence-completion/radar-mobile-390x844.png` |

---

### Identity Hub (`/collectibles`)

#### R755-004 — Route/name collision with `/identity` (P0)

| Field | Value |
|-------|-------|
| **Page** | Identity Hub + `/identity` |
| **Component** | Nav + `CollectiblesStudioScreen` vs `EconomicIdentityConsole` |
| **Visible problem** | Nav “Identity Hub” → `/collectibles`. Separate `/identity` is operator Economic Identity Console (no shell). Users/bookmarks conflate two products. |
| **Severity** | P0 |
| **Proposed fix** | Rename operator route `/identity` → `/economic-identity` or gate behind Command Center; add redirect note. |
| **Files** | `pages/identity/index.tsx`, `pages/collectibles/index.tsx`, `navigation.ts:70-76` |
| **Screenshot** | `docs/screenshots/r755-ux-reality-audit/identity-route-collision.png` |

#### R755-005 — Hero CTAs non-functional (P0)

| Field | Value |
|-------|-------|
| **Page** | Identity Hub |
| **Component** | `CollectiblesStudioPageHeader` |
| **Visible problem** | “Explore Collections” and “Create Collectible” are `type="button"` with no `onClick`/`href` — clicks do nothing. |
| **Severity** | P0 |
| **Proposed fix** | Scroll to `#collections-grid` / link `/nft/` or `/build-studio`; or disable with “Soon”. |
| **Pixel notes** | Primary btn in row gap 12px; hero 56px title / 42px mobile (`CollectiblesStudioPageHeader.tsx:159-167`). |
| **Files** | `views/CollectiblesStudio/components/CollectiblesStudioPageHeader.tsx` |
| **Screenshot** | `docs/screenshots/r755-ux-reality-audit/identity-hub-hero-cta.png` |

#### R755-027 — NFT floor/volume placeholders (P1)

| Field | Value |
|-------|-------|
| **Page** | Identity Hub |
| **Component** | `CollectibleGridCard` |
| **Visible problem** | Floor and volume show `—` — no marketplace indexer (`SOURCE_DOES_NOT_EXIST`). |
| **Severity** | P1 |
| **Proposed fix** | Hide metrics or show “No marketplace data”. |
| **Files** | `views/CollectiblesStudio/*`, `placeholderAudit.ts:37` |
| **Screenshot** | `docs/screenshots/r755-ux-reality-audit/collectibles-floor-volume.png` |

---

### Build Studio (`/build-studio`)

#### R755-028 — Disabled BUILD nav items visible on expand (P1)

| Field | Value |
|-------|-------|
| **Page** | Sidebar BUILD expand |
| **Component** | `SidebarExpandableSection` + disabled items |
| **Visible problem** | “Reward MARCO holders”, “Create Token”, etc. show with “Preparation only — module not ready” — teases unavailable features. |
| **Severity** | P1 |
| **Proposed fix** | Hide disabled items until ready; or move to Build Studio page as roadmap cards only. |
| **Files** | `app-shell/config/navigation.ts:98-143`, `SidebarExpandableSection.tsx` |
| **Screenshot** | `docs/screenshots/r011b-build-studio-polish/build-studio-mobile-390x844.png` |

#### R755-029 — Gas estimate unavailable (P2)

| Field | Value |
|-------|-------|
| **Page** | Build Studio |
| **Component** | `CreateTokenPanel` (and related) |
| **Visible problem** | Gas shows “Unavailable” — intentional dry-run but reads as broken wallet. |
| **Severity** | P2 |
| **Proposed fix** | Label “Estimate on submit” instead of “Unavailable”. |
| **Files** | `views/BuildStudio/components/*`, `placeholderAudit.ts:36` |
| **Screenshot** | `docs/screenshots/r107-global-ux-visual-fix/build-studio-1440x900.png` |

#### R755-015b — Build Studio mobile padding drift (P2)

| Field | Value |
|-------|-------|
| **Page** | Build Studio |
| **Component** | `BuildStudioScreen` `Content` |
| **Visible problem** | Mobile padding `20px` vs Home/Liquidity `16px` — horizontal rhythm inconsistency. |
| **Severity** | P2 |
| **Proposed fix** | Use shared `studioLayout.contentPaddingX` token (16px). |
| **Files** | `views/BuildStudio/BuildStudioScreen.tsx:45-47` |
| **Screenshot** | `docs/screenshots/r011b-build-studio-polish/build-studio-mobile-390x844.png` |

---

### Broken routes

#### R755-009 — `/info/*` routes retired to NotFound (P0)

| Field | Value |
|-------|-------|
| **Page** | `/info`, `/info/tokens`, `/info/pairs/*` |
| **Component** | All `pages/info/**` |
| **Visible problem** | Every info route renders `<NotFound />`. Old Pancake analytics URLs 404. |
| **Severity** | P0 |
| **Proposed fix** | 301 to `/radar` or `/projects`; remove from sitemap. |
| **Files** | `pages/info/index.tsx` (and siblings) |
| **Screenshot** | `docs/screenshots/r755-ux-reality-audit/info-route-404.png` |

#### R755-030 — `/_mp/*` mini-program dead routes (P2)

| Field | Value |
|-------|-------|
| **Page** | `/_mp/farms`, `/_mp/pools/history` |
| **Component** | `pages/_mp/**` |
| **Visible problem** | Several MP routes return `<NotFound />`. |
| **Severity** | P2 |
| **Proposed fix** | Redirect to canonical studio routes or remove MP entrypoints. |
| **Files** | `pages/_mp/farms/index.tsx`, etc. |
| **Screenshot** | N/A |

#### R755-031 — `/find` BSC-only (P2)

| Field | Value |
|-------|-------|
| **Page** | `/find` |
| **Component** | `pages/find.tsx` |
| **Visible problem** | Pool finder gated BSC only — not linked in nav but reachable; wrong network shows broken state. |
| **Severity** | P2 |
| **Proposed fix** | Multi-chain support or hide route. |
| **Files** | `pages/find.tsx` |
| **Screenshot** | N/A |

---

## Authority matrix (UX ownership)

| Domain | Expected owner | Current state |
|--------|----------------|---------------|
| Navigation truth | `navigation.ts` + shell | Canonical shell OK; legacy nav dead code remains |
| Social links | Brand/marketing | Split across 2 implementations |
| Empty-state copy | `placeholderAudit` + runtime | Mix of honest unavailable vs looks-broken |
| Studio typography | Design system tokens | Per-studio drift (Orbitron, display fonts, cases) |
| Data surfaces | Subgraph + RPC + BscScan | Holders blocked on env; whale feeds unimplemented |

---

## Summary counts

| Severity | Count |
|----------|-------|
| P0 | 14 |
| P1 | 13 |
| P2 | 8 |
| **Total** | **35** |

---

## Final verdict

**`UX_AUDIT_READY`**

Surgical roadmap is actionable without touching Smart Router, KERL, Treasury, Wrapper, or contracts. Recommended first sprint: **Wave 1 + Wave 2** (navigation trust + data honesty).
