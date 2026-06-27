export type GraphNodeType = 'project' | 'asset' | 'venue' | 'event'

export type GraphLinkStatus = 'linked' | 'not_indexed'

export type GraphRelation =
  | 'project_to_asset'
  | 'project_to_venue'
  | 'project_to_event'
  | 'asset_to_project'
  | 'asset_to_venue'
  | 'asset_to_event'
  | 'venue_to_project'
  | 'venue_to_asset'
  | 'venue_to_event'
  | 'event_to_project'
  | 'event_to_asset'
  | 'event_to_venue'
  | 'treasury_placeholder'

export interface GraphNodeRef {
  type: GraphNodeType
  slug: string
  identity: string
  displayName: string
  href: string
}

export interface GraphEdge {
  from: GraphNodeRef
  to: GraphNodeRef
  relation: GraphRelation
  status: GraphLinkStatus
}

export interface GraphLayerChain {
  projectSlug: string
  assetSlugs: string[]
  venueSlugs: string[]
  eventSlugs: string[]
}

export interface RegistryGraphSummary {
  projectCount: number
  assetCount: number
  venueCount: number
  eventCount: number
  edgeCount: number
  linkedEdgeCount: number
  notIndexedEdgeCount: number
  primaryProjectSlug: string
}

export interface EconomicGraph {
  summary: RegistryGraphSummary
  nodes: GraphNodeRef[]
  edges: GraphEdge[]
  layers: {
    projects: GraphNodeRef[]
    assets: GraphNodeRef[]
    venues: GraphNodeRef[]
    events: GraphNodeRef[]
  }
  chains: GraphLayerChain[]
}

export interface GraphNeighborhood {
  focus: GraphNodeRef
  projects: GraphNodeRef[]
  assets: GraphNodeRef[]
  venues: GraphNodeRef[]
  events: GraphNodeRef[]
  edges: GraphEdge[]
  treasuryStatus: GraphLinkStatus
}
