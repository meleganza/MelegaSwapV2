# R016 local funnel preflight

Candidate under test before this fix: `86789234`. Local production build only. External wallet, payment, and old-DEX clicks were not followed.

## Fixed

Editing a quote amount, a portfolio address, a Beefy receipt address, or a shadow address left the previous result on screen. Those results now clear, and a late response is dropped.

## Matrix

| Control | Result |
| --- | --- |
| Home idle 3s, widths 320/390/430/768/1440 | PASS. 0 `/api` calls. Overflow 0. |
| Skip link focus | PASS. |
| Quote invalid amount, then 0.01, then edit to 0.02 | PASS. Invalid text shown. Result clears on edit. |
| Portfolio `zz`, then a public address, then edit back | PASS. Rejection and balances clear on edit. |
| Earn MARCO contract, APY unavailable, live farm href | PASS. |
| Beefy receipt address edit | PASS. Prior rejection clears. |
| `/earn-retired` read button and farm exit href | PASS. Full chain scan not repeated. |
| Explore project and trending hrefs, Boost empty or unavailable | PASS for labels. EXTERNAL_NOT_E2E_TESTED for the live site. |
| Create Token, Featured, Premium, Trend Boost hrefs | EXTERNAL_NOT_E2E_TESTED. Copy says payment stays on the live DEX. |
| Bridge pairs and live bridge href | PASS for disabled in-beta execution. EXTERNAL_NOT_E2E_TESTED for the live bridge. |
| Swap direction button | BLOCKED by design. Label: unavailable. |
| History back from Swap to Bridge | PASS. |
| `/api/sealed-prepare` with certify in the body | PASS. HTTP 403 `PREVIEW_READ_ONLY`. |
| Guest hosted preview | BLOCKED. Not retried on a previously challenged host. |

Screenshots from this local build: `docs/r016/home-390.png`, `docs/r016/home-1440.png`, `docs/r016/earn-1440.png`, `docs/r016/bridge-390.png`.

## Not a release

In-beta swap, bridge execution, farm deposit, and pool withdrawal are not this app. Replacing `www.melega.finance` remains NO-GO until the live engine stays in place and a guest can open the hosted preview without SSO.
