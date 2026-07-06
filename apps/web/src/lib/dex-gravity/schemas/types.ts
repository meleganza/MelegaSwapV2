import type {
  DEX_CANONICAL_PIPELINES,
  DEX_DELEGATED_AUTHORITIES,
  DEX_FORBIDDEN_AUTHORITIES,
  DEX_GRAVITY_SCHEMA_VERSION,
  MELEGA_DEX_SCHEMA,
  MELEGA_EXECUTION_SCHEMA,
  MELEGA_EXCHANGE_RECEIPT_SCHEMA,
  MELEGA_LIQUIDITY_SCHEMA,
} from '../constants'

export interface DexAuthorityBoundaries {
  owns: readonly string[]
  delegated: readonly (typeof DEX_DELEGATED_AUTHORITIES)[number][]
  forbidden: readonly (typeof DEX_FORBIDDEN_AUTHORITIES)[number][]
  receiptOnlySettlement: true
}

export interface DexProvenance {
  module: 'dex-gravity'
  kap: 'KAP-006C'
  emittedAt: string
}

export interface MelegaDexV1Payload {
  schema: typeof MELEGA_DEX_SCHEMA
  schemaVersion: typeof DEX_GRAVITY_SCHEMA_VERSION
  role: 'Civilization Economic Exchange Engine'
  civilizationLiquidityOwner: true
  pipelines: readonly (typeof DEX_CANONICAL_PIPELINES)[number][]
  chains: number[]
  venues: string[]
  capabilities: {
    swapRouting: true
    lpRouting: true
    executionIngress: true
    treasuryHandoff: 'receipt-only'
    opportunityRefConsumption: true
    gravityComputation: false
    opportunityTruth: false
  }
  routingPolicy: {
    quoteOwner: 'routing-layer'
    computationEngine: 'smart-router'
  }
  executionPolicy: {
    submitOwner: 'execution-ingress'
    evidenceOwner: 'execution-tracker'
  }
  treasuryHandoff: {
    schema: typeof MELEGA_EXCHANGE_RECEIPT_SCHEMA
    legacySchema: 'melega.dex-execution-receipt.v1'
    settlementBoundary: 'receipt-only'
  }
  opportunityRef: {
    consumption: 'read-only'
    detection: false
    ranking: false
  }
  authority: DexAuthorityBoundaries
  provenance: DexProvenance
}

export interface MelegaLiquidityV1Payload {
  schema: typeof MELEGA_LIQUIDITY_SCHEMA
  schemaVersion: typeof DEX_GRAVITY_SCHEMA_VERSION
  canonicalOwner: 'liquidityRuntime'
  canonicalRoute: '/liquidity-studio'
  aliasRoutes: readonly string[]
  operation?: 'mint' | 'burn' | 'positions' | 'simulation'
  poolDiscovery: boolean
  lpPositions: boolean
  analytics: boolean
  optimizationRecommendations: boolean
  autoExecution: false
  rewardsOwnership: 'farms-pools-separate'
  authority: DexAuthorityBoundaries
  provenance: DexProvenance
  pair?: string
  poolAddress?: string
  wallet?: string
  chainId?: number
}

export type ExecutionLifecyclePhase =
  | 'quoted'
  | 'instruction_packaged'
  | 'ingress_dispatched'
  | 'wallet_submitted'
  | 'confirmed'
  | 'failed'

export interface MelegaExecutionV1Payload {
  schema: typeof MELEGA_EXECUTION_SCHEMA
  schemaVersion: typeof DEX_GRAVITY_SCHEMA_VERSION
  lifecycle: ExecutionLifecyclePhase
  instructionId?: string
  correlationId?: string
  adapter?: string
  routingDomain?: string
  quoteOwner: 'routing-layer'
  submitOwner: 'execution-ingress'
  authority: DexAuthorityBoundaries
  provenance: DexProvenance
}

export interface MelegaExchangeReceiptV1Payload {
  schema: typeof MELEGA_EXCHANGE_RECEIPT_SCHEMA
  schemaVersion: typeof DEX_GRAVITY_SCHEMA_VERSION
  legacySchema: 'melega.dex-execution-receipt.v1'
  transactionHash: string
  wallet: string
  chain: number
  timestamp: string
  status: 'confirmed' | 'failed'
  operation: 'swap' | 'liquidity-mint' | 'liquidity-burn'
  settlementBoundary: 'receipt-only'
  authority: DexAuthorityBoundaries
  provenance: DexProvenance
  asset?: {
    symbol: string
    address: string
    decimals?: number
  }
  amount?: string
  fee?: string
  explorerUrl?: string
  originModule?: string
}
