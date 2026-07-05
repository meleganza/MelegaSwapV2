import type { MelegaTickerItem } from 'design-system/melega'

export interface HomeMachinePayload {
  schema: 'melega.home.v1'
  schemaVersion: '1.0.0'
  module: 'home'
  timestamp: string
  dataSources: string[]
  reasonCodes: Record<string, string>
  primaryActions: string[]
  runtimeLinks: string[]
  surfaces: {
    swap: 'active'
    trendingRibbon: 'active'
    earnOpportunities: 'partial'
    liveActivity: 'partial'
  }
  indexedProjects: number
  marketCards: number
}

export function buildHomeMachine(input: {
  indexedProjects: number
  marketCards: MelegaTickerItem[]
  activityRows: number
  earnRows: number
}): HomeMachinePayload {
  const reasonCodes: Record<string, string> = {}
  if (input.activityRows === 0) reasonCodes.liveActivity = 'NO_EVENTS_INDEXED'
  if (input.earnRows === 0) reasonCodes.earnOpportunities = 'NO_POOL_FOUND'

  return {
    schema: 'melega.home.v1',
    schemaVersion: '1.0.0',
    module: 'home',
    timestamp: new Date().toISOString(),
    dataSources: ['registry', 'subgraph', 'farms-api', 'pools-api'],
    reasonCodes,
    primaryActions: ['swap', 'list_project', 'view_trending', 'view_earn'],
    runtimeLinks: ['/trade', '/import-existing-token', '/trending', '/farms', '/command-center'],
    surfaces: {
      swap: 'active',
      trendingRibbon: 'active',
      earnOpportunities: input.earnRows > 0 ? 'partial' : 'partial',
      liveActivity: input.activityRows > 0 ? 'partial' : 'partial',
    },
    indexedProjects: input.indexedProjects,
    marketCards: input.marketCards.length,
  }
}
