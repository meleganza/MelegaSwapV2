#!/usr/bin/env node
/** Audit-only tests — evidence + read-only production checks. No production writes. */
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

function readRel(rel) {
  return fs.readFileSync(path.join(REPO, rel), 'utf8')
}

const required = [
  'smart-swap-current-production-flow.json',
  'pancake-capability-audit.json',
  'external-dex-coverage-matrix.json',
  'smart-swap-strategy-comparison.json',
  'smart-swap-business-opportunity.json',
  'smart-swap-final-decision.json',
  'kerl-final-inventory.json',
  'kerl-decommission-plan.json',
  'treasury-runtime-final-audit.json',
  'smart-swap-target-architecture.json',
  'smart-swap-product-truth-audit.json',
  'MISSION_REPORT.md',
]

for (const f of required) ok(`evidence:${f}`, fs.existsSync(path.join(EVIDENCE, f)))

const decision = readJson('smart-swap-final-decision.json')
ok('decision-melega-only-improve', decision.decision === 'IMPROVE_MELEGA_ONLY_SMART_SWAP')

const pancake = readJson('pancake-capability-audit.json')
ok('pancake-classification-both-asymmetric', pancake.usageClassification === 'C_BOTH_ASYMMETRIC')
ok('pancake-no-v3', pancake.support.v3 === false)
ok('pancake-no-ur', pancake.support.universalRouter === false)

const matrix = readJson('external-dex-coverage-matrix.json')
const melega = matrix.table.find((r) => r.DEX === 'Melega DEX')
const thena = matrix.table.find((r) => r.DEX === 'Thena')
ok('matrix-melega-execute', melega?.Execute === true)
ok('matrix-thena-no-execute', thena?.Execute === false)

const strategy = readJson('smart-swap-strategy-comparison.json')
ok(
  'strategy-option4-selected',
  strategy.options.some((o) => o.id === 'OPTION_4_REMAIN_MELEGA_ONLY' && o.recommendation === 'SELECTED'),
)

const plan = readJson('kerl-decommission-plan.json')
ok('decommission-no-delete-yet', plan.doNotDeleteInThisMission === true)
ok('decommission-has-phases', Array.isArray(plan.migrationOrder) && plan.migrationOrder.length >= 4)

const tr = readJson('treasury-runtime-final-audit.json')
ok('tr-kerl-zero', tr.KERL.ACTIVE_TREASURY_RUNTIME_DEPENDENCIES === 0)
ok('tr-smartswap-zero', tr.SmartSwap.ACTIVE_TREASURY_RUNTIME_DEPENDENCIES === 0)
ok('tr-dex-zero', tr.DEX.ACTIVE_TREASURY_RUNTIME_DEPENDENCIES === 0)

const target = readJson('smart-swap-target-architecture.json')
ok('target-melega-only', target.selected === 'MELEGA_ONLY')

const product = readJson('smart-swap-product-truth-audit.json')
ok('product-no-ui-edit', product.doNotModifyUiInThisMission === true)
ok('product-has-mismatch', product.mismatches.some((m) => m.mismatch))

// Production path checks (read-only)
const bestTrade = readRel('apps/web/src/views/Swap/SmartSwap/hooks/useBestTrade.ts')
ok('route-path-smart-router-sdk', /@pancakeswap\/smart-router/.test(bestTrade) || /getBestTradeExactIn/.test(bestTrade))
ok('http-api-disabled', /Remove source from api for now/.test(bestTrade))

const authority = readRel('apps/web/src/lib/kerl-constitutional/authority.ts')
ok('kerl-mainnet-not-enforced', /KRMP_TESTNET_CHAIN_ID/.test(authority))

const handoff = readRel('apps/web/src/lib/treasury-handoff/submitSettlementHandoff.ts')
ok('treasury-handoff-noop', /Never issues HTTP requests/i.test(handoff))

const wrapper = readRel('contracts/MelegaSmartRouterWrapper.sol')
ok('wrapper-v2-underlying-only', /IUnderlyingSwapRouter/.test(wrapper) && /swapExactTokensForTokens/.test(wrapper))
ok('wrapper-no-swapMulti', !/\bswapMulti\b/.test(wrapper))

const exchange = readRel('packages/smart-router/evm/constants/exchange.ts')
ok('router-melega-not-stale-pcs', /0xc25033218D181b27D4a2944Fbb04FC055da4EAB3/.test(exchange))

const adapterDir = path.join(REPO, 'apps/web/src/lib/melega-smart-router/execution-adapter')
const adapterBlob = fs
  .readdirSync(adapterDir)
  .filter((f) => f.endsWith('.ts'))
  .map((f) => fs.readFileSync(path.join(adapterDir, f), 'utf8'))
  .join('\n')
ok('no-thena-adapter', !/thena/i.test(adapterBlob))
ok('no-biswap-adapter', !/biswap/i.test(adapterBlob))

const kerlHits = Number(
  execSync(`rg -l -i 'kerl' apps/web/src/lib/kerl-constitutional | wc -l`, { cwd: REPO, encoding: 'utf8' }).trim(),
)
ok('kerl-refs-exist', kerlHits > 0)
ok('signing-gate-missing', !fs.existsSync(path.join(REPO, 'apps/web/src/lib/kerl-signing-gate')))

const report = {
  schema: 'melega.dex.v1.smart-swap-multidex-feasibility.tests',
  passed: failures.length === 0,
  passCount: passes.length,
  failCount: failures.length,
  passes,
  failures,
  ranAt: new Date().toISOString(),
  note: 'Audit-only. No production code modified.',
}
fs.writeFileSync(path.join(EVIDENCE, 'tests.json'), `${JSON.stringify(report, null, 2)}\n`)

if (failures.length) {
  console.error('AUDIT TESTS FAILED')
  for (const f of failures) console.error(' -', f)
  process.exit(1)
}
console.log(`AUDIT TESTS PASSED (${passes.length})`)
process.exit(0)
