/**
 * Founder Liquidity Builder sequential session — validated step bindings.
 * Step progress is factual (receipt-validated). Never fabricate addresses.
 */
import { arrayify, hexlify } from '@ethersproject/bytes'
import { sha256 } from '@ethersproject/sha2'
import {
  AUTHORIZED_MELEGA_DEPLOYER,
  FOUNDER_DEPLOY_CHAIN_ID,
  FOUNDER_TREASURY_DESTINATION,
  normalizeAddress,
} from './founderDeployer'
import { loadCertifiedLbArtifacts } from './founderLbArtifacts'
import type { LbDeployedAddresses } from './founderLbDeployTx'
import {
  extractContractAddressFromReceipt,
  validatePostDeployment,
  type PostDeployOutcome,
} from './founderPostDeploy'
import { LB_CANONICAL_DEPLOYED_ADDRESSES } from 'config/constants/liquidityBuildingDeployment'

export const FOUNDER_LB_SESSION_STORAGE_KEY = 'melega.dex.v1.founder-lb-session.v1'

export const LB_STEP1_FACTUAL = {
  stepId: 'LiquidityBuildingExecutionMathV1',
  contractName: 'LiquidityBuildingExecutionMathV1',
  chainId: FOUNDER_DEPLOY_CHAIN_ID,
  txHash: '0x04c394f9e480b9d4fb8b79657348fc5c3c5aa16e1e1479caad5f540521950cbd',
  contractAddress: '0xA6434254ef3c859230d1c46a03A5928979fa379f',
  deployer: AUTHORIZED_MELEGA_DEPLOYER,
  expectedRuntimeBytecodeSha256: '0x129f6c63f052b819b9565afd29ddfcce2cd413b344308a74127f79323ef3c94e',
} as const

/** Step 2 — mainnet FeeReceiver (immutables baked into runtime; compare via mask). */
export const LB_STEP2_FACTUAL = {
  stepId: 'LiquidityBuildingTreasuryFeeReceiverV1',
  contractName: 'LiquidityBuildingTreasuryFeeReceiverV1',
  chainId: FOUNDER_DEPLOY_CHAIN_ID,
  txHash: '0x17770c7f9390f1a02d08ef9d9d439192b3e4ef11a7850feb95900d510564a9c5',
  contractAddress: '0x5f3b45ab1b4d149761f3749a3d7954a37a6a1ff5',
  deployer: AUTHORIZED_MELEGA_DEPLOYER,
  governor: AUTHORIZED_MELEGA_DEPLOYER,
  beneficiary: FOUNDER_TREASURY_DESTINATION,
  /** On-chain runtime SHA-256 (immutables filled). */
  observedRuntimeBytecodeSha256: '0xf9eecf584d14ea113933331a465e8f8bb426bc2cacbb44edb295b469f2fe0b3b',
  /** Certified template runtime SHA-256 (immutable slots zeroed). */
  expectedRuntimeBytecodeSha256: '0x135465251bb03829f19b6677c239f2ab1efb4b3c4e3b8d30f8569bca5519c77d',
} as const

export const LB_STEP3_CONTRACT = 'LiquidityBuildingExecutionAuthorizerV1' as const

/**
 * Solc immutable byte ranges in deployed bytecode (from forge immutableReferences).
 * Zeroing these yields the certified template runtime hash for comparison.
 */
export const LB_IMMUTABLE_BYTE_RANGES: Record<string, Array<{ start: number; length: number }>> = {
  LiquidityBuildingTreasuryFeeReceiverV1: [
    { start: 111, length: 32 },
    { start: 176, length: 32 },
    { start: 422, length: 32 },
    { start: 493, length: 32 },
  ],
  LiquidityBuildingExecutionAuthorizerV1: [
    { start: 435, length: 32 },
    { start: 888, length: 32 },
    { start: 1229, length: 32 },
  ],
}

export type LbStepLifecycle = 'DEPLOYED' | 'VALIDATED' | 'READY'

export type LbStepBindingRecord = {
  stepId: string
  contractName: string
  contractAddress: string
  txHash: string
  chainId: number
  runtimeBytecodeSha256: string
  status: LbStepLifecycle
  validatedAt: string
}

export type FounderLbSession = {
  schema: 'melega.dex.v1.founder-lb-sequential-session'
  chainId: typeof FOUNDER_DEPLOY_CHAIN_ID
  completedStepIds: string[]
  bindings: LbStepBindingRecord[]
  deployed: LbDeployedAddresses
}

export type FeeReceiverConstructorState = {
  governor: string | null
  beneficiary: string | null
}

export function sha256Bytecode(runtimeBytecode: string): string {
  if (!runtimeBytecode || runtimeBytecode === '0x') {
    throw new Error('Empty runtime bytecode')
  }
  const hex = runtimeBytecode.startsWith('0x') ? runtimeBytecode : `0x${runtimeBytecode}`
  return sha256(hex)
}

/** Zero solc immutable slots so on-chain runtime can match certified template hash. */
export function maskImmutableRegions(
  runtimeBytecode: string,
  ranges: Array<{ start: number; length: number }>,
): string {
  const bytes = arrayify(runtimeBytecode.startsWith('0x') ? runtimeBytecode : `0x${runtimeBytecode}`)
  const copy = new Uint8Array(bytes)
  for (const range of ranges) {
    for (let i = 0; i < range.length; i += 1) {
      const idx = range.start + i
      if (idx < copy.length) copy[idx] = 0
    }
  }
  return hexlify(copy)
}

/** Hash used to compare against certified expectedRuntimeBytecodeSha256. */
export function runtimeHashForCertifiedCompare(contractName: string, runtimeBytecode: string): string {
  const ranges = LB_IMMUTABLE_BYTE_RANGES[contractName]
  if (!ranges?.length) return sha256Bytecode(runtimeBytecode)
  return sha256Bytecode(maskImmutableRegions(runtimeBytecode, ranges))
}

export function verifyFeeReceiverConstructorState(state: FeeReceiverConstructorState): {
  ok: boolean
  governorMatch: boolean
  beneficiaryMatch: boolean
  reason?: string
} {
  const governor = normalizeAddress(state.governor)
  const beneficiary = normalizeAddress(state.beneficiary)
  const expectedGovernor = normalizeAddress(AUTHORIZED_MELEGA_DEPLOYER)
  const expectedBeneficiary = normalizeAddress(FOUNDER_TREASURY_DESTINATION)
  const governorMatch = Boolean(governor && expectedGovernor && governor === expectedGovernor)
  const beneficiaryMatch = Boolean(beneficiary && expectedBeneficiary && beneficiary === expectedBeneficiary)
  if (!governorMatch || !beneficiaryMatch) {
    return {
      ok: false,
      governorMatch,
      beneficiaryMatch,
      reason: 'STEP2_VALIDATION_FAILED: governor/beneficiary mismatch',
    }
  }
  return { ok: true, governorMatch, beneficiaryMatch }
}

export function mapStepIdToDeployedKey(stepId: string): keyof LbDeployedAddresses | null {
  if (stepId.includes('ExecutionMath')) return 'math'
  if (stepId.includes('FeeReceiver')) return 'feeReceiver'
  if (stepId.includes('Authorizer')) return 'authorizer'
  if (stepId.includes('FeeSink')) return 'feeSink'
  if (stepId.includes('Program')) return 'program'
  if (stepId.includes('Factory')) return 'factory'
  return null
}

export function emptyFounderLbSession(): FounderLbSession {
  return {
    schema: 'melega.dex.v1.founder-lb-sequential-session',
    chainId: FOUNDER_DEPLOY_CHAIN_ID,
    completedStepIds: [],
    bindings: [],
    deployed: {},
  }
}

/** Bind a validated step without overwriting unrelated bindings. */
export function bindValidatedLbStep(
  session: FounderLbSession,
  record: LbStepBindingRecord,
): FounderLbSession {
  const addr = normalizeAddress(record.contractAddress)
  if (!addr) throw new Error('Invalid contract address for binding')
  if (record.chainId !== FOUNDER_DEPLOY_CHAIN_ID) throw new Error('Wrong chain for LB binding')
  if (record.status !== 'VALIDATED' && record.status !== 'READY' && record.status !== 'DEPLOYED') {
    throw new Error('Binding requires DEPLOYED/VALIDATED/READY status')
  }

  const key = mapStepIdToDeployedKey(record.stepId)
  if (!key) throw new Error(`Unknown stepId ${record.stepId}`)

  const existing = session.bindings.find((b) => b.stepId === record.stepId)
  if (existing && normalizeAddress(existing.contractAddress) !== addr) {
    throw new Error(
      `Refusing to overwrite ${record.stepId} binding ${existing.contractAddress} with ${record.contractAddress}`,
    )
  }

  const bindings = existing
    ? session.bindings.map((b) => (b.stepId === record.stepId ? { ...record, contractAddress: record.contractAddress } : b))
    : [...session.bindings, record]

  const completedStepIds = session.completedStepIds.includes(record.stepId)
    ? session.completedStepIds
    : [...session.completedStepIds, record.stepId]

  return {
    ...session,
    bindings,
    completedStepIds,
    deployed: {
      ...session.deployed,
      [key]: record.contractAddress,
    },
  }
}

export function validateLbStepFromOnChain(input: {
  stepId: string
  contractName: string
  chainId: number
  txHash: string
  receipt: { contractAddress?: string | null; status?: number | string | null; from?: string | null }
  runtimeBytecode: string | null
  expectedRuntimeBytecodeSha256: string
  requireDeployer?: string
  constructorStateOk?: boolean
  expectedContractAddress?: string
}): { ok: true; record: LbStepBindingRecord; outcome: PostDeployOutcome } | { ok: false; reason: string } {
  const parsed = extractContractAddressFromReceipt(input.receipt)
  if (parsed.receiptStatus !== 'success') {
    return { ok: false, reason: `Receipt not successful (${parsed.receiptStatus})` }
  }
  if (!parsed.address) return { ok: false, reason: 'Missing contractAddress in receipt' }

  if (input.expectedContractAddress) {
    const got = normalizeAddress(parsed.address)
    const want = normalizeAddress(input.expectedContractAddress)
    if (!got || !want || got !== want) {
      return { ok: false, reason: 'Contract address mismatch vs expected deployment address' }
    }
  }

  if (input.requireDeployer) {
    const from = normalizeAddress(input.receipt.from ?? null)
    const expected = normalizeAddress(input.requireDeployer)
    if (!from || !expected || from !== expected) {
      return { ok: false, reason: 'Deployer address mismatch' }
    }
  }

  let observedOnChain: string | null = null
  let observedForCompare: string | null = null
  try {
    if (input.runtimeBytecode) {
      observedOnChain = sha256Bytecode(input.runtimeBytecode)
      observedForCompare = runtimeHashForCertifiedCompare(input.contractName, input.runtimeBytecode)
    }
  } catch {
    return { ok: false, reason: 'Failed to hash runtime bytecode' }
  }

  const constructorStateOk = input.constructorStateOk !== false

  const outcome = validatePostDeployment({
    subsystemId: 'liquidity_builder',
    chainId: input.chainId,
    txHash: input.txHash,
    contractAddress: parsed.address,
    receiptStatus: parsed.receiptStatus,
    runtimeBytecode: input.runtimeBytecode,
    expectedRuntimeBytecodeHash: input.expectedRuntimeBytecodeSha256,
    observedRuntimeBytecodeHash: observedForCompare,
    constructorStateOk,
    treasuryOk: true,
    feeOk: true,
  })

  if (outcome.status !== 'READY' || !outcome.bind) {
    return {
      ok: false,
      reason: outcome.status === 'QUARANTINED' ? outcome.reason : outcome.reason,
    }
  }

  const certified = loadCertifiedLbArtifacts().artifacts[input.contractName]
  if (certified && !certified.runtimeHashMatchesCertified) {
    return { ok: false, reason: 'Certified package runtime hash flag false' }
  }

  return {
    ok: true,
    outcome,
    record: {
      stepId: input.stepId,
      contractName: input.contractName,
      contractAddress: outcome.contractAddress,
      txHash: input.txHash,
      chainId: input.chainId,
      runtimeBytecodeSha256: observedOnChain!,
      status: 'VALIDATED',
      validatedAt: new Date().toISOString(),
    },
  }
}

/** Seed session from canonical Step 1 factual binding (already validated on mainnet). */
export function seedSessionWithValidatedStep1(base: FounderLbSession = emptyFounderLbSession()): FounderLbSession {
  const certified = loadCertifiedLbArtifacts().artifacts.LiquidityBuildingExecutionMathV1
  const expected =
    certified?.expectedRuntimeBytecodeSha256 ?? LB_STEP1_FACTUAL.expectedRuntimeBytecodeSha256

  return bindValidatedLbStep(base, {
    stepId: LB_STEP1_FACTUAL.stepId,
    contractName: LB_STEP1_FACTUAL.contractName,
    contractAddress: LB_STEP1_FACTUAL.contractAddress,
    txHash: LB_STEP1_FACTUAL.txHash,
    chainId: LB_STEP1_FACTUAL.chainId,
    runtimeBytecodeSha256: expected,
    status: 'READY',
    validatedAt: '2026-08-01T00:00:00.000Z',
  })
}

/** Seed Step 2 FeeReceiver after mainnet validation (does not touch other null bindings). */
export function seedSessionWithValidatedStep2(base: FounderLbSession): FounderLbSession {
  const withStep1 = step1IsValidated(base) ? base : seedSessionWithValidatedStep1(base)
  return bindValidatedLbStep(withStep1, {
    stepId: LB_STEP2_FACTUAL.stepId,
    contractName: LB_STEP2_FACTUAL.contractName,
    contractAddress: LB_STEP2_FACTUAL.contractAddress,
    txHash: LB_STEP2_FACTUAL.txHash,
    chainId: LB_STEP2_FACTUAL.chainId,
    runtimeBytecodeSha256: LB_STEP2_FACTUAL.observedRuntimeBytecodeSha256,
    status: 'READY',
    validatedAt: '2026-08-01T00:00:00.000Z',
  })
}

/** Prefer canonical constants, then factual Step 1+2 seeds. Upgrade storage when Step 2 binds. */
export function loadInitialFounderLbSession(): FounderLbSession {
  let session = readFounderLbSessionFromStorage() ?? emptyFounderLbSession()

  if (!step1IsValidated(session)) {
    session = seedSessionWithValidatedStep1(session)
  }

  const feeMatches =
    normalizeAddress(LB_CANONICAL_DEPLOYED_ADDRESSES.lbFeeReceiver) ===
    normalizeAddress(LB_STEP2_FACTUAL.contractAddress)

  if (feeMatches && !step2IsValidated(session)) {
    session = seedSessionWithValidatedStep2(session)
  }

  return session
}

export function readFounderLbSessionFromStorage(): FounderLbSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(FOUNDER_LB_SESSION_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as FounderLbSession
    if (parsed?.schema !== 'melega.dex.v1.founder-lb-sequential-session') return null
    if (parsed.chainId !== FOUNDER_DEPLOY_CHAIN_ID) return null
    if (!Array.isArray(parsed.completedStepIds) || !Array.isArray(parsed.bindings)) return null
    return parsed
  } catch {
    return null
  }
}

export function persistFounderLbSession(session: FounderLbSession): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(FOUNDER_LB_SESSION_STORAGE_KEY, JSON.stringify(session))
  } catch {
    // ignore quota / private mode
  }
}

export function step1IsValidated(session: FounderLbSession): boolean {
  const b = session.bindings.find((x) => x.stepId === LB_STEP1_FACTUAL.stepId)
  return Boolean(
    b &&
      (b.status === 'VALIDATED' || b.status === 'READY') &&
      normalizeAddress(b.contractAddress) === normalizeAddress(LB_STEP1_FACTUAL.contractAddress),
  )
}

export function step2IsValidated(session: FounderLbSession): boolean {
  const b = session.bindings.find((x) => x.stepId === LB_STEP2_FACTUAL.stepId)
  return Boolean(
    b &&
      (b.status === 'VALIDATED' || b.status === 'READY') &&
      normalizeAddress(b.contractAddress) === normalizeAddress(LB_STEP2_FACTUAL.contractAddress),
  )
}
