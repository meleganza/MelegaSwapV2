# MelegaDEX Evo UX Master Spec — R033

Status: execution source of truth for Founder Review RC. This document does not confer Founder approval.

## Baseline

- Repository: `meleganza/MelegaSwapV2`
- Application: `apps/web`
- Technical baseline: R032 `70fb5f82ed1c2fc93e9781cc534195373c128017`
- R031 ancestor: `7ff4d72d16de270bc8870a36d0e160b647c3485e`
- R033 branch: `codex/r033-founder-approved-ux`
- `apps/next-gen` is out of scope and must not be changed.

## Canonical mockup manifest

The eleven supplied files resolve to eight unique images. Files suffixed `OK` are byte-identical to their corresponding source image and are treated as the canonical duplicate.

| ID | Canonical asset in RC | SHA-256 | Size | Approved surfaces |
|---|---|---|---|---|
| M01 | `artifacts/r033/mockups/trade-smartswap.png` | `88c07e9150c57f348bf1fa250ec0539e61495bc8c2577c54e2e71a1e7b512d24` | 852×1846 | Trade / SmartSwap |
| M02 | `artifacts/r033/mockups/token-selector.png` | `0e35d3086a2341b02257974044f303d1df6c9189e285437cab94902a639f39eb` | 852×1846 | Token Selector |
| M03 | `artifacts/r033/mockups/marco-bridge.png` | `89536aa17cad06bdf5464139dff706cada72d9ec4f8f228e915da1a5d5f04100` | 941×1672 | MARCO Bridge |
| M04 | `artifacts/r033/mockups/earn-flow-showcase.png` | `cf75029d62d5213cf555b93b3ecb760275f532a097ba9e2b21820d15bc1c9dbb` | 1536×1024 | Earn Opportunities, pair guided flow, stake LP |
| M05 | `artifacts/r033/mockups/earn-pearl-dashboard.png` | `af6d54141efcbb6edab067cdf6865a3bd7a02c51dbc8d4b15e87f5716cf59d2b` | 1536×1024 | Earn Pearl catalog, detail, add liquidity |
| M06 | `artifacts/r033/mockups/portfolio-pearl.png` | `50023874ace92f7801295a75412214539493f761aa2a72e8fb2f92af2bf8291b` | 1536×1024 | Portfolio overview, positions, position detail |
| M07 | `artifacts/r033/mockups/explore-pearl.png` | `eb34c73c77f76851323b25f0cca90a0d46ff02e9008a77951702a42421dd3cee` | 1536×1024 | Explore discovery, project detail, swap handoff |
| M08 | `artifacts/r033/mockups/tools-pearl.png` | `5e7d917a5d480d8c383e0ffdfdd258062db3f168d9a0e8f1cd232a12b2a2a4a3` | 1536×1024 | Tools catalog, Create Token, Trend Boost |

Mockup data values are illustrative only. Runtime values must come from the existing readers; unavailable data is omitted or labelled unavailable.

## Route and legacy-runtime mapping

| Surface | Route/deep link | UI owner | Canonical runtime preserved |
|---|---|---|---|
| Trade / SmartSwap | `/`, `/swap` | `TradeTerminalScreen`, `TradeCockpit` | existing SmartSwap form, Redux/Wagmi, quote/execution host |
| Token Selector | modal from Trade/Liquidity | `CurrencySearchModal`, `CurrencySelect` | existing token lists, wallet balances, import flow |
| MARCO Bridge | Trade tab and `/bridge` | `MarcoBridgeWorkspace` | `/api/marco-bridge/*`, existing build/quote/track flow |
| Earn Opportunities | `/farms`, `/pools` | `FarmsStudioScreen`, `PoolsStudioScreen`, `EarnPremiumShell` | existing farm/pool readers and action host |
| Earn Liquidity | `/liquidity`, `/add/*`, `/remove/*` | `LiquidityStudioV3Shell` plus canonical legacy add/remove runtime | existing AMM, LP readers, approvals and transaction builders |
| Portfolio | `/portfolio` | `PortfolioStudioScreen` | existing wallet aggregation and position readers |
| Explore | `/projects` | `ProjectsStudioScreen` | existing project registry/indexer readers |
| Project detail | `/project/[slug]` and canonical redirects | existing project detail route | existing registry, market-data and social sources |
| Tools catalog | `/list` | `ListStudioScreen`, `ToolsServiceGrid` | existing services and checkout hosts |
| Create Token | `/list?intent=create-token` | `ListWorkspace` | canonical factory and post-creation funnel |
| Trend Boost | `/list?intent=claim-project#trend-boost` | `ListTrendBoostCheckout` | existing plans, orders and checkout |

## Visual contract

- Pearl is the default: canvas `#F7F6F2`, surface `#FFFFFF`, secondary surface `#F1F0EB`, text `#171817`, secondary text `#72736E`, border `#E5E2D9`, gold `#F3C928`, gold soft `#FFF2BD`, success `#21865A`, error `#C84545`.
- Inter only, weights 400/500/600/700.
- Radius: cards 16px; buttons and inputs 12px; minimum interactive target 44px.
- No decorative gradients, glass, neon, heavy shadows, oversized hero, empty KPI panels, ticker, global search, duplicated navigation or promotional sections.
- Mobile header: verified MelegaDEX Evo lockup, network and wallet. Mobile bottom navigation: Trade, Earn, Portfolio, Explore. Tools remains secondary.
- Desktop header: logo, Trade, Earn, Portfolio, Explore, Tools, network and wallet.

## Brand asset rule

The repository contains the canonical Melega symbol but no standalone licensed `Evo` lettering asset. R033 must use an exact, stable raster extraction from M01/M02/M03 rather than synthesized text or an unverified font. The extraction is a derivative of the Founder-supplied canonical mockup and is used only as the lockup suffix.

## Financial invariants

- No new engine, provider, reader, indexer, checkout or AMM.
- Wallet, Redux/Wagmi, SmartSwap, action host, contracts, fees, Treasury, MARCO Pay and checkout behavior remain unchanged.
- BNB native Melega farms/pools may accept new positions.
- Polygon, Ethereum and Base native Melega farms/pools are terminated: no new stake/deposit/create through list, deep link or action host.
- Existing exits remain available where contracts permit: unstake, withdraw, emergency withdraw, claim and remove liquidity.
- The terminated policy does not disable Swap or ordinary liquidity removal.

## Phase gates

Each implementation phase requires a limited diff, real 390px and 1440px screenshots, relevant tests and visual comparison against the mapped mockup. A failed visual comparison blocks the next phase. Final status is limited to `R033_FOUNDER_REVIEW_RC_READY` or `R033_BLOCKED`.
