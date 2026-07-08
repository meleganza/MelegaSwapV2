#!/usr/bin/env node
/** P0 Civilization Smart Router — validation gate. */
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB = path.resolve(__dirname, '..')
const ROOT = path.resolve(WEB, '../..')
const CONTRACT_PATH = path.resolve(WEB, 'public/registry/smart-router/civilization-router-contract.json')
const OUT = path.resolve(ROOT, 'docs/runtime/CIVILIZATION_SMART_ROUTER_GATE.json')

function run(cmd, args, cwd = WEB) {
  const r = spawnSync(cmd, args, { cwd, stdio: 'pipe', encoding: 'utf8' })
  return { ok: r.status === 0, stdout: r.stdout, stderr: r.stderr, code: r.status }
}

async function main() {
  const failures = []
  const report = {
    task: 'P0 Civilization Smart Router Gate',
    timestamp: new Date().toISOString(),
    verdict: null,
    contractPath: '/registry/smart-router/civilization-router-contract.json',
    checks: {},
  }

  const build = run('yarn', ['build'])
  report.checks.build = { ok: build.ok, code: build.code }
  if (!build.ok) failures.push(`yarn build failed: ${build.stderr.slice(0, 200)}`)

  const tests = run('yarn', ['vitest', 'run', 'src/lib/melega-smart-router/__tests__/civilization-router.test.ts', 'src/lib/melega-smart-router/__tests__/melega-smart-router-d87.test.ts', 'src/lib/melega-smart-router/__tests__/melega-smart-router-phase25.test.ts', 'src/lib/melega-smart-router/__tests__/registry-resolution.test.ts'])
  report.checks.smartRouterTests = { ok: tests.ok, code: tests.code }
  if (!tests.ok) failures.push('smart-router tests failed')

  const treasuryTests = run('yarn', ['vitest', 'run', 'src/lib/treasury-handoff'])
  report.checks.treasuryHandoffTests = { ok: treasuryTests.ok, code: treasuryTests.code }
  if (!treasuryTests.ok) failures.push('treasury-handoff tests failed')

  let contract
  try {
    contract = JSON.parse(readFileSync(CONTRACT_PATH, 'utf8'))
    report.checks.machineContract = { ok: true }
  } catch (e) {
    report.checks.machineContract = { ok: false, error: String(e) }
    failures.push('civilization-router-contract.json missing or invalid')
  }

  if (contract) {
    if (contract.wrapperAddress != null) failures.push('wrapperAddress must be null until deployed')
    if (contract.labsBinding?.narrative_trade_support === true) failures.push('narrative_trade_support must not be true')
    if (contract.phases?.narrativeTrade?.executable === true) failures.push('narrative trade must not be executable')
    const chain56 = contract.supportedChains?.['56']
    if (chain56?.treasuryCollector != null) failures.push('treasuryCollector must be null in published contract')
    report.checks.noFakeRouting = {
      wrapperNull: contract.wrapperAddress == null,
      narrativeBlocked: contract.labsBinding?.narrative_trade_support === false,
      testnetBlocked: contract.phases?.bnbTestnet?.status === 'BNB_TESTNET_BLOCKED',
    }
  }

  report.verdict = failures.length
    ? failures.some((f) => f.includes('build') || f.includes('tests'))
      ? 'CIVILIZATION_SMART_ROUTER_BLOCKED'
      : 'CIVILIZATION_SMART_ROUTER_PARTIAL'
    : 'CIVILIZATION_SMART_ROUTER_PARTIAL'

  mkdirSync(path.dirname(OUT), { recursive: true })
  writeFileSync(OUT, JSON.stringify(report, null, 2))

  console.log(JSON.stringify(report, null, 2))
  if (failures.length) {
    console.error('FAILURES:', failures.join('; '))
    process.exit(report.verdict === 'CIVILIZATION_SMART_ROUTER_BLOCKED' ? 1 : 0)
  }
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
