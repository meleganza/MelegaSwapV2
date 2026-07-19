import { createHash } from 'crypto'
import type {
  BaseUnitString,
  ClassifiedSwap,
  ExclusionReason,
  FlowBucket,
  ObservationStatus,
  ObservationV1,
  ObservedSwapEvent,
  SwapDirectionClass,
} from './types'
import { LB_CHAIN_ID, LB_FINALITY_DEPTH, LB_OBSERVATION_SCHEMA, MELEGA_FACTORY } from './types'

export function eventKey(e: ObservedSwapEvent): string {
  return `${e.transactionHash.toLowerCase()}:${e.logIndex}`
}

export function bu(v: bigint | number | string): BaseUnitString {
  return BigInt(v).toString()
}

export function classifyDirection(e: ObservedSwapEvent): { direction: SwapDirectionClass; quoteAmount: bigint } {
  const a0In = BigInt(e.amount0In)
  const a1In = BigInt(e.amount1In)
  const a0Out = BigInt(e.amount0Out)
  const a1Out = BigInt(e.amount1Out)

  // Quote in, project out = BUY
  // Project in, quote out = SELL
  if (e.projectIsToken0) {
    // project=token0, quote=token1
    if (a1In > 0n && a0Out > 0n) return { direction: 'BUY', quoteAmount: a1In }
    if (a0In > 0n && a1Out > 0n) return { direction: 'SELL', quoteAmount: a1Out }
  } else {
    // project=token1, quote=token0
    if (a0In > 0n && a1Out > 0n) return { direction: 'BUY', quoteAmount: a0In }
    if (a1In > 0n && a0Out > 0n) return { direction: 'SELL', quoteAmount: a0Out }
  }
  return { direction: 'UNRELATED', quoteAmount: 0n }
}

function exclusionFor(e: ObservedSwapEvent, seen: Set<string>): ExclusionReason | null {
  const key = eventKey(e)
  if (seen.has(key)) return 'DUPLICATE_EVENT'
  if (e.txStatus === 'REVERTED') return 'REVERTED'
  if (!e.isCanonicalPair) return 'NON_CANONICAL_PAIR'
  if (e.isAddLiquidity) return 'ADD_LIQUIDITY'
  if (e.isRemoveLiquidity) return 'REMOVE_LIQUIDITY'
  if (e.isRetryOrReplacement) return 'RETRY_REPLACEMENT'
  if (e.isLiquidityBuildingExecution) return 'LB_OWN_SWAP'
  if (e.chainId !== LB_CHAIN_ID) return 'UNRELATED_DIRECTION'
  return null
}

export function classifySwap(e: ObservedSwapEvent, seen: Set<string>): ClassifiedSwap {
  const key = eventKey(e)
  const exclusion = exclusionFor(e, seen)
  seen.add(key)
  const { direction, quoteAmount } = classifyDirection(e)
  if (exclusion) {
    return {
      eventKey: key,
      direction,
      quoteAmount: bu(quoteAmount),
      excluded: true,
      exclusionReason: exclusion,
      event: e,
    }
  }
  if (direction === 'UNRELATED') {
    return {
      eventKey: key,
      direction,
      quoteAmount: '0',
      excluded: true,
      exclusionReason: 'UNRELATED_DIRECTION',
      event: e,
    }
  }
  return {
    eventKey: key,
    direction,
    quoteAmount: bu(quoteAmount),
    excluded: false,
    exclusionReason: null,
    event: e,
  }
}

function emptyFlow(): FlowBucket {
  return { buyQuote: '0', sellQuote: '0', eventCount: 0 }
}

function addBuy(f: FlowBucket, q: bigint): FlowBucket {
  return {
    buyQuote: bu(BigInt(f.buyQuote) + q),
    sellQuote: f.sellQuote,
    eventCount: f.eventCount + 1,
  }
}

function addSell(f: FlowBucket, q: bigint): FlowBucket {
  return {
    buyQuote: f.buyQuote,
    sellQuote: bu(BigInt(f.sellQuote) + q),
    eventCount: f.eventCount + 1,
  }
}

export function commitmentHash(parts: string[]): string {
  return `0x${createHash('sha256').update(parts.join('|')).digest('hex')}`
}

export type BuildObservationInput = {
  program: string
  pair: string
  projectToken: string
  quoteAsset: string
  observationStartBlock: number
  observationEndBlock: number
  events: ObservedSwapEvent[]
  status?: ObservationStatus
  finalityDepth?: number
  factory?: string
  generatedAt?: string
  finalizedAt?: string | null
}

/**
 * Build LB003 observation layers: Observed → Excluded → Eligible.
 * Eligible never includes excluded events.
 */
export function buildObservation(input: BuildObservationInput): ObservationV1 {
  const seen = new Set<string>()
  let observed = emptyFlow()
  let excluded = { ...emptyFlow(), reasons: {} as Record<string, number> }
  let eligible = emptyFlow()
  const classified: ClassifiedSwap[] = []

  for (const ev of input.events) {
    const c = classifySwap(ev, seen)
    classified.push(c)
    const q = BigInt(c.quoteAmount)

    if (c.direction === 'BUY') observed = addBuy(observed, q)
    else if (c.direction === 'SELL') observed = addSell(observed, q)

    if (c.excluded) {
      if (c.direction === 'BUY') excluded = { ...addBuy(excluded, q), reasons: excluded.reasons }
      else if (c.direction === 'SELL') excluded = { ...addSell(excluded, q), reasons: excluded.reasons }
      else excluded = { ...excluded, eventCount: excluded.eventCount + 1 }
      const r = c.exclusionReason || 'UNRELATED_DIRECTION'
      excluded.reasons[r] = (excluded.reasons[r] || 0) + 1
      continue
    }

    if (c.direction === 'BUY') eligible = addBuy(eligible, q)
    else if (c.direction === 'SELL') eligible = addSell(eligible, q)
  }

  const net = BigInt(eligible.buyQuote) - BigInt(eligible.sellQuote)
  const eligibleNetBuyFlow = bu(net > 0n ? net : 0n)

  const sourceBlockHashes = [...new Set(input.events.map((e) => e.blockHash).filter(Boolean))]
  const excludedFlowCommitment = commitmentHash(
    classified
      .filter((c) => c.excluded)
      .map((c) => `${c.eventKey}:${c.exclusionReason}:${c.quoteAmount}`)
      .sort(),
  )
  const observationRoot = commitmentHash([
    input.program.toLowerCase(),
    input.pair.toLowerCase(),
    String(input.observationStartBlock),
    String(input.observationEndBlock),
    eligible.buyQuote,
    eligible.sellQuote,
    eligibleNetBuyFlow,
    excludedFlowCommitment,
  ])

  return {
    schemaVersion: LB_OBSERVATION_SCHEMA,
    chainId: LB_CHAIN_ID,
    factory: input.factory || MELEGA_FACTORY,
    pair: input.pair,
    program: input.program,
    projectToken: input.projectToken,
    quoteAsset: input.quoteAsset,
    observationStartBlock: input.observationStartBlock,
    observationEndBlock: input.observationEndBlock,
    finalityDepth: input.finalityDepth ?? LB_FINALITY_DEPTH,
    status: input.status || 'OBSERVED',
    observed,
    excluded,
    eligible,
    eligibleNetBuyFlow,
    excludedFlowCommitment,
    observationRoot,
    generatedAt: input.generatedAt || new Date().toISOString(),
    finalizedAt: input.finalizedAt ?? null,
    sourceBlockHashes,
  }
}

export type FinalityAssessment = {
  status: ObservationStatus
  confirmations: number
  reason: string
}

/**
 * Finality gate: require `finalityDepth` confirmations and matching tip hash when provided.
 */
export function assessFinality(args: {
  observationEndBlock: number
  chainHead: number
  finalityDepth?: number
  recordedEndBlockHash?: string | null
  currentEndBlockHash?: string | null
  chainId?: number
  pairStillCanonical?: boolean
}): FinalityAssessment {
  const depth = args.finalityDepth ?? LB_FINALITY_DEPTH
  if ((args.chainId ?? LB_CHAIN_ID) !== LB_CHAIN_ID) {
    return { status: 'REJECTED', confirmations: 0, reason: 'INVALID_CHAIN' }
  }
  if (args.pairStillCanonical === false) {
    return { status: 'REJECTED', confirmations: 0, reason: 'PAIR_NOT_CANONICAL' }
  }
  if (
    args.recordedEndBlockHash &&
    args.currentEndBlockHash &&
    args.recordedEndBlockHash.toLowerCase() !== args.currentEndBlockHash.toLowerCase()
  ) {
    return { status: 'REORGED', confirmations: 0, reason: 'BLOCK_HASH_MISMATCH' }
  }
  const confirmations = Math.max(0, args.chainHead - args.observationEndBlock)
  if (confirmations < depth) {
    return { status: 'AWAITING_FINALITY', confirmations, reason: 'INSUFFICIENT_CONFIRMATIONS' }
  }
  return { status: 'FINALIZED', confirmations, reason: 'FINALITY_OK' }
}

export function finalizeObservation(
  observation: ObservationV1,
  assessment: FinalityAssessment,
  finalizedAt?: string,
): ObservationV1 {
  if (assessment.status !== 'FINALIZED') {
    return { ...observation, status: assessment.status, finalizedAt: null }
  }
  return {
    ...observation,
    status: 'FINALIZED',
    finalizedAt: finalizedAt || new Date().toISOString(),
  }
}
