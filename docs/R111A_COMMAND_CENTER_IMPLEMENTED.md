# R111-A — Command Center Canonical Implementation

**Status:** `R111A_COMMAND_CENTER_IMPLEMENTED`  
**Base SHA:** `5f41a9b` (R111-A canonical layout — working tree, deploy pending)  
**Preview:** https://v2.melega.finance/command-center  
**Local capture:** `http://localhost:3002/command-center` (2026-07-04)

---

## Implementation summary

The Command Center was rebuilt as a **single vertical operating system homepage** with exactly nine sections in the mandated reading order. All previous layouts were removed:

- No right-side rail
- No KPI cluster in hero
- No trending ribbon
- No masonry / multi-column dashboard
- No floating widgets
- No shadows

### Reading order (implemented)

1. Header (72px) — title, subtitle, chain, wallet, search
2. Daily Briefing (180px) — greeting, max 4 bullets, action pill, 6% emblem
3. Portfolio Overview — 4 equal cards × 150px (Assets, Liquidity, Pools, Farms)
4. Today's Priorities — 65/35 grid × 320px (Actions + AI Recommendations)
5. Infrastructure Status — 3 equal cards × 220px (Projects, Radar, Build)
6. Recent Activity — full-width table × 340px (max 8 rows)
7. Notifications — 240px (max 6, grouped Today/Yesterday/Earlier)
8. Settlement — 180px read-only + Open Treasury
9. Machine Summary — collapsed 72px / expanded 420px, schema `melega.command-center.v1`

### Design tokens (exact)

| Token | Value |
|-------|-------|
| Shell max-width | 1180px |
| Horizontal padding | 32px |
| Section gap | 28px |
| Card gap | 20px |
| Card radius | 20px |
| Card border | 1px `#2A2A2A` |
| Card background | `#141414` |
| Hover border | `#D4AF37` 180ms |

### Files

- `commandCenterTokens.ts` — canonical tokens
- `components/canonical/commandCenterSpecPrimitives.tsx` — SpecCard, buttons, empty states
- `components/canonical/CommandCenterCanonicalSections.tsx` — all 9 sections
- `CommandCenterScreen.tsx` — vertical shell only

### Screenshots

| Viewport | Path |
|----------|------|
| Desktop 1440 | `docs/screenshots/r111a-command-center/command-center-desktop-1440.png` |
| Mobile 390 | `docs/screenshots/r111a-command-center/command-center-mobile-390.png` |

Capture: `SCREENSHOT_BASE_URL=https://v2.melega.finance node apps/web/scripts/capture-r111a-command-center.mjs`

---

*R111-A — Implement exactly. No creative freedom.*
