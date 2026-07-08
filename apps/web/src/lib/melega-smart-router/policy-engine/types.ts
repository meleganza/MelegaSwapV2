/** Phase 2.5 — externalized policy references consumed by execution pipeline. */

export const POLICY_ENGINE_VERSION = '2.5.0' as const
export const POLICY_ENGINE_SCHEMA = 'melega.policy-engine.v1' as const

export type PricingPolicyRef = 'D87_DEX_PRICING_RATIFIED'
export type TreasuryPolicyRef = 'FSC-01'
export type RegistryPolicyRef = 'smart-router-registry' | 'treasury-runtime-registry' | 'kerl-registry'
export type ExecutionPolicyRef = 'melega.execution-policy.v1'
export type CompliancePolicyRef = 'melega.compliance-policy.v1'
export type ChainPolicyRef = 'melega.chain-policy.v1'

export interface PricingPolicy {
  policyRef: PricingPolicyRef
  version: string
  protocolFeeStandardBps: number
  protocolFeeBuyMarcoBps: number
  buyMarcoRule: string
  lpFeePolicy: string
  lpFeeNote: string
}

export interface TreasuryPolicy {
  policyRef: TreasuryPolicyRef
  version: string
  dexPolicy: string
  owner: string
  settlementOwner: string
}

export interface RegistryPolicy {
  policyRef: RegistryPolicyRef
  version: string
  resolutionOrder: string[]
  disclaimer: string
}

export interface ExecutionPolicy {
  policyRef: ExecutionPolicyRef
  version: string
  architecture: 'ADAPTER'
  targetArchitecture: 'WRAPPER'
  exactInput: 'supported'
  exactOutput: 'blocked'
  feeOnTransfer: 'blocked'
  settlementLayer: 'treasury-runtime'
}

export interface CompliancePolicy {
  policyRef: CompliancePolicyRef
  version: string
  dexOwnsSettlement: false
  forwardsGrossProtocolFeeOnly: true
  forbiddenLocalOperations: string[]
}

export interface ChainPolicy {
  policyRef: ChainPolicyRef
  version: string
  chainId: number
  chainName: string
  executionRouter?: string
  wrapperStatus: string
  collectorStatus: string
  marcoStatus: string
}

export interface SmartRouterPolicyBundle {
  schema: typeof POLICY_ENGINE_SCHEMA
  engineVersion: typeof POLICY_ENGINE_VERSION
  pricing: PricingPolicy
  treasury: TreasuryPolicy
  registry: RegistryPolicy[]
  execution: ExecutionPolicy
  compliance: CompliancePolicy
  chain?: ChainPolicy
}
