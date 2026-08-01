#!/usr/bin/env node
/**
 * Deterministic client-safe Liquidity Builder certified artifact manifest.
 * Reads forge `out/` + certified runtime hashes from LiquidityBuildingV1.inputs.json.
 * Fails closed on missing/empty bytecode or runtime hash mismatch.
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB_ROOT = path.resolve(__dirname, '..')
const REPO_ROOT = path.resolve(WEB_ROOT, '../..')
const OUT_DIR = path.join(REPO_ROOT, 'out')
const INPUTS = path.join(
  REPO_ROOT,
  'deployments/liquidity-building/chain-56/LiquidityBuildingV1.inputs.json',
)
const MANIFEST = path.join(
  WEB_ROOT,
  'src/lib/deployment-orchestrator/artifacts/lb-v1-certified.json',
)

const DEPLOY_ORDER = [
  'LiquidityBuildingExecutionMathV1',
  'LiquidityBuildingTreasuryFeeReceiverV1',
  'LiquidityBuildingExecutionAuthorizerV1',
  'LiquidityBuildingTreasuryFeeSinkV1',
  'LiquidityBuildingProgramV1',
  'LiquidityBuildingFactoryV1',
]

const ARTIFACT_PATHS = {
  LiquidityBuildingExecutionMathV1:
    'LiquidityBuildingExecutionMathV1.sol/LiquidityBuildingExecutionMathV1.json',
  LiquidityBuildingTreasuryFeeReceiverV1:
    'LiquidityBuildingTreasuryFeeReceiverV1.sol/LiquidityBuildingTreasuryFeeReceiverV1.json',
  LiquidityBuildingExecutionAuthorizerV1:
    'LiquidityBuildingExecutionAuthorizerV1.sol/LiquidityBuildingExecutionAuthorizerV1.json',
  LiquidityBuildingTreasuryFeeSinkV1:
    'LiquidityBuildingTreasuryFeeSinkV1.sol/LiquidityBuildingTreasuryFeeSinkV1.json',
  LiquidityBuildingProgramV1:
    'LiquidityBuildingProgramV1.sol/LiquidityBuildingProgramV1.json',
  LiquidityBuildingFactoryV1:
    'LiquidityBuildingFactoryV1.sol/LiquidityBuildingFactoryV1.json',
}

function sha256Hex(buf) {
  return `0x${crypto.createHash('sha256').update(buf).digest('hex')}`
}

/** Deterministic fingerprint for staleness checks (sha256 of placeholder-zeroed creation bytes). */
function creationFingerprint(bytecode) {
  const normalized = bytecode.replace(/^0x/, '').replace(/__\$[a-f0-9]{34}\$__/gi, '0'.repeat(40))
  return sha256Hex(Buffer.from(normalized, 'hex'))
}

function runtimeHashFromDeployed(deployedBytecode) {
  const hex = String(deployedBytecode || '').replace(/^0x/, '')
  const zeroed = hex.replace(/__\$[a-f0-9]{34}\$__/gi, '0'.repeat(40))
  return sha256Hex(Buffer.from(zeroed, 'hex'))
}

function readBytecode(art) {
  const b = art.bytecode
  if (typeof b === 'string') return b.startsWith('0x') ? b : `0x${b}`
  if (b && typeof b.object === 'string') return b.object.startsWith('0x') ? b.object : `0x${b.object}`
  return ''
}

function readDeployed(art) {
  const b = art.deployedBytecode
  if (typeof b === 'string') return b.startsWith('0x') ? b : `0x${b}`
  if (b && typeof b.object === 'string') return b.object.startsWith('0x') ? b.object : `0x${b.object}`
  return ''
}

function readLinkReferences(art) {
  const b = art.bytecode
  if (b && typeof b === 'object' && b.linkReferences) return b.linkReferences
  return art.linkReferences || {}
}

function gitSourceCommit() {
  try {
    return execSync('git rev-parse HEAD', { cwd: REPO_ROOT, encoding: 'utf8' }).trim()
  } catch {
    return 'UNKNOWN'
  }
}

function main() {
  const checkOnly = process.argv.includes('--check')
  if (!fs.existsSync(INPUTS)) {
    console.error(`FAIL: missing certified inputs ${INPUTS}`)
    process.exit(1)
  }
  const inputs = JSON.parse(fs.readFileSync(INPUTS, 'utf8'))
  const certified = inputs.bytecode || {}
  const artifacts = {}
  const errors = []

  for (const name of DEPLOY_ORDER) {
    const rel = ARTIFACT_PATHS[name]
    const full = path.join(OUT_DIR, rel)
    if (!fs.existsSync(full)) {
      errors.push(`${name}: missing forge artifact ${rel}`)
      continue
    }
    const art = JSON.parse(fs.readFileSync(full, 'utf8'))
    const creationBytecode = readBytecode(art)
    if (!creationBytecode || creationBytecode === '0x' || creationBytecode.length < 4) {
      errors.push(`${name}: empty creation bytecode`)
      continue
    }
    const deployed = readDeployed(art)
    const observedRuntimeBytecodeSha256 = runtimeHashFromDeployed(deployed)
    const expectedRuntimeBytecodeSha256 = certified[name]?.deployedBytecodeSha256
    if (!expectedRuntimeBytecodeSha256) {
      errors.push(`${name}: missing certified runtime hash in LiquidityBuildingV1.inputs.json`)
      continue
    }
    const runtimeHashMatchesCertified =
      observedRuntimeBytecodeSha256.toLowerCase() === expectedRuntimeBytecodeSha256.toLowerCase()
    if (!runtimeHashMatchesCertified) {
      errors.push(
        `${name}: runtime hash mismatch observed=${observedRuntimeBytecodeSha256} expected=${expectedRuntimeBytecodeSha256}`,
      )
    }
    const ctor = (art.abi || []).find((x) => x.type === 'constructor')
    artifacts[name] = {
      contractName: name,
      creationBytecode,
      creationBytecodeSha256: creationFingerprint(creationBytecode),
      expectedRuntimeBytecodeSha256,
      observedRuntimeBytecodeSha256,
      runtimeHashMatchesCertified,
      constructorInputs: ctor?.inputs || [],
      abi: (art.abi || []).filter((x) => x.type === 'constructor' || (x.type === 'function' && ['beneficiary', 'governor', 'authority', 'SUCCESS_FEE_BPS'].includes(x.name))),
      linkReferences: readLinkReferences(art),
    }
  }

  if (errors.length) {
    console.error('FAIL: certified LB manifest generation\n' + errors.map((e) => `  - ${e}`).join('\n'))
    process.exit(1)
  }

  const manifest = {
    schema: 'melega.dex.v1.lb-certified-artifacts',
    version: '1.0.0',
    chainId: 56,
    artifactVersion: 'LiquidityBuildingV1',
    sourceCommit: inputs.sourceCommit || gitSourceCommit(),
    generatedAt: new Date().toISOString(),
    deployOrder: DEPLOY_ORDER,
    scriptRef: 'script/liquidity-building/DeployLiquidityBuildingV1Mainnet.s.sol',
    certifiedHashesRef: 'deployments/liquidity-building/chain-56/LiquidityBuildingV1.inputs.json#bytecode',
    artifacts,
  }

  if (checkOnly) {
    if (!fs.existsSync(MANIFEST)) {
      console.error('FAIL: manifest missing — run generate without --check')
      process.exit(1)
    }
    const existing = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'))
    // Stale if deploy order, runtime hashes, or creation fingerprints diverge.
    const staleReasons = []
    if (JSON.stringify(existing.deployOrder) !== JSON.stringify(DEPLOY_ORDER)) {
      staleReasons.push('deployOrder mismatch')
    }
    for (const name of DEPLOY_ORDER) {
      const a = existing.artifacts?.[name]
      const b = artifacts[name]
      if (!a?.creationBytecode || a.creationBytecode !== b.creationBytecode) {
        staleReasons.push(`${name}: creation bytecode stale or missing`)
      }
      if (
        (a?.expectedRuntimeBytecodeSha256 || '').toLowerCase() !==
        b.expectedRuntimeBytecodeSha256.toLowerCase()
      ) {
        staleReasons.push(`${name}: expected runtime hash stale`)
      }
      if (!a?.runtimeHashMatchesCertified) {
        staleReasons.push(`${name}: runtimeHashMatchesCertified false in committed manifest`)
      }
      if ((a?.creationBytecodeSha256 || '') !== b.creationBytecodeSha256) {
        staleReasons.push(`${name}: creationBytecodeSha256 stale`)
      }
    }
    if (staleReasons.length) {
      console.error('FAIL: stale LB certified manifest\n' + staleReasons.map((e) => `  - ${e}`).join('\n'))
      process.exit(1)
    }
    console.log('OK: lb-v1-certified.json matches forge out + certified hashes')
    return
  }

  fs.mkdirSync(path.dirname(MANIFEST), { recursive: true })
  fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest)}\n`)
  console.log(`OK: wrote ${path.relative(REPO_ROOT, MANIFEST)} (${DEPLOY_ORDER.length} contracts)`)
}

main()
