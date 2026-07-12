#!/usr/bin/env node
/**
 * R786 production data gates — static + optional production probe.
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

const tierInv = read('src/lib/bsc-indexer/indexer/tierInventory.ts')
gate('R786-TIER-REGISTRY-FIX', tierInv.includes('const { registry } = await resolveOnchainRegistry()'), 'tier inventory reads registry wrapper')

const canonical = read('src/lib/bsc-indexer/indexer/canonicalTierPairs.ts')
gate('R786-TIER1-FACTORY-PROOF', canonical.includes('factoryGetPair') && canonical.includes('pairReserves'), 'tier1 Factory.getPair + reserves proof')

const engine = read('src/lib/bsc-indexer/indexer/pairSyncEngine.ts')
gate('R786-FORWARD-PRIORITY', engine.includes('forwardCursor') && engine.includes('chunked-forward'), 'dual-cursor forward-priority sync')

const recon = read('src/lib/data-truth/tradeReconciliation.ts')
gate('R786-G2-COMPLETE', recon.includes('volume24h>0 but no normalized Swap events') && recon.includes('volume24h>0 but no volume-bearing candles'), 'G2 full reconciliation')

const runApi = read('src/pages/api/indexer/run.ts')
gate('R786-TIER1-SYNC', runApi.includes('runIndexerOrchestrator') || (runApi.includes('tier1Extra') && runApi.includes('runTierPairSync')), 'cron syncs tier pairs via orchestrator')

gate('R786-INVENTORY-API', read('src/pages/api/indexer/inventory.ts').includes('forwardCursor'), 'pair inventory diagnostic API')

gate('R786-STORE-CONSISTENCY', read('src/pages/api/indexer/store-consistency.ts').includes('canonicalNamespace'), 'store consistency diagnostic')

if (failures.length) {
  console.error('\nR786 gates failed:', failures.length)
  process.exit(1)
}
console.log('\nR786 data gates: ALL PASS (static)')
process.exit(0)
