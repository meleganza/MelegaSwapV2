# LIQUIDITY_MODULE_002_LB_CARD — Report

## 1. Verdict

**LIQUIDITY_MODULE_002_LB_CARD_CERTIFIED**

## 2. Branch / base

- Branch: `mission-liquidity-module-002-lb-card`
- Base: `mission-liquidity-module-001-hero` @ `82256a93` (Hero + Trending certified)

## 3. Scope confirmation

Modified only:

- `onePage/LiquidityBuildingCard.tsx`
- `onePage/onePageTokens.ts` (LB section tokens only)
- Card tests + evidence docs

**Not modified:** Header, Trending Bar, Hero, Add Liquidity, DEX Snapshot, Overview, Positions, education rail, shell chrome, mobile bottom nav, LB transaction/state hooks.

## 4. Desktop bounding boxes (measured)

### Initial (hero expanded)

| Region | Target | Actual |
|--------|--------|--------|
| Card | 672×860 | 672×860 |
| Hero | 210 | 210 |
| Wizard | 48 | 48 |
| Content | 442 | 442 |
| Footer | 160 | 160 |
| Sum | 860 | 860 |

### Setup (hero collapsed)

| Region | Target | Actual |
|--------|--------|--------|
| Card | 672×860 | 672×860 |
| Hero | 72 | 72 |
| Wizard | 48 | 48 |
| Content | 580 (=442+138) | 580 |
| Footer | 160 | 160 |
| Sum | 860 | 860 |

Content grows by exactly the hero collapse delta `(210−72)=138` so the card never shrinks, never gains dead space, and never changes page layout.

## 5. Mobile (390)

- Card height natural (not locked to 860): measured ~595–growing with content
- No horizontal page overflow
- Hero / wizard / content / footer stack without clipping

## 6. Behavior

- Initial: artwork + benefits + single CTA **Set Up Liquidity Building**
- Setup click: hero → 72px; steps replace content only
- Steps: Setup → Budget → Strategy → Review → Activate (replace, never append)
- Learn More accordion (collapsed) for budget/protections copy
- Program bar 44px inside content when in-flow / active
- Active: compact dashboard in content; wizard strip shows ACTIVE
- One Connect Wallet path (footer activate step only); no CurrencySearchModal

## 7. Screenshots

Under `apps/web/docs/runtime/liquidity-module-002-lb-card/`:

- `before-desktop-lb-card.png`
- `after-desktop-lb-card-initial.png`
- `after-desktop-lb-card-setup.png`
- `after-desktop-page-initial.png`
- `after-mobile-lb-card.png`
- `overlay-desktop-lb-card.png`
- `diff-desktop-lb-card.png`
- `lb-card-measurements.json`

## 8. Overlay / deviation

- Before/after overlay MAE ≈ 22.8 (intentional rebuild of card chrome/content)
- **Geometry deviation:** 0px on all locked section targets (±2px tolerance) → **< 3%**
- Card remains 672×860 through initial → setup transition

## 9. Tests / build

- `liquidityModule002.lbCard.test.ts` + `liquidityPixelPerfection001.test.ts` — pass
- `yarn next build` — pass

## 10. Push

Branch pushed. Not merged. Not deployed.

---

LIQUIDITY_MODULE_002_LB_CARD_CERTIFIED
