/**
 * Certified Public Farm Factory artifact loader — autoload on import, fail closed.
 */
import { keccak256 } from '@ethersproject/keccak256'
import { AUTHORIZED_MELEGA_DEPLOYER, FOUNDER_TREASURY_DESTINATION } from './founderDeployer'
import { LB_MELEGA_AMM } from 'config/constants/liquidityBuildingDeployment'
import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'
import {
  PUBLIC_FARM_ELIGIBILITY_SIGNER,
  PUBLIC_FARM_FACTORY_FEE_RECIPIENT,
} from 'config/constants/publicFarmFactoryDeployment'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const certified = require('./artifacts/pff-v1-certified.json') as {
  schema: string
  version: string
  artifactVersion: string
  chainId: number
  sourceCommit: string
  deployOrder: string[]
  treasuryDestination: string
  marcoToken: string
  pairFactory: string
  eligibilitySigner: string
  authorityModel: string
  noKms: boolean
  noServerSigner: boolean
  noTreasuryRuntime: boolean
  immutableByteRanges: Array<{ start: number; length: number }>
  artifacts: Record<string, PffArtifactRecord>
}

export const PFF_FACTORY_CONTRACT = 'PublicFarmFactoryV1' as const
export const PFF_FACTORY_ALIAS = 'PublicFarmFactoryV1' as const

export type PffArtifactRecord = {
  contractName: string
  artifactAlias?: string
  creationBytecode: string
  creationBytecodeSha256?: string
  expectedRuntimeBytecodeSha256: string
  observedRuntimeBytecodeSha256: string
  runtimeHashMatchesCertified: boolean
  constructorInputs: Array<{ name: string; type: string; components?: unknown[]; internalType?: string }>
  abi?: unknown[]
  linkReferences: Record<string, unknown>
  creationBytes?: number
  deployedBytes?: number
}

export type PffIntegrityGate = {
  ok: boolean
  contractName: string
  creationBytecodePresent: boolean
  creationBytecodeHash: string | null
  creationBytecodeSha256: string | null
  runtimeHashVerified: boolean
  constructorSchemaPresent: boolean
  treasuryOk: boolean
  marcoOk: boolean
  pairFactoryOk: boolean
  eligibilitySignerOk: boolean
  mismatches: string[]
  statusLabel:
    | 'Loading certified artifact'
    | 'Certified artifact loaded'
    | 'Artifact hash verified'
    | 'Artifact integrity failed'
}

export type PffArtifactLoadResult = {
  status: 'ARTIFACTS_LOADING' | 'ARTIFACTS_VALID' | 'ARTIFACTS_INVALID'
  deployOrder: string[]
  artifacts: Record<string, PffArtifactRecord>
  invalidReasons: string[]
  artifactVersion: string
  sourceCommit: string
  treasury: typeof FOUNDER_TREASURY_DESTINATION
  marcoToken: string
  pairFactory: string
  eligibilitySigner: string
  deployer: typeof AUTHORIZED_MELEGA_DEPLOYER
  immutableByteRanges: Array<{ start: number; length: number }>
  statusLabels: string[]
}

function zeroPlaceholders(bytecode: string): string {
  return `0x${bytecode.replace(/^0x/, '').replace(/__\$[a-f0-9]{34}\$__/gi, '0'.repeat(40))}`
}

export function keccakPffCreationBytecode(bytecode: string): string {
  return keccak256(zeroPlaceholders(bytecode))
}

export function assessPffArtifactIntegrity(
  art: PffArtifactRecord | undefined,
  expectedName: string = PFF_FACTORY_CONTRACT,
): PffIntegrityGate {
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
      treasuryOk: false,
      marcoOk: false,
      pairFactoryOk: false,
      eligibilitySignerOk: false,
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
    mismatches.push(`${expectedName}: runtime hash mismatch`)
  }
  if (certified.artifactVersion !== PFF_FACTORY_ALIAS) {
    mismatches.push(`artifact version mismatch: ${certified.artifactVersion}`)
  }

  const treasuryOk =
    (certified.treasuryDestination || '').toLowerCase() === PUBLIC_FARM_FACTORY_FEE_RECIPIENT.toLowerCase() &&
    PUBLIC_FARM_FACTORY_FEE_RECIPIENT.toLowerCase() === FOUNDER_TREASURY_DESTINATION.toLowerCase()
  const marcoOk = (certified.marcoToken || '').toLowerCase() === MARCO_BSC_ADDRESS.toLowerCase()
  const pairFactoryOk = (certified.pairFactory || '').toLowerCase() === LB_MELEGA_AMM.factory.toLowerCase()
  const eligibilitySignerOk =
    (certified.eligibilitySigner || '').toLowerCase() === PUBLIC_FARM_ELIGIBILITY_SIGNER.toLowerCase()

  if (!treasuryOk) mismatches.push(`${expectedName}: fee recipient is not MELEGA TREASURY WALLET`)
  if (!marcoOk) mismatches.push(`${expectedName}: marcoToken mismatch`)
  if (!pairFactoryOk) mismatches.push(`${expectedName}: pairFactory mismatch`)
  if (!eligibilitySignerOk) mismatches.push(`${expectedName}: eligibilitySigner must be Founder-approved EOA`)
  if (certified.noKms !== true || certified.noServerSigner !== true) {
    mismatches.push(`${expectedName}: certified package must forbid KMS / server signer`)
  }
  if (certified.noTreasuryRuntime !== true) {
    mismatches.push(`${expectedName}: certified package must forbid Treasury Runtime`)
  }
  if (certified.authorityModel !== 'FOUNDER_WALLET_SIGNED') {
    mismatches.push(`${expectedName}: authorityModel must be FOUNDER_WALLET_SIGNED`)
  }

  const creationBytecodeHash = creationBytecodePresent ? keccakPffCreationBytecode(art.creationBytecode) : null
  const ok = mismatches.length === 0
  return {
    ok,
    contractName: expectedName,
    creationBytecodePresent,
    creationBytecodeHash,
    creationBytecodeSha256: art.creationBytecodeSha256 ?? null,
    runtimeHashVerified: art.runtimeHashMatchesCertified,
    constructorSchemaPresent: Array.isArray(art.constructorInputs) && art.constructorInputs.length === 4,
    treasuryOk,
    marcoOk,
    pairFactoryOk,
    eligibilitySignerOk,
    mismatches,
    statusLabel: ok ? 'Artifact hash verified' : 'Artifact integrity failed',
  }
}

export function loadCertifiedPffArtifacts(): PffArtifactLoadResult {
  const deployOrder = [...(certified.deployOrder || [PFF_FACTORY_CONTRACT])]
  const raw = certified.artifacts
  const invalidReasons: string[] = []
  const artifacts: Record<string, PffArtifactRecord> = {}
  const statusLabels: string[] = ['Certified artifact loaded']

  if (!raw || !deployOrder.length) {
    return {
      status: 'ARTIFACTS_INVALID',
      deployOrder,
      artifacts,
      invalidReasons: ['certified Public Farm Factory package empty'],
      artifactVersion: certified.artifactVersion || 'unknown',
      sourceCommit: certified.sourceCommit || 'unknown',
      treasury: FOUNDER_TREASURY_DESTINATION,
      marcoToken: MARCO_BSC_ADDRESS,
      pairFactory: LB_MELEGA_AMM.factory,
      eligibilitySigner: PUBLIC_FARM_ELIGIBILITY_SIGNER,
      deployer: AUTHORIZED_MELEGA_DEPLOYER,
      immutableByteRanges: certified.immutableByteRanges || [],
      statusLabels: ['Artifact integrity failed'],
    }
  }

  for (const name of deployOrder) {
    const gate = assessPffArtifactIntegrity(raw[name], name)
    if (!gate.ok) invalidReasons.push(...gate.mismatches)
    if (raw[name]) artifacts[name] = raw[name]
  }

  if (!invalidReasons.length) statusLabels.push('Artifact hash verified')

  return {
    status: invalidReasons.length ? 'ARTIFACTS_INVALID' : 'ARTIFACTS_VALID',
    deployOrder,
    artifacts,
    invalidReasons,
    artifactVersion: certified.artifactVersion || '1.0.0',
    sourceCommit: certified.sourceCommit || 'unknown',
    treasury: FOUNDER_TREASURY_DESTINATION,
    marcoToken: certified.marcoToken || MARCO_BSC_ADDRESS,
    pairFactory: certified.pairFactory || LB_MELEGA_AMM.factory,
    eligibilitySigner: certified.eligibilitySigner || PUBLIC_FARM_ELIGIBILITY_SIGNER,
    deployer: AUTHORIZED_MELEGA_DEPLOYER,
    immutableByteRanges: certified.immutableByteRanges || [],
    statusLabels,
  }
}
