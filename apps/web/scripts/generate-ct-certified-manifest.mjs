#!/usr/bin/env node
/**
 * Create Token Factory certified client manifest tooling.
 *
 * Modes:
 *   --generate          Require Forge `out/` artifact; write committed client manifest.
 *   --check-committed   Validate committed manifest only (Vercel / prebuild). No Forge required.
 *   --check             Alias of --check-committed.
 *   --certify           Require Forge; compare freshly generated output to committed manifest.
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB_ROOT = path.resolve(__dirname, '..')
const REPO_ROOT = path.resolve(WEB_ROOT, '../..')
const OUT_ARTIFACT = path.join(REPO_ROOT, 'out/MelegaTokenFactory.sol/MelegaTokenFactory.json')
const MANIFEST = path.join(WEB_ROOT, 'src/lib/deployment-orchestrator/artifacts/ct-v1-certified.json')

const CANONICAL_TREASURY = '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b'
const CANONICAL_FEE_WEI = '100000000000000000'
const CANONICAL_DEPLOYER = '0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0'
const SCHEMA = 'melega.dex.v1.ct-certified-bytecode'
const ARTIFACT_VERSION = 'CreateTokenFactoryV1'
const CONTRACT = 'MelegaTokenFactory'
const SOL_SOURCES = [
  'contracts/create-token/MelegaTokenFactory.sol',
  'contracts/create-token/MelegaFixedSupplyToken.sol',
]

const IMMUTABLE_BYTE_RANGES = [
  { start: 236, length: 32 },
  { start: 529, length: 32 },
  { start: 682, length: 32 },
  { start: 750, length: 32 },
  { start: 1119, length: 32 },
  { start: 1195, length: 32 },
  { start: 1311, length: 32 },
  { start: 3300, length: 32 },
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

function gitSourceCommit() {
  try {
    return execSync('git rev-parse HEAD', { cwd: REPO_ROOT, encoding: 'utf8' }).trim()
  } catch {
    return 'UNKNOWN'
  }
}

function computeSourceFingerprint() {
  const parts = []
  for (const rel of SOL_SOURCES) {
    const full = path.join(REPO_ROOT, rel)
    if (fs.existsSync(full)) parts.push(`${rel}:${sha256Hex(fs.readFileSync(full))}`)
    else parts.push(`${rel}:MISSING`)
  }
  parts.push(`feeRecipient:${CANONICAL_TREASURY.toLowerCase()}`)
  parts.push(`creationFeeWei:${CANONICAL_FEE_WEI}`)
  return sha256Hex(Buffer.from(parts.join('\n'), 'utf8'))
}

function fail(msg, details = []) {
  console.error(msg)
  for (const d of details) console.error(`  - ${d}`)
  process.exit(1)
}

function buildFromForge() {
  if (!fs.existsSync(OUT_ARTIFACT)) {
    fail(`FAIL: missing forge artifact ${OUT_ARTIFACT}. Run forge build.`)
  }
  const art = JSON.parse(fs.readFileSync(OUT_ARTIFACT, 'utf8'))
  const creationBytecode = readBytecode(art)
  if (!creationBytecode || creationBytecode === '0x' || creationBytecode.length < 4) {
    fail('FAIL: empty MelegaTokenFactory creation bytecode')
  }
  const deployed = readDeployed(art)
  const observedRuntimeBytecodeSha256 = runtimeHashFromDeployed(deployed)
  const ctor = (art.abi || []).find((x) => x.type === 'constructor')
  return {
    schema: SCHEMA,
    version: '1.0.0',
    chainId: 56,
    artifactVersion: ARTIFACT_VERSION,
    displayName: 'Create Token Factory',
    contractName: CONTRACT,
    sourceCommit: gitSourceCommit(),
    sourceFingerprint: computeSourceFingerprint(),
    generatedAt: new Date().toISOString(),
    deployOrder: [CONTRACT],
    scriptRef: 'script/create-token/DeployMelegaTokenFactoryMainnet.s.sol',
    packagePath: 'contracts/create-token/',
    treasuryDestination: CANONICAL_TREASURY,
    creationFeeWei: CANONICAL_FEE_WEI,
    creationFeeBnb: '0.10',
    deployer: CANONICAL_DEPLOYER,
    authorityModel: 'FOUNDER_WALLET_SIGNED',
    noKms: true,
    noServerSigner: true,
    noAutomaticBroadcast: true,
    immutableByteRanges: IMMUTABLE_BYTE_RANGES,
    artifacts: {
      [CONTRACT]: {
        contractName: CONTRACT,
        artifactAlias: ARTIFACT_VERSION,
        creationBytecode,
        creationBytecodeSha256: creationFingerprint(creationBytecode),
        expectedRuntimeBytecodeSha256: observedRuntimeBytecodeSha256,
        observedRuntimeBytecodeSha256,
        runtimeHashMatchesCertified: true,
        constructorInputs: ctor?.inputs || [],
        abi: (art.abi || []).filter(
          (x) =>
            x.type === 'constructor' ||
            (x.type === 'function' && ['feeRecipient', 'creationFee', 'createToken'].includes(x.name)),
        ),
        linkReferences: {},
        creationBytes: creationBytecode.replace(/^0x/, '').length / 2,
        deployedBytes: deployed.replace(/^0x/, '').length / 2,
      },
    },
  }
}

function validateCommittedManifest(manifest) {
  const errors = []
  if (!manifest || typeof manifest !== 'object') return ['manifest is not a JSON object']
  if (manifest.schema !== SCHEMA) errors.push(`unsupported schema: ${manifest.schema}`)
  if (manifest.artifactVersion !== ARTIFACT_VERSION) {
    errors.push(`artifactVersion mismatch: ${manifest.artifactVersion}`)
  }
  if (manifest.chainId !== 56) errors.push(`chainId must be 56, got ${manifest.chainId}`)
  if (!manifest.sourceCommit) errors.push('sourceCommit missing')
  if ((manifest.treasuryDestination || '').toLowerCase() !== CANONICAL_TREASURY.toLowerCase()) {
    errors.push(`treasuryDestination mismatch: ${manifest.treasuryDestination}`)
  }
  if (String(manifest.creationFeeWei) !== CANONICAL_FEE_WEI) {
    errors.push(`creationFeeWei must be ${CANONICAL_FEE_WEI}`)
  }
  if (manifest.authorityModel !== 'FOUNDER_WALLET_SIGNED') {
    errors.push('authorityModel must be FOUNDER_WALLET_SIGNED')
  }
  if (manifest.noKms !== true || manifest.noServerSigner !== true) {
    errors.push('must declare noKms and noServerSigner')
  }
  const a = manifest.artifacts?.[CONTRACT]
  if (!a) {
    errors.push(`${CONTRACT}: missing from committed manifest`)
    return errors
  }
  if (!a.creationBytecode || !a.creationBytecode.startsWith('0x') || a.creationBytecode.length < 4) {
    errors.push(`${CONTRACT}: creation bytecode empty or invalid`)
  } else {
    const recomputed = creationFingerprint(a.creationBytecode)
    if ((a.creationBytecodeSha256 || '').toLowerCase() !== recomputed.toLowerCase()) {
      errors.push(`${CONTRACT}: creationBytecodeSha256 does not match bytecode`)
    }
  }
  if (!a.runtimeHashMatchesCertified) errors.push(`${CONTRACT}: runtimeHashMatchesCertified is false`)
  if (!Array.isArray(a.constructorInputs) || a.constructorInputs.length !== 2) {
    errors.push(`${CONTRACT}: constructorInputs must be [feeRecipient_, creationFee_]`)
  }
  return errors
}

function compareManifests(committed, fresh) {
  const errors = []
  const a = committed.artifacts[CONTRACT]
  const b = fresh.artifacts[CONTRACT]
  if (!a || !b) return [`${CONTRACT}: missing in compare`]
  if ((a.creationBytecodeSha256 || '').toLowerCase() !== (b.creationBytecodeSha256 || '').toLowerCase()) {
    errors.push('creationBytecodeSha256 drift')
  }
  if (
    (a.expectedRuntimeBytecodeSha256 || '').toLowerCase() !==
    (b.expectedRuntimeBytecodeSha256 || '').toLowerCase()
  ) {
    errors.push('expectedRuntimeBytecodeSha256 drift')
  }
  if (String(committed.creationFeeWei) !== String(fresh.creationFeeWei)) errors.push('creationFeeWei drift')
  return errors
}

const args = process.argv.slice(2)
const mode = args.includes('--generate')
  ? 'generate'
  : args.includes('--certify')
    ? 'certify'
    : args.includes('--check') || args.includes('--check-committed') || args.length === 0
      ? 'check'
      : null

if (!mode) {
  fail('Usage: generate-ct-certified-manifest.mjs --generate|--check-committed|--certify')
}

if (mode === 'generate') {
  const fresh = buildFromForge()
  fs.mkdirSync(path.dirname(MANIFEST), { recursive: true })
  fs.writeFileSync(MANIFEST, `${JSON.stringify(fresh, null, 2)}\n`)
  console.log(`OK: wrote ${MANIFEST}`)
  console.log(`  creationBytecodeSha256=${fresh.artifacts[CONTRACT].creationBytecodeSha256}`)
  console.log(`  expectedRuntimeBytecodeSha256=${fresh.artifacts[CONTRACT].expectedRuntimeBytecodeSha256}`)
  process.exit(0)
}

if (!fs.existsSync(MANIFEST)) fail(`FAIL: missing committed manifest ${MANIFEST}`)
const committed = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'))
const checkErrors = validateCommittedManifest(committed)
if (checkErrors.length) fail('FAIL: committed Create Token certified manifest invalid', checkErrors)
console.log('OK: committed Create Token certified manifest valid')

if (mode === 'certify') {
  const fresh = buildFromForge()
  const drift = compareManifests(committed, fresh)
  if (drift.length) fail('FAIL: Create Token certified manifest drifts from Forge out/', drift)
  console.log('OK: committed Create Token manifest matches Forge artifacts')
}
