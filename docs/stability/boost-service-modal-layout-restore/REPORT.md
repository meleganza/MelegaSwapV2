# Boost Service Modal Layout Restore

Mission: `MELEGA-DEX-P0-BOOST-SERVICE-MODAL-LAYOUT-RESTORE`

## Proven regression

- Base main: `6b30e585dbf7bbaa3882f4e6f9919e0268526c10`.
- Last known good layout: `e9b0f18524fc8711b8a73c367479862352527627`, the parent of the regression.
- Regression: `fd2d3ab` (`fix(boost): recover historical funnel and token logos on current main`).
- Root cause: that change replaced the compact three-column card grid with tall, centered, vertically stacked cards. It increased card minimum height from 86px to 164px, padding from `11px 13px` to `18px 14px 15px`, gaps from 8px to 10px, enlarged title/description/price typography, and changed the card from a compact icon/content/price grid to a vertical flex layout. The shared modal primitive was not changed and did not require modification.

## Restoration

The Boost Service step now uses the canonical compact geometry from the last known good implementation while retaining the current five-service catalogue and current activation-state copy. The change is scoped to `CommercialCheckoutModal`; no service, price, package, authority, payment, contract, fee, or economic behavior changed.

The focused browser validator measures rendered DOM geometry rather than source strings. Its desktop card-height guard is 102px, so the broken 164px-minimum implementation fails. It also checks modal/body scroll, card visibility and grid containment, Trend Boost visibility, footer and controls, overlap, and horizontal overflow. It exercises Featured → Continue, Back, Trend Boost → Continue, and Close.

## Browser evidence

| Viewport | Internal vertical scroll | Horizontal overflow | All five cards visible | Trend Boost visible | Footer visible |
| --- | --- | --- | --- | --- | --- |
| 1440×900 | false | false | true | true | true |
| 1280×800 | false | false | true | true | true |
| 390×844 | intentional single body scroll | false | true | true | true |
| 430×932 | false | false | true | true | true |

Exact measurements are stored in `geometry-results.json`. Screenshots are stored beside this report.

## Verification

- Typecheck: PASS, 0 diagnostics.
- Certification: PASS, 29 files / 271 tests.
- Boost authority regression: PASS, 4 files / 24 tests.
- Global TVL deterministic regression: PASS, 5/5 tests.
- Focused combined regression run: PASS, 5 files / 29 tests.
- Production build: PASS, 8/8 tasks.
- Browser geometry and interaction acceptance: PASS at 1440×900, 1280×800, 390×844, and 430×932.
- Diff check: PASS.
- Real payment/approval/transaction: none.

## Scope

No shared modal primitive was touched, so Farm, Pool, SmartSwap, Bridge, and Liquidity modal geometry was not changed. The only runtime change is the historical Boost service-card layout restoration. The remaining files are the browser validator and acceptance evidence.

`BOOST_SERVICE_MODAL_LAYOUT_RESTORE_PASS`
