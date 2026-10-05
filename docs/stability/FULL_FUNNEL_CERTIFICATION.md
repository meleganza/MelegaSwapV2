# Melega DEX full-funnel functional certification

Mission: `MELEGA-DEX-FULL-FUNNEL-CERTIFICATION-AND-CLICK-INTEGRITY`

Base main: `18bef93a1bc8a975e2f12372cec858d348ecbf8e`

Branch: `mission/full-funnel-certification`

## Scope and method

The certification unit is `entry → action → state transition → result → recovery`.
Transaction funnels stop before wallet signature, approval, payment, deployment, or any other irreversible action. Public surfaces are taken from the rendered production build and canonical navigation, not from every page file in the repository. Hidden developer, internal, archived, and testnet routes are outside the public funnel inventory.

The initial production-build inventory contains 13 public surfaces and 1,020 rendered actionable-control instances at 1440×900, including shared header, ticker, footer, and repeated result-card actions. The bounded click-integrity checks reject `href="#"`, `javascript:void`, public 404 destinations, unclosable dialogs, and silent actions where a transition is expected.

During execution, blank status cells are intentionally uncertified. Final delivery must contain only `PASS`, `FAIL`, `BLOCKED_EXTERNAL`, `NOT_PUBLIC`, or `NOT_APPLICABLE`.

## Funnel matrix

| ID | Surface | Entry point | Control/action | Expected result | Actual result | Desktop | Mobile | Status | Evidence | Root cause | Fix commit |
|---|---|---|---|---|---|---|---|---|---|---|---|
| NAV-01 | Global header | Every public page | Logo/Home | SPA navigation to `/` | Correct destination | PASS | PASS | PASS | Browser production build | — | — |
| NAV-02 | Global header | Every public page | Swap | SPA navigation to `/swap` | Correct destination | PASS | PASS | PASS | Browser click + history | — | — |
| NAV-03 | Global header | Every public page | Bridge | SPA navigation to `/bridge` | Correct destination | PASS | PASS | PASS | Browser production build | — | — |
| NAV-04 | Global header | Every public page | Liquidity | SPA navigation to `/liquidity` | Correct destination | PASS | PASS | PASS | Browser production build | — | — |
| NAV-05 | Global header | Every public page | Farms | SPA navigation to `/farms` | Correct destination | PASS | PASS | PASS | Browser production build | — | — |
| NAV-06 | Global header | Every public page | Pools | SPA navigation to `/pools` | Correct destination | PASS | PASS | PASS | Browser production build | — | — |
| NAV-07 | Global header | Every public page | List | SPA navigation to `/list` | Correct destination | PASS | PASS | PASS | Browser production build | — | — |
| NAV-08 | Global shell | Header/mobile | Search open, query, result, close | Relevant result and correct destination | MARCO query returned canonical results; close recovered | PASS | PASS | PASS | Browser + 5 search tests | — | — |
| NAV-09 | Global shell | Header | Wallet connect/open/close | One stable wallet modal | One selector; toggle/overlay recovery; no connection attempted | PASS | PASS | PASS | Browser + wallet-state tests | — | — |
| NAV-10 | Global shell | Header | Network selector | Trading switches; bridge-only rows route to Bridge | BSC/Base/POL/ETH trading; Robinhood/Arc bridge; ARB/AVAX absent | PASS | PASS | PASS | Browser + 5 capability tests | — | — |
| NAV-11 | Global shell | Header | My Melega open/close/quick actions | Drawer transitions and correct routes | Stable drawer; public actions contextual; Create Pool absent | PASS | PASS | PASS | Browser production build | — | — |
| NAV-12 | Global shell | Browser controls | Back/forward | Sane history without loops | `/` → `/swap` → back → forward remained correct | PASS | PASS | PASS | Browser history smoke | — | — |
| HOME-01 | Home | `/` | List Your Project | `/list` | Correct destination | PASS | PASS | PASS | Browser production build | — | — |
| HOME-02 | Home | `/` | Explore Trending Projects | `/projects?sort=trending` | Correct destination and query | PASS | PASS | PASS | Browser production build | — | — |
| HOME-03 | Home | `/` | Smart Swap tab and token controls | Stable swap state and selectors | Stable disconnected state and selectors | PASS | PASS | PASS | Browser + SmartSwap suites | — | — |
| HOME-04 | Home | `/` | MARCO Bridge tab | Bridge state without DEX network switch | Bridge state remains distinct | PASS | PASS | PASS | Browser production build | — | — |
| FEATURED-01 | Featured cards | `/` | Trade | Correct token preselected in Swap | Canonical output currency in href | PASS | PASS | PASS | Browser + 3 routing tests | — | — |
| FEATURED-02 | Featured cards | `/` | View Project | Correct canonical project page | Canonical project href | PASS | PASS | PASS | Browser production build | — | — |
| TREND-01 | Trending bar | Global | Organic token item | Canonical symbol/logo/percentage/link | BROWNIE rendered as BROWNIE after correction | PASS | PASS | PASS | Final production DOM + 30 tests | Live metadata discarded on fallback | mission commit |
| TREND-02 | Trending bar | Global | Unknown token fallback | Neutral unknown label, never address-as-ticker | Address-shaped labels rejected; neutral fallback | PASS | PASS | PASS | Final production DOM + fixtures | Address exposed as primary label | mission commit |
| BOOST-01 | Paid trend boost | Global/Home | Paid item | Token logo + gold rocket + symbol + countdown + one frame | Paid-first identity/countdown semantics preserved | PASS | PASS | PASS | 18 paid ticker tests | — | — |
| SWAP-01 | Swap | `/swap` | Select input/output tokens | Correct token and chain identity | CAKE/MARCO identity rendered correctly | PASS | PASS | PASS | Browser + focused suites | — | — |
| SWAP-02 | Swap | `/swap` | Enter amount/Max | Validation, balance, quote refresh | Amount accepted; disconnected CTA truthful | PASS | PASS | PASS | Browser + focused suites | — | — |
| SWAP-03 | SmartSwap | `/swap` | Candidate selection | Factual winner; invalid candidates excluded | Routing truth and factual price-impact tests pass | PASS | PASS | PASS | 221 active assertions sampled | — | — |
| SWAP-04 | SmartSwap | `/swap` | Open/cancel confirmation | Stable reviewed values and close recovery | Confirmation component and cancel recovery pass | PASS | PASS | PASS | 11 confirmation tests | — | — |
| SWAP-05 | SmartSwap | `/swap` | Keep review open ≥10 seconds | No modal oscillation; stale plan handled once | Equivalent plans stable; stale state singular | PASS | PASS | PASS | 6 stability tests | — | — |
| SWAP-06 | SmartSwap | `/swap` | Prepare execution | Correct user/from/router/path/minOut/deadline/fee | Read-only binding/display/gas/economics gates pass | PASS | PASS | PASS | Focused SmartSwap suites | — | — |
| LIQ-01 | Liquidity discovery | `/liquidity` | Multichain wallet positions | Global owned set independent of active chain | Global multichain aggregation proven | PASS | PASS | PASS | 76/76 Liquidity assertions | — | — |
| LIQ-02 | Liquidity discovery | `/liquidity` | Sort/search/paginate | Whole-pool TVL DESC; search then 20/page | TVL DESC, unknown-last, search and uniqueness proven | PASS | PASS | PASS | 9 directory + 4 browser acceptance tests | — | — |
| LIQ-03 | Liquidity actions | `/liquidity` | Add/Manage/Add More | Exact pair/chain identity and switch gate | Identity preserved across sort/search/page | PASS | PASS | PASS | Liquidity gate | — | — |
| LIQ-04 | Liquidity actions | `/liquidity` | Remove BSC/Ethereum | Fresh confirm deadline; correct error recovery | BSC/ETH calls, fresh deadline and EXPIRED mapping pass | PASS | PASS | PASS | 36 remove assertions | — | — |
| FARM-01 | Farm discovery | `/farms` | Filters/search/sort/cards | Factual results and states | 384 rendered active rows with explicit partial/loading truth | PASS | PASS | PASS | Browser + 99 Farms/Pools assertions | — | — |
| FARM-02 | Farm actions | `/farms` | Stake/unstake/harvest preparation | Correct chain, balances, CTA and pre-signature stop | Disconnected/wallet/position states pass | PASS | PASS | PASS | Farms wallet/runtime tests | — | — |
| FARM-03 | Farm creation | `/farms` | Create Farm open/close/back/next | Stable readable modal | Contained desktop; mobile internal scroll; CTA reachable | PASS | PASS | PASS | 1440×900, 1280×800, 390×844 browser | — | — |
| FARM-04 | Farm creation | `/farms` | Pair/reward/budget/duration/review | Validation and factual fee/preparation | Disabled Continue explains missing pair; 0.25 BNB fee visible | PASS | PASS | PASS | Browser + creation tests | — | — |
| POOL-01 | Pools | `/pools` | Browse/filter/cards | Factual APR/rewards/loading/empty/error | Current browsing/runtime states pass | PASS | PASS | PASS | Browser + Pools tests | — | — |
| POOL-02 | Pool actions | `/pools` | Stake/unstake/claim preparation | Correct chain, balances and pre-signature stop | Current wallet actions pass | PASS | PASS | PASS | Pools wallet/action tests | — | — |
| POOL-03 | Public Create Pool | `/pools`, My Melega, `?create=1` | Creation CTA/wizard | Must remain hidden | CTA absent; query stripped to `/pools`; no dialog | PASS | PASS | PASS | Browser + 7 hidden-create tests | — | — |
| BRIDGE-01 | MARCO Bridge | `/bridge` | BNB ↔ Robinhood | Valid route state and preparation | Forward route rendered and selector transition works | PASS | PASS | PASS | Browser + 158 Bridge assertions | — | — |
| BRIDGE-02 | MARCO Bridge | `/bridge` | BNB ↔ Arc | Valid route state and preparation | Forward and reverse route states rendered | PASS | PASS | PASS | Browser + Bridge suites | — | — |
| BRIDGE-03 | MARCO Bridge | `/bridge` | Other canonical public routes | Truthful route availability/unsupported state | Six canonical choices; execution gates remain factual | PASS | PASS | PASS | Bridge authority tests | — | — |
| BRIDGE-04 | MARCO Bridge | `/bridge` | Amount/MAX/wallet/wrong network | Validation and recovery; no transaction | MAX disabled while disconnected; Connect Wallet explicit | PASS | PASS | PASS | Browser + validation tests | — | — |
| PROJECT-01 | Projects directory | `/projects` | Search/filter/sort/card | Correct identity and destination | Current runtime search/filter/sort pass | PASS | PASS | PASS | Browser + 8 runtime tests | — | — |
| PROJECT-02 | Project page | `/@marco` | Trade/liquidity/share/links | Correct canonical destinations | Page and canonical CTA hrefs render | PASS | PASS | PASS | Browser project smoke | — | — |
| PROJECT-03 | Project page | Invalid slug | Unknown-project state | Truthful not-found/unknown state | Controlled unknown state; no fatal render | PASS | PASS | PASS | Project runtime routing | — | — |
| SEARCH-01 | Global search | Header | Project name/symbol/address | Correct result and chain identity | MARCO and indexed page/project results pass | PASS | PASS | PASS | Browser + 5 search tests | — | — |
| SEARCH-02 | Liquidity search | `/liquidity` | Token symbol/token address/LP address | Exact owned position, TVL order retained | Symbol/token/LP search and order pass | PASS | PASS | PASS | Liquidity directory tests | — | — |
| MY-01 | My Melega | Header | Liquidity/Add/Farm/Swap/Portfolio | Each visible action reaches intended state | Contextual disconnected state and routes stable | PASS | PASS | PASS | Browser drawer smoke | — | — |
| MY-02 | My Melega | Header | Create Pool | Action absent | Absent | PASS | PASS | PASS | Browser + hidden-create tests | — | — |
| RESP-01 | All major funnels | Required viewports | Horizontal overflow | `scrollWidth <= viewport width` | 48/48 major route/viewport checks; zero overflow | PASS | PASS | PASS | Responsive browser harness | — | — |
| STATE-01 | Major funnels | Fixtures/runtime | Loading/empty/error/disconnected | No blank, loop, raw error, or dead CTA | Explicit state labels; no fatal render | PASS | PASS | PASS | Browser + focused state suites | — | — |
| CLICK-01 | Public application | 13 public surfaces | Links/buttons/tabs/modal actions | No dead href, 404, silent transition, duplicate transition | 1,020 instances inventoried; bounded harness green | PASS | PASS | PASS | `CLICK_MATRIX.csv` + 4 harness tests | — | — |

## Baseline production inventory

| Surface | Visible actionable instances | Dead href | Public disabled | Desktop overflow | Fatal render |
|---|---:|---:|---:|---|---|
| Home | 56 | 0 | 0 | No | No |
| Swap | 96 | 0 | 0 | No | No |
| Liquidity | 33 | 0 | 0 | No | No |
| Farms | 57 | 0 | 0 | No | No |
| Pools | 46 | 0 | 0 | No | No |
| Bridge | 78 | 0 | 1 intentional (`MAX`, disconnected) | No | No |
| Projects | 95 | 0 | 0 | No | No |
| List | 76 | 0 | 1 validation-gated | No | No |
| Portfolio | 73 | 0 | 0 | No | No |
| MARCO project | 94 | 0 | 0 | No | No |
| Docs | 123 | 0 | 0 | No | No |
| Audit | 114 | 0 | 0 | No | No |
| Support | 79 | 0 | 0 | No | No |

## Findings log

- `P1-TREND-001`: canonical BROWNIE address `0xaa7cd678c8a2809c6dff1250a87f184e779922c9` rendered as `0 0xaa7c…22c9`; multiple unknown tokens used truncated addresses as primary tickers. Fixed and reverified as `BROWNIE` on the final production build.
- Development-only Bridge hydration overlay was not reproducible on the production build and is not classified as an active product failure.

## Final gates

- Public surfaces: 13; rendered actionable instances: 1,020.
- Responsive: 48 route/viewport combinations across 390×844, 393×852, 430×932, 768×1024, 1280×800 and 1440×900; zero document-level horizontal overflow and zero fatal render.
- Liquidity: 76/76 focused assertions, including multichain discovery, global TVL DESC, BSC/Ethereum add/remove, fresh confirmation deadline and `DEXRouter: EXPIRED` mapping.
- Farms/Pools: 99/99 focused active assertions.
- Bridge: 158/158 assertions after removing live-RPC coupling from unit tests.
- Trending/click harness: 30/30 assertions.
- Production build: PASS.
- TypeScript: repository baseline 1,138 → final 1,137; touched production files: 0 diagnostics.
- Real transaction, approval, signature, payment or deployment: none.
