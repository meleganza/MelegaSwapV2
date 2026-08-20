import { defaultAbiCoder } from '@ethersproject/abi'
import { keccak256 } from '@ethersproject/keccak256'
import { toUtf8Bytes } from '@ethersproject/strings'
import { computeFeeAmountRaw, evaluateRevenuePolicy } from './evaluateRevenuePolicy'
import { PROTOCOL_FEE_STATE } from './fee'
import { CANONICAL_SMARTSWAP_FEE_BENEFICIARY } from './feeEnforcement'
import { SMARTSWAP_REVENUE_POLICY_V1 } from './revenuePolicy'

export const INTENT_VERSION = 1 as const
export const NATIVE_FEE_ASSET = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' as const
export const POLICY_ID_HASH = keccak256(toUtf8Bytes('SMARTSWAP_REVENUE_POLICY_V1'))
export const POLICY_VERSION_HASH = keccak256(toUtf8Bytes('1.0.0'))

export function venueIdHash(venueId: string): string {
  return keccak256(toUtf8Bytes(venueId))
}

export function authorizedSmartSwapFeeBps(structuralRouteCostBps: number): number {
  const assessment = evaluateRevenuePolicy({
    structuralRouteCostBps,
    swapValueNormalized: 1,
    inputAmountRaw: '1',
    feeEnforcementState: PROTOCOL_FEE_STATE.FEE_PREVIEW_ONLY,
  })
  if (assessment.feeBps == null) throw new Error('ROUTE_COST_UNCERTIFIED')
  return assessment.feeBps
}

export interface ExecutionIntent {
  version: typeof INTENT_VERSION
  policyId: string
  policyVersion: string
  chainId: number
  user: string
  inputAsset: string
  outputAsset: string
  inputAmount: string
  minUserOut: string
  venueId: string
  router: string
  routeHash: string
  feeBps: number
  feeAmount: string
  feeAsset: string
  beneficiary: string
  structuralRouteCostBps: number
  deadline: number
  nonce: string
  nativeIn: boolean
  nativeOut: boolean
  engineSeal: string
}

export function routeHashOf(path: string[], nativeIn: boolean, nativeOut: boolean): string {
  return keccak256(defaultAbiCoder.encode(['address[]', 'bool', 'bool'], [path, nativeIn, nativeOut]))
}

export function hashExecutionIntent(intent: Omit<ExecutionIntent, 'engineSeal'>): string {
  return keccak256(
    defaultAbiCoder.encode(
      [
        'uint256',
        'bytes32',
        'bytes32',
        'uint256',
        'address',
        'address',
        'address',
        'uint256',
        'uint256',
        'bytes32',
        'address',
        'bytes32',
        'uint16',
        'uint256',
        'address',
        'address',
        'uint256',
        'uint256',
        'uint256',
        'bool',
        'bool',
      ],
      [
        intent.version,
        POLICY_ID_HASH,
        POLICY_VERSION_HASH,
        intent.chainId,
        intent.user,
        intent.inputAsset,
        intent.outputAsset,
        intent.inputAmount,
        intent.minUserOut,
        venueIdHash(intent.venueId),
        intent.router,
        intent.routeHash,
        intent.feeBps,
        intent.feeAmount,
        intent.feeAsset,
        intent.beneficiary,
        intent.structuralRouteCostBps,
        intent.deadline,
        intent.nonce,
        intent.nativeIn,
        intent.nativeOut,
      ],
    ),
  )
}

export function sealExecutionIntent(input: {
  chainId: number
  user: string
  inputAsset: string
  outputAsset: string
  inputAmount: string
  minUserOut: string
  venueId: string
  router: string
  path: string[]
  structuralRouteCostBps: number
  deadline: number
  nonce: string
  nativeIn: boolean
  nativeOut: boolean
  /** Rejected if provided. Fee is derived from policy only. */
  feeBpsOverride?: number
  beneficiaryOverride?: string
}): ExecutionIntent {
  if (input.feeBpsOverride != null) throw new Error('FEE_BYPASS_REJECTED')
  if (input.beneficiaryOverride && input.beneficiaryOverride.toLowerCase() !== CANONICAL_SMARTSWAP_FEE_BENEFICIARY.toLowerCase()) {
    throw new Error('FEE_BENEFICIARY_NOT_CANONICAL')
  }
  const feeBps = authorizedSmartSwapFeeBps(input.structuralRouteCostBps)
  if (feeBps <= 0 || feeBps > SMARTSWAP_REVENUE_POLICY_V1.maxProtocolFeeBps) throw new Error('FEE_BYPASS_REJECTED')
  const feeAmount = computeFeeAmountRaw(input.inputAmount, feeBps)
  const feeAsset = input.nativeIn ? NATIVE_FEE_ASSET : input.inputAsset
  const unsigned: Omit<ExecutionIntent, 'engineSeal'> = {
    version: INTENT_VERSION,
    policyId: SMARTSWAP_REVENUE_POLICY_V1.id,
    policyVersion: SMARTSWAP_REVENUE_POLICY_V1.version,
    chainId: input.chainId,
    user: input.user.toLowerCase(),
    inputAsset: input.inputAsset.toLowerCase(),
    outputAsset: input.outputAsset.toLowerCase(),
    inputAmount: input.inputAmount,
    minUserOut: input.minUserOut,
    venueId: input.venueId,
    router: input.router.toLowerCase(),
    routeHash: routeHashOf(input.path, input.nativeIn, input.nativeOut),
    feeBps,
    feeAmount,
    feeAsset: feeAsset.toLowerCase(),
    beneficiary: CANONICAL_SMARTSWAP_FEE_BENEFICIARY.toLowerCase(),
    structuralRouteCostBps: input.structuralRouteCostBps,
    deadline: input.deadline,
    nonce: input.nonce,
    nativeIn: input.nativeIn,
    nativeOut: input.nativeOut,
  }
  return { ...unsigned, engineSeal: hashExecutionIntent(unsigned) }
}

export function assertExecutionIntent(intent: ExecutionIntent, nowTs: number, expectedChainId: number): void {
  if (nowTs > intent.deadline) throw new Error('EXPIRED_INTENT')
  if (intent.chainId !== expectedChainId) throw new Error('WRONG_CHAIN')
  if (intent.beneficiary.toLowerCase() !== CANONICAL_SMARTSWAP_FEE_BENEFICIARY.toLowerCase()) {
    throw new Error('WRONG_BENEFICIARY')
  }
  if (intent.version !== INTENT_VERSION || intent.policyId !== SMARTSWAP_REVENUE_POLICY_V1.id) {
    throw new Error('WRONG_POLICY')
  }
  if (intent.policyVersion !== SMARTSWAP_REVENUE_POLICY_V1.version) throw new Error('WRONG_POLICY')
  if (intent.feeBps === 0) throw new Error('FEE_BYPASS_REJECTED')
  if (intent.feeBps > SMARTSWAP_REVENUE_POLICY_V1.maxProtocolFeeBps) throw new Error('FEE_ABOVE_MAX')
  const expectedBps = authorizedSmartSwapFeeBps(intent.structuralRouteCostBps)
  if (intent.feeBps !== expectedBps) throw new Error('WRONG_FEE')
  if (intent.feeAmount !== computeFeeAmountRaw(intent.inputAmount, expectedBps)) throw new Error('WRONG_FEE')
  const { engineSeal, ...unsigned } = intent
  if (hashExecutionIntent(unsigned) !== engineSeal) throw new Error('INTENT_SEAL_MISMATCH')
}

export const EXECUTION_INTENT_TRUST = {
  mechanism: 'repository-native keccak seal + on-chain engine ECDSA',
  engineSigner: 'Designated SmartSwap intentSigner. Compromised frontend cannot alter fee without this key.',
  user: 'msg.sender must equal intent.user. Token approval is separate ERC-20 mechanics.',
  eip712: 'Not required. abi.encode + eth_sign is the contract digest.',
} as const
