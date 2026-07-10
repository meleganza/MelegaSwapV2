# R107-B — Visual Validation Certification Report

**Mission:** R107-B Visual Validation Certification  
**Date:** 2026-07-04  
**Branch:** `design-system-foundation`  
**Staging URL:** https://v2.melega.finance  
**Deployed SHA (verified):** `29baaff697084daa616091af06d0c45cfb9eb1f9` — **R104** (not R107)  
**R107 working tree:** 73 uncommitted files — **not deployed**  
**Screenshots:** `docs/screenshots/r107b-visual-certification/` (48/48 captured)  
**Audit JSON:** `docs/screenshots/r107b-visual-certification/certification-audit.json`

---

## Executive Summary

| Step | Result |
|------|--------|
| **STEP 1 — Deploy R107 to staging** | ❌ **FAILED** — Vercel CLI deploy aborted (outdated CLI / upload error). Staging still serves `29baaff` (R104). R107 deltas exist only in local working tree. |
| **STEP 2 — Screenshot matrix** | ✅ **48/48 captured** (12 routes × 4 viewports) |
| **STEP 3 — R107 spec comparison** | ❌ **Cannot verify R107 fixes** — fixes not live on staging |
| **STEP 4 — Issue catalog** | See below |
| **FINAL VERDICT** | **`VISUAL_BLOCKED`** |

**Truth statement:** This certification audited what **staging actually serves today** (`29baaff`). R107 visual fixes were **not** present on `v2.melega.finance` at capture time. Several routes do not render their target UI at all (Sentry error boundary). Remaining routes have confirmed overlap, clipping, and mobile navigation issues.

---

## Deploy Verification (STEP 1)

| Check | Result |
|-------|--------|
| GitHub latest deployment SHA | `29baaff` (2026-07-04T09:11:12Z) |
| Local HEAD | `29baaff` (matches remote) |
| R107 files in staging bundle | **Not found** — `R107GlobalVisualStyle`, APR caps, card token changes absent |
| Vercel deploy attempt | Failed — CLI 41.7.0 rejected (requires ≥47.2.2); upload aborted |
| `last-modified` header at capture | `2026-07-04T11:50:26 GMT` |

**Conclusion:** Staging does **not** serve R107. Certification of R107 implementation is **blocked** until deploy completes.

---

## Screenshot Matrix (STEP 2)

| Route | 390×844 | 428×926 | 1440×900 | 1728×1117 |
|-------|---------|---------|----------|-----------|
| `/` | `home-390x844.png` | `home-428x926.png` | `home-1440x900.png` | `home-1728x1117.png` |
| `/trade` | `trade-390x844.png` | `trade-428x926.png` | `trade-1440x900.png` | `trade-1728x1117.png` |
| `/liquidity-studio` | `liquidity-studio-390x844.png` | … | `liquidity-studio-1440x900.png` | … |
| `/farms` | `farms-390x844.png` | … | `farms-1440x900.png` | … |
| `/pools` | `pools-390x844.png` | … | `pools-1440x900.png` | … |
| `/projects` | `projects-390x844.png` | … | `projects-1440x900.png` | … |
| `/trending` | `trending-390x844.png` | … | `trending-1440x900.png` | … |
| `/radar` | `radar-390x844.png` | … | `radar-1440x900.png` | … |
| `/collectibles` | `collectibles-390x844.png` | … | `collectibles-1440x900.png` | … |
| `/build-studio` | `build-studio-390x844.png` | … | `build-studio-1440x900.png` | … |
| `/import-existing-token` | `import-existing-token-390x844.png` | … | `import-existing-token-1440x900.png` | … |
| `/command-center` | `command-center-390x844.png` | … | `command-center-1440x900.png` | … |

Automated audit summary: **0** horizontal-overflow shots; **17** shots with DOM overlap signals; **14** with clipping signals. Manual image review below supersedes false positives.

---

## Before / After (R107 intent vs staging reality)

| Area | R107 intent (working tree) | Staging today (`29baaff`) |
|------|---------------------------|---------------------------|
| Global shell | 1180px max, safe-area-bottom via `R107GlobalVisualStyle` | Pre-R107 tokens; partial safe-area on some studios only |
| Farms/Pools cards | APR 32/28px, flex-wrap CTAs, no overlap | **Page does not render** — Sentry error boundary |
| Projects cards | 400px min-height, 3-line summary, flex CTAs | Renders; metrics overlap + mobile CTA crowding remain |
| Trending | Compact empty states, auto card heights | Renders; whale panel gaps reduced in code but **not deployed**; clipping/overlap remain |
| Command Center | 2×2 meta grid, privilege chip cap | **Page does not render** — Sentry error boundary |
| Trade mobile | Full-width Connect, token ellipsis | Connect **visible** ✅; desktop stats clipped |
| Import | Collapsed machine JSON, clean stack | **Verified** ✅ — layout clean on desktop + mobile |

---

## Issue Catalog (STEP 4)

### BLOCKER — R107 not deployed

| Route | Screenshot | Coordinates | Severity | Fix suggestion |
|-------|------------|-------------|----------|----------------|
| All | N/A | N/A | **Blocker** | Commit + push R107 working tree; deploy `design-system-foundation` to `v2.melega.finance`; re-run certification |

---

### BLOCKER — Target UI not rendered (Sentry error boundary)

Seven routes return the Sentry fallback ("Oops, something wrong.") instead of studio UI on **all four viewports** tested. Visual certification of layout, spacing, CTAs, and cards is impossible.

| Route | Screenshot | Coordinates | Severity | Fix suggestion |
|-------|------------|-------------|----------|----------------|
| `/farms` | `farms-1440x900.png`, `farms-390x844.png` | ~(720, 200) | **Blocker** | Page must render Farms UI before UX certification; re-capture after fix |
| `/pools` | `pools-1440x900.png`, `pools-390x844.png` | ~(720, 200) | **Blocker** | Same |
| `/liquidity-studio` | `liquidity-studio-1440x900.png` | ~(720, 200) | **Blocker** | Same |
| `/radar` | `radar-1440x900.png` | ~(720, 200) | **Blocker** | Same |
| `/collectibles` | `collectibles-1440x900.png` | ~(720, 200) | **Blocker** | Same |
| `/build-studio` | `build-studio-1440x900.png` | ~(720, 200) | **Blocker** | Same |
| `/command-center` | `command-center-1440x900.png` | ~(720, 200) | **Blocker** | Same |

---

### HIGH — Confirmed visual defects on rendered routes

| Route | Screenshot | Coordinates | Severity | Issue | Fix suggestion |
|-------|------------|-------------|----------|-------|----------------|
| `/` | `home-390x844.png` | ~(195, 520) | **High** | Mobile bottom nav floats mid-viewport, overlaps "Trade. Build." hero text | Pin nav to `bottom: env(safe-area-inset-bottom)`; add content padding-bottom on home screen |
| `/projects` | `projects-1440x900.png` | ~(540, 420) | **High** | Featured MARCO card — five "Unavailable" metric values overlap in one row | Use `minmax(0,1fr)` grid + `ellipsis` per cell (R107 `ProjectGridCard` — deploy required) |
| `/projects` | `projects-390x844.png` | ~(195, 1680) | **High** | Grid card footer — Trade / Open Project / Radar buttons overlap | Flex-wrap button row with gap 8px (R107 fix — deploy required) |
| `/trending` | `trending-1440x900.png` | ~(850, 280) | **High** | KPI card "WHALE ALERTS" value clipped to "U..." | Widen cell or reduce font; allow wrap |
| `/trending` | `trending-1440x900.png` | ~(200, 260) | **Medium** | KPI labels ("PROJECTS", "ALERTS") overlap sparkline charts | Separate label row from chart area |
| `/trending` | `trending-390x844.png` | ~(320, 980) | **High** | Trending Now card — 99/100, SIGNAL, NON-CANONICAL badge, sparkline stack on top of each other | Reflow card header to vertical stack on mobile; bound chart 72×28px |
| `/trending` | `trending-390x844.png` | ~(180, 1050) | **High** | Stats row values clipped to "Unav..." | Allow wrap or reduce column count on mobile |
| `/trending` | `trending-390x844.png` | ~(300, 720) | **Medium** | Heatmap column header clipped ("LIG" vs "LIQUIDITY") | Horizontal scroll container with min column widths |
| `/trade` | `trade-1440x900.png` | ~(680, 580) | **Medium** | Pair stats show "Inde..." (Indexing clipped) | Increase stat cell min-width or allow wrap |
| `/trade` | `trade-1440x900.png` | ~(500, 350) | **Low** | Chart area empty (no price chart rendered) | Verify chart panel height + data binding (visual empty state) |

---

### Verified — No issue (manual review)

| Route | Screenshot(s) | Notes |
|-------|---------------|-------|
| `/` | `home-1440x900.png` | Desktop layout clean; no overlap; MARCO logo correct; cards aligned |
| `/trade` | `trade-390x844.png` | Mobile Connect CTA visible; swap form fits 390px; bottom nav present |
| `/import-existing-token` | `import-existing-token-1440x900.png`, `import-existing-token-390x844.png` | Input card spacing clean; machine panel not expanded; stacks on mobile |

---

## R107 Specification Checklist (staging `29baaff`)

| Rule | Result |
|------|--------|
| No overlapping text | ❌ Fail — `/projects`, `/trending`, `/` (mobile) |
| No overlapping buttons | ❌ Fail — `/projects` mobile grid card |
| No clipped charts | ❌ Fail — `/trending` mobile Trending Now card |
| No clipped percentages | ❌ Fail — `/trending` Whale Alerts; `/trade` Indexing stats |
| No clipped titles | ⚠️ Partial — heatmap headers on trending mobile |
| No clipped AI summaries | ✅ Pass on `/projects` (3-line summary visible) |
| No giant empty spaces | ⚠️ Partial — trending whale/smart panels still tall on staging (R107 not deployed) |
| No horizontal overflow | ✅ Pass — automated check 0/48 shots |
| No broken branding | ✅ Pass — Melega + MARCO logos correct on rendered pages |
| No wrong MARCO logo | ✅ Verified |
| No inconsistent card heights | ⚠️ Cannot assess on 7 error-boundary routes |
| No broken responsive layout | ❌ Fail — home mobile nav overlap |
| No broken safe area | ❌ Fail — home mobile nav not pinned to bottom |
| No broken mobile navigation | ❌ Fail — home mobile floating nav |
| Machine JSON collapsed | ✅ Pass on `/import-existing-token`, `/trending` (staging) |

---

## Validation Summary

```
Staging SHA verified:     29baaff (R104) — NOT R107
Deploy R107:              FAILED (Vercel CLI)
Screenshots captured:     48/48
Routes rendering UI:      5/12 (/, /trade, /projects, /trending, /import-existing-token)
Routes on error boundary: 7/12
Manual issues confirmed:  10
Routes verified clean:    3 (home desktop, trade mobile, import both)
```

**Re-certification command (after deploy):**

```bash
SCREENSHOT_BASE_URL=https://v2.melega.finance node apps/web/scripts/r107b-visual-certification.mjs
```

---

## Remaining Visual Blockers (real only)

1. **R107 not deployed to staging** — cannot certify implemented fixes  
2. **Seven routes show Sentry error UI** instead of studio pages (farms, pools, liquidity-studio, radar, collectibles, build-studio, command-center)  
3. **Home mobile** — bottom navigation overlaps hero content  
4. **Projects** — featured metrics text overlap (desktop); grid card CTA overlap (mobile)  
5. **Trending** — KPI clipping + card header overlap (desktop and mobile)  
6. **Trade desktop** — indexing stats clipped in pair panel  

---

## FINAL VERDICT

# `VISUAL_BLOCKED`

Staging does not serve R107. Seven of twelve certification routes fail to render target UI. On the five routes that do render, confirmed overlap, clipping, and mobile navigation defects remain. Re-run R107-B after R107 deploy and error-boundary resolution.

---

*Certification only. No code changes made in R107-B.*
