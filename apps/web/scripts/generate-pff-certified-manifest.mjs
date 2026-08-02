#!/usr/bin/env node
/**
 * Public Farm Factory certified client manifest tooling.
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
const OUT_ARTIFACT = path.join(REPO_ROOT, 'out/PublicFarmFactoryV1.sol/PublicFarmFactoryV1.json')
const MANIFEST = path.join(WEB_ROOT, 'src/lib/deployment-orchestrator/artifacts/pff-v1-certified.json')

const CANONICAL_TREASURY = '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b'
const CANONICAL_DEPLOYER = '0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0'
const CANONICAL_MARCO = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'
const CANONICAL_PAIR_FACTORY = '0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C'
/** Founder-approved attestation EOA for v1 — MELEGA DEPLOYER (no KMS / no server signer). */
const CANONICAL_ELIGIBILITY_SIGNER = CANONICAL_DEPLOYER
const SCHEMA = 'melega.dex.v1.pff-certified-bytecode'
const ARTIFACT_VERSION = 'PublicFarmFactoryV1'
const CONTRACT = 'PublicFarmFactoryV1'
const SOL_SOURCES = [
  'contracts/public-farm-factory/PublicFarmFactoryV1.sol',
  'contracts/public-farm-factory/PublicFarmTemplateV1.sol',
  'contracts/public-farm-factory/interfaces/IPublicFarmFactoryV1.sol',
  'contracts/public-farm-factory/interfaces/IMelegaPairFactoryMinimal.sol',
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

function flattenImmutableRanges(art) {
  const refs = art.deployedBytecode?.immutableReferences || art.immutableReferences || {}
  const ranges = []
  for (const list of Object.values(refs)) {
    if (!Array.isArray(list)) continue
    for (const r of list) {
      if (r && typeof r.start === 'number' && typeof r.length === 'number') ranges.push(r)
    }
  }
  return ranges.sort((a, b) => a.start - b.start)
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
  parts.push(`treasury:${CANONICAL_TREASURY.toLowerCase()}`)
  parts.push(`marco:${CANONICAL_MARCO.toLowerCase()}`)
  parts.push(`pairFactory:${CANONICAL_PAIR_FACTORY.toLowerCase()}`)
  parts.push(`eligibilitySigner:${CANONICAL_ELIGIBILITY_SIGNER.toLowerCase()}`)
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
    fail('FAIL: empty PublicFarmFactoryV1 creation bytecode')
  }
  const deployed = readDeployed(art)
  const observedRuntimeBytecodeSha256 = runtimeHashFromDeployed(deployed)
  const ctor = (art.abi || []).find((x) => x.type === 'constructor')
  const immutableByteRanges = flattenImmutableRanges(art)
  return {
    schema: SCHEMA,
    version: '1.0.0',
    chainId: 56,
    artifactVersion: ARTIFACT_VERSION,
    displayName: 'Public Farm Factory',
    contractName: CONTRACT,
    sourceCommit: gitSourceCommit(),
    sourceFingerprint: computeSourceFingerprint(),
    generatedAt: new Date().toISOString(),
    deployOrder: [CONTRACT],
    scriptRef: 'contracts/public-farm-factory/ (Founder wallet CREATE)',
    packagePath: 'contracts/public-farm-factory/',
    treasuryDestination: CANONICAL_TREASURY,
    marcoToken: CANONICAL_MARCO,
    pairFactory: CANONICAL_PAIR_FACTORY,
    eligibilitySigner: CANONICAL_ELIGIBILITY_SIGNER,
    feePolicy: {
      marcoPair: 'FREE',
      otherwiseWei: '250000000000000000',
      otherwiseBnb: '0.25',
      minimumTvlBnb: '0.25',
      marcoReward: 'UNSUPPORTED',
    },
    deployer: CANONICAL_DEPLOYER,
    authorityModel: 'FOUNDER_WALLET_SIGNED',
    noKms: true,
    noServerSigner: true,
    noAutomaticBroadcast: true,
    noTreasuryRuntime: true,
    immutableByteRanges,
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
            (x.type === 'function' &&
              ['treasury', 'marcoToken', 'pairFactory', 'eligibilitySigner', 'createFarm', 'FREE_FEE', 'DEFAULT_FEE'].includes(
                x.name,
              )),
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
  if ((manifest.marcoToken || '').toLowerCase() !== CANONICAL_MARCO.toLowerCase()) {
    errors.push(`marcoToken mismatch`)
  }
  if ((manifest.pairFactory || '').toLowerCase() !== CANONICAL_PAIR_FACTORY.toLowerCase()) {
    errors.push(`pairFactory mismatch`)
  }
  if ((manifest.eligibilitySigner || '').toLowerCase() !== CANONICAL_ELIGIBILITY_SIGNER.toLowerCase()) {
    errors.push(`eligibilitySigner mismatch`)
  }
  if (manifest.authorityModel !== 'FOUNDER_WALLET_SIGNED') {
    errors.push('authorityModel must be FOUNDER_WALLET_SIGNED')
  }
  if (manifest.noKms !== true || manifest.noServerSigner !== true) {
    errors.push('must declare noKms and noServerSigner')
  }
  if (manifest.noTreasuryRuntime !== true) errors.push('must declare noTreasuryRuntime')
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
  if (!Array.isArray(a.constructorInputs) || a.constructorInputs.length !== 4) {
    errors.push(`${CONTRACT}: constructorInputs must be [treasury_, marcoToken_, pairFactory_, eligibilitySigner_]`)
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
  fail('Usage: generate-pff-certified-manifest.mjs --generate|--check-committed|--certify')
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
if (checkErrors.length) fail('FAIL: committed Public Farm Factory certified manifest invalid', checkErrors)
console.log('OK: committed Public Farm Factory certified manifest valid')

if (mode === 'certify') {
  const fresh = buildFromForge()
  const drift = compareManifests(committed, fresh)
  if (drift.length) fail('FAIL: Public Farm Factory certified manifest drifts from Forge out/', drift)
  console.log('OK: committed Public Farm Factory manifest matches Forge artifacts')
}
