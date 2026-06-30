# Melega DEX Design System Guide

**Mission:** DS-001 — Design System Foundation  
**Branch:** `design-system-foundation`  
**Import path:** `design-system/melega` (from `apps/web/src`)

This document is the canonical reference for Melega DEX visual language. **No page or feature may introduce colors, spacing, typography, radius, shadows, or animations outside these tokens.**

---

## Principles

1. **Black & gold premium** — depth from surface, border, and spacing only. **No drop shadows.**
2. **Inter everywhere** — titles and body use Inter. **Orbitron is reserved for brand wordmark only.**
3. **Token-first** — all components consume `melegaTokens`; no hardcoded values in pages.
4. **Responsive** — mobile 390px, tablet 1024px, desktop 1440px.
5. **Stateful** — every component supports `disabled`, `loading`, hover/active, and layout overrides via `padding`, `margin`, `radius`.

---

## Color Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `colors.canvas` | `#000000` | App background |
| `colors.surface1` | `#0A0A0A` | Primary surfaces |
| `colors.surface2` | `#111111` | Cards, panels |
| `colors.surface3` | `#171717` | Elevated / input wells |
| `colors.gold` | `#D4AF37` | Primary accent |
| `colors.goldHover` | `#E8C547` | Primary hover |
| `colors.goldSoft` | `rgba(212,175,55,0.12)` | Soft gold fills |
| `colors.border` | `rgba(255,255,255,0.08)` | Default borders |
| `colors.borderStrong` | `rgba(255,255,255,0.14)` | Emphasis borders |
| `colors.textPrimary` | `#FFFFFF` | Headings, values |
| `colors.textSecondary` | `#A8A8A8` | Body, labels |
| `colors.textMuted` | `#707070` | Meta, placeholders |
| `colors.green` | `#22C55E` | Success, APR |
| `colors.red` | `#EF4444` | Errors, danger |

---

## Typography

| Token | Value |
|-------|-------|
| `typography.fontFamily.body` | Inter |
| `typography.fontFamily.wordmark` | Orbitron (wordmark only) |

**Sizes:** 40, 32, 24, 20, 18, 16, 14, 13, 12, 11 (px)  
**Weights:** 700, 600, 500, 400

---

## Spacing (4px base)

| Token | Value |
|-------|-------|
| `spacing[1]` | 4px |
| `spacing[2]` | 8px |
| `spacing[3]` | 12px |
| `spacing[4]` | 16px |
| `spacing[5]` | 20px |
| `spacing[6]` | 24px |
| `spacing[8]` | 32px |
| `spacing[10]` | 40px |
| `spacing[12]` | 48px |
| `spacing[16]` | 64px |
| `spacing[20]` | 80px |

---

## Border Radius

| Token | Value |
|-------|-------|
| `radius.sm` | 8px |
| `radius.md` | 10px |
| `radius.lg` | 12px |
| `radius.xl` | 14px |
| `radius['2xl']` | 18px |
| `radius.full` | 999px |

---

## Shadows

**NONE.** Depth is created only through surface, border, and spacing.

---

## Animation Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `animation.hover` | 150ms ease | Buttons, links |
| `animation.expand` | 200ms ease | Panels, drawers |
| `animation.fade` | 180ms ease | Row insert, rotator |
| `animation.glow` | 9s ease-in-out | Ambient glow |
| `animation.ticker` | 45s linear | Market ticker |

Respect `prefers-reduced-motion` in animated components.

---

## Breakpoints

| Name | Width |
|------|-------|
| Mobile | 390px |
| Tablet | 1024px |
| Desktop | 1440px |

Use `media.mobile`, `media.tabletUp`, `media.desktopUp` from `design-system/melega/theme`.

---

## Component Inventory

| Component | Variants / Notes | Import |
|-----------|------------------|--------|
| **MelegaButton** | primary, secondary, ghost, danger, disabled | `components/Button` |
| **MelegaCard** | sm, md, lg | `components/Card` |
| **MelegaPanel** | Gradient panel surface | `components/Panel` |
| **MelegaBadge** | ready, live, waiting, error, legacy | `components/Badge` |
| **MelegaStatusChip** | neutral, success, warning, error, gold | `components/StatusChip` |
| **MelegaSidebarItem** | active, icon, href | `components/SidebarItem` |
| **MelegaSidebarSection** | Label + children | `components/SidebarSection` |
| **MelegaHeader** | left / center / right slots | `components/Header` |
| **MelegaSearchBar** | placeholder, ⌘K shortcut | `components/SearchBar` |
| **MelegaTokenSelector** | symbol, icon, pill | `components/TokenSelector` |
| **MelegaInput** | label, hint, error | `components/Input` |
| **MelegaStatCard** | label, value, meta | `components/StatCard` |
| **MelegaFeedRow** | icon, title, trailing | `components/FeedRow` |
| **MelegaTimelineRow** | event, context, time | `components/TimelineRow` |
| **MelegaTicker** | scrolling items, pause on hover | `components/Ticker` |
| **MelegaCtaCard** | visual, dual actions | `components/CtaCard` |
| **MelegaFooter** | three slots | `components/Footer` |
| **MelegaBottomNavigation** | 5 items, active indicator | `components/BottomNavigation` |
| **MelegaSectionTitle** | title, subtitle, action | `components/SectionTitle` |
| **MelegaEmptyState** | pulse icon, copy | `components/EmptyState` |
| **MelegaLoadingSkeleton** | block / multi-line | `components/LoadingSkeleton` |

### Shared layout props (all components)

```typescript
interface MelegaLayoutProps {
  padding?: SpacingToken   // 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20
  margin?: SpacingToken
  radius?: RadiusToken     // sm | md | lg | xl | 2xl | full
  disabled?: boolean
  loading?: boolean
  mobile?: boolean
  desktop?: boolean
}
```

---

## Usage Example

```tsx
import {
  MelegaButton,
  MelegaCard,
  MelegaSectionTitle,
  melegaTokens,
} from 'design-system/melega'

export const Example = () => (
  <MelegaCard size="md" padding={4}>
    <MelegaSectionTitle title="Earn Opportunities" action={<a href="/farms">View Earn →</a>} />
    <MelegaButton variant="primary">Connect Wallet</MelegaButton>
  </MelegaCard>
)
```

---

## Catalogue & Screenshots

Static catalogue (not routed): `MelegaDesignSystemCatalogue`

| Asset | Path |
|-------|------|
| HTML preview | `docs/screenshots/design-system/catalogue.html` |
| Desktop catalogue | `docs/screenshots/design-system/catalogue-desktop-1440.png` |
| Mobile catalogue | `docs/screenshots/design-system/catalogue-mobile-390.png` |

Regenerate:

```bash
cd apps/web
npx tsx scripts/render-design-system-catalogue.tsx
```

---

## File Structure

```
apps/web/src/design-system/melega/
├── tokens/           # colors, typography, spacing, radius, animation
├── theme/            # breakpoints, media queries
├── primitives/       # shared types + style helpers
├── components/       # 21 UI components
├── catalogue/        # MelegaDesignSystemCatalogue
└── __tests__/        # token + component tests
```

---

## Validation (DS-001)

| Check | Result |
|-------|--------|
| `yarn build` (apps/web) | Pass |
| Design system tests | 8/8 pass |
| Homepage untouched | Yes |
| Swap / liquidity / earn untouched | Yes |
| Contracts / wagmi / exchange untouched | Yes |
| No new routes added | Yes |

---

## Forbidden (untouched in this mission)

- Homepage (`pages/index.tsx`, `HomeTrade/*`)
- Swap, liquidity, farms, pools views
- `exchange.ts`, `contracts.ts`, `wagmi.ts`
- Wallet, router, token lists, NFT logic

---

## Next Steps (out of scope for DS-001)

Future missions will **migrate pages one at a time** to import from `design-system/melega`. Do not migrate until explicitly instructed.
