import { ConstitutionalCanonicalEconomy } from 'lib/economic-activation'

export type WorkspaceSectionId =
  | 'projects'
  | 'assets'
  | 'liquidity'
  | 'pools'
  | 'farms'
  | 'presence'
  | 'activation'
  | 'execution'

export interface WorkspaceSectionItem {
  id: string
  label: string
  href?: string
  status?: string
  notes?: string
}

export interface WorkspaceSection {
  id: WorkspaceSectionId
  label: string
  description: string
  moduleHref: string
  items: WorkspaceSectionItem[]
  emptyMessage: string
  hasActivity: boolean
  indexedCount: number
}

export interface WorkspaceFutureSurface {
  id: string
  label: string
  status: 'PLANNED'
  manifest: string
  notes: string
}

export interface UserWorkspaceReadModel {
  asOf: string
  disclaimer: string
  readOnly: true
  executionEnabled: false
  constitutional: ConstitutionalCanonicalEconomy
  sections: WorkspaceSection[]
  futureSurfaces: WorkspaceFutureSurface[]
}

export interface UserWorkspaceManifest {
  manifest: string
  api_version: string
  phase: string
  read_only: true
  execution_enabled: false
  as_of: string
  disclaimer: string
  constitutional: ConstitutionalCanonicalEconomy
  sections: {
    section_id: WorkspaceSectionId
    label: string
    module_href: string
    indexed_count: number
    has_activity: boolean
    items: WorkspaceSectionItem[]
  }[]
  future_surfaces: WorkspaceFutureSurface[]
}
