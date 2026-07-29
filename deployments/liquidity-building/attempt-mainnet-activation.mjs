#!/usr/bin/env node
/**
 * Measured mainnet activation attempt for Liquidity Building V1.
 * Never fabricates addresses. Exits non-zero while deployment authority is unavailable.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')
const CHAIN56 = path.join(__dirname, 'chain-56')
const OUT_DIR = path.join(
  ROOT,
  'apps/web/docs/runtime/melega-dex-v1-liquidity-builder-mainnet-activation',
)

const require = createRequire(import.meta.url)
const { validateDeploymentInputs } = require('./validate-lb-v1-inputs-core.mjs')

function envPresent(name) {
  const v = process.env[name]
  return Boolean(v && String(v).trim())
}

function write(name, obj) {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  fs.writeFileSync(path.join(OUT_DIR, name), `${JSON.stringify(obj, null, 2)}\n`)
}

const requiredDeployEnv = [
  'MAINNET_DEPLOYER',
  'LB_PRODUCTION_AUTHORITY',
  'LB_FEE_RECEIVER_GOVERNOR',
  'LB_FEE_RECEIVER_BENEFICIARY',
  'BNB_MAINNET_RPC_URL',
  'BSCSCAN_API_KEY',
]
const optionalKms = ['AWS_KMS_KEY_ID', 'LB_RELAY_URL']

const envProbe = Object.fromEntries([
  ...requiredDeployEnv.map((k) => [k, envPresent(k) ? 'SET' : 'UNSET']),
  ...optionalKms.map((k) => [k, envPresent(k) ? 'SET' : 'UNSET']),
  ['LB_MAINNET_DEPLOY_AUTHORIZED', process.env.LB_MAINNET_DEPLOY_AUTHORIZED === '1' ? '1' : 'UNSET_OR_0'],
])

const inputs = JSON.parse(fs.readFileSync(path.join(CHAIN56, 'LiquidityBuildingV1.inputs.json'), 'utf8'))
const addresses = JSON.parse(fs.readFileSync(path.join(CHAIN56, 'deployed-addresses.v1.json'), 'utf8'))
const validator = validateDeploymentInputs(inputs)

const missingAuthority = requiredDeployEnv.filter((k) => !envPresent(k))
const authorizedFlag = process.env.LB_MAINNET_DEPLOY_AUTHORIZED === '1'
const canBroadcast =
  authorizedFlag &&
  missingAuthority.length === 0 &&
  validator.result === 'DEPLOYMENT_INPUTS_VALID'

let forgeBroadcast = {
  attempted: false,
  result: 'NOT_ATTEMPTED',
  reason: 'Gates incomplete',
}

if (!canBroadcast) {
  forgeBroadcast = {
    attempted: false,
    result: 'DEPLOYMENT_BLOCKED',
    reason: 'Physical inability to publish: missing deployment authority and/or DEPLOYMENT_INPUTS_BLOCKED',
    missingEnv: missingAuthority,
    validatorResult: validator.result,
    activationAuthorizedFlag: authorizedFlag,
  }
} else {
  // Production path — only when gates + env are green (not available in this environment).
  forgeBroadcast = {
    attempted: true,
    result: 'WOULD_BROADCAST',
    note: 'Broadcast path reserved; not reached in current measured environment',
  }
}

// Prove local structure still compiles/runs (no mainnet).
const dry = spawnSync(
  'forge',
  [
    'script',
    'script/liquidity-building/DryRunDeployLiquidityBuildingV1.s.sol:DryRunDeployLiquidityBuildingV1',
    '--sig',
    'run()',
    '-vv',
  ],
  { cwd: ROOT, encoding: 'utf8' },
)

const summary = {
  schemaVersion: 'melega.liquidity-builder.mainnet-activation.deployment-summary.v1',
  missionId: 'MELEGA_DEX_V1_AI_LIQUIDITY_BUILDER_MAINNET_ACTIVATION',
  assessedAt: new Date().toISOString(),
  chainId: 56,
  mainnetDeployExecuted: false,
  fabricatedAddresses: false,
  fabricatedDeployment: false,
  envProbe,
  validator: {
    result: validator.result,
    reasons: validator.reasons,
  },
  deployedAddressesArtifact: addresses,
  forgeDryRun: {
    exitCode: dry.status,
    ok: dry.status === 0 && /DRY_RUN_STRUCTURE_OK/.test(dry.stdout || ''),
    excerpt: (dry.stdout || dry.stderr || '').split('\n').slice(-20),
  },
  forgeBroadcast,
  blocker: {
    code: 'DEPLOYMENT_AUTHORITY_UNAVAILABLE',
    detail:
      'MAINNET_DEPLOYER, LB_PRODUCTION_AUTHORITY (non-exportable KMS), fee-receiver governor/beneficiary, BNB_MAINNET_RPC_URL, BSCSCAN_API_KEY, and LB_MAINNET_DEPLOY_AUTHORIZED=1 are required. LiquidityBuildingV1.inputs.json remains DEPLOYMENT_INPUTS_BLOCKED (authority/treasury/quotePolicies/runtimeIngestion).',
    missingEnv: missingAuthority,
  },
  contracts: {
    LiquidityBuildingFactoryV1: { status: 'NOT_DEPLOYED', address: null, deploymentTx: null },
    LiquidityBuildingExecutionAuthorizerV1: { status: 'NOT_DEPLOYED', address: null, deploymentTx: null },
    LiquidityBuildingTreasuryFeeSinkV1: { status: 'NOT_DEPLOYED', address: null, deploymentTx: null },
    LiquidityBuildingTreasuryFeeReceiverV1: { status: 'NOT_DEPLOYED', address: null, deploymentTx: null },
    LiquidityBuildingProgramV1: { status: 'NOT_DEPLOYED', address: null, deploymentTx: null },
    LiquidityBuildingExecutionMathV1: { status: 'NOT_DEPLOYED', address: null, deploymentTx: null },
  },
}

write('deployment-summary.json', summary)
write('runtime-state.json', {
  missionId: 'MELEGA_DEX_V1_AI_LIQUIDITY_BUILDER_MAINNET_ACTIVATION',
  assessedAt: summary.assessedAt,
  LB_DEPLOYED_ADDRESSES: {
    lbFactory: null,
    lbAuthorizer: null,
    lbFeeSink: null,
    programAddress: null,
  },
  builderReadiness: 'BLOCKED',
  reason: summary.blocker.code,
  canonicalConfig: 'deployments/liquidity-building/chain-56/deployed-addresses.v1.json',
  frontendConfig: 'apps/web/src/config/constants/liquidityBuildingDeployment.ts',
})

console.log(JSON.stringify({ result: 'DEPLOYMENT_BLOCKED', missingEnv: missingAuthority, validator: validator.result }, null, 2))
process.exit(2)
