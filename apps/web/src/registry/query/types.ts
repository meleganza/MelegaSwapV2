import { GraphNodeType } from 'registry/graph/types'
import { CapabilityStatus } from 'registry/projects/types'
import { VenueType } from 'registry/venues/types'

export type QueryItemStatus = 'linked' | 'not_indexed' | 'observed' | 'registry_derived' | 'planned' | 'live' | 'partial'

export type QueryPresetId =
  | 'projects-with-marco-assets'
  | 'treasury-compatible-projects'
  | 'venues-connected-to-marco'
  | 'events-derived-from-marco'
  | 'machine-ready-surfaces'
  | 'not-indexed-relationships'

export interface QueryResultItem {
  nodeType: GraphNodeType | 'manifest' | 'relationship'
  slug: string
  identity: string
  displayName: string
  href: string
  status: QueryItemStatus
  notes?: string
}

export interface QueryResult {
  queryId: string
  label: string
  description: string
  resultCount: number
  items: QueryResultItem[]
  dataSource: 'registry-query-static'
  asOf: string
}

export interface QueryPreset {
  id: QueryPresetId
  label: string
  description: string
}

export type ProjectCapabilityQuery = keyof import('registry/projects/types').ProjectCapabilities

export interface TreasuryCompatibilityFilter {
  includePartial?: boolean
  includeLive?: boolean
}

export interface NotIndexedRelationship {
  kind: string
  source: string
  target?: string
  status: 'not_indexed'
  notes?: string
  href?: string
}

export type { CapabilityStatus, VenueType }
