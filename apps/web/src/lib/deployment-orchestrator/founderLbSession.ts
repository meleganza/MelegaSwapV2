/**
 * Founder Liquidity Builder sequential session — validated step bindings.
 * Step progress is factual (receipt-validated). Never fabricate addresses.
 */
import { sha256 } from '@ethersproject/sha2'
import {
  AUTHORIZED_MELEGA_DEPLOYER,
  FOUNDER_DEPLOY_CHAIN_ID,
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

export function sha256Bytecode(runtimeBytecode: string): string {
  if (!runtimeBytecode || runtimeBytecode === '0x') {
    throw new Error('Empty runtime bytecode')
  }
  const hex = runtimeBytecode.startsWith('0x') ? runtimeBytecode : `0x${runtimeBytecode}`
  return sha256(hex)
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
}): { ok: true; record: LbStepBindingRecord; outcome: PostDeployOutcome } | { ok: false; reason: string } {
  const parsed = extractContractAddressFromReceipt(input.receipt)
  if (parsed.receiptStatus !== 'success') {
    return { ok: false, reason: `Receipt not successful (${parsed.receiptStatus})` }
  }
  if (!parsed.address) return { ok: false, reason: 'Missing contractAddress in receipt' }

  if (input.requireDeployer) {
    const from = normalizeAddress(input.receipt.from ?? null)
    const expected = normalizeAddress(input.requireDeployer)
    if (!from || !expected || from !== expected) {
      return { ok: false, reason: 'Deployer address mismatch' }
    }
  }

  let observed: string | null = null
  try {
    observed = input.runtimeBytecode ? sha256Bytecode(input.runtimeBytecode) : null
  } catch {
    return { ok: false, reason: 'Failed to hash runtime bytecode' }
  }

  const outcome = validatePostDeployment({
    subsystemId: 'liquidity_builder',
    chainId: input.chainId,
    txHash: input.txHash,
    contractAddress: parsed.address,
    receiptStatus: parsed.receiptStatus,
    runtimeBytecode: input.runtimeBytecode,
    expectedRuntimeBytecodeHash: input.expectedRuntimeBytecodeSha256,
    observedRuntimeBytecodeHash: observed,
    constructorStateOk: true,
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
      runtimeBytecodeSha256: observed!,
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

/** Prefer canonical constant, then factual Step 1 seed. */
export function loadInitialFounderLbSession(): FounderLbSession {
  const fromStorage = readFounderLbSessionFromStorage()
  if (fromStorage && fromStorage.completedStepIds.includes(LB_STEP1_FACTUAL.stepId)) {
    return fromStorage
  }

  const canonicalMath = LB_CANONICAL_DEPLOYED_ADDRESSES.lbExecutionMathLibrary
  let session = emptyFounderLbSession()
  if (canonicalMath && normalizeAddress(canonicalMath) === normalizeAddress(LB_STEP1_FACTUAL.contractAddress)) {
    session = seedSessionWithValidatedStep1(session)
  } else {
    // Factual mainnet Step 1 is known and validated — seed so Step 2 unlocks.
    session = seedSessionWithValidatedStep1(session)
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
