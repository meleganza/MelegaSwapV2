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
}

/**
 * Deterministic autonomous loop orchestration.
 * Never signs with private keys; never broadcasts when relay disabled;
 * never claims Treasury success when Runtime blocked.
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
    treasuryAuthorizationReference: string
  }
}): Promise<AutonomousLoopResult> {
  const health = assessLiquidityBuildingRuntimeHealth()
  const machine = new AutonomousLoopStateMachine()
  const blockedReasons: string[] = [...health.reasons]
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
    return { health, state: machine.state, observation, decision, artifact: null, blockedReasons }
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
    return { health, state: machine.state, observation, decision, artifact: null, blockedReasons }
  }

  machine.transition('SIGN', 'intent_built')
  const signer = new DisabledLiquidityBuildingKmsSigner()
  const signed = await signArtifact(built.artifact, signer)
  if (signed.signingStatus !== 'SIGNED') {
    machine.transition('SIGNING_UNAVAILABLE', signed.signingReason || 'disabled')
    blockedReasons.push(signed.signingReason || 'SIGNING_DISABLED')
    return { health, state: machine.state, observation, decision, artifact: signed, blockedReasons }
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
    return { health, state: machine.state, observation, decision, artifact: signed, blockedReasons }
  }

  machine.transition('MONITOR', 'submitted')
  const treasury = new BlockedTreasuryIngestor()
  if (!treasury.ready) {
    machine.transition('TREASURY_UNAVAILABLE', 'treasury_blocked')
    blockedReasons.push('TREASURY_UNAVAILABLE')
  }

  return { health, state: machine.state, observation, decision, artifact: signed, blockedReasons }
}
