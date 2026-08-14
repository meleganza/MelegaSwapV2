#!/usr/bin/env node
/** Certified browser-deployment manifest for PublicPoolFactoryAdapterV1. */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB_ROOT = path.resolve(__dirname, '..')
const REPO_ROOT = path.resolve(WEB_ROOT, '../..')
const OUT_ARTIFACT = path.join(
  REPO_ROOT,
  'out/PublicPoolFactoryAdapterV1.sol/PublicPoolFactoryAdapterV1.json',
)
const MANIFEST = path.join(
  WEB_ROOT,
  'src/lib/deployment-orchestrator/artifacts/ppfa-v1-certified.json',
)

const CONTRACT = 'PublicPoolFactoryAdapterV1'
const SCHEMA = 'melega.dex.v1.ppfa-certified-bytecode'
const DEPLOYER = '0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0'
const LEGACY_FACTORY = '0x4c33eb3d40c78461dd1a079150fcac6da3c701cf'
const MARCO = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'
const TREASURY = '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b'
const INIT_CODE_HASH = '0x6a0d0b073d0d328d62f194cf061b2075570cf5d131eeb707cf7db52ae91c3f9b'
const SOURCES = [
  'contracts/public-pool-adapter/PublicPoolFactoryAdapterV1.sol',
  'contracts/public-pool-adapter/interfaces/ILegacySmartChef.sol',
  'contracts/public-pool-adapter/interfaces/ILegacySmartChefFactory.sol',
]

function sha256Hex(buffer) {
  return `0x${crypto.createHash('sha256').update(buffer).digest('hex')}`
}

function bytecodeObject(value) {
  const raw = typeof value === 'string' ? value : value?.object
  if (typeof raw !== 'string') return ''
  return raw.startsWith('0x') ? raw : `0x${raw}`
}

function bytecodeSha256(bytecode) {
  const normalized = bytecode.replace(/^0x/, '').replace(/__\$[a-f0-9]{34}\$__/gi, '0'.repeat(40))
  return sha256Hex(Buffer.from(normalized, 'hex'))
}

function immutableRanges(artifact) {
  const ranges = []
  const refs = artifact.deployedBytecode?.immutableReferences || {}
  for (const list of Object.values(refs)) {
    if (!Array.isArray(list)) continue
    for (const range of list) {
      if (typeof range?.start === 'number' && typeof range?.length === 'number') ranges.push(range)
    }
  }
  return ranges.sort((a, b) => a.start - b.start)
}

function sourceFingerprint() {
  const rows = SOURCES.map((relative) => {
    const absolute = path.join(REPO_ROOT, relative)
    return `${relative}:${fs.existsSync(absolute) ? sha256Hex(fs.readFileSync(absolute)) : 'MISSING'}`
  })
  rows.push(`deployer:${DEPLOYER.toLowerCase()}`)
  rows.push(`legacyFactory:${LEGACY_FACTORY.toLowerCase()}`)
  rows.push(`marco:${MARCO.toLowerCase()}`)
  rows.push(`treasury:${TREASURY.toLowerCase()}`)
  rows.push(`initCodeHash:${INIT_CODE_HASH.toLowerCase()}`)
  return sha256Hex(Buffer.from(rows.join('\n'), 'utf8'))
}

function currentCommit() {
  try {
    return execSync('git rev-parse HEAD', { cwd: REPO_ROOT, encoding: 'utf8' }).trim()
  } catch {
    return 'UNKNOWN'
  }
}

function buildManifest() {
  if (!fs.existsSync(OUT_ARTIFACT)) throw new Error(`Missing Forge artifact: ${OUT_ARTIFACT}`)
  const artifact = JSON.parse(fs.readFileSync(OUT_ARTIFACT, 'utf8'))
  const creationBytecode = bytecodeObject(artifact.bytecode)
  const deployedBytecode = bytecodeObject(artifact.deployedBytecode)
  if (!creationBytecode || creationBytecode === '0x') throw new Error('Creation bytecode is empty')
  if (!deployedBytecode || deployedBytecode === '0x') throw new Error('Runtime bytecode is empty')
  const constructor = (artifact.abi || []).find((entry) => entry.type === 'constructor')

  return {
    schema: SCHEMA,
    version: '1.0.0',
    chainId: 56,
    artifactVersion: CONTRACT,
    displayName: 'Public Pool Factory Adapter',
    contractName: CONTRACT,
    sourceCommit: currentCommit(),
    sourceFingerprint: sourceFingerprint(),
    generatedAt: new Date().toISOString(),
    deployOrder: [CONTRACT],
    packagePath: 'contracts/public-pool-adapter/',
    deployer: DEPLOYER,
    legacyFactory: LEGACY_FACTORY,
    marcoToken: MARCO,
    treasury: TREASURY,
    smartChefInitCodeHash: INIT_CODE_HASH,
    activation: ['DEPLOY_ADAPTER', 'TRANSFER_LEGACY_FACTORY_OWNERSHIP'],
    authorityModel: 'FOUNDER_WALLET_SIGNED',
    noKms: true,
    noServerSigner: true,
    noAutomaticBroadcast: true,
    immutableByteRanges: immutableRanges(artifact),
    artifacts: {
      [CONTRACT]: {
        contractName: CONTRACT,
        creationBytecode,
        creationBytecodeSha256: bytecodeSha256(creationBytecode),
        expectedRuntimeBytecodeSha256: bytecodeSha256(deployedBytecode),
        constructorInputs: constructor?.inputs || [],
        abi: artifact.abi || [],
        creationBytes: creationBytecode.replace(/^0x/, '').length / 2,
        deployedBytes: deployedBytecode.replace(/^0x/, '').length / 2,
      },
    },
  }
}

function validate(manifest) {
  const errors = []
  if (manifest?.schema !== SCHEMA) errors.push('schema mismatch')
  if (manifest?.chainId !== 56) errors.push('chainId must be 56')
  if ((manifest?.deployer || '').toLowerCase() !== DEPLOYER.toLowerCase()) errors.push('deployer mismatch')
  if ((manifest?.legacyFactory || '').toLowerCase() !== LEGACY_FACTORY.toLowerCase()) errors.push('legacyFactory mismatch')
  if ((manifest?.marcoToken || '').toLowerCase() !== MARCO.toLowerCase()) errors.push('MARCO mismatch')
  if ((manifest?.treasury || '').toLowerCase() !== TREASURY.toLowerCase()) errors.push('treasury mismatch')
  if ((manifest?.smartChefInitCodeHash || '').toLowerCase() !== INIT_CODE_HASH.toLowerCase()) {
    errors.push('SmartChef init-code hash mismatch')
  }
  if (manifest?.authorityModel !== 'FOUNDER_WALLET_SIGNED') errors.push('authority model mismatch')
  if (manifest?.noKms !== true || manifest?.noServerSigner !== true) errors.push('unsafe signer declaration')
  const artifact = manifest?.artifacts?.[CONTRACT]
  if (!artifact?.creationBytecode?.startsWith('0x')) errors.push('creation bytecode missing')
  if (artifact?.creationBytecode) {
    const actual = bytecodeSha256(artifact.creationBytecode)
    if ((artifact.creationBytecodeSha256 || '').toLowerCase() !== actual.toLowerCase()) {
      errors.push('creation bytecode checksum mismatch')
    }
  }
  if (!Array.isArray(artifact?.constructorInputs) || artifact.constructorInputs.length !== 5) {
    errors.push('constructor schema mismatch')
  }
  return errors
}

const mode = process.argv[2]
if (mode === '--generate') {
  const manifest = buildManifest()
  fs.mkdirSync(path.dirname(MANIFEST), { recursive: true })
  fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`Generated ${path.relative(REPO_ROOT, MANIFEST)}`)
  console.log(`Creation SHA-256 ${manifest.artifacts[CONTRACT].creationBytecodeSha256}`)
} else if (mode === '--check' || mode === '--check-committed') {
  if (!fs.existsSync(MANIFEST)) throw new Error(`Missing committed manifest: ${MANIFEST}`)
  const errors = validate(JSON.parse(fs.readFileSync(MANIFEST, 'utf8')))
  if (errors.length) throw new Error(errors.join('\n'))
  console.log('Public Pool Factory Adapter certified manifest OK')
} else if (mode === '--certify') {
  const committed = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'))
  const fresh = buildManifest()
  const errors = validate(committed)
  if (committed.artifacts[CONTRACT].creationBytecodeSha256 !== fresh.artifacts[CONTRACT].creationBytecodeSha256) {
    errors.push('committed creation bytecode differs from Forge build')
  }
  if (committed.sourceFingerprint !== fresh.sourceFingerprint) errors.push('source fingerprint differs')
  if (errors.length) throw new Error(errors.join('\n'))
  console.log('Public Pool Factory Adapter source and bytecode certified')
} else {
  throw new Error('Usage: generate-ppfa-certified-manifest.mjs --generate|--check-committed|--certify')
}
