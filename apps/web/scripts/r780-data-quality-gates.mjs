#!/usr/bin/env node
/**
 * R780 — production data quality gates (CI / pre-deploy).
 * Exits non-zero when a gate fails.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const webRoot = path.resolve(__dirname, '..')

const failures = []

function fail(id, message) {
  failures.push({ id, message })
}

function readJson(rel) {
  const full = path.join(webRoot, rel)
  if (!fs.existsSync(full)) return null
  return JSON.parse(fs.readFileSync(full, 'utf8'))
}

function readText(rel) {
  const full = path.join(webRoot, rel)
  if (!fs.existsSync(full)) return ''
  return fs.readFileSync(full, 'utf8')
}

// Gate: ontology + metric definitions exist
if (!fs.existsSync(path.join(webRoot, 'src/lib/data-truth/ontology.ts'))) {
  fail('G-ONTOLOGY', 'Missing canonical ontology module')
}
if (!fs.existsSync(path.join(webRoot, 'src/lib/data-truth/metricDefinitions.ts'))) {
  fail('G-METRICS', 'Missing production metric definitions')
}

// Gate: no public footer links to internal operator routes
const footer = readText('src/views/HomeTrade/HomeTradeFooter.tsx')
if (footer.includes('/orchestrator') || footer.includes('/runtime/labs')) {
  fail('G-FOOTER', 'Public footer exposes internal operator routes')
}

// Gate: live activity uses 24H window constant
const homeData = readText('src/views/HomeTrade/useHomeTradeData.ts')
if (!homeData.includes('LIVE_ACTIVITY_WINDOW_SEC')) {
  fail('G-ACTIVITY-WINDOW', 'Homepage activity must use LIVE_ACTIVITY_WINDOW_SEC')
}
if (!homeData.includes('No protocol activity indexed in the last 24 hours')) {
  fail('G-ACTIVITY-MESSAGE', 'Homepage empty activity message not spec-compliant')
}

// Gate: chart must not draw flat line for single point
const chartPanel = readText('src/views/Trade/components/TradeChartPanel.tsx')
if (chartPanel.includes('M 0 ${y} L ${width} ${y}')) {
  fail('G-CHART-FLAT', 'Trade chart still renders deceptive flat line for single point')
}
if (!chartPanel.includes('insufficient_history')) {
  fail('G-CHART-HISTORY', 'Trade chart missing insufficient_history state')
}

// Gate: tier indexer storage per slug
const storage = readText('src/lib/bsc-indexer/storage/index.ts')
if (!storage.includes('resolveIndexerStorageForSlug')) {
  fail('G-TIER-STORAGE', 'Per-slug indexer storage not implemented')
}

// Gate: multi-pair indexer not permanently DEFERRED in readiness source
const readiness = readText('src/lib/bsc-indexer/readiness.ts')
if (!readiness.includes('loadTierPairInventory')) {
  fail('G-TIER-READINESS', 'Readiness report does not evaluate tier inventory')
}

// Gate: DEX intelligence synthetic events gated
const radarRuntime = readText('src/views/RadarStudio/radarRuntime/useRadarIntelligenceRuntime.ts')
if (!radarRuntime.includes('isDexIntelligencePublicReady')) {
  fail('G-RADAR-SYNTH', 'DEX Intelligence synthetic live events not gated')
}

// Gate: registry audit file present
const audit = readJson('docs/runtime/r780-data-truth-audit.json')
if (!audit) {
  fail('G-AUDIT', 'Missing r780-data-truth-audit.json')
}

// Gate: dex-asset-index barrel exports match buildDexAssetIndex public API
const dexBarrel = readText('src/lib/dex-asset-index/index.ts')
const dexBuild = readText('src/lib/dex-asset-index/buildDexAssetIndex.ts')
const requiredDexExports = ['getCanonicalIndexedAssets', 'getTradeSurfaceAssets', 'buildDexAssetIndex']
requiredDexExports.forEach((symbol) => {
  if (!dexBuild.includes(`export function ${symbol}`) && !dexBuild.includes(`export const ${symbol}`)) {
    fail('G-DEX-EXPORT-SOURCE', `buildDexAssetIndex missing export ${symbol}`)
  }
  if (!dexBarrel.includes(symbol)) {
    fail('G-DEX-EXPORT-BARREL', `lib/dex-asset-index barrel missing re-export ${symbol}`)
  }
})

const homeImportsCanonical = homeData.includes('getCanonicalIndexedAssets')
if (homeImportsCanonical && !dexBarrel.includes('getCanonicalIndexedAssets')) {
  fail('G-DEX-CANONICAL-BARREL', 'useHomeTradeData imports getCanonicalIndexedAssets but barrel does not export it')
}

// R783 gates
const trendingRankings = readText('src/views/HomeTrade/useDexTrendingRankings.ts')
if (!trendingRankings.includes('getCanonicalIndexedAssets')) {
  fail('G-TRENDING-UNIQUE-ADDRESS', 'Trending must rank canonical assets by address')
}
if (!trendingRankings.includes('computeValid24hPriceChange')) {
  fail('G-TRENDING-CHANGE-HISTORY', 'Trending must use valid 24H change helper')
}
if (!readText('src/lib/data-truth/compute24hPriceChange.ts').includes('window.length < 2')) {
  fail('G-TRENDING-CHANGE-HISTORY', '24H change helper must reject insufficient window')
}

const poolsRuntime = readText('src/views/PoolsStudio/poolsRuntime/formatPoolsRuntime.ts')
if (!poolsRuntime.includes('derivePoolLifecycle')) {
  fail('G-POOL-RECONCILIATION', 'Pools runtime must derive canonical lifecycle flags')
}
if (!poolsRuntime.includes('listRewardingPools')) {
  fail('G-POOL-RECONCILIATION', 'Pools runtime must expose rewarding pool list')
}

const featuredHero = readText('src/views/PoolsStudio/components/FeaturedPoolHero.tsx')
if (!featuredHero.includes('rewardingCount')) {
  fail('G-POOL-HERO-CONSISTENCY', 'Featured pool hero must respect rewarding count')
}

const farmsRuntime = readText('src/views/FarmsStudio/farmsRuntime/useFarmsStakingRuntime.ts')
if (!farmsRuntime.includes('useMasterChefEmission')) {
  fail('G-FARM-EMISSION-CONSISTENCY', 'Farms runtime must use canonical MasterChef emission hook')
}

const createPool = readText('src/views/PoolsStudio/components/CreatePoolCta.tsx')
if (!createPool.includes('MelegaTokenAvatar')) {
  fail('G-MARCO-OFFICIAL-ASSET', 'Create Pool wizard must use MelegaTokenAvatar')
}
if (createPool.includes('value.slice(0, 1)') && createPool.includes('TokenLogo')) {
  fail('G-MARCO-OFFICIAL-ASSET', 'Create Pool wizard must not use generic letter avatars')
}

const poolCard = readText('src/views/PoolsStudio/components/PoolGridCard.tsx')
if (poolCard.includes('position: absolute') && poolCard.includes('Footer')) {
  fail('G-CARD-NO-OVERFLOW', 'Pool cards must not use absolute footer positioning')
}

const report = {
  mission: 'R780 data quality gates',
  timestamp: new Date().toISOString(),
  passed: failures.length === 0,
  failureCount: failures.length,
  failures,
}

const outPath = path.join(webRoot, 'docs/runtime/r780-data-quality-gates.json')
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`)

console.log(JSON.stringify(report, null, 2))
process.exit(failures.length > 0 ? 1 : 0)
