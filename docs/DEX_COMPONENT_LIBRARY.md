# Melega DEX Component Library

**Status:** FROZEN — Constitutional reference  
**Canonical implementation:** `apps/web/src/design-system/melega/`  
**Guide:** `DESIGN_SYSTEM_GUIDE.md`  
**Amendment rule:** No new primitives without constitutional amendment

---

## 1. Purpose

This document freezes all **reusable UI primitives** permitted across Melega DEX. Pages compose these primitives; they do not invent parallel component systems.

Page-scoped studios (Radar, Build Studio, Collectibles, Projects) may define **page tokens** and **composed panels** built from constitutional primitives — not independent design languages.

---

## 2. Layout primitives

### Hero

**Canonical:** Page header regions with title, subtitle, and primary actions.

| Implementation | Location |
|----------------|----------|
| `MelegaAppHeader` | `components/AppHeader` |
| `MelegaHeader` | `components/Header` (slot-based) |
| Page-scoped heroes | `*PageHeader.tsx` in each studio — must use constitutional typography and spacing |

**Rules:**
- One hero per page.
- Title + operational subtitle (no hype-first copy).
- Primary CTA + secondary outline CTA pattern.

---

### KPI card

**Canonical:** `MelegaStatCard`

| Prop | Usage |
|------|-------|
| `label` | Uppercase or semibold label |
| `value` | Primary metric |
| `meta` | Delta, sparkline context, secondary text |

**Page examples:** Build Studio `BuildKpiRow`, Radar `RadarKpiRow`, Collectibles KPI strip.

**Rules:**
- Consistent height within a row.
- Delta color: green positive, red/yellow negative or warning.
- Optional sparkline — no new chart primitives without amendment.

---

### Feature panel

**Canonical:** `MelegaPanel`, `MelegaSectionCard`, `MelegaCinematicPanel`

| Component | Usage |
|-----------|-------|
| `MelegaPanel` | Gradient panel surface |
| `MelegaSectionCard` | Section container with title |
| `MelegaCinematicPanel` | Featured visual panel |

**Page-scoped:** `BsPanel` (Build Studio), `RdPanel` (Radar) — must map to constitutional tokens.

---

### Advisor panel

**Canonical pattern:** Right-column or sidebar advisory surface.

| Elements | Usage |
|----------|-------|
| Workflow list | Ordered steps with arrows |
| Confidence score | Percentage + gauge |
| Reasoning block | 2–3 operational sentences |

**Implementation:** Build Studio `AIBuildAdvisorPanel`; Collectibles advisor rows.

---

### Activity table

**Canonical:** `MelegaFeedRow` + table grid pattern

| Implementation | Usage |
|----------------|-------|
| `MelegaFeedRow` | Single activity row with icon, title, trailing |
| Grid tables | Recent Builds, Radar heatmap, Projects lists |

**Rules:**
- Status chips for execution state.
- Monospace for addresses.
- Hover row highlight — no new table primitive.

---

### Timeline

**Canonical:** `MelegaTimelineRow`

| Prop | Usage |
|------|-------|
| Event label | Operational description |
| Timestamp | Relative or absolute |
| Severity | green / yellow / red |

**Page examples:** Radar MARCO timeline, project event history.

---

### Heatmap

**Canonical pattern:** Grid table with intensity-coded cells.

**Implementation:** Radar `RadarHeatmapTable`.

**Rules:**
- Color intensity from constitutional green/yellow/red tokens.
- No third-party heatmap library without amendment.

---

## 3. Discovery primitives

### Discovery card

**Canonical:** `MelegaIntelligenceTile`, Radar discovery grid cards

| Fields | Usage |
|--------|-------|
| Title | Asset or project name |
| Signal | AI classification |
| Confidence | Percentage badge |

---

### Project card

**Canonical:** `MelegaProjectCube`, Projects studio cards

| Fields | Usage |
|--------|-------|
| Name, slug | Directory identity |
| Infrastructure tags | Constitutional metadata |
| Verification badge | Status chip |

---

### Farm card

**Canonical:** Farms studio card pattern

| Fields | Usage |
|--------|-------|
| Pair / LP | Farm identifier |
| APR | Green emphasis |
| TVL | Formatted compact number |

---

### Pool card

**Canonical:** Pools studio card pattern

| Fields | Usage |
|--------|-------|
| Stake token | Primary asset |
| Reward token | Emission asset |
| Lock terms | Operational metadata |

---

## 4. Build primitives

### Builder card

**Canonical:** Build Studio template cards, second-row infrastructure cards

| Types | Usage |
|-------|-------|
| Infrastructure Template | Staking pool type + one-line description |
| Builder Template | Token archetype |
| Extension card | Infrastructure Extensions services |

**Rules:**
- Featured template (⭐ Reward MARCO Holders) uses gold border emphasis.
- Simulation blocks are read-only previews.

---

### Identity card

**Canonical:** Collectibles collection cards

| Fields | Usage |
|--------|-------|
| Identity line | Civilization passport type |
| Utility chips | Governance, DEX, AI agent |
| Identity binding | Transferable / soulbound metadata |

---

## 5. Interactive primitives

### Buttons

**Canonical:** `MelegaButton`

| Variant | Usage |
|---------|-------|
| `primary` | Gold fill — primary action |
| `secondary` | Surface border — secondary action |
| `ghost` | Text-only tertiary |
| `danger` | Destructive actions |

**Page-scoped:** `BsPrimaryBtn`, `BsOutlineBtn` (Build Studio) — must use 150ms transition, gold `#D6B445` / `#D4AF37` family.

**Animation:** `animation.hover` — **150ms ease**.

---

### Badges

**Canonical:** `MelegaBadge`

| Variant | Usage |
|---------|-------|
| `ready` | Operational ready |
| `live` | Live status |
| `waiting` | Pending |
| `error` | Failed / risk |
| `legacy` | Deprecated |

**Page-scoped:** `BsBadge` (green Machine Readable), `BsStatusChip` (green/yellow/gray/red).

---

### Progress

**Canonical pattern:** Track + fill bar

**Implementation:** Build Studio `BsProgressTrack` / `BsProgressFill` — **900ms** fill animation.

---

### Score ring

**Canonical pattern:** Circular gauge with percentage

**Implementation:** Build Studio `BsGauge` / `BsGaugeValue` / `BsGaugeLabel`; Collectibles utility score ring.

**Animation:** Conic gradient fill — **900ms** progress animation.

---

## 6. Typography

**Canonical tokens:** `typography` in `design-system/melega/tokens/typography.ts`

| Role | Font | Sizes |
|------|------|-------|
| Body | Inter | 11–18px |
| Display (page titles) | Inter bold / studio display token | 24–52px per page constitution |
| Wordmark | Orbitron | Brand lockup only |
| Monospace | SF Mono / Menlo | Manifest JSON, addresses |

**Rule:** Orbitron is **not** for general UI text — wordmark and brand only (global DS). Page studios may use Orbitron for display titles where already established (Build Studio, Radar) within frozen pages.

---

## 7. Spacing

**Canonical:** 4px base scale

| Token | Value |
|-------|-------|
| `spacing[1]` | 4px |
| `spacing[2]` | 8px |
| `spacing[3]` | 12px |
| `spacing[4]` | 16px |
| `spacing[6]` | 24px |
| `spacing[8]` | 32px |
| `spacing[12]` | 48px |

**Page layout constants:** Each studio defines `contentMax`, `sectionGap`, `cardGap` — must align to spacing scale (typically 20–32px gaps, 1180px max content).

---

## 8. Colors

**Canonical:** `colors` in `design-system/melega/tokens/colors.ts`

| Token | Value | Usage |
|-------|-------|-------|
| `canvas` | `#000000` | Page background |
| `surface1–3` | `#0A`–`#17` | Panel hierarchy |
| `gold` | `#D4AF37` | Primary accent |
| `green` | `#22C55E` | Success, APR, verified |
| `red` | `#EF4444` | Error, risk |
| `textPrimary` | `#FFFFFF` | Headings |
| `textSecondary` | `#A8A8A8` | Body |
| `textMuted` | `#707070` | Meta |

**Rule:** No new color tokens per page. Page studios use aliases mapping to this palette.

---

## 9. Radius

| Token | Value |
|-------|-------|
| `sm` | 8px |
| `md` | 10px |
| `lg` | 12px |
| `xl` | 14px |
| `2xl` | 18px |
| `full` | 999px |

Cards: typically `lg`–`2xl` (12–24px in studios). Buttons: 14–16px.

---

## 10. Animations

| Token | Duration | Usage |
|-------|----------|-------|
| `animation.hover` | 150ms | Buttons, links |
| `animation.expand` | 200ms | Panels |
| `animation.fade` | 180ms | Row insert, manifest fade (300ms Build Studio) |
| Card lift | 4px `translateY` | Panel hover |
| Progress / gauge | 900ms | Score ring, progress fill |
| Infrastructure arrows | 700ms | Build Studio pipeline |
| Ticker | 45s linear | Market ribbon |

**Rule:** Respect `prefers-reduced-motion`. No additional animation types without amendment.

---

## 11. Hover behavior

| Element | Behavior |
|---------|----------|
| Buttons | Scale 1.02 or background shift — 150ms |
| Cards / panels | `translateY(-4px)` + gold border — 180ms |
| Table rows | Background `rgba(255,255,255,0.02)` |
| Sidebar items | Gold accent active state |

**Prohibited:** Drop shadows for depth (constitutional — depth from surface and border only).

---

## 12. Full component inventory (design system)

| Component | Import path |
|-----------|-------------|
| `MelegaButton` | `components/Button` |
| `MelegaCard` | `components/Card` |
| `MelegaPanel` | `components/Panel` |
| `MelegaBadge` | `components/Badge` |
| `MelegaStatusChip` | `components/StatusChip` |
| `MelegaStatCard` | `components/StatCard` |
| `MelegaFeedRow` | `components/FeedRow` |
| `MelegaTimelineRow` | `components/TimelineRow` |
| `MelegaSectionTitle` | `components/SectionTitle` |
| `MelegaSectionCard` | `components/SectionCard` |
| `MelegaCtaCard` | `components/CtaCard` |
| `MelegaEmptyState` | `components/EmptyState` |
| `MelegaLoadingSkeleton` | `components/LoadingSkeleton` |
| `MelegaInput` | `components/Input` |
| `MelegaSearchBar` | `components/SearchBar` |
| `MelegaTokenSelector` | `components/TokenSelector` |
| `MelegaTicker` | `components/Ticker` |
| `MelegaSidebar` | `components/Sidebar` |
| `MelegaBottomNavigation` | `components/BottomNavigation` |
| `MelegaMarcoCard` | `components/MarcoCard` |
| `MelegaIntelligenceTile` | `components/IntelligenceTile` |
| `MelegaProjectCube` | `components/ProjectCube` |

**Catalogue:** `MelegaDesignSystemCatalogue` — `docs/screenshots/design-system/`

---

## 13. Amendment process for new primitives

1. Document proposed primitive with single responsibility.
2. Verify no overlap with frozen primitives in this document.
3. Add to `design-system/melega` with token compliance.
4. Update this document and `DESIGN_SYSTEM_GUIDE.md`.
5. Constitutional amendment entry in `DEX_CONSTITUTION.md`.

**Until amended, no new primitives may be introduced.**

---

**Verdict:** `DEX_CONSTITUTION_FROZEN`
