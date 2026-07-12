#!/usr/bin/env node
/**
 * R787 production gates — indexer budget, coverage, trending, activity.
 */
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const failures = []

function read(rel) {
  return readFileSync(join(ROOT, rel), 'utf8')
}

function gate(id, ok, detail) {
  if (!ok) failures.push({ id, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'} ${id}: ${detail}`)
}

gate('R787-DEADLINE-BUDGET', read('src/lib/bsc-indexer/indexer/indexerDeadline.ts').includes('SAFE_EXECUTION_BUDGET_MS'), 'indexer deadline budget')
gate('R787-COVERAGE-RANGES', read('src/lib/bsc-indexer/indexer/coverageRanges.ts').includes('bootstrapWindowSummary'), 'coverage range merge and gaps')
gate('R787-ORCHESTRATOR', read('src/lib/bsc-indexer/indexer/indexerOrchestrator.ts').includes('runIndexerOrchestrator'), 'deadline orchestrator')
gate('R787-COVERAGE-API', read('src/pages/api/indexer/coverage.ts').includes('bootstrapWindow'), 'coverage diagnostic API')
gate('R787-PROTOCOL-ACTIVITY', read('src/pages/api/protocol/activity.ts').includes('listProtocolActivityEvents'), 'protocol activity API')
gate('R787-TIER-SCHEDULER', read('src/lib/bsc-indexer/indexer/tierScheduler.ts').includes('tier1RotationIndex'), 'tier round-robin scheduler')

const trending = read('src/views/HomeTrade/useDexTrendingRankings.ts')
gate('R787-TRENDING-NO-CHANGE-GATE', !trending.includes('if (!change24h) return'), '24H change not required for listing')
gate('R787-TRENDING-ACTIVITY-ACCENT', trending.includes('activityAccent'), 'trade count accent without change')

const avatar = read('src/design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar.tsx')
gate('R787-AVATAR-FALLBACK', avatar.includes('setSourceIndex((i) => i + 1)'), 'avatar advances through sources to monogram')

const network = read('src/components/NetworkSwitcher.tsx')
gate('R787-BNB-INLINE-SWITCH', network.includes('Switch wallet to BNB Smart Chain'), 'BNB-only inline wallet switch')

const runApi = read('src/pages/api/indexer/run.ts')
gate('R787-RUN-ORCHESTRATOR', runApi.includes('runIndexerOrchestrator'), 'cron uses orchestrator')

if (failures.length) {
  console.error('\nR787 gates failed:', failures.length)
  process.exit(1)
}
console.log('\nR787 data gates: ALL PASS (static)')
process.exit(0)
