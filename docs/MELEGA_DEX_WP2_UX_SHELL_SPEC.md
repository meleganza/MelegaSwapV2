# Melega DEX — WP2 UX Shell Specification

**Status:** Implementation specification (pre-code)  
**Version:** 1.0  
**Date:** 2026-06-26  
**Prerequisite:** WP1 complete (`phase1-brand-shell` — brand shell, SEO, home copy)  
**Parent doctrine:** `MELEGA_DEX_CONSTITUTION_V1.md`, `MELEGA_DEX_SYSTEM_MAP_V1.md`, `MELEGA_DEX_AI_PROTOCOL_V1.md`  
**Classification:** `SAFE_FRONTEND_ONLY` — no contract, routing, or config logic changes

---

## 1. Scope

### 1.1 Objective

Transform the existing MelegaSwapV2 frontend (`apps/web`) into a **cohesive Melega DEX UX shell** — KIRI-aligned visual language, improved navigation, page layout, and copy — while **preserving 100% of legacy swap, liquidity, farm, and pool behavior**.

WP2 is **presentation and information architecture only**. It prepares the human surface for Phase 2 machine manifests without implementing backend APIs yet.

### 1.2 In scope

| Area | WP2 deliverable |
|------|-----------------|
| Global chrome | Header, footer, nav, network switcher styling, wallet menu labels |
| Theme | Color tokens, typography, spacing in `packages/ui` / uikit consumption |
| Homepage | Section order, copy, CTA hierarchy, remove hype metrics framing |
| Core pages | Swap, liquidity, farms, pools — layout polish, labels, empty states |
| ILO | Visible; copy alignment; inactive-state UX (no removal) |
| NFT (BSC) | Nav styling only; no contract changes |
| Localization | `en-US` priority sweep; MelegaSwap → Melega DEX remnants |
| Machine surfaces (visual) | Placeholder links/badges for future manifests (read-only UI hints) |
| Mobile | Bottom nav, touch targets, responsive tables |

### 1.3 Out of scope

| Area | Deferred to |
|------|-------------|
| Agent API implementation | WP9 |
| Token/Project registry backend | WP4–WP5 |
| Smart routing logic changes | WP7 |
| Fee collection / treasury contracts | WP8 |
| Package rename `@pancakeswap/*` | Future refactor |
| Logo binary redesign (unless asset provided) | Design handoff |
| Info (`/info`) subgraph fixes | Separate config task |
| Bridge page activation | Product decision |

### 1.4 Active chains (unchanged)

Wallet-enabled: **BSC (56), Base (8453), Polygon (137), Ethereum (1)** per `apps/web/src/utils/wagmi.ts`.  
Feature gating per `supportChains.ts` — **do not modify** in WP2.

---

## 2. Forbidden files and contract-critical areas

### 2.1 DO NOT MODIFY

```
packages/swap-sdk/src/constants.ts
apps/web/src/config/constants/exchange.ts
apps/web/src/views/Swap/SmartSwap/utils/exchange.ts
packages/smart-router/evm/constants/exchange.ts
apps/web/src/config/constants/contracts.ts
packages/multicall/index.ts
packages/farms/src/const.ts
packages/farms/constants/**
apps/web/src/config/constants/pools.tsx
apps/web/src/config/constants/supportChains.ts
apps/web/src/config/constants/lists.ts
apps/web/src/config/constants/tokenLists/**
packages/tokens/src/**          # addresses immutable
apps/web/src/utils/wagmi.ts     # CHAINS array + connectors only; appName done in WP1
```

### 2.2 MODIFY WITH EXTREME CAUTION (default: do not touch in WP2)

| File | Risk |
|------|------|
| `apps/web/src/state/**` | Business logic |
| `apps/web/src/hooks/useSwap*` | Swap logic |
| `apps/web/src/views/Swap/**/hooks/**` | Trade routing |
| `apps/web/src/views/Farms/hooks/**` | Farm stake logic |
| `apps/web/src/views/Pools/hooks/**` | Pool stake logic |
| `apps/web/src/config/abi/**` | Contract ABIs |

### 2.3 SAFE TO MODIFY (WP2 primary surface)

```
apps/web/src/components/Menu/**
apps/web/src/components/Layout/**
packages/uikit/src/components/Footer/**
packages/uikit/src/components/Svg/Icons/LogoWithText.tsx
packages/ui/css/vars.css.ts
packages/ui/tokens/**
apps/web/src/views/Home/**
apps/web/src/views/Swap/components/**     # presentational only
apps/web/src/views/Swap/index.tsx         # layout wrapper only
apps/web/src/views/AddLiquidity/**        # styling, not hooks
apps/web/src/views/RemoveLiquidity/**     # styling, not hooks
apps/web/src/views/Farms/components/**    # tables, cards — not hooks
apps/web/src/views/Pools/components/**    # not hooks or state
apps/web/public/locales/en-US.json
apps/web/src/config/localization/translations.json
apps/web/public/images/**
apps/web/src/style/Global.tsx
```

**Rule:** If a change affects transaction calldata, router address, farm pid, pool sousId, or token address → **stop**.

---

## 3. Current legacy pages to preserve

All routes below must remain **reachable and functional** after WP2.

| Route | Page file | Feature |
|-------|-----------|---------|
| `/` | `pages/index.tsx` → `views/Home` | Home |
| `/swap` | `pages/swap/index.tsx` | Swap (SmartSwap + StableSwap) |
| `/liquidity` | `pages/liquidity.tsx` | Liquidity overview |
| `/add/[[...currency]]` | `pages/add/[[...currency]].tsx` | Add liquidity |
| `/remove/[[...currency]]` | `pages/remove/[[...currency]].tsx` | Remove liquidity |
| `/find` | `pages/find.tsx` | Import pool |
| `/farms` | `pages/farms/index.tsx` | Farms |
| `/farms/history` | `pages/farms/history.tsx` | Farm history |
| `/pools` | `pages/pools/index.tsx` | Pools |
| `/pools/history` | `pages/pools/history.tsx` | Pool history |
| `/ilo` | `pages/ilo.tsx` | ILO (ifov3) |
| `/nft` | `pages/nft/index.tsx` | NFT mint (BSC) |
| `/viewNFTs` | `pages/viewNFTs.tsx` | NFT wallet |
| `/nftmarket` | `pages/nftmarket.tsx` | NFT market |
| `/info/*` | `pages/info/**` | Analytics (menu optional) |
| `/_mp/farms`, `/_mp/pools` | Mobile layouts | Preserve |
| `/451` | Geo block | Preserve |

**Middleware matcher** (`middleware.ts`) — do not remove routes from matcher.

---

## 4. New navigation structure

### 4.1 Design principles

- **Task-oriented** — group by what users do (Trade, Earn, Launch, Discover).
- **Chain-aware** — disable items when `supportChainIds` excludes active chain (existing pattern).
- **No dead links** — do not add menu items without routes.
- **ILO visible** — keep until verified inactive on-chain + product sign-off.

### 4.2 Proposed top navigation

| Order | Label | href | Sub-items | Chain gate |
|------:|-------|------|-----------|------------|
| 1 | Home | `/` | — | — |
| 2 | Trade | `/swap` | Exchange → `/swap`, Liquidity → `/liquidity` | — |
| 3 | Earn | `/farms` | Farms → `/farms`, Pools → `/pools` | `SUPPORT_FARMS` |
| 4 | Launch | `/ilo` | ILO → `/ilo` | `SUPPORT_ILO` (BSC) |
| 5 | NFT | `/nft` | Mint → `/nft`, Wallet → `/viewNFTs`, Market → `/nftmarket` | `SUPPORT_ONLY_BSC` |
| 6 | Discover | external | Coingecko, Dex Guru (existing Chart submenu) | — |

**Implementation file:** `apps/web/src/components/Menu/config/config.ts`

### 4.3 Header chrome

| Element | WP2 change |
|---------|------------|
| Logo | `LogoWithText` → Melega DEX (WP1 alt done) |
| Network switcher | KIRI dark styling; keep chain list unchanged |
| Buy MARCO | Keep `buyCakeLabel` / link; label already MARCO |
| Solana MelegaFi | Keep external link; optional style harmonization |
| Settings | Gas/theme — styling only |
| User menu | Wallet info layout polish |

### 4.4 Footer

Already updated in WP1 (`packages/uikit/src/components/Footer/config.tsx`). WP2: visual harmonization with KIRI palette; no Pancake doc links.

### 4.5 Mobile bottom navigation

Use existing uikit `BottomNav` if wired; otherwise ensure top nav `showItemsOnMobile` covers: **Home, Trade, Earn**. ILO/NFT behind “More” drawer if space constrained.

---

## 5. Homepage structure

**File:** `apps/web/src/views/Home/index.tsx` + section components.

### 5.1 Proposed section order

| # | Section | Component | WP2 action |
|---|---------|-----------|------------|
| 1 | Hero | `Hero.tsx` | WP1 copy done; WP2: visual polish, CTA prominence |
| 2 | Quick actions | **New** `QuickActionsRow` (optional) | Swap / Farms / Pools / ILO chips — links only |
| 3 | Trade pitch | `SalesSection` (`swapSectionData`) | WP1 copy done |
| 4 | Earn pitch | `SalesSection` (`earnSectionData`) | WP1 copy done |
| 5 | MARCO | `SalesSection` (`cakeSectionData`) | WP1 copy done |
| 6 | Network stats | `MetricsSection` | WP1 de-hyped; WP2: label on-chain vs static |
| 7 | Farms/Pools preview | `FarmsPoolsRow` | Live data only; show loading skeleton |
| 8 | Win / games | `WinSection` | De-emphasize lottery framing or collapse if no active game |
| 9 | Community links | `CakeDataRow` | Rename sections; Melega DEX wording |
| 10 | Footer block | `Footer` / `CakeDataRow` | KIRI styling |

### 5.2 Homepage removals / de-emphasis

- Remove or gate **hardcoded 2021 tx/user counts** in `MetricsSection` unless replaced with live `useGetStats()` only.
- Do not show **“millions / billions”** headline framing (WP1 addressed).
- NFT mint block on home — keep for BSC but visually separate from DEX core (optional collapse).

### 5.3 Homepage CTAs (priority)

1. Trade Now → `/swap`  
2. Explore Farms → `/farms`  
3. Buy MARCO → `/swap?outputCurrency=0x963556de0eb8138E97A85F0A86eE0acD159D210b` (BSC; chain-aware link via existing pattern)

---

## 6. Swap page UX improvements

**Files:** `views/Swap/`, `pages/swap/index.tsx`, presentational components only.

### 6.1 Layout

| Improvement | Safe approach |
|-------------|---------------|
| Page title | “Swap” with subtitle: “Trade tokens on Melega DEX” |
| Card container | KIRI dark card: `#000` bg, subtle border, consistent radius |
| Token selector | Larger touch targets (min 44px) |
| Route display | Show path hops as readable list (existing `SwapRoute` — style only) |
| Price impact | Color-code: green &lt;1%, yellow 1–3%, red &gt;3% (thresholds unchanged) |
| Expert mode | Keep logic; improve toggle discoverability |

### 6.2 Information hierarchy

```
1. You pay / You receive
2. Rate + price impact
3. Route path
4. Minimum received
5. Slippage tolerance (settings)
6. Confirm swap
```

### 6.3 Warnings (display only)

- Existing `SwapWarningModal` — ensure KIRI styling.
- Add **static disclaimer** footer: “Always verify token contract address. Listed ≠ audited.”
- Do **not** add new risk logic — Risk Engine is WP4+.

### 6.4 Chain switcher context

Show active chain badge on swap card. On unsupported chain, use existing `PageNetworkSupportModal` — style only.

---

## 7. Liquidity page UX improvements

**Files:** `views/AddLiquidity/`, `views/RemoveLiquidity/`, `pages/liquidity.tsx`, `pages/add`, `pages/remove`.

### 7.1 Liquidity hub (`/liquidity`)

| Improvement | Notes |
|-------------|-------|
| Your positions table | Responsive scroll; empty state CTA to `/add` |
| Import pool link | Prominent `/find` link |
| Add liquidity CTA | Primary button |

### 7.2 Add / Remove flows

| Improvement | Notes |
|-------------|-------|
| Step clarity | “Choose pair” → “Enter amounts” → “Confirm” visual steps |
| Zap (BSC) | Keep zap UI where `SUPPORT_ZAP`; label clearly |
| Stable liquidity | Separate visual tab if already present — no logic change |
| LP preview | Show pool share % (existing calculation — display polish) |

### 7.3 Copy

- Replace any “Pancake” / “CAKE” UI strings with **MARCO** / **Melega DEX** in presentation layer only.
- Pool links to block explorer — keep addresses from config.

---

## 8. Farms / Pools UX improvements

**Files:** `views/Farms/`, `views/Pools/`, presentational components.

### 8.1 Farms (`/farms`)

| Improvement | Notes |
|-------------|-------|
| Table → cards on mobile | Responsive `FarmTable` / card toggle |
| APR display | Show **only live-fetched APR**; if unavailable show `—` not fake % |
| Stale farm | If ended, use existing `isFinished` — grey out row |
| Multi-chain | Tab or filter by chain (UI filter on existing data) |
| MARCO label | Farm rewards display as MARCO where `cake` token maps |

### 8.2 Pools (`/pools`)

| Improvement | Notes |
|-------------|-------|
| Vault cards | “Auto MARCO” / “Flexible MARCO” labels (already in `pools.tsx` vault config — display only) |
| APR / ROI | Sourced fields only; tooltip: “APR varies with reward price” |
| History link | Keep `/pools/history` |

### 8.3 Shared Earn page patterns

- Unified **Earn** sub-nav: Farms | Pools (matches §4.2).
- Consistent stake/harvest button styling with swap confirm button.

---

## 9. ILO handling policy

### 9.1 Current state

- Route: `/ilo` → `views/Ilos` → `CurrentIfo` reads **ifov3** contract via `useGetPublicIfoData`.
- Menu: ILO item present in `config.ts`.
- Chain gate: `SUPPORT_ILO = [BSC]`.

### 9.2 WP2 policy

| Rule | Action |
|------|--------|
| **Keep visible** | ILO remains in nav Launch section |
| **No contract changes** | Do not modify `ifov3` address or hooks |
| **Inactive sale** | When `status === -2`, show neutral empty state: “No active ILO” — not remove route |
| **Copy** | “ILO” not “IFO” in user-facing strings where safe |
| **Hide menu item** | **Only after** product confirms no active sale + `ifov3` paused AND governance note — **not in WP2 default** |

### 9.3 WP2 UX for ILO page

- KIRI card layout consistent with swap.
- Disclaimer: “Participate at your own risk. DYOR.”
- Link to add MARCO-BNB LP if contribute flow requires it (existing modals — style only).

---

## 10. Machine-readable surfaces to expose visually

Phase 2 APIs are not built in WP2. Expose **discovery hints** in UI only (links, badges, copy).

| Surface | WP2 visual treatment | Target (future) |
|---------|---------------------|-----------------|
| Platform manifest | Footer link “Developers” → docs placeholder or `/.well-known/melega-dex.json` (404 OK until WP3) | WP3 |
| API status | Settings footer: “Machine API: coming soon” grey badge | WP9 |
| Data provenance | On metrics: `Source: on-chain` / `as_of` tooltip on live stats | WP3+ |
| Token list | Manage tokens modal — label “Registry sync: Phase 2” | WP4 |
| Risk tier | Swap confirm: static disclaimer (not live tier yet) | WP4 + AI Protocol |
| Agent docs | Link to `docs/MELEGA_DEX_AI_PROTOCOL_V1.md` in repo / future docs site | WP9 |

**Do not** fabricate JSON endpoints or fake “API live” badges.

---

## 11. Kiri / D87 language guidelines

### 11.1 Voice

| Use | Avoid |
|-----|-------|
| Precise, calm, technical | Hype, superlatives, “#1”, “billions” |
| “Swap”, “Add liquidity”, “Stake” | “Aping”, “Moon”, “Guaranteed” |
| “MARCO”, “Melega DEX” | “CAKE”, “PancakeSwap”, “MelegaSwap” |
| “Listed ≠ audited” | “Safe”, “Verified project”, “Official” |
| “AI-native liquidity surface” | “Revolutionary”, “Disrupting DeFi” |

### 11.2 KIRI visual language

| Token | Value / direction |
|-------|-------------------|
| Background | `#000000`, `#0a0a0f` |
| Primary accent | `#31d0aa` (existing) or governance-approved cyan |
| Secondary | `#aba0c4`, `#523292` |
| Text primary | `#ffffff` |
| Text subtle | `#b8add2` |
| Borders | `1px solid rgba(255,255,255,0.12)` |
| Radius | 16–24px cards (match existing `card` token) |
| Typography | Kanit (loaded in `_document.tsx`) — consistent weights 400/600 |

### 11.3 D87 compliance (UX)

- Every live number shows **source** on hover or sublabel.
- Warnings use icon + text — never color alone.
- AI-generated copy (future) must be labeled — no AI labels in WP2 unless content is AI-generated.

---

## 12. Mobile-first requirements

| Requirement | Target |
|-------------|--------|
| Min touch target | 44×44px |
| Viewport | Existing meta viewport — no change |
| Tables | Horizontal scroll or card collapse on `md` breakpoint |
| Swap card | Full-width on mobile; max-width desktop |
| Wallet connect | Sticky header access |
| Bottom nav | Home, Trade, Earn visible without hamburger |
| Modal sheets | Full-screen on mobile for confirm modals |
| Font size | Min 14px body, 12px captions |
| Network switcher | Accessible from header on all pages |

**Test devices (manual):** iPhone Safari, Android Chrome, narrow desktop (375px).

---

## 13. No-fake-metrics policy

### 13.1 Prohibited

- Hardcoded user counts, trade counts, TVL, volume, “#1 DEX” claims.
- APR/APY without live source and `as_of` timestamp.
- “Total users” or “Trusted with billions” framing.
- Mock chart data on production paths.

### 13.2 Allowed

| Metric | Source | Display rule |
|--------|--------|----------------|
| TVL | `useGetStats()` / API | Show `—` while loading; show value + “on-chain estimate” sublabel |
| Farm APR | `getFarmApr` hooks | Existing logic only |
| Pool APR | Pool fetch hooks | If null → `—` |
| MARCO price | `useCakeBusdPrice` | Header display — existing |
| Wallet balance | On-chain | Always |

### 13.3 MetricsSection policy

- Remove static `txCount` / `addressCount` constants (2021 BitQuery snapshot) from user-visible copy **or** move to “Historical reference” footnote with date — **not** headline metrics.
- Prefer: “Multi-chain liquidity” narrative (WP1) + optional live TVL only.

---

## 14. Test checklist

### 14.1 Regression (required per PR)

| # | Test | Chain | Pass criteria |
|---|------|-------|---------------|
| T1 | Wallet connect | BSC | Connects, correct network |
| T2 | Swap small trade | BSC | Tx succeeds |
| T3 | Add liquidity | BSC | LP mint succeeds |
| T4 | Remove liquidity | BSC | LP burn succeeds |
| T5 | Farm stake/unstake | BSC | MasterChef interaction OK |
| T6 | Pool stake/harvest | BSC | sousChef OK |
| T7 | ILO page load | BSC | Reads ifov3 without crash |
| T8 | NFT pages | BSC | Load without regression |
| T9 | Chain switch | ETH, Base, Polygon | Farms/pools lists load |
| T10 | Mobile nav | BSC | All primary links reachable |

### 14.2 UX acceptance

| # | Check |
|---|-------|
| U1 | No visible “MelegaSwap” on `/`, `/swap`, `/farms`, `/pools` (en-US) |
| U2 | No visible “PancakeSwap” in header/footer/help |
| U3 | No headline fake millions/billions metrics |
| U4 | ILO in nav on BSC |
| U5 | Logo alt = “Melega DEX” |
| U6 | Theme consistent across swap/farms/pools cards |
| U7 | Mobile: swap usable at 375px width |

### 14.3 Forbidden diff check

```bash
git diff --name-only | rg 'exchange\.ts|contracts\.ts|farms/constants|pools\.tsx|tokenLists|smart-router'
# Must return empty
```

---

## 15. Implementation plan with safe work packages

### WP2-A — Theme tokens (low risk)

| Task | Files |
|------|-------|
| Refine `vars.css.ts` KIRI palette | `packages/ui/css/vars.css.ts` |
| Shadow/focus tokens | `packages/ui/tokens/index.ts` |
| Global style pass | `apps/web/src/style/Global.tsx` |

**Exit:** Swap/farms/pools cards use consistent dark shell.

---

### WP2-B — Navigation restructure (low risk)

| Task | Files |
|------|-------|
| Implement §4.2 nav | `Menu/config/config.ts` |
| Mobile nav items | Same + uikit menu props |
| Remove commented dead menu blocks (optional cleanup) | `config.ts` |

**Exit:** Trade / Earn / Launch / NFT / Discover structure live.

---

### WP2-C — Homepage layout (medium risk — copy only)

| Task | Files |
|------|-------|
| Section reorder per §5.1 | `views/Home/index.tsx` |
| Optional `QuickActionsRow` | New component in `views/Home/components/` |
| MetricsSection live-only policy | `MetricsSection/index.tsx` |
| WinSection de-emphasis | `WinSection/index.tsx` |

**Exit:** Home matches spec; no fake metrics in headline.

---

### WP2-D — Core page polish (medium risk)

| Task | Files |
|------|-------|
| Swap card layout | `views/Swap/components/*`, `SmartSwap/index.tsx` wrapper |
| Liquidity hub | `views/Pool/`, `pages/liquidity.tsx` |
| Farms table/cards | `views/Farms/components/` |
| Pools cards | `views/Pools/components/` |
| Static disclaimers | Swap confirm, farm stake modals (text only) |

**Exit:** §6–§8 acceptance met.

---

### WP2-E — ILO + localization (low–medium risk)

| Task | Files |
|------|-------|
| ILO empty state copy | `views/Ilos/*` presentational |
| `en-US` + `translations.json` sweep | locale files |
| Remaining MelegaSwap strings | grep-driven |

**Exit:** §9 policy; U1–U2 pass.

---

### WP2-F — Machine surface hints + docs links (low risk)

| Task | Files |
|------|-------|
| Footer developer hint | `Footer/config.tsx` |
| “Data source” tooltips on live stats | `MetricsSection`, farm APR cells |

**Exit:** §10 visual hints without fake API.

---

### Suggested PR sequence

```
WP2-A (theme) → WP2-B (nav) → WP2-C (home) → WP2-D (pages) → WP2-E (ilo/l10n) → WP2-F (hints)
```

One PR per work package recommended. Run §14 test checklist after each merge to `phase1-brand-shell` or dedicated `wp2-ux-shell` branch.

---

## Document control

| Field | Value |
|-------|-------|
| Document ID | `MELEGA-DEX-WP2-UX-SHELL-SPEC` |
| Depends on | WP1 complete |
| Blocks | WP3 Machine Manifest (optional parallel design) |
| Classification | SAFE_FRONTEND_ONLY |
