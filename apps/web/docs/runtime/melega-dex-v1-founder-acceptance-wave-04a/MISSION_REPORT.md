# MELEGA_DEX_V1_FOUNDER_ACCEPTANCE_WAVE_04A_HOME_AND_PRODUCT_PAGES

## Scope (limited)

Completed only:

1. Home — Featured Projects + Top Movers
2. Project Page — dense long page, no anchor menu
3. List Page — Melega orbit hero, no KPI cards, compact How it works beside workspace

Explicitly untouched: Liquidity runtime, Pools runtime, AI Liquidity Builder contracts, Create Token contracts, Factory/Router/Treasury/Passport.

## Changes

### Home / Featured

- Desktop: four cards on one row (`repeat(4, minmax(0, 1fr))`); never 2×2 — tablet/mobile use horizontal snap rail
- Yellow border removed; continuous ambient gold glow pulse only
- Card height compressed (~half prior visual budget)
- Metrics: logo, name, symbol, chain, Trade, View Project, 24h %, Price, Liquidity, Volume, Market Cap
- Human decimal formatting (`0.000000000427 BNB`) — never scientific notation
- Unavailable volume / mcap remain `—`

### Home / Top Movers

- Ranking sources (priority): internal pair index → swap/tier observations → CoinGecko `simple/price` coin IDs → sequential single-contract `token_price`
- Measured multi-asset ribbon (local prod @1440): ETH, BTCB, CAKE, FLOKI, DOT, MARCO
- No fabrication; free-tier CG multi-contract batch rejected (error 10012) — handled via ID batch + 1-contract probes

### Project Page

- `ProjectStickyNav` removed from shell (`data-project-nav="none"`)
- One dense long page; hero compacted (horizontal identity)
- Order: Hero → Market snapshot → Trade → About → Tokenomics → Markets/Chart → Earn (Liq/Pools/Farms) → Wallet → Community → Roadmap → Transparency → Updates → Links/Developer/Treasury (always expanded)

### List Page

- Corrupted hero artwork + KPI cards removed
- Premium CSS 3D Melega logo with orbiting BNB + USDT (dark / gold, continuous)
- How it works compacted beside workspace Completion (`list-workflow-bridge`)
- Action cards scroll into workspace on intent select

## Evidence

Folder: `apps/web/docs/runtime/melega-dex-v1-founder-acceptance-wave-04a/`

- `capture.mjs` / `capture.log`
- `responsive-verification.json`
- `screenshots/{desktop,tablet,mobile}/*`

## Gates

- Vitest (Home + List Wave 04A suites): PASS
- `next build`: PASS
- Responsive overflow probe: none measured
- Forbidden runtimes: untouched

## FINAL VERDICT

**MELEGA_DEX_V1_FOUNDER_ACCEPTANCE_WAVE_04A_HOME_AND_PRODUCT_PAGES_CERTIFIED**
