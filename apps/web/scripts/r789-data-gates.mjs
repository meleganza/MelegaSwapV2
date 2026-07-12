#!/usr/bin/env node
/**
 * R789 production gates — liquidity studio dup-unavailable, SmartChef inventory, indexer.
 */
import { readFileSync, existsSync } from 'node:fs'
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

const lpInfo = read('src/views/LiquidityStudio/components/LiquidityLpInfoPanel.tsx')
gate('R789-LS-LP-NO-DUP-UNAVAILABLE', !lpInfo.includes('RUNTIME_UNAVAILABLE_LABEL'), 'LP panel uses em dash not Unavailable label')

const advisor = read('src/views/LiquidityStudio/components/AILiquidityAdvisorPanel.tsx')
gate('R789-LS-ADVISOR-NO-JSON-DUMP', !advisor.includes('TradeTechnicalDetails'), 'advisor panel avoids machine JSON dump')
gate('R789-LS-ADVISOR-NO-UNAVAILABLE-IMPORT', !advisor.includes('RUNTIME_UNAVAILABLE_LABEL'), 'advisor panel avoids Unavailable label')

const market = read('src/views/LiquidityStudio/components/MarketIntelligencePanel.tsx')
gate('R789-LS-MARKET-NO-JSON-DUMP', !market.includes('TradeTechnicalDetails'), 'market panel avoids machine JSON dump')

const terminal = read('src/views/LiquidityStudio/liquidityRuntime/useLiquidityTerminalData.ts')
gate('R789-LS-TERMINAL-NO-UNAVAILABLE', !terminal.includes('RUNTIME_UNAVAILABLE_LABEL'), 'liquidity terminal avoids Unavailable label')

const activity = read('src/views/LiquidityStudio/components/LiquidityActivityTable.tsx')
gate('R789-LS-ACTIVITY-NO-UNAVAILABLE', !activity.includes('RUNTIME_UNAVAILABLE_LABEL'), 'activity empty state avoids Unavailable label')

const discover = read('src/lib/bsc-indexer/registry/discoverSmartChefOnChain.ts')
gate('R789-SMARTCHEF-MULTI-PATH', discover.includes('pools-canonical-inventory.json'), 'SmartChef discovery loads canonical inventory paths')

const inventoryPath = join(ROOT, 'public/registry/pools-canonical-inventory.json')
gate('R789-SMARTCHEF-INVENTORY-PUBLIC', existsSync(inventoryPath), 'public registry inventory present for Vercel')

const r787 = read('scripts/r787-data-gates.mjs')
gate('R789-INHERITS-R787-GATES', r787.includes('R787-DEADLINE-BUDGET'), 'R787 gate script retained')

if (failures.length) {
  console.error('\nR789 gates failed:', failures.length)
  process.exit(1)
}
console.log('\nR789 data gates: ALL PASS (static)')
process.exit(0)
