/**
 * Founder-signed browser deployment operational states.
 */

import type { FounderDeployGateResult } from './founderDeployer'
import type { FounderGasReadiness, GasEstimateStatus } from './founderGasReadiness'

export type FounderOperationalState =
  | 'CONNECT_WALLET'
  | 'WRONG_WALLET'
  | 'WRONG_CHAIN'
  | 'ARTIFACTS_LOADING'
  | 'ARTIFACTS_INVALID'
  | 'GAS_ESTIMATE_PENDING'
  | 'GAS_ESTIMATE_UNAVAILABLE'
  | 'FUNDING_REQUIRED'
  | 'READY_TO_DEPLOY'
  | 'AWAITING_SIGNATURE'
  | 'TRANSACTION_SUBMITTED'
  | 'CONFIRMING'
  | 'VALIDATING'
  | 'BINDING'
  | 'READY'
  | 'DEPLOYMENT_FAILED'
  | 'QUARANTINED'

export const FORBIDDEN_SERVER_AUTHORITY_PHRASES = [
  'Production authority missing',
  'Provide production deployment authority',
  'Missing KMS',
  'Missing MAINNET_DEPLOYER',
  'Missing server deploy authorization',
  'No deployer credentials authorized',
] as const

export function containsForbiddenServerAuthorityWording(text: string): boolean {
  const t = text.toLowerCase()
  return FORBIDDEN_SERVER_AUTHORITY_PHRASES.some((p) => t.includes(p.toLowerCase()))
}

export function resolveFounderOperationalState(input: {
  gates: FounderDeployGateResult
  gas: FounderGasReadiness
  artifactStatus?: 'ARTIFACTS_LOADING' | 'ARTIFACTS_VALID' | 'ARTIFACTS_INVALID'
  signaturePending?: boolean
  transactionSubmitted?: boolean
  confirming?: boolean
  validating?: boolean
  binding?: boolean
  failed?: boolean
  quarantined?: boolean
  subsystemReadyComplete?: boolean
}): FounderOperationalState {
  if (input.failed) return 'DEPLOYMENT_FAILED'
  if (input.quarantined) return 'QUARANTINED'
  if (input.binding) return 'BINDING'
  if (input.validating) return 'VALIDATING'
  if (input.confirming) return 'CONFIRMING'
  if (input.transactionSubmitted) return 'TRANSACTION_SUBMITTED'
  if (input.signaturePending) return 'AWAITING_SIGNATURE'
  if (input.subsystemReadyComplete) return 'READY'

  const { gates, gas } = input
  if (gates.codes.includes('WALLET_DISCONNECTED')) return 'CONNECT_WALLET'
  if (gates.codes.includes('WRONG_WALLET')) return 'WRONG_WALLET'
  if (gates.codes.includes('WRONG_CHAIN')) return 'WRONG_CHAIN'

  if (input.artifactStatus === 'ARTIFACTS_LOADING') return 'ARTIFACTS_LOADING'
  if (input.artifactStatus === 'ARTIFACTS_INVALID' || gates.codes.includes('ARTIFACT_INVALID')) {
    return 'ARTIFACTS_INVALID'
  }

  // Never infer FUNDING from null/pending/unavailable estimates.
  if (gas.estimateStatus === 'pending') return 'GAS_ESTIMATE_PENDING'
  if (gas.estimateStatus === 'unavailable') return 'GAS_ESTIMATE_UNAVAILABLE'

  if (gas.pauseCode === 'FOUNDER_DEPLOYER_FUNDING_REQUIRED') {
    return 'FUNDING_REQUIRED'
  }

  if (
    gates.codes.includes('AUTHORIZED_DEPLOYER_MATCH') &&
    gates.codes.includes('CHAIN_56') &&
    gas.estimateStatus === 'ready' &&
    gas.fundingSufficient === true &&
    input.artifactStatus === 'ARTIFACTS_VALID'
  ) {
    return 'READY_TO_DEPLOY'
  }

  if (gates.codes.includes('AUTHORIZED_DEPLOYER_MATCH') && gates.codes.includes('CHAIN_56')) {
    if (gas.estimateStatus === 'ready' && gas.fundingSufficient == null) return 'READY_TO_DEPLOY'
  }

  return 'CONNECT_WALLET'
}

export function gasStatusToUi(status: GasEstimateStatus): FounderOperationalState {
  if (status === 'pending') return 'GAS_ESTIMATE_PENDING'
  if (status === 'unavailable') return 'GAS_ESTIMATE_UNAVAILABLE'
  return 'READY_TO_DEPLOY'
}

export const DEPLOY_BUTTON_LABEL: Record<
  'liquidity_builder' | 'create_token' | 'public_farm_factory',
  string
> = {
  liquidity_builder: 'Deploy Liquidity Builder',
  create_token: 'Deploy Create Token Factory',
  public_farm_factory: 'Deploy Public Farm Factory',
}

/** Liquidity Builder permanent package labels (script order + ExecutionMath prelude). */
export const LB_DEPLOYMENT_TX_STEPS = [
  { id: 'LiquidityBuildingExecutionMathV1', contractName: 'LiquidityBuildingExecutionMathV1', phase: 'Prepare Transaction' },
  { id: 'LiquidityBuildingTreasuryFeeReceiverV1', contractName: 'LiquidityBuildingTreasuryFeeReceiverV1', phase: 'Prepare Transaction' },
  { id: 'LiquidityBuildingExecutionAuthorizerV1', contractName: 'LiquidityBuildingExecutionAuthorizerV1', phase: 'Prepare Transaction' },
  { id: 'LiquidityBuildingTreasuryFeeSinkV1', contractName: 'LiquidityBuildingTreasuryFeeSinkV1', phase: 'Prepare Transaction' },
  { id: 'LiquidityBuildingProgramV1', contractName: 'LiquidityBuildingProgramV1', phase: 'Prepare Transaction' },
  { id: 'LiquidityBuildingFactoryV1', contractName: 'LiquidityBuildingFactoryV1', phase: 'Prepare Transaction' },
] as const

export type LbTxStepPhase =
  | 'Prepare Transaction'
  | 'Review in Wallet'
  | 'Awaiting Signature'
  | 'Transaction Submitted'
  | 'Confirming'
  | 'Validated'
  | 'Bound'
  | 'Ready'
