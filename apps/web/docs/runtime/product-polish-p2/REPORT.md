# MELEGASWAP_V2_PRODUCT_POLISH_P2_FOUNDER_ACCEPTANCE

## Verdict

`MELEGASWAP_V2_PRODUCT_POLISH_P2_FOUNDER_ACCEPTANCE_COMPLETE`

## Baseline

- Source branch: `mission-product-polish-p1`
- Source commit: `21ebc757`

## Bugs found (before)

| ID | Severity | Part | Detail |
|---|---|---|---|
| portfolio-header / portfolio-nav | high | F | `/portfolio` set `pure=true` → global header + navbar hidden |
| create-pool-double-title | high | C | Hidden legacy `<Title>Create Pool</Title>` still present as H2 in DOM |
| create-pool treasury raw | latent | C | Fee recipient hex could surface in hidden fee block / review |
| farms-my Unavailable | med | E | My Farms card printed `Unavailable` instead of `—` / USD-primary |
| portfolio Unavailable labels | med | F | Shell converted `—` metrics back to `Unavailable` |
| create-farm DOM order | med | B | Preview column preceded accordion in DOM (mobile order risk) |
| network-modal mobile | med | G | Acceptance could not open chain control (hidden desktop target) |

## Bugs fixed

1. Removed `PortfolioPage.pure = true` so Portfolio uses Melega app shell header/nav
2. Removed duplicate Create Pool H2; review jump kept without second title
3. Create Pool fee UI shows consumer `Fee destination` label only (no raw treasury address)
4. My Farms deposited primary prefers USD when available; missing metrics use `—`
5. Portfolio metrics/placeholders use `—` (no Unavailable conversion)
6. Create Farm DOM: accordion (`FieldsCol`) left, sticky `PreviewCol` right
7. Mobile network hit-target densified (`min 40×40`) in `MelegaAppShell`

## Acceptance

- Unit: `productPolishP2FounderAcceptance` + polish/modal/portfolio suites — pass
- `next build` — pass
- Browser founder acceptance 1440 / 1280 / 1024 / 390 — **0 bugs** (`after-acceptance.json`)
- Screenshots: `docs/runtime/product-polish-p2/screenshots/{before,after}/`

## Forbidden (untouched)

Smart Swap · contracts · AMM · Treasury economics · fee schedule logic · router · wallet execution · certified on-chain writes
