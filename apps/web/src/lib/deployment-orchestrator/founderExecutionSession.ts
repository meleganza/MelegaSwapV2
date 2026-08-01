/**
 * Founder mainnet deployment execution session — pause states and null-safe records.
 * Operational pauses (wallet / funding / signature) are not implementation blockers.
 */

import {
  AUTHORIZED_MELEGA_DEPLOYER,
  FOUNDER_DEPLOY_CHAIN_ID,
  assessFounderDeployGates,
  type FounderDeployGateResult,
} from './founderDeployer'
import { assessFounderGasReadiness, type FounderGasReadiness } from './founderGasReadiness'
import { nextFounderDeployTarget } from './founderSequence'
import type { SubsystemId } from './types'

export type FounderExecutionPauseState =
  | 'AWAITING_FOUNDER_WALLET'
  | 'AWAITING_FOUNDER_SIGNATURE'
  | 'FOUNDER_DEPLOYER_FUNDING_REQUIRED'
  | 'WRONG_CHAIN'
  | 'SEQUENCE_QUARANTINED'
  | 'LIVE'
  | 'READY_FOR_NEXT'

export type FounderDeploymentRecord = {
  subsystemId: SubsystemId
  status: 'NULL' | 'DEPLOYED' | 'BOUND' | 'READY' | 'QUARANTINED' | 'VERIFICATION_PENDING'
  transactionHash: string | null
  blockNumber: string | null
  contractAddress: string | null
  gasUsed: string | null
  verification: 'VERIFIED' | 'VERIFICATION_PENDING' | 'VERIFICATION_FAILED' | null
  bound: boolean
  note: string
}

export type FounderExecutionSession = {
  schema: 'melega.dex.v1.founder-signed-mainnet-deployment-execution.session'
  pauseState: FounderExecutionPauseState
  expectedDeployer: typeof AUTHORIZED_MELEGA_DEPLOYER
  chainIdRequired: typeof FOUNDER_DEPLOY_CHAIN_ID
  nextSubsystem: SubsystemId | null
  gates: FounderDeployGateResult
  gas: FounderGasReadiness
  records: FounderDeploymentRecord[]
  kmsRequired: false
  serverSideSigning: false
  privateKeyHandling: false
  message: string
}

const NULL_NOTE = 'No Founder signature yet — factual deployment record remains null.'

export function emptyDeploymentRecords(): FounderDeploymentRecord[] {
  return (['liquidity_builder', 'create_token', 'public_farm_factory'] as SubsystemId[]).map(
    (subsystemId) => ({
      subsystemId,
      status: 'NULL',
      transactionHash: null,
      blockNumber: null,
      contractAddress: null,
      gasUsed: null,
      verification: null,
      bound: false,
      note: NULL_NOTE,
    }),
  )
}

export function resolveFounderExecutionPauseState(input: {
  gates: FounderDeployGateResult
  gas: FounderGasReadiness
  allSubsystemsLive?: boolean
  quarantined?: boolean
}): FounderExecutionPauseState {
  if (input.allSubsystemsLive) return 'LIVE'
  if (input.quarantined) return 'SEQUENCE_QUARANTINED'

  const { gates, gas } = input
  if (gates.codes.includes('WALLET_DISCONNECTED') || gates.codes.includes('WRONG_WALLET')) {
    return 'AWAITING_FOUNDER_WALLET'
  }
  if (gates.codes.includes('WRONG_CHAIN')) {
    return 'WRONG_CHAIN'
  }
  if (gas.pauseCode === 'FOUNDER_DEPLOYER_FUNDING_REQUIRED') {
    return 'FOUNDER_DEPLOYER_FUNDING_REQUIRED'
  }
  if (gas.estimateStatus === 'pending' || gas.estimateStatus === 'unavailable') {
    // Operational pause awaiting estimate — still Founder-facing, not a code defect.
    if (gates.codes.includes('AUTHORIZED_DEPLOYER_MATCH') && gates.codes.includes('CHAIN_56')) {
      return 'AWAITING_FOUNDER_SIGNATURE'
    }
  }
  if (gates.ok && gates.codes.includes('FOUNDER_SIGNATURE_REQUIRED')) {
    return 'AWAITING_FOUNDER_SIGNATURE'
  }
  if (gates.codes.includes('AUTHORIZED_DEPLOYER_MATCH') && gates.codes.includes('CHAIN_56')) {
    return 'AWAITING_FOUNDER_SIGNATURE'
  }
  return 'AWAITING_FOUNDER_WALLET'
}

export function buildFounderExecutionSession(input: {
  connectedWallet: string | null | undefined
  chainId: number | null | undefined
  balanceWei: bigint | null | undefined
  gasPriceWei?: bigint | null
  artifactValid: boolean
  constructorValid: boolean
  subsystemReady: boolean
  records?: FounderDeploymentRecord[]
  allSubsystemsLive?: boolean
  quarantined?: boolean
}): FounderExecutionSession {
  const nextSubsystem = nextFounderDeployTarget()
  const remaining = nextSubsystem
    ? ([nextSubsystem, ...(nextSubsystem === 'liquidity_builder'
        ? (['create_token', 'public_farm_factory'] as SubsystemId[])
        : nextSubsystem === 'create_token'
          ? (['public_farm_factory'] as SubsystemId[])
          : [])] as SubsystemId[])
    : ([] as SubsystemId[])

  void remaining
  const gas = assessFounderGasReadiness({
    balanceWei: input.balanceWei,
    estimateStatus: 'pending',
    gasPriceWei: input.gasPriceWei ?? null,
    gasPriceSource: input.gasPriceWei ? 'wallet' : 'none',
  })

  const gates = assessFounderDeployGates({
    connectedWallet: input.connectedWallet,
    chainId: input.chainId,
    balanceWei: input.balanceWei,
    artifactValid: input.artifactValid,
    constructorValid: input.constructorValid,
    subsystemReady: input.subsystemReady,
  })

  const pauseState = resolveFounderExecutionPauseState({
    gates,
    gas,
    allSubsystemsLive: input.allSubsystemsLive,
    quarantined: input.quarantined,
  })

  const messages: Record<FounderExecutionPauseState, string> = {
    AWAITING_FOUNDER_WALLET: 'Connect the authorized MELEGA DEPLOYER.',
    AWAITING_FOUNDER_SIGNATURE: 'Review constructor state, then sign in the connected wallet.',
    FOUNDER_DEPLOYER_FUNDING_REQUIRED:
      gas.message ?? `Fund MELEGA DEPLOYER ${AUTHORIZED_MELEGA_DEPLOYER}.`,
    WRONG_CHAIN: 'Switch to BNB Smart Chain.',
    SEQUENCE_QUARANTINED: 'Deployment quarantined — do not bind; do not advance sequence.',
    LIVE: 'All permanent platform contracts are DEPLOYED, BOUND, and READY.',
    READY_FOR_NEXT: 'Previous subsystem READY — prepare next Founder signature.',
  }

  return {
    schema: 'melega.dex.v1.founder-signed-mainnet-deployment-execution.session',
    pauseState,
    expectedDeployer: AUTHORIZED_MELEGA_DEPLOYER,
    chainIdRequired: FOUNDER_DEPLOY_CHAIN_ID,
    nextSubsystem,
    gates,
    gas,
    records: input.records ?? emptyDeploymentRecords(),
    kmsRequired: false,
    serverSideSigning: false,
    privateKeyHandling: false,
    message: messages[pauseState],
  }
}

/** Server-side session when no wallet context is available. */
export function buildServerFounderExecutionSession(): FounderExecutionSession {
  return buildFounderExecutionSession({
    connectedWallet: null,
    chainId: null,
    balanceWei: null,
    artifactValid: true,
    constructorValid: true,
    subsystemReady: true,
  })
}
