/**
 * Canonical Liquidity Builder event signatures + topic0 hashes.
 * Computed via keccak256(signature) — never hand-edited hashes.
 */
import { id } from '@ethersproject/hash'
import { LB_CANONICAL_DEPLOYED_ADDRESSES } from 'config/constants/liquidityBuildingDeployment'

export const LB_FACTORY_ADDRESS = LB_CANONICAL_DEPLOYED_ADDRESSES.lbFactory
export const LB_FEE_SINK_ADDRESS = LB_CANONICAL_DEPLOYED_ADDRESSES.lbFeeSink

/** Exact ABI event signatures (uint8 for StrategyMode). */
export const LB_EVENT_SIGNATURES = {
  ProgramCreated:
    'ProgramCreated(bytes32,address,address,address,address,address,uint64,bytes32)',
  ProgramActivated: 'ProgramActivated(bytes32,uint64)',
  ProgramPaused: 'ProgramPaused(bytes32,uint64)',
  ProgramResumed: 'ProgramResumed(bytes32,uint64)',
  ProgramStopped: 'ProgramStopped(bytes32,uint64)',
  ProgramSafetyPaused: 'ProgramSafetyPaused(bytes32,bytes32,address,uint64)',
  ProgramSafetyCleared: 'ProgramSafetyCleared(bytes32,uint64)',
  BudgetDeposited: 'BudgetDeposited(bytes32,uint256,uint256,uint64)',
  BudgetAdded: 'BudgetAdded(bytes32,uint256,uint256,uint64)',
  BudgetWithdrawn: 'BudgetWithdrawn(bytes32,uint256,uint256,uint64)',
  ExecutionCompleted:
    'ExecutionCompleted(bytes32,uint256,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,address,bytes32)',
  LiquidityBuildingFeeSettled:
    'LiquidityBuildingFeeSettled(bytes32,bytes32,bytes32,address,address,uint256,address,bytes32,bytes32)',
  StrategyUpdated: 'StrategyUpdated(bytes32,uint8,uint16,uint16,uint64)',
} as const

export type LbEventName = keyof typeof LB_EVENT_SIGNATURES

export const LB_EVENT_TOPICS: Record<LbEventName, string> = {
  ProgramCreated: id(LB_EVENT_SIGNATURES.ProgramCreated),
  ProgramActivated: id(LB_EVENT_SIGNATURES.ProgramActivated),
  ProgramPaused: id(LB_EVENT_SIGNATURES.ProgramPaused),
  ProgramResumed: id(LB_EVENT_SIGNATURES.ProgramResumed),
  ProgramStopped: id(LB_EVENT_SIGNATURES.ProgramStopped),
  ProgramSafetyPaused: id(LB_EVENT_SIGNATURES.ProgramSafetyPaused),
  ProgramSafetyCleared: id(LB_EVENT_SIGNATURES.ProgramSafetyCleared),
  BudgetDeposited: id(LB_EVENT_SIGNATURES.BudgetDeposited),
  BudgetAdded: id(LB_EVENT_SIGNATURES.BudgetAdded),
  BudgetWithdrawn: id(LB_EVENT_SIGNATURES.BudgetWithdrawn),
  ExecutionCompleted: id(LB_EVENT_SIGNATURES.ExecutionCompleted),
  LiquidityBuildingFeeSettled: id(LB_EVENT_SIGNATURES.LiquidityBuildingFeeSettled),
  StrategyUpdated: id(LB_EVENT_SIGNATURES.StrategyUpdated),
}

export const LB_FACTORY_TOPIC0S = [LB_EVENT_TOPICS.ProgramCreated] as const

export const LB_PROGRAM_TOPIC0S = [
  LB_EVENT_TOPICS.ProgramActivated,
  LB_EVENT_TOPICS.ProgramPaused,
  LB_EVENT_TOPICS.ProgramResumed,
  LB_EVENT_TOPICS.ProgramStopped,
  LB_EVENT_TOPICS.ProgramSafetyPaused,
  LB_EVENT_TOPICS.ProgramSafetyCleared,
  LB_EVENT_TOPICS.BudgetDeposited,
  LB_EVENT_TOPICS.BudgetAdded,
  LB_EVENT_TOPICS.BudgetWithdrawn,
  LB_EVENT_TOPICS.ExecutionCompleted,
  LB_EVENT_TOPICS.StrategyUpdated,
] as const

export const LB_FEE_TOPIC0S = [LB_EVENT_TOPICS.LiquidityBuildingFeeSettled] as const

export function lbFactoryTopicsOrFilter(): [string[]] {
  return [[...LB_FACTORY_TOPIC0S]]
}

export function lbProgramTopicsOrFilter(): [string[]] {
  return [[...LB_PROGRAM_TOPIC0S]]
}

export function lbFeeTopicsOrFilter(): [string[]] {
  return [[...LB_FEE_TOPIC0S]]
}

export function topicToLbEventName(topic0: string | undefined | null): LbEventName | null {
  if (!topic0) return null
  const t = topic0.toLowerCase()
  for (const [name, hash] of Object.entries(LB_EVENT_TOPICS) as [LbEventName, string][]) {
    if (hash.toLowerCase() === t) return name
  }
  return null
}
