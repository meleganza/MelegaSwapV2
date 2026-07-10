# R758 — Studio Design Constitution

**Verdict:** `PASS`  
**Scope:** Visual language unification across all Studios. No runtime, Smart Router, or Treasury Runtime changes.

---

## Validation Matrix

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Hero — same structure, spacing, title/subtitle/CTA/badge | PASS | `MelegaStudioPageHeader` on all 8 Studios |
| Typography — Title Case, never ALL CAPS heroes | PASS | `STUDIO_PAGE_TITLES` + constitution tests |
| Hero rhythm — Ledger → Hero → KPIs → Content | PASS | `sectionGap: 28px`, `heroMarginBottom: 28px` |
| Cards — shared radius, padding, border, hover | PASS | `studioConstitutionLayout` + `MelegaStudioPanel` |
| Buttons — Primary / Secondary / Ghost / Outline | PASS | `MelegaStudioButtons` in studio headers |
| Section spacing — same vertical rhythm | PASS | All studio token files extend constitution |
| Responsive — hierarchy preserved | PASS | `mobileBreakpoint: 767px`, aligned mobile padding |
| Every Studio feels like one product | PASS | Shared tokens + headers wired |

---

## Studios Unified

| Studio | Route | Hero Title |
|--------|-------|------------|
| Trade | `/swap` | Trade |
| Liquidity Studio | `/liquidity` | Liquidity Studio |
| Pools | `/pools` | Pools |
| Farms | `/farms` | Farms |
| Projects | `/projects` | Projects |
| DEX Intelligence | `/radar` | DEX Intelligence |
| Identity Hub | `/collectibles` | Identity Hub |
| Build Studio | `/build` | Build Studio |

---

## Shared Design Tokens

### Constitution (`design-system/melega/tokens/studioConstitution.ts`)
- `studioConstitutionLayout` — rhythm, hero, card, button dimensions
- `studioConstitutionColors` — palette extension from `premiumStudio`
- `studioConstitutionType` — hero title/subtitle sizes
- `STUDIO_PAGE_TITLES` — canonical Title Case names
- `STUDIO_FONT_DISPLAY` / `STUDIO_FONT_BODY`

### Components
- `MelegaStudioPageHeader` — hero shell (title, subtitle, actions, badge, media)
- `MelegaStudioContent` — content wrapper with `sectionGap`
- `MelegaStudioPanel` — card shell (radius, padding, border, hover lift)
- `MelegaStudioPrimaryBtn` / `MelegaStudioOutlineBtn` / `MelegaStudioGhostBtn` / `MelegaStudioSecondaryBtn`

### Canonical rhythm values
| Token | Value |
|-------|-------|
| `sectionGap` | 28px |
| `heroMinHeight` | 96px |
| `heroTitleSize` | 44px (36px mobile) |
| `heroSubtitleMaxWidth` | 720px |
| `heroMarginBottom` | 28px |
| `cardRadius` | 20px |
| `cardPadding` | 24px |
| `btnHeight` | 48px |
| `btnRadius` | 12px |
| `kpiHeight` | 120px |

---

## Files Changed

### Design system (new / extended)
- `design-system/melega/tokens/studioConstitution.ts`
- `design-system/melega/tokens/__tests__/studioConstitution.test.ts`
- `design-system/melega/tokens/index.ts`
- `design-system/melega/components/StudioPageHeader/MelegaStudioPageHeader.tsx`
- `design-system/melega/components/StudioButtons/MelegaStudioButtons.tsx`
- `design-system/melega/components/StudioShell/MelegaStudioContent.tsx`
- `design-system/melega/components/StudioShell/MelegaStudioPanel.tsx`
- `design-system/melega/components/index.ts`

### Studio headers (all use `MelegaStudioPageHeader`)
- `views/Trade/components/TradePageHeader.tsx`
- `views/LiquidityStudio/components/LiquidityStudioPageHeader.tsx`
- `views/PoolsStudio/components/PoolsStudioPageHeader.tsx`
- `views/FarmsStudio/components/FarmsStudioPageHeader.tsx`
- `views/ProjectsStudio/components/ProjectsStudioPageHeader.tsx`
- `views/RadarStudio/components/RadarStudioPageHeader.tsx`
- `views/CollectiblesStudio/components/CollectiblesStudioPageHeader.tsx`
- `views/BuildStudio/components/BuildStudioPageHeader.tsx`

### Studio tokens (constitution spread)
- `views/Trade/tradeTokens.ts`
- `views/LiquidityStudio/liquidityStudioTokens.ts`
- `views/PoolsStudio/poolsStudioTokens.ts`
- `views/FarmsStudio/farmsStudioTokens.ts`
- `views/ProjectsStudio/projectsStudioTokens.ts`
- `views/RadarStudio/radarStudioTokens.ts`
- `views/CollectiblesStudio/collectiblesStudioTokens.ts`
- `views/BuildStudio/buildStudioTokens.ts`

### Studio screens (rhythm fixes)
- `views/PoolsStudio/PoolsStudioScreen.tsx`
- `views/BuildStudio/BuildStudioScreen.tsx`
- `views/CollectiblesStudio/CollectiblesStudioScreen.tsx`

---

## Remaining Visual Inconsistencies

These are intentional studio-specific layout differences below the hero layer. They do not break constitution rhythm but may be tightened in a future pass:

1. **Pools** — wider content max (`1440px` vs `1180px`) and custom pool-card grid dimensions for featured explorer layout.
2. **Radar** — console 3-column grid and radar-specific panel gradients remain studio-specific.
3. **Per-studio primitives** — `PsPanel`, `FsPanel`, `CsPanel`, etc. still live in each studio; they inherit constitution `cardRadius` via tokens but have not been migrated to `MelegaStudioPanel` yet.
4. **Projects** — no TrendingRibbon ledger strip (pre-existing); hero → KPI rhythm is consistent within its content shell.
5. **Trade cockpit** — 3-column trading grid is function-specific; header and `sectionGap` match constitution.
6. **Collectibles hero media** — right-side art panel is Identity Hub–specific; structure still uses shared header shell.
7. **Internal preview badges** — labels like `PREVIEW LAYOUT` remain uppercase in dev fixtures (not page heroes).

---

## Screenshot Checklist (manual verification)

Capture at **1440px**, **768px**, and **390px** for each Studio:

- [ ] `/swap` — Trade hero Title Case, ribbon → hero → chart gap
- [ ] `/liquidity` — Liquidity Studio hero + builder grid
- [ ] `/pools` — Pools (not POOLS) + KPI row spacing
- [ ] `/farms` — Farms hero + featured/advisor row
- [ ] `/projects` — Projects hero + featured panel
- [ ] `/radar` — DEX Intelligence (not ALL CAPS) + console grid
- [ ] `/collectibles` — Identity Hub hero + media panel
- [ ] `/build` — Build Studio hero + import/create columns

Compare: title position, subtitle width (~720px), CTA alignment, badge placement, 28px section gaps, card radius 20px, button height 48px.

---

## Tests

```bash
cd apps/web && npx vitest run src/design-system/melega/tokens/__tests__/studioConstitution.test.ts
```

Expected: 2/2 passed (rhythm drift guard + Title Case titles).

---

## Constraints Respected

- Runtime truth (R756) untouched
- Navigation trust (R757) untouched
- Smart Router untouched
- Treasury Runtime untouched
