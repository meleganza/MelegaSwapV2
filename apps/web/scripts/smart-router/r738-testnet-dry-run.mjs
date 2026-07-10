#!/usr/bin/env node
/**
 * R738 — Wrapper testnet dry-run orchestrator.
 * Runs Foundry DryRunWrapperDeploy; exits safely when constructor args are null.
 */
import { spawnSync } from 'child_process'
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../../..')
const DISCOVERY = path.join(REPO_ROOT, 'docs/runtime/R738_CHAIN_97_DISCOVERY.json')

function envPresent(name) {
  const v = process.env[name]?.trim()
  return Boolean(v && v.startsWith('0x') && v.length === 42)
}

function main() {
  const discovery = JSON.parse(readFileSync(DISCOVERY, 'utf8'))
  const chain97 = discovery.chain97

  const report = {
    action: 'r738-testnet-dry-run',
    chainId: 97,
    timestamp: new Date().toISOString(),
    constructor: {
      UNDERLYING_ROUTER: envPresent('UNDERLYING_ROUTER')
        ? 'set'
        : chain97.underlyingRouter.candidateAddress,
      TREASURY_INTAKE: envPresent('TREASURY_INTAKE') || envPresent('TREASURY_COLLECTOR') ? 'set' : null,
      MARCO_TOKEN: envPresent('MARCO_TOKEN') ? 'set' : null,
      DEPLOYER_OWNER: envPresent('DEPLOYER_OWNER') ? 'set' : null,
    },
    marcoStatus: chain97.marco.status,
    treasuryStatus: chain97.treasuryIntake.status,
  }

  const missing = []
  if (!envPresent('UNDERLYING_ROUTER')) {
    if (!process.env.UNDERLYING_ROUTER) {
      process.env.UNDERLYING_ROUTER = chain97.underlyingRouter.candidateAddress
      report.constructor.UNDERLYING_ROUTER = 'candidate-from-discovery'
    } else missing.push('UNDERLYING_ROUTER')
  }
  if (!envPresent('TREASURY_INTAKE') && !envPresent('TREASURY_COLLECTOR')) missing.push('TREASURY_INTAKE')
  if (!envPresent('MARCO_TOKEN')) {
    const marco = chain97.marco?.address
    if (marco && chain97.marco.status !== 'BLOCKED_MARCO_TESTNET_MISSING') {
      process.env.MARCO_TOKEN = marco
      report.constructor.MARCO_TOKEN = 'registry-default-r744b'
    } else {
      missing.push('MARCO_TOKEN')
    }
  }
  if (!envPresent('DEPLOYER_OWNER')) missing.push('DEPLOYER_OWNER')

  if (missing.length > 0) {
    report.verdict = 'DRY_RUN_BLOCKED'
    report.missing = missing
    console.log(JSON.stringify(report, null, 2))
    process.exit(0)
  }

  process.env.CHAIN_ID = '97'
  const forge = spawnSync(
    'forge',
    ['script', 'script/DryRunWrapperDeploy.s.sol', '-vvv'],
    { cwd: REPO_ROOT, stdio: 'pipe', encoding: 'utf8' },
  )

  report.forgeExit = forge.status
  report.forgeStdout = forge.stdout?.slice(-2000) ?? ''
  report.forgeStderr = forge.stderr?.slice(-1000) ?? ''
  report.verdict = forge.status === 0 ? 'DRY_RUN_OK' : 'DRY_RUN_FAILED'
  console.log(JSON.stringify(report, null, 2))
  process.exit(forge.status === 0 ? 0 : 1)
}

main()
