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
