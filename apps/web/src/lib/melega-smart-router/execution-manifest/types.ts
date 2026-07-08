/** Phase 2.5 — immutable execution self-description schema. */

export const EXECUTION_MANIFEST_SCHEMA = 'melega.execution-manifest.v1' as const
export const MELEGA_SMART_ROUTER_ADAPTER_VERSION = '2.5.0' as const

export type ExecutionManifestStatus = 'prepared' | 'blocked'
export type ExecutionManifestValidationState = 'valid' | 'blocked' | 'incomplete'

export interface ExecutionManifest {
  schema: typeof EXECUTION_MANIFEST_SCHEMA
  executionId: string
  executionTimestamp: string
  chainId: number
  executionLayer: 'ADAPTER'
  executionRouter: string
  smartRouterPhase: {
    current: 'ADAPTER'
    target: 'WRAPPER'
  }
  wrapperVersion: string
  adapterVersion: typeof MELEGA_SMART_ROUTER_ADAPTER_VERSION
  pricingPolicy: string
  policyVersion: string
  inputToken: string
  outputToken: string
  grossAmount: string
  netAmount: string
  protocolFee: string
  lpFee: string
  treasuryCollector: string
  treasuryPolicy: string
  buyMarcoApplied: boolean
  registryVersion: string
  receiptHash: string
  machineReadable: Record<string, unknown>
  status: ExecutionManifestStatus
  validationState: ExecutionManifestValidationState
  blockCode?: string
  blockMessage?: string
}
