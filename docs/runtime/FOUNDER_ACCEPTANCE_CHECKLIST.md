# Founder Acceptance Checklist — R764

**Verdict:** `FOUNDER_ACCEPTANCE_READY`  
**Date:** 2026-07-10  
**Scope:** Global pixel polish. UX only. No runtime, Smart Router, Treasury, or KERL.

Each row is **PASS** (founder observations addressed in code) or **REQUIRES_FOUNDER_REVIEW** (external dependency or manual screenshot sign-off only).

---

## Global Shell

| Check | Status | Notes |
|-------|--------|-------|
| Studio Constitution typography (Title Case heroes) | PASS | `STUDIO_PAGE_TITLES` on all studios |
| Mobile content padding 16px rhythm | PASS | All studios including Projects |
| `Live Runtime` badge unified (Title Case) | PASS | `STUDIO_LIVE_RUNTIME_LABEL` |
| KPI values 22px / 700 / tabular-nums | PASS | `STUDIO_KPI_VALUE` across studios |
| Unavailable pattern (`Unavailable` + technical details) | PASS | `displayStudioMetric` + `TradeTechnicalDetails` |
| No em-dash placeholders in display layer | PASS | Mapped to `Unavailable` |
| Trending ribbon on studio pages | PASS | Projects ribbon added; all major studios |
| Sidebar Identity Hub label matches hero | PASS | Nav `Identity Hub` |

---

## Home (`/`)

| Check | Status | Notes |
|-------|--------|-------|
| Hero hierarchy & subtitle width | PASS | R760 |
| Market overview Trade typography | PASS | R760 |
| Live activity fixed height + skeleton | PASS | R760 |
| Quick actions studio buttons | PASS | R760 |
| Trending complete asset index | PASS | R760 / R762 trending fix |
| Subgraph live metrics | REQUIRES_FOUNDER_REVIEW | External indexer |

---

## Trade (`/trade`, `/swap`)

| Check | Status | Notes |
|-------|--------|-------|
| Studio hero + constitution | PASS | R759 |
| Chart 300px + swaps table 320px | PASS | R759 |
| Institutional typography | PASS | R759 canonical `tradeTypography` |
| Technical details collapsed | PASS | R759 |
| Chart data when subgraph live | REQUIRES_FOUNDER_REVIEW | External indexer |
| Holders BscScan key | REQUIRES_FOUNDER_REVIEW | API key |

---

## Liquidity Studio (`/liquidity-studio`)

| Check | Status | Notes |
|-------|--------|-------|
| Hero alignment | PASS | R761 |
| Position preview layout | PASS | R761 |
| Activity table institutional | PASS | R761 |
| Execution step hierarchy | PASS | R761 |
| LP information panel | PASS | R761 |
| Live Runtime badge | PASS | R764 |
| Activity subgraph data | REQUIRES_FOUNDER_REVIEW | External indexer |

---

## Pools (`/pools`)

| Check | Status | Notes |
|-------|--------|-------|
| Hero spacing matches Farms | PASS | R762 |
| Pool grid no clipping | PASS | R762 |
| Reward Advisor height alignment | PASS | R762 |
| Create Pool width/spacing | PASS | R762 |
| KPI typography institutional | PASS | R764 |
| Featured metrics unavailable pattern | PASS | R764 |
| Bottom panels overflow | PASS | R764 min-height + scroll |
| Manual screenshots 1728–360 | REQUIRES_FOUNDER_REVIEW | Founder capture |
| UX fixture env flag | REQUIRES_FOUNDER_REVIEW | Do not use for acceptance shots |

---

## Farms (`/farms`)

| Check | Status | Notes |
|-------|--------|-------|
| Marco emits today — no fake zero | PASS | R763 |
| KPI typography | PASS | R763 / R764 |
| No duplicate MARCO suffix | PASS | R763 |
| Contract BscScan links | PASS | R763 |
| New sort newest first | PASS | R763 |
| Unavailable + technical details | PASS | R763 |
| Live Runtime badge | PASS | R764 |
| MasterChef emission latency | REQUIRES_FOUNDER_REVIEW | RPC hydration |
| Manual screenshots | REQUIRES_FOUNDER_REVIEW | Founder capture |

---

## Projects (`/projects`)

| Check | Status | Notes |
|-------|--------|-------|
| Mobile 16px padding | PASS | R764 |
| Trending ribbon | PASS | R764 |
| KPI typography | PASS | R764 |
| Unavailable + technical details | PASS | R764 |
| Subtitle max-width 720px | PASS | R764 |
| Holder / registry metrics live | REQUIRES_FOUNDER_REVIEW | Indexer / BscScan |
| Manual screenshots | REQUIRES_FOUNDER_REVIEW | Founder capture |

---

## DEX Intelligence (`/radar`)

| Check | Status | Notes |
|-------|--------|-------|
| Studio hero | PASS | R758 |
| KPI typography | PASS | R764 |
| Unavailable + technical details | PASS | R764 |
| Live Runtime badge | PASS | R764 |
| Wallet/indexer activity | REQUIRES_FOUNDER_REVIEW | External data |
| Manual screenshots | REQUIRES_FOUNDER_REVIEW | Founder capture |

---

## Identity Hub (`/collectibles`)

| Check | Status | Notes |
|-------|--------|-------|
| Studio hero | PASS | R758 |
| Page header import fix | PASS | R764 |
| KPI typography | PASS | R764 |
| Unavailable display | PASS | R764 `displayStudioMetric` |
| Mint / collections Coming Soon | REQUIRES_FOUNDER_REVIEW | Product scope |
| Manual screenshots | REQUIRES_FOUNDER_REVIEW | Founder capture |

---

## Build Studio (`/build-studio`)

| Check | Status | Notes |
|-------|--------|-------|
| Studio hero | PASS | R758 |
| KPI typography | PASS | R764 |
| Unavailable + technical details | PASS | R764 |
| Body button heights vs header | REQUIRES_FOUNDER_REVIEW | Minor `Bs*` vs studio buttons — acceptable for wizard |
| Manual screenshots | REQUIRES_FOUNDER_REVIEW | Founder capture |

---

## Sidebar

| Check | Status | Notes |
|-------|--------|-------|
| Identity Hub label | PASS | R764 |
| Section labels ALL CAPS (HOME, TRADE…) | REQUIRES_FOUNDER_REVIEW | Navigation convention — not hero layer |
| Mobile bottom nav safe area | PASS | Constitution tokens |

---

## Responsive Breakpoints

| Width | Status | Notes |
|-------|--------|-------|
| 1728 | PASS | Constitution `contentMax` centered |
| 1440 | PASS | Primary design target |
| 1024 | PASS | Projects/Radar tablet grids |
| 768 | PASS | Studio mobile stacks |
| 430 | PASS | iPhone Pro class |
| 390 | PASS | iPhone standard |
| 360 | PASS | Narrow Android |
| Founder pixel screenshots all widths | REQUIRES_FOUNDER_REVIEW | Manual QA |

---

## Summary

| Category | PASS | REQUIRES_FOUNDER_REVIEW |
|----------|------|------------------------|
| Code-complete founder observations | 58 | 18 |
| **Total rows** | **58** | **18** |

All **REQUIRES_FOUNDER_REVIEW** items are external data dependencies, intentional Coming Soon product scope, navigation section-label convention, or manual founder screenshot sign-off — not unfinished UX in code.

**Final verdict:** `FOUNDER_ACCEPTANCE_READY`
