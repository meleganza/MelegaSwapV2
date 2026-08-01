/**
 * Certified Create Token Factory artifact loader — autoload on import, fail closed.
 */
import { keccak256 } from '@ethersproject/keccak256'
import { AUTHORIZED_MELEGA_DEPLOYER, FOUNDER_TREASURY_DESTINATION } from './founderDeployer'
import {
  CREATE_TOKEN_CREATION_FEE_WEI,
  CREATE_TOKEN_FEE_RECIPIENT,
} from 'config/constants/createTokenFactoryDeployment'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const certified = require('./artifacts/ct-v1-certified.json') as {
  schema: string
  version: string
  artifactVersion: string
  chainId: number
  sourceCommit: string
  deployOrder: string[]
  treasuryDestination: string
  creationFeeWei: string
  creationFeeBnb: string
  authorityModel: string
  noKms: boolean
  noServerSigner: boolean
  immutableByteRanges: Array<{ start: number; length: number }>
  artifacts: Record<string, CtArtifactRecord>
}

export const CT_FACTORY_CONTRACT = 'MelegaTokenFactory' as const
export const CT_FACTORY_ALIAS = 'CreateTokenFactoryV1' as const

export type CtArtifactRecord = {
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

export type CtIntegrityGate = {
  ok: boolean
  contractName: string
  creationBytecodePresent: boolean
  creationBytecodeHash: string | null
  creationBytecodeSha256: string | null
  runtimeHashVerified: boolean
  constructorSchemaPresent: boolean
  feeRecipientOk: boolean
  creationFeeOk: boolean
  mismatches: string[]
  statusLabel:
    | 'Loading certified artifact'
    | 'Certified artifact loaded'
    | 'Artifact hash verified'
    | 'Artifact integrity failed'
}

export type CtArtifactLoadResult = {
  status: 'ARTIFACTS_LOADING' | 'ARTIFACTS_VALID' | 'ARTIFACTS_INVALID'
  deployOrder: string[]
  artifacts: Record<string, CtArtifactRecord>
  invalidReasons: string[]
  artifactVersion: string
  sourceCommit: string
  treasury: typeof FOUNDER_TREASURY_DESTINATION
  creationFeeWei: string
  deployer: typeof AUTHORIZED_MELEGA_DEPLOYER
  immutableByteRanges: Array<{ start: number; length: number }>
  statusLabels: string[]
}

function zeroPlaceholders(bytecode: string): string {
  return `0x${bytecode.replace(/^0x/, '').replace(/__\$[a-f0-9]{34}\$__/gi, '0'.repeat(40))}`
}

export function keccakCtCreationBytecode(bytecode: string): string {
  return keccak256(zeroPlaceholders(bytecode))
}

export function assessCtArtifactIntegrity(
  art: CtArtifactRecord | undefined,
  expectedName: string = CT_FACTORY_CONTRACT,
): CtIntegrityGate {
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
      feeRecipientOk: false,
      creationFeeOk: false,
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
  if (certified.artifactVersion !== CT_FACTORY_ALIAS) {
    mismatches.push(`artifact version mismatch: ${certified.artifactVersion}`)
  }
  const feeRecipientOk =
    (certified.treasuryDestination || '').toLowerCase() === CREATE_TOKEN_FEE_RECIPIENT.toLowerCase() &&
    CREATE_TOKEN_FEE_RECIPIENT.toLowerCase() === FOUNDER_TREASURY_DESTINATION.toLowerCase()
  const creationFeeOk = String(certified.creationFeeWei) === CREATE_TOKEN_CREATION_FEE_WEI
  if (!feeRecipientOk) mismatches.push(`${expectedName}: fee recipient is not MELEGA TREASURY WALLET`)
  if (!creationFeeOk) mismatches.push(`${expectedName}: creation fee must be 0.10 BNB (100000000000000000 wei)`)
  if (certified.noKms !== true || certified.noServerSigner !== true) {
    mismatches.push(`${expectedName}: certified package must forbid KMS / server signer`)
  }
  if (certified.authorityModel !== 'FOUNDER_WALLET_SIGNED') {
    mismatches.push(`${expectedName}: authorityModel must be FOUNDER_WALLET_SIGNED`)
  }

  const creationBytecodeHash = creationBytecodePresent ? keccakCtCreationBytecode(art.creationBytecode) : null
  const ok = mismatches.length === 0
  return {
    ok,
    contractName: expectedName,
    creationBytecodePresent,
    creationBytecodeHash,
    creationBytecodeSha256: art.creationBytecodeSha256 ?? null,
    runtimeHashVerified: art.runtimeHashMatchesCertified,
    constructorSchemaPresent: Array.isArray(art.constructorInputs) && art.constructorInputs.length === 2,
    feeRecipientOk,
    creationFeeOk,
    mismatches,
    statusLabel: ok ? 'Artifact hash verified' : 'Artifact integrity failed',
  }
}

export function loadCertifiedCtArtifacts(): CtArtifactLoadResult {
  const deployOrder = [...(certified.deployOrder || [CT_FACTORY_CONTRACT])]
  const raw = certified.artifacts
  const invalidReasons: string[] = []
  const artifacts: Record<string, CtArtifactRecord> = {}
  const statusLabels: string[] = ['Certified artifact loaded']

  if (!raw || !deployOrder.length) {
    return {
      status: 'ARTIFACTS_INVALID',
      deployOrder,
      artifacts,
      invalidReasons: ['certified Create Token package empty'],
      artifactVersion: certified.artifactVersion || 'unknown',
      sourceCommit: certified.sourceCommit || 'unknown',
      treasury: FOUNDER_TREASURY_DESTINATION,
      creationFeeWei: CREATE_TOKEN_CREATION_FEE_WEI,
      deployer: AUTHORIZED_MELEGA_DEPLOYER,
      immutableByteRanges: certified.immutableByteRanges || [],
      statusLabels: ['Artifact integrity failed'],
    }
  }

  for (const name of deployOrder) {
    const gate = assessCtArtifactIntegrity(raw[name], name)
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
    creationFeeWei: String(certified.creationFeeWei || CREATE_TOKEN_CREATION_FEE_WEI),
    deployer: AUTHORIZED_MELEGA_DEPLOYER,
    immutableByteRanges: certified.immutableByteRanges || [],
    statusLabels,
  }
}
