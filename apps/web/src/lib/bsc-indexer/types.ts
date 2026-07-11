export type IndexerProtocol = 'amm' | 'masterchef' | 'smartchef'

export type IndexerEventType =
  | 'PairCreated'
  | 'Swap'
  | 'Mint'
  | 'Burn'
  | 'Sync'
  | 'Deposit'
  | 'Withdraw'
  | 'EmergencyWithdraw'

export interface NormalizedIndexerEvent {
  chainId: number
  protocol: IndexerProtocol
  eventType: IndexerEventType
  contractAddress: string
  pairAddress?: string
  poolId?: string
  farmPid?: number
  token0?: string
  token1?: string
  tokenIn?: string
  tokenOut?: string
  amount0?: string
  amount1?: string
  amountIn?: string
  amountOut?: string
  wallet?: string
  recipient?: string
  txHash: string
  logIndex: number
  blockNumber: number
  blockTimestamp: number
  explorerUrl: string
  sourceStatus: 'indexed' | 'backfill' | 'incremental'
}

export type IndexerPhase = 'bootstrap' | 'incremental'

export interface IndexerCheckpoint {
  chainId: number
  lastIndexedBlock: number
  chainHeadAtSync: number
  reorgSafetyBlocks: number
  lastSuccessfulSync: string
  lastFailureReason?: string
  chunkSize: number
  cursorPairIndex: number
  /** R771 v2 featured-pair namespace — absent on legacy R768 checkpoints. */
  schemaVersion?: number
  phase?: IndexerPhase
  featuredPairSlug?: string
  bootstrapStartBlock?: number
  bootstrapDays?: number
  providerUsed?: string
  legacyNote?: string
  /** R773 — featured-pair checkpoint reset metadata. */
  resetReason?: string
  resetAt?: string
}

export interface IndexerHealthSnapshot {
  status: 'ready' | 'syncing' | 'error' | 'unavailable'
  storageBackend: string
  storageConfigured: boolean
  lastIndexedBlock: number
  chainHead: number
  indexingLag: number
  lastSuccessfulSync?: string
  lastFailureReason?: string
  eventCounts: Record<string, number>
  startedAt?: string
  finishedAt?: string
  indexerGeneration?: 'v2-featured-pair' | 'legacy-universal'
  featuredPairSlug?: string
  phase?: IndexerPhase
  providerUsed?: string
  indexedBlockRange?: { from: number; to: number }
  bootstrapDays?: number
  bootstrapStartBlock?: number
  providerHealth?: Array<{
    url: string
    label: string
    healthy: boolean
    lastFailureReason?: string
    quarantinedUntil?: string
  }>
}

export interface OhlcvCandle {
  pairAddress: string
  interval: '1H' | '4H' | '1D'
  bucketTimestamp: number
  open: number
  high: number
  low: number
  close: number
  baseVolume: number
  quoteVolume: number
  tradeCount: number
  startBlock: number
  endBlock: number
  lastUpdated: string
}

export type PairDiscoveryClass =
  | 'tradeable'
  | 'liquidity_present'
  | 'inactive'
  | 'metadata_incomplete'
  | 'invalid_contract'

export interface ClassifiedAmmPair {
  pairAddress: string
  token0?: string
  token1?: string
  symbol0?: string
  symbol1?: string
  reserve0?: string
  reserve1?: string
  classification: PairDiscoveryClass
  metadataStatus: 'complete' | 'partial' | 'address_only'
  active: boolean
  lastVerified?: string
}
