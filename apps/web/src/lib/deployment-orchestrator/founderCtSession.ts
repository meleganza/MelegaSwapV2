/**
 * Create Token Factory post-deploy validation + bind session.
 * Bind only after receipt success + runtime hash + constructor state checks.
 * Never fabricate factoryAddress.
 */

import { Interface } from '@ethersproject/abi'
import { sha256 } from '@ethersproject/sha2'
import {
  CREATE_TOKEN_CREATION_FEE_WEI,
  CREATE_TOKEN_FEE_RECIPIENT,
  isCreateTokenFactoryBound,
} from 'config/constants/createTokenFactoryDeployment'
import { AUTHORIZED_MELEGA_DEPLOYER, FOUNDER_TREASURY_DESTINATION } from './founderDeployer'
import { CT_FACTORY_ALIAS, CT_FACTORY_CONTRACT, loadCertifiedCtArtifacts } from './founderCtArtifacts'
import { runtimeHashForCtCertifiedCompare, verifyCtConstructorArgs } from './founderCtDeployTx'

export type CtDeploymentEvidence = {
  schema: 'melega.create-token.deployment-evidence.v1'
  chainId: 56
  contractAlias: typeof CT_FACTORY_ALIAS
  contractName: typeof CT_FACTORY_CONTRACT
  txHash: string
  nonce: number | null
  from: string | null
  contractAddress: string
  blockNumber: number | null
  gasUsed: string | null
  receiptStatus: 'success' | 'failed' | 'unknown'
  runtimeBytecodeSha256: string
  runtimeHashMatchesCertified: boolean
  creationFeeWei: string | null
  feeRecipient: string | null
  constructorStateOk: boolean
  validatedAt: string
  status: 'VALIDATED' | 'QUARANTINED'
  quarantineReason?: string
}

export type CtBindRecord = {
  factoryAddress: string
  deploymentTx: string
  deploymentBlock: number | null
  verified: true
  status: 'DEPLOYED_VALIDATED_BOUND_READY'
  boundAt: string
  evidence: CtDeploymentEvidence
}

let sessionEvidence: CtDeploymentEvidence | null = null
let sessionBound: CtBindRecord | null = null

export function resetCtSession(): void {
  sessionEvidence = null
  sessionBound = null
}

export function getCtSessionEvidence(): CtDeploymentEvidence | null {
  return sessionEvidence
}

export function getCtSessionBound(): CtBindRecord | null {
  return sessionBound
}

function normalizeAddress(value: string | null | undefined): string | null {
  if (!value || !/^0x[a-fA-F0-9]{40}$/.test(value)) return null
  return value.toLowerCase()
}

function receiptStatusOf(status: string | number | null | undefined): 'success' | 'failed' | 'unknown' {
  if (status === 1 || status === '0x1' || status === '1') return 'success'
  if (status === 0 || status === '0x0' || status === '0') return 'failed'
  return 'unknown'
}

/** ABI fragment for post-deploy constructor state reads. */
export const CT_FACTORY_VIEW_IFACE = new Interface([
  'function creationFee() view returns (uint256)',
  'function feeRecipient() view returns (address)',
])

export function encodeCtCreationFeeCall(): string {
  return CT_FACTORY_VIEW_IFACE.encodeFunctionData('creationFee', [])
}

export function encodeCtFeeRecipientCall(): string {
  return CT_FACTORY_VIEW_IFACE.encodeFunctionData('feeRecipient', [])
}

export function decodeCtCreationFee(result: string): string {
  const [fee] = CT_FACTORY_VIEW_IFACE.decodeFunctionResult('creationFee', result)
  return fee.toString()
}

export function decodeCtFeeRecipient(result: string): string {
  const [addr] = CT_FACTORY_VIEW_IFACE.decodeFunctionResult('feeRecipient', result)
  return String(addr)
}

/**
 * Validate Create Token Factory after Founder-signed deploy.
 * Does not bind SSOT — caller must invoke bindValidatedCreateTokenFactory after ok.
 */
export function validateCtFactoryFromOnChain(input: {
  txHash: string
  nonce?: number | null
  receipt: {
    contractAddress?: string | null
    status?: number | string | null
    from?: string | null
    blockNumber?: string | number | null
    gasUsed?: string | number | null
  }
  runtimeBytecode: string
  creationFeeWeiOnChain?: string | null
  feeRecipientOnChain?: string | null
}): { ok: true; evidence: CtDeploymentEvidence } | { ok: false; reason: string; evidence: CtDeploymentEvidence } {
  const status = receiptStatusOf(input.receipt.status)
  const contractAddress = normalizeAddress(input.receipt.contractAddress ?? null)
  const from = normalizeAddress(input.receipt.from ?? null)
  const deployer = normalizeAddress(AUTHORIZED_MELEGA_DEPLOYER)
  const certified = loadCertifiedCtArtifacts().artifacts[CT_FACTORY_CONTRACT]
  const expectedRuntime = certified?.expectedRuntimeBytecodeSha256 ?? ''

  let runtimeHash = ''
  try {
    runtimeHash = runtimeHashForCtCertifiedCompare(input.runtimeBytecode)
  } catch {
    runtimeHash = ''
  }

  const blockNumber =
    input.receipt.blockNumber == null
      ? null
      : typeof input.receipt.blockNumber === 'string'
        ? Number.parseInt(input.receipt.blockNumber, 16)
        : Number(input.receipt.blockNumber)

  const gasUsed =
    input.receipt.gasUsed == null
      ? null
      : typeof input.receipt.gasUsed === 'string'
        ? BigInt(input.receipt.gasUsed).toString()
        : String(input.receipt.gasUsed)

  const constructorCheck = verifyCtConstructorArgs({
    feeRecipient: input.feeRecipientOnChain ?? '',
    creationFeeWei: input.creationFeeWeiOnChain ?? '',
  })

  const checks = {
    receiptSuccess: status === 'success',
    contractAddressPresent: Boolean(contractAddress),
    deployerMatch: Boolean(from && deployer && from === deployer),
    runtimeHashMatch: Boolean(
      runtimeHash && expectedRuntime && runtimeHash.toLowerCase() === expectedRuntime.toLowerCase(),
    ),
    constructorStateOk: constructorCheck.ok,
    feeRecipientCanonical:
      (input.feeRecipientOnChain ?? '').toLowerCase() === CREATE_TOKEN_FEE_RECIPIENT.toLowerCase() &&
      CREATE_TOKEN_FEE_RECIPIENT.toLowerCase() === FOUNDER_TREASURY_DESTINATION.toLowerCase(),
    creationFeeMatch: (input.creationFeeWeiOnChain ?? '') === CREATE_TOKEN_CREATION_FEE_WEI,
  }

  const ok = Object.values(checks).every(Boolean)
  const evidence: CtDeploymentEvidence = {
    schema: 'melega.create-token.deployment-evidence.v1',
    chainId: 56,
    contractAlias: CT_FACTORY_ALIAS,
    contractName: CT_FACTORY_CONTRACT,
    txHash: input.txHash,
    nonce: input.nonce ?? null,
    from: input.receipt.from ?? null,
    contractAddress: contractAddress ?? '0x0000000000000000000000000000000000000000',
    blockNumber: Number.isFinite(blockNumber as number) ? (blockNumber as number) : null,
    gasUsed,
    receiptStatus: status,
    runtimeBytecodeSha256: input.runtimeBytecode.startsWith('0x')
      ? sha256(input.runtimeBytecode as `0x${string}`)
      : '',
    runtimeHashMatchesCertified: checks.runtimeHashMatch,
    creationFeeWei: input.creationFeeWeiOnChain ?? null,
    feeRecipient: input.feeRecipientOnChain ?? null,
    constructorStateOk: checks.constructorStateOk,
    validatedAt: new Date().toISOString(),
    status: ok ? 'VALIDATED' : 'QUARANTINED',
    quarantineReason: ok
      ? undefined
      : Object.entries(checks)
          .filter(([, v]) => !v)
          .map(([k]) => k)
          .join(', '),
  }

  sessionEvidence = evidence
  if (!ok) {
    return { ok: false, reason: evidence.quarantineReason || 'Create Token Factory validation failed', evidence }
  }
  return { ok: true, evidence }
}

/**
 * Bind validated CT factory into in-memory session.
 * SSOT file update is an explicit Founder commit after live deploy — never fabricate.
 */
export function bindValidatedCreateTokenFactory(evidence: CtDeploymentEvidence): CtBindRecord {
  if (evidence.status !== 'VALIDATED') {
    throw new Error('Cannot bind quarantined Create Token Factory evidence')
  }
  if (!/^0x[a-fA-F0-9]{40}$/.test(evidence.contractAddress)) {
    throw new Error('Invalid factory address')
  }
  if (evidence.contractAddress.toLowerCase() === '0x0000000000000000000000000000000000000000') {
    throw new Error('Zero address cannot be bound')
  }
  const record: CtBindRecord = {
    factoryAddress: evidence.contractAddress,
    deploymentTx: evidence.txHash,
    deploymentBlock: evidence.blockNumber,
    verified: true,
    status: 'DEPLOYED_VALIDATED_BOUND_READY',
    boundAt: new Date().toISOString(),
    evidence,
  }
  sessionBound = record
  return record
}

/** SSOT patch description for Founder follow-up commit — never auto-writes fabricated addresses. */
export function describeCtSSotBindPatch(record: CtBindRecord): {
  file: string
  factoryAddress: string
  deploymentTx: string
  deploymentBlock: number | null
  status: 'READY'
  verified: true
} {
  return {
    file: 'apps/web/src/config/constants/createTokenFactoryDeployment.ts',
    factoryAddress: record.factoryAddress,
    deploymentTx: record.deploymentTx,
    deploymentBlock: record.deploymentBlock,
    status: 'READY',
    verified: true,
  }
}

export function isCtExecutionAwaitingFounderSignature(): boolean {
  return !isCreateTokenFactoryBound() && sessionBound == null
}
