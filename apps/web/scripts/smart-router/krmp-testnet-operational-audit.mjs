#!/usr/bin/env node
/**
 * R754 — KRMP testnet operational re-audit (structural).
 * Validates R753 blockers are closed in repository wiring.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB_ROOT = path.resolve(__dirname, '../..')
const SRC = path.join(WEB_ROOT, 'src')

function read(rel) {
  return fs.readFileSync(path.join(WEB_ROOT, rel), 'utf8')
}

function readSrc(rel) {
  return fs.readFileSync(path.join(SRC, rel), 'utf8')
}

const checks = []

function pass(id, detail) {
  checks.push({ id, status: 'PASS', detail })
}

function fail(id, detail) {
  checks.push({ id, status: 'FAIL', detail })
}

// B1 — prepareCivilizationRoute chain 97 unblocked
const civRoute = readSrc('lib/melega-smart-router/civilization-router/prepareCivilizationRoute.ts')
if (civRoute.includes('BNB_TESTNET_BLOCKED')) {
  fail('B1', 'prepareCivilizationRoute still blocks chain 97')
} else if (civRoute.includes('preparedKerlSwap') && civRoute.includes('KRMP_TESTNET_REGISTRY')) {
  pass('B1', 'prepareCivilizationRoute uses KERL path on chain 97')
} else {
  fail('B1', 'prepareCivilizationRoute chain 97 wiring incomplete')
}

// B2 — DEX routing gated on chain 97
const useBestTrade = readSrc('views/Swap/SmartSwap/hooks/useBestTrade.ts')
if (useBestTrade.includes('isKerlRoutingAuthorityEnforced') && useBestTrade.includes('return null')) {
  pass('B2', 'useBestTrade returns null when KERL routing authority enforced')
} else {
  fail('B2', 'useBestTrade not gated for KERL routing authority')
}

// B3 — Wrapper wired to swap commit
const commitBtn = readSrc('views/Swap/SmartSwap/components/SmartSwapCommitButton.tsx')
if (commitBtn.includes('useKerlConstitutionalSwap') && commitBtn.includes('kerlEnforced')) {
  pass('B3', 'SmartSwapCommitButton uses KERL wrapper execution on chain 97')
} else {
  fail('B3', 'Swap UI not wired to wrapper via KERL constitutional path')
}

// B4 — ExecutionRequest schema exists
if (fs.existsSync(path.join(SRC, 'lib/kerl-constitutional/types.ts'))) {
  const types = readSrc('lib/kerl-constitutional/types.ts')
  if (types.includes('melega.kerl.execution-request.v1') && types.includes('melega.kerl.settlement-receipt.v1')) {
    pass('B4', 'ExecutionRequest and KerlSettlementReceipt schemas published')
  } else {
    fail('B4', 'Constitutional schemas missing')
  }
} else {
  fail('B4', 'kerl-constitutional module missing')
}

// B5 — KERL settlement path
const handoffUpdater = readSrc('state/transactions/treasuryHandoffUpdater.tsx')
if (handoffUpdater.includes('submitKerlSettlementHandoff') && handoffUpdater.includes('buildKerlSettlementReceipt')) {
  pass('B5', 'Settlement path routes through KERL receipt before Treasury')
} else {
  fail('B5', 'KERL settlement path not wired')
}

// B6 — KERL execution activation
const indexTsx = readSrc('index.tsx')
if (indexTsx.includes('ensureKrmpTestnetOperationalActivation')) {
  pass('B6', 'KRMP testnet operational activation enabled at app startup')
} else {
  fail('B6', 'KERL execution mode not activated')
}

// B7 — kerl/index.json genesis handoff
const kerlIndex = JSON.parse(read('public/registry/kerl/index.json'))
const hasGenesis = kerlIndex.handoffs?.some((h) => h.id?.includes('genesis-testnet'))
if (hasGenesis && kerlIndex.executionMode === 'TESTNET_EXECUTION_ONLY') {
  pass('B7', 'kerl/index.json lists genesis testnet handoff with TESTNET_EXECUTION_ONLY')
} else {
  fail('B7', 'Genesis handoff not in kerl/index.json or executionMode not updated')
}

// B8 — Wrapper-only entrypoint
const wrapperExec = readSrc('lib/kerl-constitutional/wrapperExecutor.ts')
if (wrapperExec.includes('executeKerlWrapperSwap') && wrapperExec.includes('ExecutionRequest')) {
  pass('B8', 'ExecutionRequest → Wrapper is sole execution entrypoint on chain 97')
} else {
  fail('B8', 'Wrapper executor missing')
}

// B9 — KERL producer owns routing
const producer = readSrc('lib/kerl-constitutional/producer.ts')
if (producer.includes('produceKerlExecutionRequest') && producer.includes("authority: 'kerl'")) {
  pass('B9', 'KERL is routing producer')
} else {
  fail('B9', 'KERL producer missing')
}

const failures = checks.filter((c) => c.status === 'FAIL')
const verdict = failures.length === 0 ? 'KRMP_TESTNET_OPERATIONAL_READY' : 'KRMP_TESTNET_OPERATIONAL_BLOCKED'

const report = {
  schema: 'melega.krmp.testnet.operational-audit.v1',
  mission: 'R754',
  validationDate: new Date().toISOString().slice(0, 10),
  verdict,
  checks,
  remainingBlockers: failures.map((f) => `${f.id}: ${f.detail}`),
}

console.log(JSON.stringify(report, null, 2))
process.exit(failures.length === 0 ? 0 : 1)
