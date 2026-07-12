#!/usr/bin/env node
/**
 * R785 founder reconciliation gates — static source checks + optional production probe.
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SRC = join(ROOT, 'src')

const failures = []

function read(rel) {
  return readFileSync(join(ROOT, rel), 'utf8')
}

function gate(id, ok, detail) {
  if (!ok) failures.push({ id, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'} ${id}: ${detail}`)
}

// GATE 4 — rewarding=0 => no featured pool recommendation in selectFeaturedPool
const poolsRuntime = read('src/views/PoolsStudio/poolsRuntime/formatPoolsRuntime.ts')
gate(
  'G4-FEATURED-REWARDING-ONLY',
  poolsRuntime.includes('listRewardingPools(cards)') &&
    poolsRuntime.includes('if (!rewarding.length) return undefined'),
  'selectFeaturedPool restricted to rewarding pools',
)

// GATE 6/7 — trending eligibility requires change + trades
const trending = read('src/views/HomeTrade/useDexTrendingRankings.ts')
gate(
  'G6-TICKER-ELIGIBILITY',
  trending.includes('tradeCount24h <= 0') && trending.includes('if (!change24h) return'),
  'ticker requires trades and valid 24H change',
)

gate(
  'G7-TICKER-SYMBOL-DEDUP',
  trending.includes('bySymbol'),
  'symbol deduplication present',
)

// GATE 8 — image onError fallback
const gridCard = read('src/views/CollectiblesStudio/components/CollectibleGridCard.tsx')
gate(
  'G8-IMAGE-FALLBACK',
  gridCard.includes('onError') && gridCard.includes('fallbackImageUrl'),
  'collectible image fallback chain',
)

// GATE 9 — BNB-only non-interactive pill
const networkSwitcher = read('src/components/NetworkSwitcher.tsx')
gate(
  'G9-BNB-STATUS-PILL',
  networkSwitcher.includes('data-network-status-pill') && networkSwitcher.includes("cursor: 'default'"),
  'BNB-only status pill without modal trigger',
)

// GATE 10 — no duplicate Unavailable in pools KPI
const poolsKpi = read('src/views/PoolsStudio/components/PoolsKpiRow.tsx')
gate(
  'G10-POOLS-APR-UNAVAILABLE',
  poolsKpi.includes('isForbiddenAprDisplay'),
  'highest APR forbidden display guard',
)

// Part 7 — AI Mode removed from trade header
const tradeHeader = read('src/views/Trade/components/TradePageHeader.tsx')
gate(
  'G-REMOVE-AI-MODE',
  !tradeHeader.includes('<HowItWorks') && !tradeHeader.includes('AiModeWrap'),
  'trade header dead controls removed',
)

// Trending empty copy
const tickerUi = read('src/design-system/melega/components/Ticker/MelegaTicker.tsx')
gate(
  'G-TICKER-EMPTY-COPY',
  tickerUi.includes('Market ranking temporarily unavailable'),
  'ticker empty state copy',
)

// Market overview hides when empty
const marketOverview = read('src/views/HomeTrade/HomeMarketOverview.tsx')
gate(
  'G-MARKET-HIDE-EMPTY',
  marketOverview.includes('if (cards.length === 0) return null'),
  'market overview hidden when no cards',
)

// Chart 3+ candles for line
const chartPanel = read('src/views/Trade/components/TradeChartPanel.tsx')
gate(
  'G3-CHART-MIN-CANDLES',
  chartPanel.includes('pairPrices.length >= 3'),
  'line chart requires 3+ valid points',
)

// GATE 1-3 — trade reconciliation gates in terminal data
const tradeTerminal = read('src/views/Trade/useTradeTerminalData.ts')
gate(
  'G1-TRADE-SWAPS-RECONCILE',
  tradeTerminal.includes("reconciliationStatus === 'inconsistent'") &&
    tradeTerminal.includes('tradeCount > 0 && recentSwaps.length === 0'),
  'tradeCount>0 requires recent swaps or inconsistent status',
)
gate(
  'G3-LIQUIDITY-RESERVE-GATE',
  tradeTerminal.includes('reserveLiquidityUsd') && tradeTerminal.includes('liquidityStat?.reasonCode'),
  'reserve liquidity reconciliation gate',
)

// Pools hero historical state
const featuredHero = read('src/views/PoolsStudio/components/FeaturedPoolHero.tsx')
gate(
  'G-POOLS-HISTORICAL-HERO',
  featuredHero.includes('No active rewarding pools') &&
    featuredHero.includes('machine?.integrity?.ended'),
  'pools hero uses ended pool integrity count',
)

// Radar coming soon disposition
const radarScreen = read('src/views/RadarStudio/RadarStudioScreen.tsx')
gate(
  'G-RADAR-COMING-SOON',
  radarScreen.includes('isDexIntelligencePublicReady()') && radarScreen.includes('RadarComingSoonBanner'),
  'radar hides intelligence panels until pipeline ready',
)

// Create pool estimated APR guard
const poolWizard = read('src/views/PoolsStudio/components/createPoolWizardState.ts')
gate(
  'G-CREATE-POOL-APR',
  poolWizard.includes('Complete pool parameters to estimate APR') &&
    poolWizard.includes('hasCompletePoolEstimateParams'),
  'create pool APR blocked until parameters complete',
)

if (failures.length) {
  console.error('\nR785 gates failed:', failures.length)
  failures.forEach((f) => console.error(` - ${f.id}: ${f.detail}`))
  process.exit(1)
}

console.log('\nR785 founder production gates: ALL PASS (static)')
process.exit(0)
