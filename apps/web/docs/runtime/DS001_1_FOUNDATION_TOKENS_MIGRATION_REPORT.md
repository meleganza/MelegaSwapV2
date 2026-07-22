# DS001.1 — Global Design System Foundations — Migration Report

**Mission:** DS001.1 Part 1 — Foundations  
**Branch:** `mission-ds001-1-global-design-foundations`  
**Date:** 2026-07-21  
**Scope:** Global tokens + design-system refactor only. **Header redesign deferred to DS001.2.**

---

## 1. Single source of truth

| Path | Role |
| ---- | ---- |
| `apps/web/src/design-system/melega/tokens/ds001/*` | DS001.1 foundation SSOT |
| `apps/web/src/design-system/melega/tokens/{colors,typography,spacing,radius,animation,premiumStudio,studioConstitution}.ts` | Compatibility aliases → DS001.1 |
| `apps/web/src/design-system/melega/tokens/index.ts` | Barrel; `melegaTokens.foundation = ds001Tokens` |

Import going forward:

```ts
import { ds001Tokens, ds001Colors, ds001Spacing, ds001Radius, ds001Shadows } from 'design-system/melega/tokens/ds001'
```

---

## 2. Explicitly not done (DS001.2)

- App header geometry remains **60px** (`MELEGA_APP_HEADER_HEIGHT`)
- Header layout / nav / search chrome redesign not applied
- `ds001Layout.headerHeight = 72px` is **token-only** preparation

---

## 3. Token replacements (before → after)

### Colors

| Legacy token / value | DS001.1 |
| -------------------- | ------- |
| `colors.gold` `#D4AF37` | `#F4C430` (`primaryGold`) |
| `colors.goldHover` `#F4C542` | `#FFD34D` (`hoverGold`) |
| _(missing pressed)_ | `#D9A500` (`pressedGold`) |
| `colors.goldGlow` (glow) | deprecated → alias `hoverGold` |
| `colors.canvas` / `background` `#0A0A0A` | `#080808` |
| `premiumStudioColors.canvas` `#050505` | `#080808` |
| `colors.surface1` `#101010` | `#121212` (`surface`) |
| `colors.surface2/3` `#171717` / `#1C1C1C` | `#181818` (`surfaceElevated`) |
| `premiumStudioColors.card` `#141414` | `#121212` |
| `colors.border` `rgba(255,255,255,0.08)` | `#2A2A2A` |
| `premiumStudioColors.divider` `#262626` | `#202020` |
| `colors.textSecondary` `#B3B3B3` | `#B5B5B5` |
| `colors.textMuted` `#707070` / studio `#8F8F8F` | `#7A7A7A` |
| `colors.green` `#00E676` / `#1BE77A` | `#22C55E` |
| `premiumStudioColors.red` `#FF4D4F` | `#EF4444` |
| `premiumStudioColors.orange` `#FF9F43` | `#F59E0B` (`warning`) |
| _(missing info)_ | `#3B82F6` |
| Hardcoded `#D4AF37` (bulk remap) | `#F4C430` |
| Hardcoded `rgba(212,175,55,…)` | `rgba(244,196,48,…)` |

### Typography

| Legacy | DS001.1 |
| ------ | ------- |
| Body `Inter` | `Sora, Inter, system-ui` |
| Display `Orbitron` (`PREMIUM_FONT_DISPLAY`) | `Sora, Inter, system-ui` |
| Size `11px` micro/xs | `12px` (`smallLabel`) |
| Size `14px` base | `16px` (`body`) |
| Size `20/24/30/42` keys | snapped to `18/28/36/48` roles |
| Weight `800/850` | capped at `700` |
| Project consumer body `17px` | `16px` |
| Home mobile body Inter `17px` | Sora stack `16px` |

Google Fonts: Sora + Inter linked in `_document.tsx` (Kanit retained for legacy).

### Spacing

| Legacy | DS001.1 |
| ------ | ------- |
| Scale ends at `20→80px` | Extended `24→96`, `32→128` |
| `premiumStudioLayout.sectionGap` `28px` | `32px` |
| `studioConstitutionLayout.heroInnerGap` `6px` | `8px` |
| Home `mobileSectionGap` `36px` | `40px` |
| Project consumer `SECTION_GAP` `38px` | `40px` |
| Command Center `briefingPaddingX` `28px` | `32px` |
| Pools `gapHeaderKpi` `28px` | `32px` |
| Projects `featuredMetricGapX` `28px` | `32px` |

Allow-list: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128`.

### Radius

| Legacy | DS001.1 |
| ------ | ------- |
| `radius.sm/md/lg` `8/10/12` | alias → `button` `14px` |
| `radius.xl` `14px` | `button` `14px` |
| `radius.2xl` `18px` | `card` `20px` |
| `radius.panel` `20px` | `card` `20px` |
| `premiumStudioLayout.btnRadius` `12px` | `14px` |
| _(missing)_ | `input` `16px`, `modal` `24px` |

### Shadows

| Legacy | DS001.1 |
| ------ | ------- |
| _(no shadows.ts)_ | `default: none` |
| Gold glow hover `0 10px 24px rgba(212,175,55,0.08)` | `0 8px 24px rgba(0,0,0,0.18)` |
| Pools `goldButtonGlow` / elevation glow | `none` / hover shadow |
| _(missing modal)_ | `0 24px 80px rgba(0,0,0,0.45)` |

### Layout (non-header)

| Legacy | DS001.1 |
| ------ | ------- |
| `contentMax` `1180px` | `1380px` |
| `contentPaddingTop` `24px` | `32px` |
| Background gradients as page canvas | Solid `#080808` (token) |

### Buttons (MelegaButton)

| Legacy | DS001.1 |
| ------ | ------- |
| Gradient primary | Solid `#F4C430` |
| Height `40px` / mobile `44px` | `48px` |
| Radius `10/14` mixed | `14px` |
| Secondary gold border | Neutral `#2A2A2A` border |
| Ghost with border | Ghost no border |

### Cards (MelegaCard)

| Legacy | DS001.1 |
| ------ | ------- |
| Radius `lg/xl` | `card` `20px` |
| Padding varied | Default `24px` |
| Hover border strong | `#3A3A3A` + surface `#151515` + hover shadow |

### Animation

| Legacy | DS001.1 |
| ------ | ------- |
| `hover` / `cardHover` `150ms` | `180ms` |
| `glow` | deprecated (do not use) |

### Icons

| Legacy | DS001.1 |
| ------ | ------- |
| Mixed libraries historically | Token declares **Lucide only**, stroke `1.75`, sizes `20/24/32` |

---

## 4. View-level token files remapped

- `HomeTrade/homeTradeTokens.ts`
- `CommandCenter/commandCenterTokens.ts`
- `RadarStudio/radarStudioTokens.ts`
- `ProjectsStudio/projectsStudioTokens.ts`
- `PoolsStudio/poolsStudioTokens.ts`
- `ProjectPage/consumer/theme.ts`
- Plus bulk hardcode remap via `apps/web/scripts/ds001-remap-foundations.py` (`#D4AF37` → `#F4C430`, Orbitron → Sora)

---

## 5. Remaining migration debt (post-foundations)

These remain for DS001.2+ component passes (screens stay functional):

- App header / shell geometry (72px, nav, search 320×40)
- Arbitrary studio component heights still outside spacing allow-list (`kpiHeight` 120, timeline 68, tag 36, etc.)
- Some local `#050505` text-on-gold hardcodes (should be `#080808`)
- Non-allow-listed font sizes still embedded in a few studio primitives (15px search, etc. — search `15px` is DS-legal for search control)
- Pancake legacy Kanit font still loaded for compatibility surfaces
- Full Lucide adoption audit (icon library enforcement)

---

## 6. Tests

| Suite | Purpose |
| ----- | ------- |
| `design-system/melega/__tests__/tokens.test.ts` | Legacy aliases resolve to DS001.1 |
| `design-system/melega/tokens/__tests__/ds001Foundation.test.ts` | Spec lock for colors/type/spacing/radius/shadows/layout |

---

## 7. Certification criteria for Part 1

- [x] Global design tokens created (`tokens/ds001`)
- [x] Design system refactored to consume them
- [x] Existing screens remain functional (no header redesign)
- [x] Platform prepared for DS001.2 (header tokens present, unused by shell)
- [x] Migration report lists token replacements

**DS001.1_FOUNDATIONS_COMPLETE**
