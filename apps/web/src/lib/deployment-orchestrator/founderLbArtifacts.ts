/**
 * Certified Liquidity Builder artifact loader — autoload on import, fail closed.
 */
import { keccak256 } from '@ethersproject/keccak256'
import { AUTHORIZED_MELEGA_DEPLOYER, FOUNDER_TREASURY_DESTINATION } from './founderDeployer'

// Bundler JSON import (Next/webpack). Fail closed if package absent.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const certified = require('./artifacts/lb-v1-certified.json') as {
  schema: string
  version: string
  artifactVersion: string
  chainId: number
  sourceCommit: string
  deployOrder: string[]
  artifacts: Record<string, LbArtifactRecord>
}

export type LbArtifactRecord = {
  contractName: string
  creationBytecode: string
  creationBytecodeSha256?: string
  expectedRuntimeBytecodeSha256: string
  observedRuntimeBytecodeSha256: string
  runtimeHashMatchesCertified: boolean
  constructorInputs: Array<{ name: string; type: string; components?: unknown[]; internalType?: string }>
  abi?: unknown[]
  linkReferences: Record<string, Record<string, Array<{ start: number; length: number }>>>
}

export type LbIntegrityGate = {
  ok: boolean
  contractName: string
  creationBytecodePresent: boolean
  creationBytecodeHash: string | null
  creationBytecodeSha256: string | null
  runtimeHashVerified: boolean
  constructorSchemaPresent: boolean
  mismatches: string[]
  statusLabel: 'Loading certified artifact' | 'Certified artifact loaded' | 'Artifact hash verified' | 'Artifact integrity failed'
}

export type LbArtifactLoadResult = {
  status: 'ARTIFACTS_LOADING' | 'ARTIFACTS_VALID' | 'ARTIFACTS_INVALID'
  deployOrder: string[]
  artifacts: Record<string, LbArtifactRecord>
  invalidReasons: string[]
  artifactVersion: string
  sourceCommit: string
  treasury: typeof FOUNDER_TREASURY_DESTINATION
  deployer: typeof AUTHORIZED_MELEGA_DEPLOYER
  statusLabels: string[]
}

function zeroPlaceholders(bytecode: string): string {
  return `0x${bytecode.replace(/^0x/, '').replace(/__\$[a-f0-9]{34}\$__/gi, '0'.repeat(40))}`
}

export function keccakCreationBytecode(bytecode: string): string {
  return keccak256(zeroPlaceholders(bytecode))
}

export function assessLbArtifactIntegrity(art: LbArtifactRecord | undefined, expectedName: string): LbIntegrityGate {
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
      mismatches: [`${expectedName}: missing from certified package`],
      statusLabel: 'Artifact integrity failed',
    }
  }
  const creationBytecodePresent = Boolean(
    art.creationBytecode && art.creationBytecode.startsWith('0x') && art.creationBytecode.length > 4,
  )
  if (!creationBytecodePresent) mismatches.push(`${expectedName}: empty creation bytecode`)
  if (art.contractName !== expectedName) mismatches.push(`${expectedName}: contract name mismatch`)
  if (!art.runtimeHashMatchesCertified) {
    mismatches.push(
      `${expectedName}: runtime hash mismatch (observed ${art.observedRuntimeBytecodeSha256}, expected ${art.expectedRuntimeBytecodeSha256})`,
    )
  }
  if (certified.artifactVersion !== 'LiquidityBuildingV1' && certified.version !== '1.0.0') {
    mismatches.push(`artifact version mismatch: ${certified.artifactVersion || certified.version}`)
  }
  const creationBytecodeHash = creationBytecodePresent ? keccakCreationBytecode(art.creationBytecode) : null
  const ok = mismatches.length === 0
  return {
    ok,
    contractName: expectedName,
    creationBytecodePresent,
    creationBytecodeHash,
    creationBytecodeSha256: art.creationBytecodeSha256 ?? null,
    runtimeHashVerified: art.runtimeHashMatchesCertified,
    constructorSchemaPresent: Array.isArray(art.constructorInputs),
    mismatches,
    statusLabel: ok ? 'Artifact hash verified' : 'Artifact integrity failed',
  }
}

export function loadCertifiedLbArtifacts(): LbArtifactLoadResult {
  const deployOrder = [...certified.deployOrder]
  const raw = certified.artifacts
  const invalidReasons: string[] = []
  const artifacts: Record<string, LbArtifactRecord> = {}
  const statusLabels: string[] = ['Certified artifact loaded']

  if (!raw || !deployOrder.length) {
    return {
      status: 'ARTIFACTS_INVALID',
      deployOrder,
      artifacts,
      invalidReasons: ['certified package empty'],
      artifactVersion: certified.artifactVersion || certified.version || 'unknown',
      sourceCommit: certified.sourceCommit || 'unknown',
      treasury: FOUNDER_TREASURY_DESTINATION,
      deployer: AUTHORIZED_MELEGA_DEPLOYER,
      statusLabels: ['Artifact integrity failed'],
    }
  }

  for (const name of deployOrder) {
    const gate = assessLbArtifactIntegrity(raw[name], name)
    if (!gate.ok) invalidReasons.push(...gate.mismatches)
    if (raw[name]) artifacts[name] = raw[name]
  }

  if (!invalidReasons.length) statusLabels.push('Artifact hash verified')

  return {
    status: invalidReasons.length ? 'ARTIFACTS_INVALID' : 'ARTIFACTS_VALID',
    deployOrder,
    artifacts,
    invalidReasons,
    artifactVersion: certified.artifactVersion || certified.version || '1.0.0',
    sourceCommit: certified.sourceCommit || 'unknown',
    treasury: FOUNDER_TREASURY_DESTINATION,
    deployer: AUTHORIZED_MELEGA_DEPLOYER,
    statusLabels,
  }
}

/** Replace solc library placeholders in creation bytecode with a deployed library address. */
export function linkLibraryBytecode(creationBytecode: string, libraryAddress: string): string {
  const addr = libraryAddress.replace(/^0x/, '').toLowerCase()
  if (!/^[a-f0-9]{40}$/.test(addr)) {
    throw new Error('Invalid library address for linking')
  }
  const linked = creationBytecode.replace(/__\$[a-f0-9]{34}\$__/gi, addr)
  if (linked.includes('__$')) {
    throw new Error('Unresolved library placeholders remain after link')
  }
  return linked.startsWith('0x') ? linked : `0x${linked}`
}
