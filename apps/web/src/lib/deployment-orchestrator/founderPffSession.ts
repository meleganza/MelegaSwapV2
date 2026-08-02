/**
 * Public Farm Factory post-deploy validation + bind session.
 * Bind only after receipt success + runtime hash + constructor state checks.
 * Never fabricate factoryAddress into SSOT from this session alone.
 */

import { Interface } from '@ethersproject/abi'
import { sha256 } from '@ethersproject/sha2'
import {
  PUBLIC_FARM_ELIGIBILITY_SIGNER,
  PUBLIC_FARM_FACTORY_FEE_RECIPIENT,
  PUBLIC_FARM_MARCO_TOKEN,
  PUBLIC_FARM_PAIR_FACTORY,
  isPublicFarmFactoryBound,
} from 'config/constants/publicFarmFactoryDeployment'
import { AUTHORIZED_MELEGA_DEPLOYER, FOUNDER_TREASURY_DESTINATION } from './founderDeployer'
import { loadCertifiedPffArtifacts, PFF_FACTORY_ALIAS, PFF_FACTORY_CONTRACT } from './founderPffArtifacts'
import { runtimeHashForPffCertifiedCompare, verifyPffConstructorArgs } from './founderPffDeployTx'

export type PffDeploymentEvidence = {
  schema: 'melega.public-farm-factory.deployment-evidence.v1'
  chainId: 56
  contractAlias: typeof PFF_FACTORY_ALIAS
  contractName: typeof PFF_FACTORY_CONTRACT
  txHash: string
  nonce: number | null
  from: string | null
  contractAddress: string
  blockNumber: number | null
  gasUsed: string | null
  receiptStatus: 'success' | 'failed' | 'unknown'
  runtimeBytecodeSha256: string
  runtimeHashMatchesCertified: boolean
  treasury: string | null
  marcoToken: string | null
  pairFactory: string | null
  eligibilitySigner: string | null
  constructorStateOk: boolean
  validatedAt: string
  status: 'VALIDATED' | 'QUARANTINED'
  quarantineReason?: string
}

export type PffBindRecord = {
  factoryAddress: string
  deploymentTx: string
  deploymentBlock: number | null
  verified: true
  status: 'DEPLOYED_VALIDATED_SESSION_BOUND'
  boundAt: string
  evidence: PffDeploymentEvidence
}

let sessionEvidence: PffDeploymentEvidence | null = null
let sessionBound: PffBindRecord | null = null

export function resetPffSession(): void {
  sessionEvidence = null
  sessionBound = null
}

export function getPffSessionEvidence(): PffDeploymentEvidence | null {
  return sessionEvidence
}

export function getPffSessionBound(): PffBindRecord | null {
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

export const PFF_FACTORY_VIEW_IFACE = new Interface([
  'function treasury() view returns (address)',
  'function marcoToken() view returns (address)',
  'function pairFactory() view returns (address)',
  'function eligibilitySigner() view returns (address)',
])

export function encodePffTreasuryCall(): string {
  return PFF_FACTORY_VIEW_IFACE.encodeFunctionData('treasury', [])
}
export function encodePffMarcoTokenCall(): string {
  return PFF_FACTORY_VIEW_IFACE.encodeFunctionData('marcoToken', [])
}
export function encodePffPairFactoryCall(): string {
  return PFF_FACTORY_VIEW_IFACE.encodeFunctionData('pairFactory', [])
}
export function encodePffEligibilitySignerCall(): string {
  return PFF_FACTORY_VIEW_IFACE.encodeFunctionData('eligibilitySigner', [])
}

export function decodePffAddress(fn: 'treasury' | 'marcoToken' | 'pairFactory' | 'eligibilitySigner', result: string): string {
  const [addr] = PFF_FACTORY_VIEW_IFACE.decodeFunctionResult(fn, result)
  return String(addr)
}

export function validatePffFactoryFromOnChain(input: {
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
  treasuryOnChain?: string | null
  marcoTokenOnChain?: string | null
  pairFactoryOnChain?: string | null
  eligibilitySignerOnChain?: string | null
}): { ok: true; evidence: PffDeploymentEvidence } | { ok: false; reason: string; evidence: PffDeploymentEvidence } {
  const status = receiptStatusOf(input.receipt.status)
  const contractAddress = normalizeAddress(input.receipt.contractAddress ?? null)
  const from = normalizeAddress(input.receipt.from ?? null)
  const deployer = normalizeAddress(AUTHORIZED_MELEGA_DEPLOYER)
  const certified = loadCertifiedPffArtifacts().artifacts[PFF_FACTORY_CONTRACT]
  const expectedRuntime = certified?.expectedRuntimeBytecodeSha256 ?? ''

  let runtimeHash = ''
  try {
    runtimeHash = runtimeHashForPffCertifiedCompare(input.runtimeBytecode)
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

  const constructorCheck = verifyPffConstructorArgs({
    treasury: input.treasuryOnChain ?? '',
    marcoToken: input.marcoTokenOnChain ?? '',
    pairFactory: input.pairFactoryOnChain ?? '',
    eligibilitySigner: input.eligibilitySignerOnChain ?? '',
  })

  const checks = {
    receiptSuccess: status === 'success',
    contractAddressPresent: Boolean(contractAddress),
    deployerMatch: Boolean(from && deployer && from === deployer),
    runtimeHashMatch: Boolean(
      runtimeHash && expectedRuntime && runtimeHash.toLowerCase() === expectedRuntime.toLowerCase(),
    ),
    constructorStateOk: constructorCheck.ok,
    treasuryCanonical:
      (input.treasuryOnChain ?? '').toLowerCase() === PUBLIC_FARM_FACTORY_FEE_RECIPIENT.toLowerCase() &&
      PUBLIC_FARM_FACTORY_FEE_RECIPIENT.toLowerCase() === FOUNDER_TREASURY_DESTINATION.toLowerCase(),
    marcoMatch: (input.marcoTokenOnChain ?? '').toLowerCase() === PUBLIC_FARM_MARCO_TOKEN.toLowerCase(),
    pairFactoryMatch: (input.pairFactoryOnChain ?? '').toLowerCase() === PUBLIC_FARM_PAIR_FACTORY.toLowerCase(),
    eligibilitySignerMatch:
      (input.eligibilitySignerOnChain ?? '').toLowerCase() === PUBLIC_FARM_ELIGIBILITY_SIGNER.toLowerCase(),
  }

  const ok = Object.values(checks).every(Boolean)
  const evidence: PffDeploymentEvidence = {
    schema: 'melega.public-farm-factory.deployment-evidence.v1',
    chainId: 56,
    contractAlias: PFF_FACTORY_ALIAS,
    contractName: PFF_FACTORY_CONTRACT,
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
    treasury: input.treasuryOnChain ?? null,
    marcoToken: input.marcoTokenOnChain ?? null,
    pairFactory: input.pairFactoryOnChain ?? null,
    eligibilitySigner: input.eligibilitySignerOnChain ?? null,
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
    return { ok: false, reason: evidence.quarantineReason || 'Public Farm Factory validation failed', evidence }
  }
  return { ok: true, evidence }
}

export function bindValidatedPublicFarmFactory(evidence: PffDeploymentEvidence): PffBindRecord {
  if (evidence.status !== 'VALIDATED') {
    throw new Error('Cannot bind quarantined Public Farm Factory evidence')
  }
  if (!/^0x[a-fA-F0-9]{40}$/.test(evidence.contractAddress)) {
    throw new Error('Invalid factory address')
  }
  if (evidence.contractAddress.toLowerCase() === '0x0000000000000000000000000000000000000000') {
    throw new Error('Zero address cannot be bound')
  }
  const record: PffBindRecord = {
    factoryAddress: evidence.contractAddress,
    deploymentTx: evidence.txHash,
    deploymentBlock: evidence.blockNumber,
    verified: true,
    status: 'DEPLOYED_VALIDATED_SESSION_BOUND',
    boundAt: new Date().toISOString(),
    evidence,
  }
  sessionBound = record
  return record
}

export function isPffExecutionAwaitingFounderSignature(): boolean {
  return !isPublicFarmFactoryBound() && sessionBound == null
}
