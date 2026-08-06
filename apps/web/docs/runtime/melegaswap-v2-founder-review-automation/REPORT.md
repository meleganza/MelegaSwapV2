# MELEGASWAP_V2_FOUNDER_REVIEW_REPORT

**Mission:** `MELEGASWAP_V2_FOUNDER_REVIEW_AUTOMATION`  
**Surface:** Production `https://www.melega.finance`  
**Method:** Founder walkthrough — try to break flows, no features / redesign / architecture  
**Captured:** 2026-08-06 · desktop 1440 + mobile 390 · probe script + visual review  
**Evidence:** `apps/web/docs/runtime/melegaswap-v2-founder-review-automation/`

---

## Executive verdict

The DEX **looks premium** and several commercial paths now work (Boost hub, Featured/Trend checkout modal V3, Create Farm/Pool modals, Chain Switch).  

As a Founder trying to ship trust + conversion, production still fails on **routing honesty**, **data emptiness on money pages**, and **duplicate / unfinished copy** that reads like staging.

| Severity | Count | Ship stance |
|----------|------:|-------------|
| **P0** | 3 | Fix before calling production “founder-ready” |
| **P1** | 8 | Fix this sprint |
| **P2** | 6 | Polish backlog |

---

## Page-by-page (Founder answers)

### HOME `/`
1. **Unfinished:** Smart Swap shows Route / AI Insight / fee grid as `—` before any amount; Featured cards say “No recent swaps / No 24H baseline”.
2. **Wastes space:** Large dead black field left of swap; hero CTAs float with unused vertical room.
3. **Duplicated:** “AI-POWERED” badge + “Powered by AI”; Connect Wallet in header + swap.
4. **Confuses:** “Trending Projects” lands on Projects (not a distinct Trending product); “Secured by MARCO” unclear.
5. **Simplify:** Hide empty route/AI blocks until amount entered.
6. **Commercial:** Strong — Featured rail + List Your Project are visible. Conversion hurt by empty swap chrome.

### SEARCH (header ⌘K)
1. **Unfinished:** Multiple MARCO TOKEN rows look like duplicate index hits.
2. **Wastes space:** Dropdown is tall; 4 near-identical rows.
3. **Duplicated:** MARCO as PROJECT + 3× TOKEN with overlapping CTAs (Open Project / Trade / Buy).
4. **Confuses:** Which MARCO is the real one?
5. **Simplify:** Collapse to 1 Project + 1 primary Token per chain.
6. **Commercial:** Powerful if deduped; today dilutes Buy/Open.

### PROJECTS `/projects` (+ `/trending` → same)
1. **Unfinished:** Dev note **“Same pipeline everywhere”** visible; Holders/Volume **Unavailable** wall; Featured volume weak.
2. **Wastes space:** Featured + full grid both compete above fold.
3. **Duplicated:** Filter pill **Trending** twice; Featured projects also in grid with Featured badge.
4. **Confuses:** `/trending` URL becomes Projects — no dedicated Trending surface.
5. **Simplify:** One Trending control; remove pipeline meta copy; soften Unavailable to “—” or hide row.
6. **Commercial:** List/Claim CTAs good; data gaps kill confidence to Trade.

### PROJECT PAGE `/project-hq/marco`
1. **Unfinished:** Market strip mostly `—`; Economy cards empty with sketchy spark stubs; Age/Liquidity/Volume trust badges empty.
2. **Wastes space:** Gap under description; nested swap chrome.
3. **Duplicated:** Verification string twice; Claim card in Boost hub **and** Claim banner; Featured rail again at bottom.
4. **Confuses:** Default chain **ETH** while header on Home is BSC; scientific price `$5.90e-7`; Nav still marks **Home** active.
5. **Simplify:** One Claim entry; default to chain with liquidity; human price format.
6. **Commercial:** **Boost hub + checkout work** — best commercial surface on the site. Undermined by empty market/economy.

### SMART SWAP `/swap` (real Trade)
1. **Unfinished:** Right panels mostly empty; chart flatline after spike; Settlement “HANDOFF” jargon.
2. **Wastes space:** Three-column empty state.
3. **Duplicated:** Route messaging in left + middle/right.
4. **Confuses:** Home nav stays highlighted; “Open Project Page” without clear pair context for newcomers.
5. **Simplify:** Collapse Assets/Settlement until connected or amount > 0.
6. **Commercial:** Credible pro Trade surface — better than `/trade` alias.

### TRADE `/trade`
1. **Unfinished:** Not a Trade page — **redirects to `/?focus=swap`** (Home marketing).
2. **Wastes space:** Same as Home.
3. **Duplicated:** Entire Home experience under a Trade URL.
4. **Confuses:** Bookmarking `/trade` ≠ `/swap`.
5. **Simplify:** `/trade` → `/swap` (or show Trade shell).
6. **Commercial:** Weak — users never land on focused Trade.

### FARMS `/farms`
1. **Unfinished:** KPI subtext truncated (“Active Farmers…”, “Highest Sustainable…”).
2. **Wastes space:** Huge empty “My Farms” before Explore list.
3. **Duplicated:** Connect Wallet header + My Farms; Create + Explore both “farms”.
4. **Confuses:** Decorative LP→Farm diagram vs Featured Farm card competition.
5. **Simplify:** Compact disconnected My Farms; full KPI labels.
6. **Commercial:** Featured Farm + Create Farm are clear. Truncation looks unshipped.

### POOLS `/pools`
1. **Unfinished:** **Featured Pool is `— → —` with Active badge**; TVL/rewards Unavailable; KPI titles truncated.
2. **Wastes space:** Giant empty My Positions.
3. **Duplicated:** Connect CTAs; pool counts don’t reconcile in summary copy (239 vs Active/Finished snippet).
4. **Confuses:** Featured looks broken — worse than empty.
5. **Simplify:** Hide Featured until a real pool exists; compact empty positions.
6. **Commercial:** **Broken Featured Pool kills trust** on a monetizable Create Pool surface.

### PORTFOLIO `/portfolio`
1. **Unfinished:** Fine for disconnected, but Rewards says “No non-zero claimable…” while disconnected.
2. **Wastes space:** Assets grid of six “Wallet disconnected” cells.
3. **Duplicated:** Disconnect messaging × many.
4. **Confuses:** Rewards empty-state wording implies wallet scanned.
5. **Simplify:** Single connect gate; collapse sections until connected.
6. **Commercial:** Neutral — conversion is Connect only.

### LIST `/list`
1. **Unfinished:** Mostly polished; footer “Why build…” overlaps AI Assistant card message.
2. **Wastes space:** Hero logo orb.
3. **Duplicated:** Title+button labels on cards; AI in card + footer.
4. **Confuses:** Import Token vs Claim Page vs Create Page sequencing for existing tokens.
5. **Simplify:** One-line “Already have a token? Claim →”.
6. **Commercial:** **Strong** — Claim POPULAR is correct bias.

### AUDIT `/audit`
1. **Unfinished:** Wallet/Oracle `—`; all Δ sparklines empty; formula card sparse.
2. **Wastes space:** Tall formula strip for one equation.
3. **Duplicated:** Health 97 ≈ Melega Score 97.1.
4. **Confuses:** Score **97.1** vs Runtime **35** red — Founder alarm; “SSOT / Σw” jargon.
5. **Simplify:** Plain-language score; hide empty indicators.
6. **Commercial:** Trust tool — Runtime red undermines Score green.

### HEADER / CHAIN SWITCH / MODALS / PAYMENT / FEATURED / TREND
| Flow | Result |
|------|--------|
| Header search | Works; duplicate hits |
| Chain switch | MelegaModal V3 — OK |
| Create Farm / Pool | V3 modals open — OK |
| Featured checkout | Opens, steps to Pay & activate — OK |
| Trend Boost checkout | Opens V3 — OK |
| Payment | Quote/pay not executed in review (wallet); UI reaches pay step |

---

## Issues

### P0

#### P0-1 · `/trade` is Home, not Trade
- **Screenshot:** `issues/P0-trade-redirects-to-home.png`
- **Root cause:** `/trade` redirects to `/?focus=swap`; user still sees marketing Home + Home nav active. Real Trade is `/swap`.
- **Minimal fix:** Redirect `/trade` → `/swap` (preserve query), or render Trade shell at `/trade`.
- **Priority:** P0  
- **Effort:** S (≤0.5d)

#### P0-2 · `/trending` is Projects with a sort flag
- **Screenshot:** `issues/P0-trending-is-projects.png`
- **Root cause:** `/trending` → `/projects/?sort=trending`. Hero “Trending Projects” promises a product; user gets Projects directory + duplicate Trending controls + “Same pipeline everywhere” note.
- **Minimal fix:** Either dedicated Trending view **or** rename CTA to “Explore Projects” and remove duplicate Trending filter + internal pipeline note.
- **Priority:** P0  
- **Effort:** S–M (0.5–1d)

#### P0-3 · Pools Featured card shows empty Active pool
- **Screenshot:** `issues/P0-featured-pool-empty.png`
- **Root cause:** Featured Pool renders `— → —`, APR/TVL/Earn empty, still “Active” + Stake.
- **Minimal fix:** If no featured pool SSOT, hide card or show explicit “No featured pool” — never fake Active.
- **Priority:** P0  
- **Effort:** S (≤0.5d)

---

### P1

#### P1-1 · Projects grid “Unavailable” wall
- **Screenshot:** `issues/P1-projects-unavailable-wall.png`
- **Root cause:** Holders (and often Volume) render literal “Unavailable” twice-feel on cards; looks unindexed.
- **Minimal fix:** Use `—` / hide Holders row when missing; never stack two Unavailable strings.
- **Priority:** P1 · **Effort:** S

#### P1-2 · Dev meta copy on Featured: “Same pipeline everywhere”
- **Screenshot:** `issues/P0-trending-is-projects.png` (Featured header)
- **Root cause:** Engineering note shipped in `FeaturedProjectsSection` meta.
- **Minimal fix:** Remove or replace with user copy (“Live featured placements”).
- **Priority:** P1 · **Effort:** XS

#### P1-3 · Duplicate “Trending” filter on Projects
- **Screenshot:** `issues/P0-trending-is-projects.png`
- **Root cause:** Two controls labeled Trending in filter row.
- **Minimal fix:** One sort control; other becomes “Hot” / remove.
- **Priority:** P1 · **Effort:** XS

#### P1-4 · Search returns 4 MARCO rows
- **Screenshot:** `issues/P1-search-marco-duplicates.png`
- **Root cause:** Project + multiple token identities without dedupe.
- **Minimal fix:** Cap: 1 project + 1 token per chain; merge CTAs.
- **Priority:** P1 · **Effort:** S–M

#### P1-5 · Project Page market/economy empty on default ETH
- **Screenshot:** `issues/P1-project-page-empty-market.png`
- **Root cause:** Default deployment ETH while liquid activity/expectation often BSC; strip shows `—`.
- **Minimal fix:** Default to chain with best liquidity/volume; humanize price (not `e-7`).
- **Priority:** P1 · **Effort:** S–M

#### P1-6 · Farms / Pools KPI labels truncated
- **Screenshot:** `issues/P1-farms-kpi-truncation.png` (+ pools shot)
- **Root cause:** Fixed card width clips “Highest Sustainable…”, farmer/rewards subcopy.
- **Minimal fix:** Shorter labels or 2-line clamp with title tooltip.
- **Priority:** P1 · **Effort:** S

#### P1-7 · Audit Score 97 vs Runtime 35
- **Screenshot:** `issues/P1-audit-runtime-vs-score.png`
- **Root cause:** Conflicting signals without plain explanation; empty Wallet/Oracle.
- **Minimal fix:** Explain Runtime in one sentence; hide empty indicators; don’t imply system unhealthy if Score high.
- **Priority:** P1 · **Effort:** S

#### P1-8 · Nav marks Home active on Project / Swap
- **Screenshot:** `issues/P1-project-page-empty-market.png`, `issues/P1-swap-page-ok-but-empty-panels.png`
- **Root cause:** `aria-current` / active styles tied to `/` for nested routes.
- **Minimal fix:** Clear Home active unless pathname is `/`.
- **Priority:** P1 · **Effort:** XS–S

---

### P2

#### P2-1 · Home Smart Swap empty chrome before amount
- **Screenshot:** `issues/P2-home-swap-empty-chrome.png`
- **Root cause:** Route/fee/AI sections always mounted.
- **Minimal fix:** Mount after amount > 0.
- **Priority:** P2 · **Effort:** S

#### P2-2 · Project Page Claim duplicated
- **Screenshot:** `issues/P2-claim-duplicated.png`
- **Root cause:** Boost card “Claim Project” + banner “Claim this Project”.
- **Minimal fix:** Keep one (prefer banner OR card, not both).
- **Priority:** P2 · **Effort:** XS

#### P2-3 · Portfolio disconnected density
- **Screenshot:** `issues/P2-portfolio-empty-density.png`
- **Root cause:** Full dashboard skeleton when disconnected; Rewards copy wrong.
- **Minimal fix:** Single connect panel; fix Rewards copy.
- **Priority:** P2 · **Effort:** S

#### P2-4 · Farms / Pools oversized empty “My …” panels
- **Screenshot:** `issues/P1-farms-kpi-truncation.png`, `issues/P0-featured-pool-empty.png`
- **Root cause:** Empty state uses large card before list.
- **Minimal fix:** Compact strip; prioritize Explore list.
- **Priority:** P2 · **Effort:** S

#### P2-5 · Swap page empty side panels / HANDOFF jargon
- **Screenshot:** `issues/P1-swap-page-ok-but-empty-panels.png`
- **Root cause:** Assets/Settlement always visible.
- **Minimal fix:** Collapse until relevant; rename HANDOFF → plain English.
- **Priority:** P2 · **Effort:** S

#### P2-6 · List AI messaging duplicated in footer
- **Screenshot:** `issues/P2-list-ok-commercial.png`
- **Root cause:** AI Assistant card + “AI-Powered Guidance” column.
- **Minimal fix:** Drop footer AI column or shorten.
- **Priority:** P2 · **Effort:** XS

---

## What is working (do not break)

- Header search opens results  
- Chain Switch MelegaModal V3  
- Create Farm / Create Pool modals V3  
- Project **Boost Your Project** + Featured/Trend checkout to **Pay & activate** (`issues/P2-featured-checkout-works.png`)  
- List Claim POPULAR emphasis  
- `/swap` Trade shell exists (use this, not `/trade`)

---

## Suggested fix order (Founder)

1. P0-3 Featured Pool empty  
2. P0-1 `/trade` → `/swap`  
3. P0-2 Trending honesty + remove pipeline note + duplicate filter  
4. P1-1 Unavailable wall  
5. P1-4 Search dedupe  
6. P1-5 Project default chain + price format  
7. Remaining P1 → P2  

---

## Artifacts

| File | Purpose |
|------|---------|
| `founder-probe.mjs` | Automated production walk |
| `probe-raw.json` | Raw signals per page |
| `screenshots/` | Full capture set |
| `issues/` | Named issue screenshots |

---

## FINAL

**MELEGASWAP_V2_FOUNDER_REVIEW_REPORT**
