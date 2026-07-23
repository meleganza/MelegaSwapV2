# LIQUIDITY_MODULE_003 — Add Liquidity Card

**Mission:** `LIQUIDITY_MODULE_003_ADD_LIQUIDITY_CARD`  
**Verdict:** `LIQUIDITY_MODULE_003_ADD_LIQUIDITY_CARD_CERTIFIED`  
**Branch:** `mission-liquidity-module-003-add-card`  
**Commit:** `06138a6e`  
**Push:** `origin/mission-liquidity-module-003-add-card`  
**Base:** `origin/mission-liquidity-module-002-lb-card` @ `e19b4d55`

---

## Scope

Modified **only** the Add Liquidity card (plus tokens + guards + evidence).

| Locked module | Touched |
| --- | --- |
| Header / Trending / Hero | No |
| Liquidity Building Card | No |
| DEX Snapshot | No |
| Overview / Positions | No |
| Footer / Mobile Nav | No |
| **Add Liquidity Card** | **Yes** |

Forbidden DEX cores (`exchange.ts`, `contracts.ts`, router/wallet/swap/farms/pools/MasterChef/NFT/token lists): **untouched**.

---

## Desktop geometry (locked)

| Section | Target | Measured | Δ |
| --- | ---: | ---: | ---: |
| Header | 96 | 96 | 0 |
| Pair Selection | 70 | 70 | 0 |
| Swap Form | 250 | 250 | 0 |
| Execution Summary | 44 | 44 | 0 |
| Footer | 60 | 60 | 0 |
| **Card** | **672 × 520** | **672 × 520** | **0** |

Section sum: `96+70+250+44+60 = 520` (measured **520**).

| Control | Target | Measured |
| --- | ---: | ---: |
| Artwork | 160 × 110 | 160 × 110 |
| Pair selector | 100% × 48 | 630 × 48 (content width after 20px pad) |
| Token A / B | 72 | 72 / 72 |
| Swap icon | 40 × 40 | 40 × 40 |
| Primary CTA | 44 full width | 44 × 630 |

**Geometry deviation:** **0%** (target &lt; 3%).

`overflow: hidden` on desktop; fixed height; no auto-grow.

---

## Mobile

| Viewport | Card height | Notes |
| --- | ---: | --- |
| 390 × 844 | 593 (natural) | Fixed 520 unlocked; no clipping required |

Pair / tokens / CTA remain 100% width; swap icon centered 40px.

---

## Behavior locks

- No **Explore Liquidity** heading
- No `CurrencySearchModal` / no new drawer
- Pair selector cycles presets in-card (updates Token A/B internally)
- Token selectors cycle common bases in-card
- Approval / pool / errors do **not** expand card height
- Errors / status surface inside Execution Summary row
- Footer CTA labels: Connect Wallet / Approve / Add Liquidity / Create Pool / Unsupported Pair / Insufficient Balance
- Only secondary link: **View Your Positions ↓** (no View Pools / Create Position)

Artwork: approved dark droplet discs + gold `+` (same illustration family as prior Add card; not regenerated as a new asset).

---

## Evidence

Directory: `apps/web/docs/runtime/liquidity-module-003-add-card/`

| Artifact | Path |
| --- | --- |
| Before desktop card | `before-desktop-add-card.png` |
| After desktop card | `after-desktop-add-card.png` |
| Before/after mobile | `before-mobile-add-card.png` / `after-mobile-add-card.png` |
| Overlay | `overlay-desktop-add-card.png` |
| Diff | `diff-desktop-add-card.png` |
| DOM measurements | `add-card-measurements.json` |
| Certify script | `certify.mjs` |

Overlay vs pre-rebuild (intentional layout change): MAE ≈ 20.3 / 255 ≈ **8.0%** pixel channel delta. Geometry certification uses section targets (0% deviation), not before-image MAE.

---

## Validation

| Check | Result |
| --- | --- |
| Vitest (`liquidityModule003`, `dexLiqOne002`, `liquidityPixelPerfection001`, `liquidityModule002`) | **22/22 passed** |
| `yarn next build` | **passed** |
| Playwright DOM certify | **pass** |
| Forbidden files | **untouched** |

---

## Files committed (mission-scoped)

- `apps/web/src/views/LiquidityStudio/onePage/AddLiquidityCard.tsx`
- `apps/web/src/views/LiquidityStudio/onePage/onePageTokens.ts`
- `apps/web/src/views/LiquidityStudio/__tests__/liquidityModule003.addCard.test.ts`
- `apps/web/src/views/LiquidityStudio/__tests__/dexLiqOne002.onePage.test.ts`
- `apps/web/src/views/LiquidityStudio/__tests__/liquidityPixelPerfection001.test.ts`
- `apps/web/docs/runtime/LIQUIDITY_MODULE_003_ADD_LIQUIDITY_CARD_REPORT.md`
- `apps/web/docs/runtime/liquidity-module-003-add-card/*`

---

## Push / deploy

- Commit + push branch only
- No merge / no PR / no production deploy in this mission
