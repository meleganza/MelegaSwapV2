import { assessFinality, buildObservation, finalizeObservation } from './eligible-flow'
import { decideLiquidityBuilding } from './decision-engine'
import { buildExecutionIntent } from './intent-builder'
import { DisabledLiquidityBuildingKmsSigner, signArtifact } from './signing-adapter'
import { DisabledLiquidityBuildingRelay } from './relay'
import { BlockedTreasuryIngestor } from './treasury-integration'
import { AutonomousLoopStateMachine } from './state-machine'
import { assessLiquidityBuildingRuntimeHealth } from './readiness'
import type {
  DecisionEngineInput,
  DecisionV1,
  ExecutionArtifactV1,
  ObservationV1,
  ObservedSwapEvent,
  RuntimeHealthReport,
} from './types'

export type AutonomousLoopResult = {
  health: RuntimeHealthReport
  state: string
  observation: ObservationV1 | null
  decision: DecisionV1 | null
  artifact: ExecutionArtifactV1 | null
  blockedReasons: string[]
  /** Accounting / observability warnings — never treated as execution blockers. */
  warnings: string[]
  accountingDegraded: boolean
}

/**
 * Deterministic autonomous loop orchestration.
 * Never signs with private keys; never broadcasts when relay disabled.
 *
 * LB-ACT-003: Treasury Runtime ingestion unavailable emits TREASURY_ACCOUNTING_DEGRADED
 * and continues to COMPLETE. It does not skip execution, force ERROR, or SAFETY_PAUSED.
 */
export async function runAutonomousLoopStep(args: {
  program: string
  pair: string
  projectToken: string
  quoteAsset: string
  observationStartBlock: number
  observationEndBlock: number
  chainHead: number
  events: ObservedSwapEvent[]
  decisionInput: Omit<
    DecisionEngineInput,
    'eligibleNetBuyFlow' | 'observationReference' | 'program' | 'epochId'
  > & { epochId: string }
  intentExtras: {
    factory: string
    factoryVersion: string
    epochStartTimestamp: number
    epochEndTimestamp: number
    anchorBlock: number
    anchorProjectReserve: string
    anchorQuoteReserve: string
    strategyMode: number
    configNonce: string
    executionNonce: string
    maximumProjectTokenIn: string
    maximumGasPrice: string
    /** ABI name; semantics = treasuryProvenanceReference (not a live ticket). */
    treasuryAuthorizationReference: string
  }
}): Promise<AutonomousLoopResult> {
  const health = assessLiquidityBuildingRuntimeHealth()
  const machine = new AutonomousLoopStateMachine()
  const blockedReasons: string[] = [...(health.blockers ?? [])]
  const warnings: string[] = [...(health.warnings ?? [])]
  let accountingDegraded = health.accountingDegraded === true
  machine.transition('OBSERVE', 'start')

  let observation = buildObservation({
    program: args.program,
    pair: args.pair,
    projectToken: args.projectToken,
    quoteAsset: args.quoteAsset,
    observationStartBlock: args.observationStartBlock,
    observationEndBlock: args.observationEndBlock,
    events: args.events,
  })

  const fin = assessFinality({
    observationEndBlock: args.observationEndBlock,
    chainHead: args.chainHead,
    pairStillCanonical: true,
  })
  observation = finalizeObservation(observation, fin)
  machine.onObservationStatus(observation.status)

  if (observation.status !== 'FINALIZED') {
    blockedReasons.push(`OBSERVATION_${observation.status}`)
    return {
      health,
      state: machine.state,
      observation,
      decision: null,
      artifact: null,
      blockedReasons,
      warnings,
      accountingDegraded,
    }
  }

  const decision = decideLiquidityBuilding({
    ...args.decisionInput,
    program: args.program,
    epochId: args.decisionInput.epochId,
    eligibleNetBuyFlow: observation.eligibleNetBuyFlow,
    observationReference: observation.observationRoot,
    anchorProjectReserve: args.intentExtras.anchorProjectReserve,
    anchorQuoteReserve: args.intentExtras.anchorQuoteReserve,
  })

  if (decision.decision !== 'EXECUTE') {
    machine.transition('COMPLETE', decision.reasonCode)
    return {
      health,
      state: machine.state,
      observation,
      decision,
      artifact: null,
      blockedReasons,
      warnings,
      accountingDegraded,
    }
  }

  const built = buildExecutionIntent({
    observation,
    decision,
    ...args.intentExtras,
    pair: args.pair,
    projectToken: args.projectToken,
    quoteAsset: args.quoteAsset,
  })
  if (!built.ok) {
    machine.transition('EXECUTION_FAILED', built.reason)
    blockedReasons.push(built.reason)
    return {
      health,
      state: machine.state,
      observation,
      decision,
      artifact: null,
      blockedReasons,
      warnings,
      accountingDegraded,
    }
  }

  machine.transition('SIGN', 'intent_built')
  const signer = new DisabledLiquidityBuildingKmsSigner()
  const signed = await signArtifact(built.artifact, signer)
  if (signed.signingStatus !== 'SIGNED') {
    machine.transition('SIGNING_UNAVAILABLE', signed.signingReason || 'disabled')
    blockedReasons.push(signed.signingReason || 'SIGNING_DISABLED')
    return {
      health,
      state: machine.state,
      observation,
      decision,
      artifact: signed,
      blockedReasons,
      warnings,
      accountingDegraded,
    }
  }

  machine.transition('SUBMIT', 'signed')
  const relay = new DisabledLiquidityBuildingRelay()
  const relayResult = await relay.submit({
    program: args.program,
    intent: signed.intent,
    signature: signed.signature!,
    calldata: '0x',
    to: args.program,
    idempotencyKey: `${args.program}:${signed.intent.executionNonce}`,
  })
  if (!relayResult.ok) {
    machine.transition('RELAY_UNAVAILABLE', relayResult.code)
    blockedReasons.push(relayResult.reason)
    return {
      health,
      state: machine.state,
      observation,
      decision,
      artifact: signed,
      blockedReasons,
      warnings,
      accountingDegraded,
    }
  }

  machine.transition('MONITOR', 'submitted')
  machine.transition('RECONCILE', 'tx_submitted')

  const treasury = new BlockedTreasuryIngestor()
  if (!treasury.ready) {
    // Case A: Treasury Runtime ingestion unavailable — execution continues.
    accountingDegraded = true
    if (!warnings.includes('TREASURY_ACCOUNTING_DEGRADED')) {
      warnings.push('TREASURY_ACCOUNTING_DEGRADED')
    }
    await treasury.ingest({
      chainId: 56,
      sink: '0x0000000000000000000000000000000000000001',
      treasuryReceiver: '0x0000000000000000000000000000000000000002',
      factory: args.intentExtras.factory,
      program: args.program,
      programId: args.program,
      executionId: `${args.program}:${signed.intent.executionNonce}`,
      quoteAsset: args.quoteAsset,
      feeAmount: '1',
      settlementKey: `pending:${args.program}:${signed.intent.executionNonce}`,
      settlementReceipt: '0x',
      transactionHash: relayResult.transactionHash || `0x${'ab'.repeat(32)}`,
      logIndex: 0,
      blockNumber: args.chainHead,
      finalized: true,
      programRegistered: true,
      sinkMatchesFactory: true,
      receiverMatchesCanonical: true,
      grossQuoteAmount: signed.intent.grossQuoteTarget,
      netQuoteAmount: undefined,
      lpAmount: undefined,
    })
    machine.transition('COMPLETE', 'accounting_degraded_async_pending')
  } else {
    machine.transition('COMPLETE', 'reconciled')
  }

  return {
    health,
    state: machine.state,
    observation,
    decision,
    artifact: signed,
    blockedReasons,
    warnings,
    accountingDegraded,
  }
}
