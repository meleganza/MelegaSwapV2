/** Indexed Liquidity Builder program inventory + event ledger. */

export type LbIndexedLifecycle =
  | 'Created'
  | 'Ready'
  | 'Active'
  | 'Paused'
  | 'SafetyPaused'
  | 'Stopped'
  | 'Unknown'

export type LbStrategyLabel = 'AI Optimized' | 'Custom Range' | 'Unknown'

export interface LbIndexedProgram {
  programAddress: string
  programId: string | null
  owner: string
  projectToken: string
  quoteAsset: string
  pair: string
  /** Total deposited / last known reserve (wei string). */
  reserveWei: string | null
  remainingWei: string | null
  status: LbIndexedLifecycle
  strategy: LbStrategyLabel
  strategyMode: number | null
  minimumRateBps: number | null
  maximumRateBps: number | null
  /** Product goal is UX-only — null until product metadata exists. */
  goal: string | null
  generation: number | null
  createdAt: number | null
  activatedAt: number | null
  pausedAt: number | null
  stoppedAt: number | null
  updatedAt: number | null
  executionCount: number
  totalFeePaidWei: string | null
  factoryVersion: string | null
}

export interface LbIndexedEvent {
  chainId: number
  eventType: string
  contractAddress: string
  programAddress: string | null
  owner: string | null
  transactionHash: string
  logIndex: number
  blockNumber: number
  timestamp: number | null
  programId: string | null
  amounts: string[]
  raw: Record<string, string | number | null>
}

export interface LbProgramInventoryDocument {
  schema: 'melega.dex.v1.lb-program-inventory'
  chainId: number
  updatedAt: string
  programs: LbIndexedProgram[]
  events: LbIndexedEvent[]
  cursor: {
    factoryLastScannedBlock: number | null
    feeLastScannedBlock: number | null
    programsLastScannedBlock: number | null
  }
}

export interface LbProgramApiRow {
  programAddress: string
  token: string
  quoteAsset: string
  pair: string
  reserve: string | null
  remaining: string | null
  status: LbIndexedLifecycle
  strategy: LbStrategyLabel
  goal: string | null
  timestamps: {
    createdAt: number | null
    activatedAt: number | null
    pausedAt: number | null
    stoppedAt: number | null
    updatedAt: number | null
  }
  programId: string | null
  owner: string
  executionCount: number
  totalFeePaid: string | null
  generation: number | null
}

export const LB_INVENTORY_SCHEMA = 'melega.dex.v1.lb-program-inventory' as const
export const LB_INDEXER_CHAIN_ID = 56
