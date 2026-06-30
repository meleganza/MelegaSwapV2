export type DexCapabilityAuditStatus =
  | 'LIVE'
  | 'CONFIG_ONLY'
  | 'UI_ONLY'
  | 'PARTIAL'
  | 'MISSING'
  | 'DEPRECATED'
  | 'UNKNOWN'

export type DexCapabilityRiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface DexCapabilityAuditEntry {
  id: string
  label: string
  status: DexCapabilityAuditStatus
  relevantFiles: string[]
  route?: string
  contractDependency: string
  configDependency: string
  userFacingAvailability: string
  reusable: boolean
  needsExtension: boolean
  riskLevel: DexCapabilityRiskLevel
  recommendedNextAction: string
  notes?: string
}

export interface DexCapabilityAuditManifest {
  manifest: string
  api_version: string
  phase: string
  mission: string
  audit_only: true
  as_of: string
  disclaimer: string
  summary: {
    total: number
    live: number
    config_only: number
    partial: number
    missing: number
    deprecated: number
  }
  chain_support: {
    wagmi_chains: number[]
    multi_chain_features: string[]
    bsc_only_features: string[]
  }
  capabilities: DexCapabilityAuditEntry[]
  recommended_mission_14: string
  highest_risk_gaps: string[]
  reusable_flows: string[]
}
