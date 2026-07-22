# DS001.4 — Pixel Fidelity Audit

Measured against the DS001.4 specification (§3–§44) and live screenshots under `apps/web/docs/runtime/ds0014-screenshots/`.

Reference viewport: **1440 × 1024**. Global header remains **72px** (DS001.2 frozen).

---

## Intro (1440)

| Token | Target | Implemented | Notes |
| --- | --- | --- | --- |
| Page shell width | `calc(100% - 64px)`, max 1380 | Studio `Content` uses DS001 shell | Unchanged DS001.1/3 shell |
| Product working width | max 1180, centered | `1180px` on `LiquidityBuildingPanel` Root | Matches |
| Product header margin-bottom | 24px | 24px | Matches |
| Back button | h 36, pad 0 12, radius 10, 12/16/600 `#A1A1A1` | Same | Label: “Back to Liquidity Studio” |
| Product icon | 44×44, radius 14, gold tint | Same | Lucide `ChartNoAxesCombined` 23px |
| Title | 36/44/600 −0.8px `#FFF` | Same | Matches |
| Subtitle | 15/23 `#A1A1A1`, max 700 | Same | Matches |
| Intro grid | `1.25fr` / `minmax(340px,0.75fr)`, gap 24 | Same | Matches |
| Hero card | min-h 430, pad 36, radius 24, border `#B78E00` | Same | Radial gold wash, no animated glow |
| Hero headline | 44/52/600 −1.1px | Same | Matches |
| Benefits | 3-col, tile min-h 96, pad 14, radius 14 | Same | Approved copy |
| Primary CTA | h 48, radius 14, `#F4C430` | Same | Matches |
| Right cards | radius 18, pad 20, border `#2A2A2A` | Same | Matches |

**Intentional differences**

1. Studio trending ribbon remains above product content (global DS001.2/3 surface) — not part of Liquidity Building mockup chrome.
2. “Connect Wallet” still appears below Technical Details when disconnected — real wallet gate, not mockup decoration.

---

## Setup (1440)

| Token | Target | Implemented | Notes |
| --- | --- | --- | --- |
| Form + summary grid | `1fr` / 340px, gap 24 | Same; sticky summary `top: 104px` ≥1120px | Matches |
| Form card | pad 28, radius 20 | Same | Matches |
| Title | 24/31/600 | Same | “Configure your program” |
| Token selector | h 56, radius 14 | Same | Real `CurrencySearchModal` |
| Budget shell | h 64, radius 14 | Same | Matches |
| Strategy cards | min-h 116, radius 14; Full AI gold border when selected | Same | RECOMMENDED badge 8px/800 |
| Frequency | 4-col, h 42, radius 11 | Same | Labels: 5 / 15 / 30 minutes / 1 hour |
| Footer CTA | Review Program h 44; disabled `#333/#747474` | Same | Matches |

**Intentional differences**

1. Dynamic Range min/max fields store the existing draft BPS strings (runtime-compatible) while labels say “Minimum % / Maximum %” per product copy.
2. Advanced protections rows are read-only “Managed by strategy” — no invented editable hard-coded fields.

---

## Review (1440)

| Token | Target | Implemented | Notes |
| --- | --- | --- | --- |
| Working width | max 960 centered | Same | Matches |
| Card | pad 28, radius 20 | Same | Matches |
| Review grid | 2-col, gap 12; item min-h 66 | Same | Collapses to 1-col ≤768 |
| Protection rows | ShieldCheck + ENFORCED | Same | Only protections already enforced by product |
| Readiness block | pending amber styling | Same | Sourced from `/api/liquidity-building/activation-status` |
| Primary when blocked | “Activation Pending” disabled `#292616/#8E7B37` | Same | Matches |

**Intentional differences**

1. Secondary “View Activation Status” added so Activation Pending is a full navigable screen without inventing an enabled activate CTA.

---

## Activation Pending (1440)

| Token | Target | Implemented | Notes |
| --- | --- | --- | --- |
| Card | pad 36, radius 22, amber border/radial | Same | Complete screen, not banner-only |
| Icon box | 64×64, radius 20 | Same | `Clock3` 28px |
| Title | 28/35/600 | Same | Matches |
| Status summary | 3-col cards | Same | Configuration READY; Deployment/Activation from readiness pills |
| Refresh Status | calls `readiness.refresh()` | Same | Real endpoints only |

**Intentional differences**

1. No fake transition to Active after refresh when gates remain closed.

---

## Dashboard / Manage

| Surface | Target | Implemented | Notes |
| --- | --- | --- | --- |
| Active dashboard | 12-col metrics + chart + details | Implemented in `LbDashboardView` | Renders only when `phase=active` and on-chain program exists |
| Chart | recharts area, `#F4C430` 2px | Same | Empty copy when no real series; no mock curve |
| Manage | dedicated `step=manage` sections | Implemented | Immutable fields disabled; stop behind confirm dialog |

**Intentional differences**

1. **No live Active/Manage screenshots in production evidence** — contracts unbound / no active program (`programSource=UNAVAILABLE`). Spec forbids fabricating active-program screenshots.

---

## 390px mobile

| Token | Target | Implemented | Notes |
| --- | --- | --- | --- |
| Page pad | 16px | Studio content + product | Matches intent |
| Product title | 30/37 | Same | Matches |
| Hero | pad 20, radius 18, headline 31/38 | Same | Matches |
| Benefits / strategy | 1 column | Same | Matches |
| Setup/Review footers | column-reverse, full-width buttons | Same | Matches |
| Activation status | 1 column | Same | Matches |

**Intentional differences**

1. Stepper becomes horizontally scrollable (≥90px columns) per §43; scrollbar hidden.

---

## Overflow

Checked at 1440 / 1280 / 1024 / 768 / 390 via full-page captures: product Root uses `min-width: 0`; Studio Content keeps `overflow-x: hidden`. No root horizontal overflow observed in captures.
