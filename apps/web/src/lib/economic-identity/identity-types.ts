import { ConstitutionalCanonicalEconomy } from 'lib/economic-activation'

export type IdentityArchetype =
  | 'human_operator'
  | 'ai_agent'
  | 'project_operator'
  | 'liquidity_provider'
  | 'collector'
  | 'launcher'
  | 'observer'

export type WalletConnectionStatus =
  | 'wallet_not_connected'
  | 'connected_wallet_future'
  | 'not_indexed'

export type IdentitySurfaceStatus = 'indexed' | 'available' | 'planned' | 'not_indexed'

export type AgentReadinessLabel =
  | 'observer'
  | 'surface_aware'
  | 'operator_candidate'
  | 'agent_ready_planned'

export interface IdentityArchetypeRecord {
  id: IdentityArchetype
  label: string
  description: string
  status: IdentitySurfaceStatus
  notes: string
}

export interface WalletIdentityState {
  status: WalletConnectionStatus
  address: string | null
  addressIndexed: false
  holdingsIndexed: false
  notes: string
}

export interface IdentitySurfaceLink {
  id: string
  label: string
  href: string
  status?: string
  notes?: string
}

export interface IdentityReadModelSection {
  id: string
  label: string
  description: string
  moduleHref: string
  status: IdentitySurfaceStatus
  indexedCount: number
  items: IdentitySurfaceLink[]
  emptyMessage: string
}

export interface AgentReadinessScore {
  score: number
  label: AgentReadinessLabel
  maxScore: number
  illustrative: true
  dimensions: {
    id: string
    label: string
    status: IdentitySurfaceStatus
    weight: number
    contribution: number
  }[]
  notes: string
}

export interface EconomicIdentityReadModel {
  asOf: string
  disclaimer: string
  readOnly: true
  executionEnabled: false
  isSocialProfile: false
  isKyc: false
  isAccountCreation: false
  constitutional: ConstitutionalCanonicalEconomy
  wallet: WalletIdentityState
  primaryArchetype: IdentityArchetype
  archetypes: IdentityArchetypeRecord[]
  sections: IdentityReadModelSection[]
  agentReadiness: AgentReadinessScore
  crossLinks: {
    workspace: string
    launch: string
    collectibles: string
    presence: string
    activation: string
    execution: string
    graph: string
    query: string
  }
}

export interface EconomicIdentityManifest {
  manifest: string
  api_version: string
  phase: string
  read_only: true
  execution_enabled: false
  as_of: string
  disclaimer: string
  framing: {
    is_social_profile: false
    is_kyc: false
    is_account_creation: false
  }
  constitutional: ConstitutionalCanonicalEconomy
  wallet: WalletIdentityState
  primary_archetype: IdentityArchetype
  archetypes: IdentityArchetypeRecord[]
  agent_readiness: AgentReadinessScore
  sections: {
    section_id: string
    label: string
    module_href: string
    status: IdentitySurfaceStatus
    indexed_count: number
    items: IdentitySurfaceLink[]
  }[]
  cross_links: EconomicIdentityReadModel['crossLinks']
}
