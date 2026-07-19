import { createHash } from 'crypto'
import type { DecisionV1, ExecutionArtifactV1, ExecutionIntentV1Wire, ObservationV1 } from './types'
import { LB_CHAIN_ID, LB_EXECUTION_SCHEMA } from './types'

export const EXECUTION_INTENT_SCHEMA_VERSION = 'LIQUIDITY_BUILDING_EXECUTION_INTENT_V1'

export type IntentBuildInput = {
  observation: ObservationV1
  decision: DecisionV1
  factory: string
  factoryVersion: string
  pair: string
  projectToken: string
  quoteAsset: string
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
  /** Must be FINALIZED before signing path is allowed */
  requireFinalized?: boolean
}

export type IntentBuildResult =
  | { ok: true; intent: ExecutionIntentV1Wire; artifact: ExecutionArtifactV1 }
  | { ok: false; reason: string }

/**
 * Build exact LB006 ExecutionIntent V1 wire object from finalized observation + decision.
 * Does not sign. Rejects unfinalized observations and non-EXECUTE decisions.
 */
export function buildExecutionIntent(input: IntentBuildInput): IntentBuildResult {
  if (input.requireFinalized !== false && input.observation.status !== 'FINALIZED') {
    return { ok: false, reason: 'OBSERVATION_NOT_FINALIZED' }
  }
  if (input.decision.decision !== 'EXECUTE') {
    return { ok: false, reason: `DECISION_NOT_EXECUTE:${input.decision.decision}` }
  }
  if (input.observation.chainId !== LB_CHAIN_ID) {
    return { ok: false, reason: 'INVALID_CHAIN' }
  }
  if (input.decision.eligibleNetBuyFlow !== input.observation.eligibleNetBuyFlow) {
    return { ok: false, reason: 'ELIGIBLE_FLOW_MISMATCH' }
  }
  if (input.decision.grossQuoteTarget === '0') {
    return { ok: false, reason: 'ZERO_GROSS_TARGET' }
  }

  const intent: ExecutionIntentV1Wire = {
    schemaVersion: EXECUTION_INTENT_SCHEMA_VERSION,
    chainId: String(LB_CHAIN_ID),
    factory: input.factory,
    factoryVersion: input.factoryVersion,
    program: input.decision.program,
    pair: input.pair,
    projectToken: input.projectToken,
    quoteAsset: input.quoteAsset,
    epochId: input.decision.epochId,
    epochStartTimestamp: String(input.epochStartTimestamp),
    epochEndTimestamp: String(input.epochEndTimestamp),
    observationStartBlock: String(input.observation.observationStartBlock),
    observationEndBlock: String(input.observation.observationEndBlock),
    anchorBlock: String(input.anchorBlock),
    anchorProjectReserve: input.anchorProjectReserve,
    anchorQuoteReserve: input.anchorQuoteReserve,
    eligibleNetBuyFlow: input.observation.eligibleNetBuyFlow,
    strategyMode: input.strategyMode,
    effectiveStrategyRateBps: input.decision.selectedRateBps,
    grossQuoteTarget: input.decision.grossQuoteTarget,
    maximumProjectTokenIn: input.maximumProjectTokenIn,
    configNonce: input.configNonce,
    executionNonce: input.executionNonce,
    strategyEngineVersion: createHash('sha256')
      .update(input.decision.strategyEngineVersion)
      .digest('hex')
      .slice(0, 64)
      .padStart(64, '0')
      .replace(/^/, '0x'),
    decisionDeadline: String(input.decision.deadline),
    maximumGasPrice: input.maximumGasPrice,
    observationRoot: input.observation.observationRoot,
    excludedFlowCommitment: input.observation.excludedFlowCommitment,
    treasuryAuthorizationReference: input.treasuryAuthorizationReference,
  }

  // Ensure strategyEngineVersion is valid bytes32 hex
  if (!/^0x[0-9a-fA-F]{64}$/.test(intent.strategyEngineVersion)) {
    const h = createHash('sha256').update(input.decision.strategyEngineVersion).digest('hex')
    intent.strategyEngineVersion = `0x${h}`
  }

  const artifact: ExecutionArtifactV1 = {
    schemaVersion: LB_EXECUTION_SCHEMA,
    intent,
    signature: null,
    digest: null,
    signingStatus: 'UNSIGNED',
    signingReason: null,
    relayStatus: 'NOT_SUBMITTED',
    transactionHash: null,
    executionId: null,
    createdAt: new Date().toISOString(),
  }

  return { ok: true, intent, artifact }
}

/** Detect mutation: signed intent must equal decision economics. */
export function intentMatchesDecision(intent: ExecutionIntentV1Wire, decision: DecisionV1): boolean {
  return (
    intent.program.toLowerCase() === decision.program.toLowerCase() &&
    intent.epochId === decision.epochId &&
    intent.eligibleNetBuyFlow === decision.eligibleNetBuyFlow &&
    intent.effectiveStrategyRateBps === decision.selectedRateBps &&
    intent.grossQuoteTarget === decision.grossQuoteTarget
  )
}
