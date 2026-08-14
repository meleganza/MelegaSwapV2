#!/usr/bin/env node
/**
 * Liquidity Builder certified client manifest tooling.
 *
 * Modes:
 *   --generate          Require Forge `out/` artifacts; write committed client manifest.
 *   --check-committed   Validate committed manifest only (Vercel / prebuild). No Forge required.
 *   --check             Alias of --check-committed (backward compatible for prebuild).
 *   --certify           Require Forge; compare freshly generated output to committed manifest.
 *
 * Vercel must run --check-committed only. Never mutate the working tree in check mode.
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

const CANONICAL_TREASURY = '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b'
const CANONICAL_SUCCESS_FEE_BPS = 1000
const SCHEMA = 'melega.dex.v1.lb-certified-artifacts'
const ARTIFACT_VERSION = 'LiquidityBuildingV1'

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

const SOL_SOURCES = [
  'contracts/liquidity-building/libraries/LiquidityBuildingExecutionMathV1.sol',
  'contracts/liquidity-building/LiquidityBuildingTreasuryFeeReceiverV1.sol',
  'contracts/liquidity-building/LiquidityBuildingExecutionAuthorizerV1.sol',
  'contracts/liquidity-building/LiquidityBuildingTreasuryFeeSinkV1.sol',
  'contracts/liquidity-building/LiquidityBuildingProgramV1.sol',
  'contracts/liquidity-building/LiquidityBuildingFactoryV1.sol',
]

function sha256Hex(buf) {
  return `0x${crypto.createHash('sha256').update(buf).digest('hex')}`
}

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

function computeSourceFingerprint(inputs) {
  const parts = []
  for (const rel of SOL_SOURCES) {
    const full = path.join(REPO_ROOT, rel)
    if (fs.existsSync(full)) {
      parts.push(`${rel}:${sha256Hex(fs.readFileSync(full))}`)
    } else {
      parts.push(`${rel}:MISSING`)
    }
  }
  parts.push(`compiler:${JSON.stringify(inputs.compiler || {})}`)
  parts.push(`deployOrder:${DEPLOY_ORDER.join(',')}`)
  parts.push(`successFeeBps:${inputs.protocolParameters?.successFeeBps ?? CANONICAL_SUCCESS_FEE_BPS}`)
  parts.push(`treasury:${(inputs.founderFeeSchedule?.destination || CANONICAL_TREASURY).toLowerCase()}`)
  for (const name of DEPLOY_ORDER) {
    parts.push(`runtime:${name}:${inputs.bytecode?.[name]?.deployedBytecodeSha256 || 'MISSING'}`)
  }
  return sha256Hex(Buffer.from(parts.join('\n'), 'utf8'))
}

function fail(msg, details = []) {
  console.error(msg)
  for (const d of details) console.error(`  - ${d}`)
  process.exit(1)
}

function requireInputs() {
  if (!fs.existsSync(INPUTS)) {
    fail(`FAIL: missing certified inputs ${INPUTS}`)
  }
  return JSON.parse(fs.readFileSync(INPUTS, 'utf8'))
}

function buildFromForge(inputs) {
  const certified = inputs.bytecode || {}
  const artifacts = {}
  const errors = []

  for (const name of DEPLOY_ORDER) {
    const rel = ARTIFACT_PATHS[name]
    const full = path.join(OUT_DIR, rel)
    if (!fs.existsSync(full)) {
      errors.push(`${name}: missing forge artifact ${rel} (expected under ${OUT_DIR})`)
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
      abi: (art.abi || []).filter(
        (x) =>
          x.type === 'constructor' ||
          (x.type === 'function' &&
            ['beneficiary', 'governor', 'authority', 'SUCCESS_FEE_BPS'].includes(x.name)),
      ),
      linkReferences: readLinkReferences(art),
    }
  }

  if (errors.length) {
    fail(
      'FAIL: certified LB manifest generation requires canonical Forge artifacts.\n' +
        'Run `forge build` in the repository root (with Foundry installed), then retry generate/certify.',
      errors,
    )
  }

  return {
    schema: SCHEMA,
    version: '1.0.0',
    chainId: 56,
    artifactVersion: ARTIFACT_VERSION,
    sourceCommit: inputs.sourceCommit || gitSourceCommit(),
    sourceFingerprint: computeSourceFingerprint(inputs),
    generatedAt: new Date().toISOString(),
    deployOrder: DEPLOY_ORDER,
    scriptRef: 'script/liquidity-building/DeployLiquidityBuildingV1Mainnet.s.sol',
    certifiedHashesRef: 'deployments/liquidity-building/chain-56/LiquidityBuildingV1.inputs.json#bytecode',
    treasuryDestination: CANONICAL_TREASURY,
    successFeeBps: CANONICAL_SUCCESS_FEE_BPS,
    artifacts,
  }
}

function validateCommittedManifest(manifest, inputs) {
  const errors = []
  if (!manifest || typeof manifest !== 'object') {
    return ['manifest is not a JSON object']
  }
  if (manifest.schema !== SCHEMA) errors.push(`unsupported schema: ${manifest.schema}`)
  if (manifest.artifactVersion !== ARTIFACT_VERSION) {
    errors.push(`artifactVersion mismatch: ${manifest.artifactVersion}`)
  }
  if (manifest.chainId !== 56) errors.push(`chainId must be 56, got ${manifest.chainId}`)
  if (!manifest.sourceCommit) errors.push('sourceCommit missing')
  if (!manifest.sourceFingerprint || !String(manifest.sourceFingerprint).startsWith('0x')) {
    // Allow legacy manifests without fingerprint during transition — recompute expected and warn-as-error if field present but invalid
    if (manifest.sourceFingerprint != null) errors.push('sourceFingerprint invalid')
  }
  if (JSON.stringify(manifest.deployOrder) !== JSON.stringify(DEPLOY_ORDER)) {
    errors.push('deployOrder mismatch vs canonical Liquidity Builder sequence')
  }
  if (
    manifest.treasuryDestination &&
    manifest.treasuryDestination.toLowerCase() !== CANONICAL_TREASURY.toLowerCase()
  ) {
    errors.push(`treasuryDestination mismatch: ${manifest.treasuryDestination}`)
  }
  if (
    manifest.successFeeBps != null &&
    Number(manifest.successFeeBps) !== CANONICAL_SUCCESS_FEE_BPS
  ) {
    errors.push(`successFeeBps must be ${CANONICAL_SUCCESS_FEE_BPS}`)
  }
  if (inputs.protocolParameters?.successFeeBps !== CANONICAL_SUCCESS_FEE_BPS) {
    errors.push('inputs.json protocolParameters.successFeeBps is not 1000')
  }
  const dest = inputs.founderFeeSchedule?.destination
  if (dest && dest.toLowerCase() !== CANONICAL_TREASURY.toLowerCase()) {
    errors.push(`inputs.json fee destination mismatch: ${dest}`)
  }

  const names = Object.keys(manifest.artifacts || {})
  if (names.length !== DEPLOY_ORDER.length) {
    errors.push(`expected ${DEPLOY_ORDER.length} contracts, found ${names.length}`)
  }
  const seen = new Set()
  for (const name of DEPLOY_ORDER) {
    if (seen.has(name)) errors.push(`duplicate contract name ${name}`)
    seen.add(name)
    const a = manifest.artifacts?.[name]
    if (!a) {
      errors.push(`${name}: missing from committed manifest`)
      continue
    }
    if (a.contractName !== name) errors.push(`${name}: contractName field mismatch`)
    if (!a.creationBytecode || !a.creationBytecode.startsWith('0x') || a.creationBytecode.length < 4) {
      errors.push(`${name}: creation bytecode empty or invalid`)
      continue
    }
    const recomputed = creationFingerprint(a.creationBytecode)
    if ((a.creationBytecodeSha256 || '').toLowerCase() !== recomputed.toLowerCase()) {
      errors.push(
        `${name}: creationBytecodeSha256 does not match bytecode (stored ${a.creationBytecodeSha256}, recomputed ${recomputed})`,
      )
    }
    const expected = inputs.bytecode?.[name]?.deployedBytecodeSha256
    if (!expected || !/^0x[a-f0-9]{64}$/i.test(expected)) {
      errors.push(`${name}: certified runtime hash missing/invalid in inputs.json`)
    } else if (
      (a.expectedRuntimeBytecodeSha256 || '').toLowerCase() !== expected.toLowerCase()
    ) {
      errors.push(`${name}: expectedRuntimeBytecodeSha256 diverges from inputs.json`)
    }
    if (!a.runtimeHashMatchesCertified) {
      errors.push(`${name}: runtimeHashMatchesCertified is false`)
    }
    if (!/^0x[a-f0-9]{64}$/i.test(a.expectedRuntimeBytecodeSha256 || '')) {
      errors.push(`${name}: expectedRuntimeBytecodeSha256 syntactically invalid`)
    }
    if (!/^0x[a-f0-9]{64}$/i.test(a.observedRuntimeBytecodeSha256 || '')) {
      errors.push(`${name}: observedRuntimeBytecodeSha256 syntactically invalid`)
    }
    if (!Array.isArray(a.constructorInputs)) {
      errors.push(`${name}: constructorInputs schema missing`)
    }
  }
  return errors
}

function compareManifests(committed, fresh) {
  const errors = []
  if (JSON.stringify(committed.deployOrder) !== JSON.stringify(fresh.deployOrder)) {
    errors.push('deployOrder drift')
  }
  for (const name of DEPLOY_ORDER) {
    const a = committed.artifacts[name]
    const b = fresh.artifacts[name]
    if (!a || !b) {
      errors.push(`${name}: missing in compare`)
      continue
    }
    if (a.creationBytecode !== b.creationBytecode) errors.push(`${name}: creation bytecode drift`)
    if (
      (a.creationBytecodeSha256 || '').toLowerCase() !==
      (b.creationBytecodeSha256 || '').toLowerCase()
    ) {
      errors.push(`${name}: creationBytecodeSha256 drift`)
    }
    if (
      (a.expectedRuntimeBytecodeSha256 || '').toLowerCase() !==
      (b.expectedRuntimeBytecodeSha256 || '').toLowerCase()
    ) {
      errors.push(`${name}: expectedRuntimeBytecodeSha256 drift`)
    }
    if (JSON.stringify(a.constructorInputs) !== JSON.stringify(b.constructorInputs)) {
      errors.push(`${name}: constructor schema drift`)
    }
  }
  return errors
}

function modeFromArgs(argv) {
  if (argv.includes('--generate')) return 'generate'
  if (argv.includes('--certify')) return 'certify'
  if (argv.includes('--check-committed') || argv.includes('--check')) return 'check'
  // Default: generate (developer refresh)
  return 'generate'
}

function main() {
  const mode = modeFromArgs(process.argv.slice(2))
  const inputs = requireInputs()

  if (mode === 'check') {
    if (!fs.existsSync(MANIFEST)) {
      fail('FAIL: committed lb-v1-certified.json missing — run yarn lb:manifest:generate with Forge artifacts')
    }
    const beforeMtime = fs.statSync(MANIFEST).mtimeMs
    const beforeBuf = fs.readFileSync(MANIFEST)
    const manifest = JSON.parse(beforeBuf.toString('utf8'))
    const errors = validateCommittedManifest(manifest, inputs)
    if (errors.length) {
      fail('FAIL: committed LB certified manifest integrity check', errors)
    }
    const afterBuf = fs.readFileSync(MANIFEST)
    if (!beforeBuf.equals(afterBuf) || fs.statSync(MANIFEST).mtimeMs !== beforeMtime) {
      fail('FAIL: check mode mutated the committed manifest (forbidden)')
    }
    // Forge out absence is OK
    const forgeMissing = DEPLOY_ORDER.filter(
      (n) => !fs.existsSync(path.join(OUT_DIR, ARTIFACT_PATHS[n])),
    )
    console.log(
      `OK: committed lb-v1-certified.json integrity PASS (${DEPLOY_ORDER.length} contracts)` +
        (forgeMissing.length
          ? ` · Forge out/ absent for ${forgeMissing.length} contracts (expected on Vercel)`
          : ' · Forge out/ present locally'),
    )
    return
  }

  if (mode === 'generate') {
    const manifest = buildFromForge(inputs)
    // Preserve prior bytecode if already committed and identical — still rewrite metadata safely.
    if (fs.existsSync(MANIFEST)) {
      const existing = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'))
      const drift = compareManifests(existing, manifest)
      if (drift.length) {
        console.warn(
          'WARN: generate would change certified bytecode/schema vs committed manifest:\n' +
            drift.map((d) => `  - ${d}`).join('\n'),
        )
        fail(
          'FAIL: refusing to overwrite committed manifest with drifted Forge output. Investigate compiler/source drift before regenerating.',
          drift,
        )
      }
      // Keep generatedAt/sourceFingerprint refresh when byte-identical
      manifest.generatedAt = new Date().toISOString()
    }
    fs.mkdirSync(path.dirname(MANIFEST), { recursive: true })
    fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest)}\n`)
    console.log(`OK: wrote ${path.relative(REPO_ROOT, MANIFEST)} (${DEPLOY_ORDER.length} contracts)`)
    return
  }

  if (mode === 'certify') {
    if (!fs.existsSync(MANIFEST)) {
      fail('FAIL: committed manifest missing — cannot certify')
    }
    const committed = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'))
    const fresh = buildFromForge(inputs)
    const structureErrors = validateCommittedManifest(committed, inputs)
    if (structureErrors.length) {
      fail('FAIL: committed manifest fails integrity before certify compare', structureErrors)
    }
    const drift = compareManifests(committed, fresh)
    if (drift.length) {
      fail('FAIL: certify detected committed vs Forge drift', drift)
    }
    console.log('OK: certify PASS — committed manifest matches Forge out/ + certified inputs')
    return
  }

  fail(`FAIL: unknown mode ${mode}`)
}

main()
