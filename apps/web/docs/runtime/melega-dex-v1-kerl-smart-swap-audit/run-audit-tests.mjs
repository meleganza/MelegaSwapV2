#!/usr/bin/env node
/**
 * Audit-only tests — read evidence + production sources; never mutate production code.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO = path.resolve(__dirname, '../../../../../')
const EVIDENCE = __dirname
const failures = []
const passes = []

function ok(name, cond, detail = '') {
  if (cond) passes.push(name)
  else failures.push(`${name}${detail ? `: ${detail}` : ''}`)
}

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(EVIDENCE, name), 'utf8'))
}

function existsRel(rel) {
  return fs.existsSync(path.join(REPO, rel))
}

function readRel(rel) {
  return fs.readFileSync(path.join(REPO, rel), 'utf8')
}

const required = [
  'kerl-inventory.json',
  'kerl-functional-analysis.json',
  'kerl-treasury-dependency-audit.json',
  'smart-swap-current-flow.json',
  'smart-swap-dex-coverage.json',
  'smart-swap-route-selection.json',
  'smart-swap-execution-authority.json',
  'routing-responsibility-matrix.json',
  'kerl-final-recommendation.json',
  'smart-swap-target-architecture.json',
  'smart-swap-product-truth.json',
  'MISSION_REPORT.md',
]

for (const f of required) {
  ok(`evidence:${f}`, fs.existsSync(path.join(EVIDENCE, f)))
}

const inventory = readJson('kerl-inventory.json')
ok('kerl-inventory.has-components', Array.isArray(inventory.components) && inventory.components.length >= 8)
ok('kerl-no-api', inventory.summary.hasKerlApi === false)
ok('kerl-no-contracts', inventory.summary.hasKerlContracts === false)
ok('kerl-signing-gate-absent', inventory.summary.kerlSigningGatePresent === false)

const tr = readJson('kerl-treasury-dependency-audit.json')
ok('treasury-active-deps-zero', tr.ACTIVE_DEPENDENCIES === 0)
ok('treasury-result-met', tr.resultMet === true)

const handoff = readRel('apps/web/src/lib/treasury-handoff/submitSettlementHandoff.ts')
ok('handoff-never-http', /Never issues HTTP requests/i.test(handoff) && /Intentionally never call fetchImpl/i.test(handoff))
ok(
  'handoff-no-live-fetch-call',
  !/await\s+fetch\s*\(/.test(handoff) && !/fetchImpl\s*\(/.test(handoff.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '')),
)

const authority = readRel('apps/web/src/lib/kerl-constitutional/authority.ts')
ok('kerl-enforced-only-97', /KRMP_TESTNET_CHAIN_ID/.test(authority) && /chainId === KRMP_TESTNET_CHAIN_ID/.test(authority))

const bestTrade = readRel('apps/web/src/views/Swap/SmartSwap/hooks/useBestTrade.ts')
ok('best-trade-null-under-kerl', /isKerlRoutingAuthorityEnforced/.test(bestTrade) && /return null/.test(bestTrade))
ok('best-trade-api-disabled', /Remove source from api for now/.test(bestTrade))

const exchange = readRel('apps/web/src/views/Swap/SmartSwap/utils/exchange.ts')
ok('smart-router-address-present', /0xC6665d98Efd81f47B03801187eB46cbC63F328B0/.test(exchange))

const coverage = readJson('smart-swap-dex-coverage.json')
const melega = coverage.table.find((r) => r.DEX === 'Melega DEX')
const uni = coverage.table.find((r) => r.DEX === 'Uniswap')
ok('coverage-melega-executable', melega?.Executable === true)
ok('coverage-uniswap-false', uni?.Executable === false)

const routes = readJson('smart-swap-route-selection.json')
ok('route-conclusion-melega-only', routes.conclusion === 'MELEGA_ONLY_ROUTER')

const execAuth = readJson('smart-swap-execution-authority.json')
ok('exec-no-tr', execAuth.confirmations.noTreasuryRuntime === true)
ok('exec-no-server-signer', execAuth.confirmations.noServerSigner === true)

const rec = readJson('kerl-final-recommendation.json')
ok('recommendation-decommission', rec.recommendation === 'DECOMMISSION_KERL')

const target = readJson('smart-swap-target-architecture.json')
ok('target-option-b', target.selectedOption === 'B_REMOVE_KERL')

const product = readJson('smart-swap-product-truth.json')
ok('product-has-mismatch', product.uiPromises.some((p) => p.mismatch === true))

// KERL references exist (inventory not empty)
const kerlHits = execSync(
  `rg -l -i 'kerl' apps/web/src/lib/kerl-constitutional | wc -l`,
  { cwd: REPO, encoding: 'utf8' },
).trim()
ok('kerl-refs-present', Number(kerlHits) > 0)

// External DEX names must not appear as swap venue wiring in smart-router adapters
const adapterDir = path.join(REPO, 'apps/web/src/lib/melega-smart-router/execution-adapter')
if (fs.existsSync(adapterDir)) {
  const adapterBlob = fs
    .readdirSync(adapterDir)
    .filter((f) => f.endsWith('.ts'))
    .map((f) => fs.readFileSync(path.join(adapterDir, f), 'utf8'))
    .join('\n')
  ok('adapters-no-thena', !/thena/i.test(adapterBlob))
  ok('adapters-no-biswap', !/biswap/i.test(adapterBlob))
  ok('adapters-no-sushiswap', !/sushiswap/i.test(adapterBlob))
}

ok('signing-gate-dir-missing', !existsRel('apps/web/src/lib/kerl-signing-gate'))

const report = {
  schema: 'melega.dex.v1.kerl-smart-swap-audit.tests',
  passed: failures.length === 0,
  passCount: passes.length,
  failCount: failures.length,
  passes,
  failures,
  ranAt: new Date().toISOString(),
  note: 'Audit-only. No production code modified by this runner.',
}

fs.writeFileSync(path.join(EVIDENCE, 'tests.json'), `${JSON.stringify(report, null, 2)}\n`)

if (failures.length) {
  console.error('AUDIT TESTS FAILED')
  for (const f of failures) console.error(' -', f)
  process.exit(1)
}
console.log(`AUDIT TESTS PASSED (${passes.length})`)
process.exit(0)
