/**
 * Pure LB log → inventory event parsing (no RPC).
 */
import { Interface } from '@ethersproject/abi'
import { hexDataSlice } from '@ethersproject/bytes'
import { LB_EVENT_SIGNATURES, topicToLbEventName, type LbEventName } from './topics'
import type { LbIndexedEvent, LbIndexedLifecycle, LbIndexedProgram, LbStrategyLabel } from './types'
import { LB_INDEXER_CHAIN_ID } from './types'

const FACTORY_IFACE = new Interface([
  'event ProgramCreated(bytes32 indexed programId, address indexed owner, address indexed program, address projectToken, address quoteAsset, address pair, uint64 generation, bytes32 factoryVersion)',
])

const PROGRAM_IFACE = new Interface([
  'event ProgramActivated(bytes32 indexed programId, uint64 configNonce)',
  'event ProgramPaused(bytes32 indexed programId, uint64 configNonce)',
  'event ProgramResumed(bytes32 indexed programId, uint64 configNonce)',
  'event ProgramStopped(bytes32 indexed programId, uint64 configNonce)',
  'event ProgramSafetyPaused(bytes32 indexed programId, bytes32 reasonCode, address detectedBy, uint64 configNonce)',
  'event ProgramSafetyCleared(bytes32 indexed programId, uint64 configNonce)',
  'event BudgetDeposited(bytes32 indexed programId, uint256 amount, uint256 totalDeposited, uint64 configNonce)',
  'event BudgetAdded(bytes32 indexed programId, uint256 amount, uint256 totalDeposited, uint64 configNonce)',
  'event BudgetWithdrawn(bytes32 indexed programId, uint256 amount, uint256 remainingBudget, uint64 configNonce)',
  'event ExecutionCompleted(bytes32 indexed executionId, uint256 indexed epochId, address indexed relayer, uint256 executionNonce, uint256 effectiveStrategyRateBps, uint256 eligibleNetBuyFlow, uint256 projectTokenSold, uint256 grossQuoteAcquired, uint256 melegaFeePaid, uint256 projectTokenMatched, uint256 quoteAssetAdded, uint256 quoteResidualAfter, uint256 lpMinted, address lpRecipient, bytes32 settlementReceipt)',
  'event StrategyUpdated(bytes32 indexed programId, uint8 mode, uint16 minBps, uint16 maxBps, uint64 configNonce)',
])

const FEE_IFACE = new Interface([
  'event LiquidityBuildingFeeSettled(bytes32 indexed settlementKey, bytes32 indexed programId, bytes32 indexed executionId, address program, address quoteAsset, uint256 amount, address treasuryReceiver, bytes32 authorizationReference, bytes32 settlementReceipt)',
])

export type RawLbLog = {
  address: string
  topics: string[]
  data: string
  transactionHash: string
  logIndex: number | string
  blockNumber: number | string
  blockTimestamp?: number | string | null
}

function asAddr(v: unknown): string {
  return String(v).toLowerCase()
}

function asHex(v: unknown): string {
  return String(v)
}

function asNum(v: unknown): number {
  return Number(v)
}

function strategyLabel(mode: number | null | undefined): LbStrategyLabel {
  if (mode === 0) return 'AI Optimized'
  if (mode === 1) return 'Custom Range'
  return 'Unknown'
}

export function emptyProgram(partial: Partial<LbIndexedProgram> & { programAddress: string; owner: string }): LbIndexedProgram {
  return {
    programAddress: partial.programAddress.toLowerCase(),
    programId: partial.programId ?? null,
    owner: partial.owner.toLowerCase(),
    projectToken: (partial.projectToken ?? '').toLowerCase(),
    quoteAsset: (partial.quoteAsset ?? '').toLowerCase(),
    pair: (partial.pair ?? '').toLowerCase(),
    reserveWei: partial.reserveWei ?? null,
    remainingWei: partial.remainingWei ?? null,
    status: partial.status ?? 'Created',
    strategy: partial.strategy ?? 'Unknown',
    strategyMode: partial.strategyMode ?? null,
    minimumRateBps: partial.minimumRateBps ?? null,
    maximumRateBps: partial.maximumRateBps ?? null,
    goal: partial.goal ?? null,
    generation: partial.generation ?? null,
    createdAt: partial.createdAt ?? null,
    activatedAt: partial.activatedAt ?? null,
    pausedAt: partial.pausedAt ?? null,
    stoppedAt: partial.stoppedAt ?? null,
    updatedAt: partial.updatedAt ?? null,
    executionCount: partial.executionCount ?? 0,
    totalFeePaidWei: partial.totalFeePaidWei ?? null,
    factoryVersion: partial.factoryVersion ?? null,
  }
}

export function parseLbLog(
  log: RawLbLog,
  chainId: number = LB_INDEXER_CHAIN_ID,
): LbIndexedEvent | null {
  const eventType = topicToLbEventName(log.topics?.[0])
  if (!eventType) return null

  const blockNumber = asNum(log.blockNumber)
  const logIndex = asNum(log.logIndex)
  const timestamp =
    log.blockTimestamp != null && log.blockTimestamp !== '' ? asNum(log.blockTimestamp) : null

  const base: LbIndexedEvent = {
    chainId,
    eventType,
    contractAddress: asAddr(log.address),
    programAddress: null,
    owner: null,
    transactionHash: String(log.transactionHash),
    logIndex,
    blockNumber,
    timestamp,
    programId: null,
    amounts: [],
    raw: {},
  }

  try {
    if (eventType === 'ProgramCreated') {
      const parsed = FACTORY_IFACE.parseLog({ topics: log.topics, data: log.data })
      const program = asAddr(parsed.args.program)
      const owner = asAddr(parsed.args.owner)
      return {
        ...base,
        programAddress: program,
        owner,
        programId: asHex(parsed.args.programId),
        raw: {
          projectToken: asAddr(parsed.args.projectToken),
          quoteAsset: asAddr(parsed.args.quoteAsset),
          pair: asAddr(parsed.args.pair),
          generation: asNum(parsed.args.generation),
          factoryVersion: asHex(parsed.args.factoryVersion),
        },
      }
    }

    if (eventType === 'LiquidityBuildingFeeSettled') {
      const parsed = FEE_IFACE.parseLog({ topics: log.topics, data: log.data })
      const program = asAddr(parsed.args.program)
      return {
        ...base,
        programAddress: program,
        programId: asHex(parsed.args.programId),
        amounts: [String(parsed.args.amount ?? '0')],
        raw: {
          settlementKey: asHex(parsed.args.settlementKey),
          executionId: asHex(parsed.args.executionId),
          quoteAsset: asAddr(parsed.args.quoteAsset),
          treasuryReceiver: asAddr(parsed.args.treasuryReceiver),
          amount: String(parsed.args.amount ?? '0'),
        },
      }
    }

    const parsed = PROGRAM_IFACE.parseLog({ topics: log.topics, data: log.data })
    const programId = parsed.args.programId != null ? asHex(parsed.args.programId) : null

    if (eventType === 'ExecutionCompleted') {
      return {
        ...base,
        programAddress: asAddr(log.address),
        programId: null,
        amounts: [
          String(parsed.args.projectTokenSold ?? '0'),
          String(parsed.args.grossQuoteAcquired ?? '0'),
          String(parsed.args.melegaFeePaid ?? '0'),
        ],
        raw: {
          executionId: asHex(parsed.args.executionId),
          epochId: String(parsed.args.epochId),
          relayer: asAddr(parsed.args.relayer),
          projectTokenSold: String(parsed.args.projectTokenSold),
          grossQuoteAcquired: String(parsed.args.grossQuoteAcquired),
          melegaFeePaid: String(parsed.args.melegaFeePaid),
          lpMinted: String(parsed.args.lpMinted),
        },
      }
    }

    const amounts: string[] = []
    if (parsed.args.amount != null) amounts.push(String(parsed.args.amount))
    if (parsed.args.totalDeposited != null) amounts.push(String(parsed.args.totalDeposited))
    if (parsed.args.remainingBudget != null) amounts.push(String(parsed.args.remainingBudget))

    return {
      ...base,
      programAddress: asAddr(log.address),
      programId,
      amounts,
      raw: {
        configNonce: parsed.args.configNonce != null ? asNum(parsed.args.configNonce) : null,
        mode: parsed.args.mode != null ? asNum(parsed.args.mode) : null,
        minBps: parsed.args.minBps != null ? asNum(parsed.args.minBps) : null,
        maxBps: parsed.args.maxBps != null ? asNum(parsed.args.maxBps) : null,
        totalDeposited: parsed.args.totalDeposited != null ? String(parsed.args.totalDeposited) : null,
        remainingBudget: parsed.args.remainingBudget != null ? String(parsed.args.remainingBudget) : null,
        amount: parsed.args.amount != null ? String(parsed.args.amount) : null,
      },
    }
  } catch {
    // Fallback: still record topic-matched event with minimal fields
    return {
      ...base,
      programAddress: eventType === 'ProgramCreated' ? null : asAddr(log.address),
      programId: log.topics[1] ? hexDataSlice(log.topics[1], 0) : null,
    }
  }
}

function statusFromEvent(eventType: LbEventName, current: LbIndexedLifecycle): LbIndexedLifecycle {
  switch (eventType) {
    case 'ProgramCreated':
      return 'Created'
    case 'BudgetDeposited':
    case 'BudgetAdded':
      return current === 'Active' || current === 'Paused' || current === 'SafetyPaused' || current === 'Stopped'
        ? current
        : 'Ready'
    case 'ProgramActivated':
      return 'Active'
    case 'ProgramPaused':
      return 'Paused'
    case 'ProgramResumed':
      return 'Active'
    case 'ProgramSafetyPaused':
      return 'SafetyPaused'
    case 'ProgramSafetyCleared':
      return 'Paused'
    case 'ProgramStopped':
      return 'Stopped'
    default:
      return current
  }
}

/** Apply a parsed event onto the program map (mutates map). */
export function applyLbEventToPrograms(
  programs: Map<string, LbIndexedProgram>,
  event: LbIndexedEvent,
): void {
  if (event.eventType === 'ProgramCreated') {
    const addr = event.programAddress
    if (!addr || !event.owner) return
    const existing = programs.get(addr)
    const next = emptyProgram({
      ...(existing ?? {}),
      programAddress: addr,
      owner: event.owner,
      programId: event.programId,
      projectToken: String(event.raw.projectToken ?? existing?.projectToken ?? ''),
      quoteAsset: String(event.raw.quoteAsset ?? existing?.quoteAsset ?? ''),
      pair: String(event.raw.pair ?? existing?.pair ?? ''),
      generation: typeof event.raw.generation === 'number' ? event.raw.generation : existing?.generation ?? null,
      factoryVersion: event.raw.factoryVersion != null ? String(event.raw.factoryVersion) : existing?.factoryVersion ?? null,
      status: 'Created',
      createdAt: event.timestamp ?? existing?.createdAt ?? null,
      updatedAt: event.timestamp ?? existing?.updatedAt ?? null,
    })
    programs.set(addr, next)
    return
  }

  if (event.eventType === 'LiquidityBuildingFeeSettled') {
    const fee = event.amounts[0] ?? String(event.raw.amount ?? '0')
    const addr = event.programAddress
    if (addr) {
      const prog = programs.get(addr) ?? emptyProgram({ programAddress: addr, owner: '' })
      prog.totalFeePaidWei = (BigInt(prog.totalFeePaidWei ?? '0') + BigInt(fee)).toString()
      prog.updatedAt = event.timestamp ?? prog.updatedAt
      if (event.programId) prog.programId = event.programId
      programs.set(addr, prog)
      return
    }
    if (!event.programId) return
    for (const prog of programs.values()) {
      if (prog.programId?.toLowerCase() === event.programId.toLowerCase()) {
        prog.totalFeePaidWei = (BigInt(prog.totalFeePaidWei ?? '0') + BigInt(fee)).toString()
        prog.updatedAt = event.timestamp ?? prog.updatedAt
        break
      }
    }
    return
  }

  const addr = event.programAddress
  if (!addr) return
  const prog = programs.get(addr) ?? emptyProgram({ programAddress: addr, owner: event.owner ?? '' })
  const type = event.eventType as LbEventName
  prog.status = statusFromEvent(type, prog.status)
  prog.updatedAt = event.timestamp ?? prog.updatedAt
  if (event.programId) prog.programId = event.programId

  if (type === 'ProgramActivated') prog.activatedAt = event.timestamp ?? prog.activatedAt
  if (type === 'ProgramPaused' || type === 'ProgramSafetyPaused') prog.pausedAt = event.timestamp ?? prog.pausedAt
  if (type === 'ProgramStopped') prog.stoppedAt = event.timestamp ?? prog.stoppedAt

  if (type === 'BudgetDeposited' || type === 'BudgetAdded') {
    if (event.raw.totalDeposited != null) {
      prog.reserveWei = String(event.raw.totalDeposited)
      prog.remainingWei = String(event.raw.totalDeposited)
    }
  }
  if (type === 'BudgetWithdrawn' && event.raw.remainingBudget != null) {
    prog.remainingWei = String(event.raw.remainingBudget)
  }
  if (type === 'ExecutionCompleted') {
    prog.executionCount += 1
    const feeRaw = event.raw.melegaFeePaid
    if (feeRaw != null && feeRaw !== '' && feeRaw !== 'undefined') {
      prog.totalFeePaidWei = (BigInt(prog.totalFeePaidWei ?? '0') + BigInt(String(feeRaw))).toString()
    }
  }
  if (type === 'StrategyUpdated') {
    const mode = typeof event.raw.mode === 'number' ? event.raw.mode : null
    prog.strategyMode = mode
    prog.strategy = strategyLabel(mode)
    prog.minimumRateBps = typeof event.raw.minBps === 'number' ? event.raw.minBps : prog.minimumRateBps
    prog.maximumRateBps = typeof event.raw.maxBps === 'number' ? event.raw.maxBps : prog.maximumRateBps
  }

  programs.set(addr, prog)
}

export function rebuildProgramsFromEvents(events: LbIndexedEvent[]): LbIndexedProgram[] {
  const map = new Map<string, LbIndexedProgram>()
  const sorted = [...events].sort(
    (a, b) => a.blockNumber - b.blockNumber || a.logIndex - b.logIndex,
  )
  for (const ev of sorted) applyLbEventToPrograms(map, ev)
  return [...map.values()]
}
