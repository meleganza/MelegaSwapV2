/**
 * Certified Avalanche V2 Router artifact loader — autoload on import, fail closed.
 * Committed manifest only (no gitignored Forge artifacts).
 */
import { keccak256 } from '@ethersproject/keccak256'
import { AUTHORIZED_MELEGA_DEPLOYER } from './founderDeployer'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const certified = require('./artifacts/avalanche-v2-router-certified.json') as {
  schema: string
  version: string
  artifactVersion: string
  chainId: number
  contractName: string
  displayName: string
  sourceIdentity: string
  factory: string
  wavax: string
  initCodePairHash: string
  deployer: string
  noKms: boolean
  noServerSigner: boolean
  noAutomaticBroadcast: boolean
  noProxy: boolean
  noMutableAuthority: boolean
  noProtocolFeeInRouter: boolean
  noKerl: boolean
  noTreasuryRuntime: boolean
  artifacts: Record<string, AvaxRouterArtifactRecord>
}

export const AVAX_ROUTER_CONTRACT = 'MelegaV2Router' as const
export const AVAX_ROUTER_ALIAS = 'AvalancheV2Router' as const
export const AVAX_ROUTER_CHAIN_ID = 43114 as const
export const AVAX_ROUTER_FACTORY = '0xFF8EBf8edf1C533A02d066f852788773BdCD631C' as const
export const AVAX_ROUTER_WAVAX = '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7' as const
export const AVAX_ROUTER_INIT_CODE_PAIR_HASH =
  '0x61d8b54c70e4fa58ec2fa33190002b375d3e6e19d891be1b158ba25e0886eea2' as const

export type AvaxRouterArtifactRecord = {
  contractName: string
  artifactAlias?: string
  creationBytecode: string
  creationBytecodeSha256?: string
  expectedRuntimeBytecodeSha256: string
  observedRuntimeBytecodeSha256: string
  runtimeHashMatchesCertified: boolean
  constructorInputs: Array<{ name: string; type: string; internalType?: string }>
  constructorValues?: { _factory?: string; _WETH?: string }
  abi?: unknown[]
  linkReferences: Record<string, unknown>
  creationBytes?: number
  deployedBytes?: number
  patchedInitCodePairHash?: string
}

export type AvaxRouterIntegrityGate = {
  ok: boolean
  contractName: string
  creationBytecodePresent: boolean
  creationBytecodeHash: string | null
  creationBytecodeSha256: string | null
  runtimeHashVerified: boolean
  constructorSchemaPresent: boolean
  factoryOk: boolean
  wavaxOk: boolean
  chainIdOk: boolean
  noProxyOk: boolean
  noAuthorityOk: boolean
  mismatches: string[]
  statusLabel:
    | 'Loading certified artifact'
    | 'Certified artifact loaded'
    | 'Artifact hash verified'
    | 'Artifact integrity failed'
}

export type AvaxRouterArtifactLoadResult = {
  status: 'ARTIFACTS_LOADING' | 'ARTIFACTS_VALID' | 'ARTIFACTS_INVALID'
  artifacts: Record<string, AvaxRouterArtifactRecord>
  invalidReasons: string[]
  artifactVersion: string
  factory: string
  wavax: string
  chainId: number
  deployer: typeof AUTHORIZED_MELEGA_DEPLOYER
  statusLabels: string[]
}

function zeroPlaceholders(bytecode: string): string {
  return `0x${bytecode.replace(/^0x/, '').replace(/__\$[a-f0-9]{34}\$__/gi, '0'.repeat(40))}`
}

export function keccakAvaxRouterCreationBytecode(bytecode: string): string {
  return keccak256(zeroPlaceholders(bytecode))
}

async function sha256Hex(bytecode: string): Promise<string> {
  const hex = bytecode.replace(/^0x/, '')
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const digest = await crypto.subtle.digest('SHA-256', bytes)
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }
  // Node fallback for tests
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createHash } = require('crypto') as typeof import('crypto')
  return createHash('sha256').update(Buffer.from(hex, 'hex')).digest('hex')
}

export function sha256AvaxRouterCreationBytecodeSync(bytecode: string): string {
  const hex = bytecode.replace(/^0x/, '')
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createHash } = require('crypto') as typeof import('crypto')
  return createHash('sha256').update(Buffer.from(hex, 'hex')).digest('hex')
}

export function assessAvaxRouterArtifactIntegrity(
  art: AvaxRouterArtifactRecord | undefined,
  expectedName: string = AVAX_ROUTER_CONTRACT,
): AvaxRouterIntegrityGate {
  const mismatches: string[] = []
  if (!art) {
    return {
      ok: false,
      contractName: expectedName,
      creationBytecodePresent: false,
      creationBytecodeHash: null,
      creationBytecodeSha256: null,
      runtimeHashVerified: false,
      constructorSchemaPresent: false,
      factoryOk: false,
      wavaxOk: false,
      chainIdOk: false,
      noProxyOk: false,
      noAuthorityOk: false,
      mismatches: ['Certified Avalanche V2 Router artifact missing'],
      statusLabel: 'Artifact integrity failed',
    }
  }

  const creationBytecodePresent =
    typeof art.creationBytecode === 'string' &&
    art.creationBytecode.startsWith('0x') &&
    art.creationBytecode.length > 10

  const creationBytecodeHash = creationBytecodePresent
    ? keccakAvaxRouterCreationBytecode(art.creationBytecode)
    : null
  const creationBytecodeSha256 = creationBytecodePresent
    ? sha256AvaxRouterCreationBytecodeSync(art.creationBytecode)
    : null

  if (!creationBytecodePresent) mismatches.push('creationBytecode missing')
  if (
    art.creationBytecodeSha256 &&
    creationBytecodeSha256 &&
    art.creationBytecodeSha256.toLowerCase() !== creationBytecodeSha256.toLowerCase()
  ) {
    mismatches.push('creationBytecodeSha256 mismatch')
  }

  const runtimeHashVerified =
    !!art.expectedRuntimeBytecodeSha256 &&
    art.expectedRuntimeBytecodeSha256 === art.observedRuntimeBytecodeSha256 &&
    art.runtimeHashMatchesCertified === true
  if (!runtimeHashVerified) mismatches.push('expected runtime hash not verified')

  const constructorSchemaPresent =
    Array.isArray(art.constructorInputs) &&
    art.constructorInputs.length === 2 &&
    art.constructorInputs[0]?.type === 'address' &&
    art.constructorInputs[1]?.type === 'address'
  if (!constructorSchemaPresent) mismatches.push('constructor schema invalid')

  const factoryOk =
    (art.constructorValues?._factory || certified.factory || '').toLowerCase() ===
    AVAX_ROUTER_FACTORY.toLowerCase()
  const wavaxOk =
    (art.constructorValues?._WETH || certified.wavax || '').toLowerCase() ===
    AVAX_ROUTER_WAVAX.toLowerCase()
  if (!factoryOk) mismatches.push('Factory constructor value mismatch')
  if (!wavaxOk) mismatches.push('WAVAX constructor value mismatch')

  const chainIdOk = certified.chainId === AVAX_ROUTER_CHAIN_ID
  if (!chainIdOk) mismatches.push('chainId must be 43114')

  const noProxyOk = certified.noProxy === true
  const noAuthorityOk = certified.noMutableAuthority === true
  if (!noProxyOk) mismatches.push('proxy not forbidden')
  if (!noAuthorityOk) mismatches.push('mutable authority not forbidden')

  if (art.contractName !== expectedName) mismatches.push(`contractName expected ${expectedName}`)

  if (
    (art.patchedInitCodePairHash || certified.initCodePairHash || '').toLowerCase() !==
    AVAX_ROUTER_INIT_CODE_PAIR_HASH.toLowerCase()
  ) {
    mismatches.push('INIT_CODE_PAIR_HASH mismatch for Avalanche Factory')
  }

  const ok = mismatches.length === 0
  return {
    ok,
    contractName: art.contractName,
    creationBytecodePresent,
    creationBytecodeHash,
    creationBytecodeSha256,
    runtimeHashVerified,
    constructorSchemaPresent,
    factoryOk,
    wavaxOk,
    chainIdOk,
    noProxyOk,
    noAuthorityOk,
    mismatches,
    statusLabel: ok ? 'Artifact hash verified' : 'Artifact integrity failed',
  }
}

export function loadCertifiedAvaxRouterArtifacts(): AvaxRouterArtifactLoadResult {
  const art = certified.artifacts?.[AVAX_ROUTER_CONTRACT]
  const gate = assessAvaxRouterArtifactIntegrity(art)
  const invalidReasons = [...gate.mismatches]
  if (certified.deployer?.toLowerCase() !== AUTHORIZED_MELEGA_DEPLOYER.toLowerCase()) {
    invalidReasons.push('deployer mismatch')
  }
  if (certified.noKms !== true || certified.noServerSigner !== true || certified.noAutomaticBroadcast !== true) {
    invalidReasons.push('authority model must be Founder wallet only')
  }
  if (certified.noProtocolFeeInRouter !== true) invalidReasons.push('protocol fee must not be in Router')
  if (certified.noKerl !== true) invalidReasons.push('KERL forbidden')
  if (certified.noTreasuryRuntime !== true) invalidReasons.push('Treasury Runtime forbidden')

  const status: AvaxRouterArtifactLoadResult['status'] =
    invalidReasons.length === 0 ? 'ARTIFACTS_VALID' : 'ARTIFACTS_INVALID'

  return {
    status,
    artifacts: certified.artifacts || {},
    invalidReasons,
    artifactVersion: certified.artifactVersion,
    factory: certified.factory,
    wavax: certified.wavax,
    chainId: certified.chainId,
    deployer: AUTHORIZED_MELEGA_DEPLOYER,
    statusLabels:
      status === 'ARTIFACTS_VALID'
        ? ['Certified artifact loaded', 'Artifact hash verified']
        : ['Artifact integrity failed', ...invalidReasons.slice(0, 3)],
  }
}

export { sha256Hex }
