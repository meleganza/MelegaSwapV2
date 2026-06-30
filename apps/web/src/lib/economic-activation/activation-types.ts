export type ActivationStageId =
  | 'narrative'
  | 'validation'
  | 'project_registry'
  | 'canonical_asset'
  | 'economic_presence'
  | 'venue_activation'
  | 'economic_events'
  | 'treasury_runtime'
  | 'radar'
  | 'space'
  | 'smartdrop'

export type ActivationStageStatus = 'READY' | 'WAITING' | 'BLOCKED' | 'PLANNED'

export type EconomicPresenceChainId = 'bnb' | 'ethereum' | 'polygon' | 'base' | 'solana'

export interface ConstitutionalCanonicalEconomy {
  canonicalChain: 'BNB Chain'
  canonicalAsset: 'MARCO'
  status: 'LIVE'
  immutable: true
}

export interface EconomicPresenceTarget {
  chainId: EconomicPresenceChainId
  displayName: string
  role: 'canonical' | 'presence'
  registryChainId?: number
  status: ActivationStageStatus
  notes: string
}

export interface ActivationStage {
  id: ActivationStageId
  label: string
  status: ActivationStageStatus
  summary: string
  notes?: string
  href?: string
  machineSurface?: string
}

export interface ActivationPipelineReadModel {
  mode: 'labs_preview' | 'project_derived'
  projectSlug?: string
  asOf: string
  disclaimer: string
  constitutional: ConstitutionalCanonicalEconomy
  presenceTargets: EconomicPresenceTarget[]
  stages: ActivationStage[]
  labsConnected: boolean
  narrativeIndexed: boolean
}

export interface ActivationManifest {
  manifest: string
  api_version: string
  phase: string
  constitution: string
  schema: string
  canonical_economy: ConstitutionalCanonicalEconomy
  presence_targets: EconomicPresenceTarget[]
  pipeline: {
    stage_id: ActivationStageId
    label: string
    status: ActivationStageStatus
    summary: string
    notes?: string
    href?: string
    machine_surface?: string
  }[]
  labs_connected: boolean
  narrative_indexed: boolean
  project_slug?: string
  disclaimer: string
  data_source: string
  as_of: string
}
