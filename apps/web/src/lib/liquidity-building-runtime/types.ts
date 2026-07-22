/**
 * Liquidity Building autonomous runtime — shared types and schema IDs (LB009).
 * Amounts are base-unit decimal strings. No floating-point accounting.
 */

export const LB_OBSERVATION_SCHEMA = 'melega.liquidity-building.observation.v1' as const
export const LB_DECISION_SCHEMA = 'melega.liquidity-building.decision.v1' as const
export const LB_EXECUTION_SCHEMA = 'melega.liquidity-building.execution.v1' as const
export const LB_RECONCILIATION_SCHEMA = 'melega.liquidity-building.reconciliation.v1' as const
export const LB_HEALTH_SCHEMA = 'melega.liquidity-building.runtime-health.v1' as const

export const LB_CHAIN_ID = 56
export const LB_FINALITY_DEPTH = 15
export const LB_STRATEGY_CEILING_BPS = 5000
export const LB_BPS = 10_000
export const LB_SUCCESS_FEE_BPS = 500
export const LB_FEE_NUMERATOR = 9975
export const LB_FEE_DENOMINATOR = 10_000

export const MELEGA_FACTORY = '0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C'
export const MELEGA_ROUTER = '0xc25033218D181b27D4a2944Fbb04FC055da4EAB3'

export type BaseUnitString = string

export type ObservationStatus = 'OBSERVED' | 'AWAITING_FINALITY' | 'FINALIZED' | 'REORGED' | 'REJECTED'

export type DecisionAction = 'EXECUTE' | 'WAIT' | 'SKIP'

export type StrategyModeName = 'FullAi' | 'DynamicRange'

export type RuntimeHealthStatus = 'READY' | 'DEGRADED' | 'BLOCKED' | 'FAILED'

export type LoopState =
  | 'DISCOVER'
  | 'OBSERVE'
  | 'FINALIZE'
  | 'DECIDE'
  | 'SIGN'
  | 'SUBMIT'
  | 'MONITOR'
  | 'RECONCILE'
  | 'COMPLETE'
  | 'WAITING_FINALITY'
  | 'SIGNING_UNAVAILABLE'
  | 'TREASURY_UNAVAILABLE'
  | 'RELAY_UNAVAILABLE'
  | 'EXECUTION_FAILED'
  | 'REORGED'

export type TxMonitorStatus = 'SUBMITTED' | 'PENDING' | 'CONFIRMED' | 'FAILED' | 'REPLACED' | 'DROPPED'

export type TreasuryIngestStatus =
  | 'OBSERVED'
  | 'AWAITING_FINALITY'
  | 'VALIDATING'
  | 'RECONCILED'
  | 'ACCOUNTED'
  | 'REJECTED'
  | 'REORGED'
  | 'ERROR'

export type ExclusionReason =
  | 'LB_OWN_SWAP'
  | 'SAME_EXECUTION_TX'
  | 'RETRY_REPLACEMENT'
  | 'REVERTED'
  | 'NON_CANONICAL_PAIR'
  | 'ADD_LIQUIDITY'
  | 'REMOVE_LIQUIDITY'
  | 'DUPLICATE_EVENT'
  | 'UNFINALIZED'
  | 'UNRELATED_DIRECTION'
  | 'INTERNAL_LB_SALE'

export type SwapDirectionClass = 'BUY' | 'SELL' | 'UNRELATED'

export type ObservedSwapEvent = {
  chainId: number
  pair: string
  projectToken: string
  quoteAsset: string
  projectIsToken0: boolean
  blockNumber: number
  blockHash: string
  transactionHash: string
  logIndex: number
  /** Raw Swap amounts — UniswapV2 style */
  amount0In: BaseUnitString
  amount1In: BaseUnitString
  amount0Out: BaseUnitString
  amount1Out: BaseUnitString
  txStatus: 'SUCCESS' | 'REVERTED'
  isCanonicalPair: boolean
  /** Optional LB exclusion hints */
  programAddress?: string | null
  executionId?: string | null
  isLiquidityBuildingExecution?: boolean
  isAddLiquidity?: boolean
  isRemoveLiquidity?: boolean
  isRetryOrReplacement?: boolean
}

export type ClassifiedSwap = {
  eventKey: string
  direction: SwapDirectionClass
  quoteAmount: BaseUnitString
  excluded: boolean
  exclusionReason: ExclusionReason | null
  event: ObservedSwapEvent
}

export type FlowBucket = {
  buyQuote: BaseUnitString
  sellQuote: BaseUnitString
  eventCount: number
}

export type ObservationV1 = {
  schemaVersion: typeof LB_OBSERVATION_SCHEMA
  chainId: number
  factory: string
  pair: string
  program: string
  projectToken: string
  quoteAsset: string
  observationStartBlock: number
  observationEndBlock: number
  finalityDepth: number
  status: ObservationStatus
  observed: FlowBucket
  excluded: FlowBucket & { reasons: Record<string, number> }
  eligible: FlowBucket
  eligibleNetBuyFlow: BaseUnitString
  excludedFlowCommitment: string
  observationRoot: string
  generatedAt: string
  finalizedAt: string | null
  sourceBlockHashes: string[]
}

export type DecisionV1 = {
  schemaVersion: typeof LB_DECISION_SCHEMA
  program: string
  epochId: string
  observationReference: string
  eligibleNetBuyFlow: BaseUnitString
  strategyMode: StrategyModeName
  selectedRateBps: number
  grossQuoteTarget: BaseUnitString
  projectedProjectTokenInput: BaseUnitString
  projectedFee: BaseUnitString
  projectedMatching: BaseUnitString
  projectedLiquidity: BaseUnitString
  expectedImpactBps: number
  expectedDeviationBps: number
  decision: DecisionAction
  reasonCode: string
  strategyEngineVersion: string
  createdAt: string
  deadline: number
}

/** Off-chain mirror of LB006 ExecutionIntentV1 — all integers as strings where uint256. */
export type ExecutionIntentV1Wire = {
  schemaVersion: string
  chainId: string
  factory: string
  factoryVersion: string
  program: string
  pair: string
  projectToken: string
  quoteAsset: string
  epochId: string
  epochStartTimestamp: string
  epochEndTimestamp: string
  observationStartBlock: string
  observationEndBlock: string
  anchorBlock: string
  anchorProjectReserve: string
  anchorQuoteReserve: string
  eligibleNetBuyFlow: string
  strategyMode: number
  effectiveStrategyRateBps: number
  grossQuoteTarget: string
  maximumProjectTokenIn: string
  configNonce: string
  executionNonce: string
  strategyEngineVersion: string
  decisionDeadline: string
  maximumGasPrice: string
  observationRoot: string
  excludedFlowCommitment: string
  treasuryAuthorizationReference: string
}

export type ExecutionArtifactV1 = {
  schemaVersion: typeof LB_EXECUTION_SCHEMA
  intent: ExecutionIntentV1Wire
  signature: string | null
  digest: string | null
  signingStatus: 'UNSIGNED' | 'SIGNED' | 'DISABLED' | 'REJECTED'
  signingReason: string | null
  relayStatus: TxMonitorStatus | 'NOT_SUBMITTED'
  transactionHash: string | null
  executionId: string | null
  createdAt: string
}

export type ReconciliationV1 = {
  schemaVersion: typeof LB_RECONCILIATION_SCHEMA
  chainId: number
  program: string
  executionId: string
  settlementKey: string | null
  settlementReceipt: string | null
  runtimeAcknowledgementId: string | null
  treasuryStatus: TreasuryIngestStatus
  feeAmount: BaseUnitString | null
  quoteAsset: string | null
  idempotencyKey: string | null
  createdAt: string
  notes: string[]
}

export type RuntimeHealthReport = {
  schemaVersion: typeof LB_HEALTH_SCHEMA
  status: RuntimeHealthStatus
  reasons: string[]
  components: {
    observer: RuntimeHealthStatus
    finalityLag: RuntimeHealthStatus
    kmsSigner: RuntimeHealthStatus
    relay: RuntimeHealthStatus
    treasuryIngestion: RuntimeHealthStatus
    quotePolicy: RuntimeHealthStatus
    programDiscovery: RuntimeHealthStatus
  }
  /** Execution-critical blockers only (Treasury ingestion excluded). */
  blockers: string[]
  /** Async accounting / reconciliation gaps — do not block execution. */
  accountingBlockers?: string[]
  warnings?: string[]
  accountingDegraded?: boolean
  accountingReadiness?: boolean
  generatedAt: string
}

/**
 * ABI / wire field name remains treasuryAuthorizationReference (frozen).
 * Semantics: provenance reference only — not a live Treasury Runtime authorization ticket.
 * Prefer treasuryProvenanceReference in new application comments and helpers.
 */
export type TreasuryProvenanceReference = string

export type DecisionEngineInput = {
  eligibleNetBuyFlow: BaseUnitString
  strategyMode: StrategyModeName
  /** Full AI selected rate; Dynamic Range selected within owner bounds */
  selectedRateBps: number
  ownerMinimumRateBps?: number
  ownerMaximumRateBps?: number
  protocolStrategyCeilingBps?: number
  anchorProjectReserve: BaseUnitString
  anchorQuoteReserve: BaseUnitString
  remainingBudget: BaseUnitString
  epochAlreadyExecuted: boolean
  hardCurveImpactBps?: number
  operatingCurveImpactBps?: number
  minimumGrossQuoteFloor?: BaseUnitString
  gasCostQuote?: BaseUnitString
  maximumGasCostShareBps?: number
  program: string
  epochId: string
  observationReference: string
  strategyEngineVersion?: string
  decisionDeadlineSeconds?: number
  nowMs?: number
}
