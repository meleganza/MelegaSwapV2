/**
 * Founder-signed browser deployment operational states.
 * Forbidden: Production authority missing / KMS / MAINNET_DEPLOYER server wording.
 */

import type { FounderDeployGateResult } from './founderDeployer'
import type { FounderGasReadiness } from './founderGasReadiness'

export type FounderOperationalState =
  | 'CONNECT_WALLET'
  | 'WRONG_WALLET'
  | 'WRONG_CHAIN'
  | 'FUNDING_REQUIRED'
  | 'READY_TO_DEPLOY'
  | 'AWAITING_SIGNATURE'
  | 'TRANSACTION_PENDING'
  | 'VALIDATING'
  | 'BINDING'
  | 'READY'
  | 'DEPLOYMENT_FAILED'

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
  signaturePending?: boolean
  transactionPending?: boolean
  validating?: boolean
  binding?: boolean
  failed?: boolean
  subsystemReadyComplete?: boolean
}): FounderOperationalState {
  if (input.failed) return 'DEPLOYMENT_FAILED'
  if (input.binding) return 'BINDING'
  if (input.validating) return 'VALIDATING'
  if (input.transactionPending) return 'TRANSACTION_PENDING'
  if (input.signaturePending) return 'AWAITING_SIGNATURE'
  if (input.subsystemReadyComplete) return 'READY'

  const { gates, gas } = input
  if (gates.codes.includes('WALLET_DISCONNECTED')) return 'CONNECT_WALLET'
  if (gates.codes.includes('WRONG_WALLET')) return 'WRONG_WALLET'
  if (gates.codes.includes('WRONG_CHAIN')) return 'WRONG_CHAIN'
  if (gas.pauseCode === 'FOUNDER_DEPLOYER_FUNDING_REQUIRED' || gates.codes.includes('INSUFFICIENT_BNB')) {
    return 'FUNDING_REQUIRED'
  }
  if (gates.ok) return 'READY_TO_DEPLOY'
  if (gates.codes.includes('AUTHORIZED_DEPLOYER_MATCH') && gates.codes.includes('CHAIN_56')) {
    return 'READY_TO_DEPLOY'
  }
  return 'CONNECT_WALLET'
}

export const DEPLOY_BUTTON_LABEL: Record<
  'liquidity_builder' | 'create_token' | 'public_farm_factory',
  string
> = {
  liquidity_builder: 'Deploy Liquidity Builder',
  create_token: 'Deploy Create Token Factory',
  public_farm_factory: 'Deploy Public Farm Factory',
}

/** Liquidity Builder permanent package — one Founder signature per CREATE, in order. */
export const LB_DEPLOYMENT_TX_STEPS = [
  {
    id: 'lb_fee_receiver',
    contractName: 'LiquidityBuildingTreasuryFeeReceiverV1',
    phase: 'Prepare Transaction',
  },
  {
    id: 'lb_authorizer',
    contractName: 'LiquidityBuildingExecutionAuthorizerV1',
    phase: 'Prepare Transaction',
  },
  {
    id: 'lb_fee_sink',
    contractName: 'LiquidityBuildingTreasuryFeeSinkV1',
    phase: 'Prepare Transaction',
  },
  {
    id: 'lb_program_impl',
    contractName: 'LiquidityBuildingProgramV1',
    phase: 'Prepare Transaction',
  },
  {
    id: 'lb_factory',
    contractName: 'LiquidityBuildingFactoryV1',
    phase: 'Prepare Transaction',
  },
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
