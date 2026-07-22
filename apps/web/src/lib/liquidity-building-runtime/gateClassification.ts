/**
 * LB-ACT-003 — Canonical Liquidity Building gate classification registry.
 *
 * Unclassified gates must never silently block activation.
 */

export type GateClassification =
  | 'EXECUTION_CRITICAL'
  | 'DEPLOYMENT_CRITICAL'
  | 'ACCOUNTING_ASYNC'
  | 'OBSERVABILITY_ONLY'

export type GateRuntimeStatus =
  | 'CONNECTED'
  | 'PARTIAL'
  | 'UNAVAILABLE'
  | 'MISCONFIGURED'
  | 'NOT_CONFIGURED'
  | 'UNKNOWN'

export type GateRegistryEntry = {
  gateId: string
  classification: GateClassification
  /** Optional secondary classification (e.g. fee receiver is also deployment-critical). */
  secondaryClassification?: GateClassification
  blocksActivation: boolean
  blocksExecution: boolean
  requiredAtDeployment: boolean
  runtimeStatus: GateRuntimeStatus
  blockerCode: string | null
  warningCode: string | null
  description: string
  rationale: string
}

export type GateClassificationSnapshot = GateRegistryEntry & {
  assessedReady: boolean | null
}

/** Consumer gate ids (activation-status surface). */
export const LB_EXECUTION_CRITICAL_GATE_IDS = [
  'LB-G03B',
  'LB-G11',
  'LB-G03C',
  'LB-G04B',
  'LB-G08',
  'LB-G10',
] as const

export const LB_ACCOUNTING_ASYNC_GATE_IDS = ['LB-G04C/G12'] as const

/** All gates still reported in diagnostics (execution + accounting). */
export const LB_DIAGNOSTIC_GATE_IDS = [
  ...LB_EXECUTION_CRITICAL_GATE_IDS,
  ...LB_ACCOUNTING_ASYNC_GATE_IDS,
] as const

export type LbDiagnosticGateId = (typeof LB_DIAGNOSTIC_GATE_IDS)[number]
export type LbExecutionCriticalGateId = (typeof LB_EXECUTION_CRITICAL_GATE_IDS)[number]
export type LbAccountingAsyncGateId = (typeof LB_ACCOUNTING_ASYNC_GATE_IDS)[number]

export const LIQUIDITY_BUILDING_GATE_REGISTRY: readonly GateRegistryEntry[] = [
  {
    gateId: 'LB-G03B',
    classification: 'EXECUTION_CRITICAL',
    blocksActivation: true,
    blocksExecution: true,
    requiredAtDeployment: true,
    runtimeStatus: 'UNKNOWN',
    blockerCode: 'LB-G03B',
    warningCode: null,
    description: 'Production KMS signer configured',
    rationale: 'Autonomous signing authority is required before any mainnet execution.',
  },
  {
    gateId: 'LB-G11',
    classification: 'EXECUTION_CRITICAL',
    blocksActivation: true,
    blocksExecution: true,
    requiredAtDeployment: true,
    runtimeStatus: 'UNKNOWN',
    blockerCode: 'LB-G11',
    warningCode: null,
    description: 'Production KMS verification passed',
    rationale: 'Production verification proves the KMS path is non-exportable and correctly wired.',
  },
  {
    gateId: 'LB-G03C',
    classification: 'EXECUTION_CRITICAL',
    blocksActivation: true,
    blocksExecution: true,
    requiredAtDeployment: true,
    runtimeStatus: 'UNKNOWN',
    blockerCode: 'LB-G03C',
    warningCode: null,
    description: 'Bounded execution relay configured and operational',
    rationale: 'Relay submission is required to broadcast signed executeLiquidityBuilding calls.',
  },
  {
    gateId: 'LB-G04B',
    classification: 'EXECUTION_CRITICAL',
    secondaryClassification: 'DEPLOYMENT_CRITICAL',
    blocksActivation: true,
    blocksExecution: true,
    requiredAtDeployment: true,
    runtimeStatus: 'UNKNOWN',
    blockerCode: 'LB-G04B',
    warningCode: null,
    description: 'Valid Treasury fee receiver address (deployment + execution critical)',
    rationale:
      'On-chain FeeSink immutable receiver must be valid for atomic fee transfer; missing receiver blocks activation.',
  },
  {
    gateId: 'LB-G04C',
    classification: 'ACCOUNTING_ASYNC',
    blocksActivation: false,
    blocksExecution: false,
    requiredAtDeployment: false,
    runtimeStatus: 'UNKNOWN',
    blockerCode: null,
    warningCode: 'TREASURY_ACCOUNTING_DEGRADED',
    description: 'Treasury Runtime ingestion readiness (async accounting)',
    rationale:
      'FeePaid events are indexed asynchronously; Runtime ingestion must not gate deterministic on-chain execution.',
  },
  {
    gateId: 'LB-G12',
    classification: 'ACCOUNTING_ASYNC',
    blocksActivation: false,
    blocksExecution: false,
    requiredAtDeployment: false,
    runtimeStatus: 'UNKNOWN',
    blockerCode: null,
    warningCode: 'TREASURY_ACCOUNTING_DEGRADED',
    description: 'Treasury reconciliation readiness (async accounting)',
    rationale: 'Reconciliation/receipting is observational; pending status must not skip epochs or refuse relay.',
  },
  {
    gateId: 'LB-G04C/G12',
    classification: 'ACCOUNTING_ASYNC',
    blocksActivation: false,
    blocksExecution: false,
    requiredAtDeployment: false,
    runtimeStatus: 'UNKNOWN',
    blockerCode: null,
    warningCode: 'TREASURY_ACCOUNTING_DEGRADED',
    description: 'Combined Treasury ingestion + reconciliation diagnostic gate',
    rationale: 'Legacy combined diagnostic id retained for artifact compatibility; ACCOUNTING_ASYNC only.',
  },
  {
    gateId: 'LB-G08',
    classification: 'EXECUTION_CRITICAL',
    blocksActivation: true,
    blocksExecution: true,
    requiredAtDeployment: true,
    runtimeStatus: 'UNKNOWN',
    blockerCode: 'LB-G08',
    warningCode: null,
    description: 'Approved on-chain quote policy available',
    rationale: 'Quote-asset policy is enforced on-chain and must be present before activation.',
  },
  {
    gateId: 'LB-G10',
    classification: 'EXECUTION_CRITICAL',
    blocksActivation: true,
    blocksExecution: true,
    requiredAtDeployment: true,
    runtimeStatus: 'UNKNOWN',
    blockerCode: 'LB-G10',
    warningCode: null,
    description: 'Chain finality / execution safety requirement',
    rationale: 'Observation finality protects against reorg-driven incorrect epoch economics.',
  },
  {
    gateId: 'LB-G09',
    classification: 'OBSERVABILITY_ONLY',
    blocksActivation: false,
    blocksExecution: false,
    requiredAtDeployment: false,
    runtimeStatus: 'UNKNOWN',
    blockerCode: null,
    warningCode: 'QUOTE_POLICY_OBSERVABILITY',
    description: 'Quote-policy observability companion (does not block when G08 ready)',
    rationale: 'Companion observability for quote policy; does not independently block activation.',
  },
  {
    gateId: 'CONTRACTS_DEPLOYED',
    classification: 'DEPLOYMENT_CRITICAL',
    blocksActivation: true,
    blocksExecution: true,
    requiredAtDeployment: true,
    runtimeStatus: 'UNKNOWN',
    blockerCode: 'CONTRACTS_NOT_DEPLOYED',
    warningCode: null,
    description: 'Liquidity Building contracts deployed',
    rationale: 'Factory / Authorizer / FeeSink addresses must exist before activation can be authorized.',
  },
  {
    gateId: 'CONTRACT_BINDINGS',
    classification: 'DEPLOYMENT_CRITICAL',
    blocksActivation: true,
    blocksExecution: true,
    requiredAtDeployment: true,
    runtimeStatus: 'UNKNOWN',
    blockerCode: 'CONTRACT_BINDINGS_INVALID',
    warningCode: null,
    description: 'Factory and Router bindings verified',
    rationale: 'Melega Factory/Router bindings must match canonical production addresses.',
  },
  {
    gateId: 'FEE_BPS_500',
    classification: 'DEPLOYMENT_CRITICAL',
    blocksActivation: true,
    blocksExecution: true,
    requiredAtDeployment: true,
    runtimeStatus: 'UNKNOWN',
    blockerCode: 'FEE_BPS_INVALID',
    warningCode: null,
    description: 'Success fee fixed at 500 bps',
    rationale: 'Protocol fee is immutable at 500 bps; deployment must not alter fee economics.',
  },
  {
    gateId: 'EXECUTOR_AUTHORITY',
    classification: 'EXECUTION_CRITICAL',
    blocksActivation: true,
    blocksExecution: true,
    requiredAtDeployment: true,
    runtimeStatus: 'UNKNOWN',
    blockerCode: 'EXECUTOR_AUTHORITY_INVALID',
    warningCode: null,
    description: 'Executor authority verified',
    rationale: 'Only the configured executor may call executeLiquidityBuilding.',
  },
]

export function getGateClassification(gateId: string): GateClassification | null {
  const row = LIQUIDITY_BUILDING_GATE_REGISTRY.find((g) => g.gateId === gateId)
  return row?.classification ?? null
}

export function gateBlocksActivation(gateId: string): boolean {
  const row = LIQUIDITY_BUILDING_GATE_REGISTRY.find((g) => g.gateId === gateId)
  if (!row) return false
  return row.blocksActivation
}

export function isAccountingAsyncGate(gateId: string): boolean {
  return getGateClassification(gateId) === 'ACCOUNTING_ASYNC'
}
