import type { MelegaTickerItem } from 'design-system/melega'
import { buildSurfaceEnvelope, type MelegaSurfaceEnvelope } from 'lib/surface-envelope'

export type HomeMachinePayload = MelegaSurfaceEnvelope

export function buildHomeMachine(input: {
  indexedProjects: number
  marketCards: MelegaTickerItem[]
  activityRows: number
  earnRows: number
}): HomeMachinePayload {
  const reasonCodes: Record<string, string> = {}
  if (input.activityRows === 0) reasonCodes.liveActivity = 'NO_EVENTS_INDEXED'
  if (input.earnRows === 0) reasonCodes.earnOpportunities = 'NO_POOL_FOUND'

  return buildSurfaceEnvelope({
    module: 'home',
    runtime: {
      status: 'ready',
      surfaces: {
        swap: 'active',
        trendingRibbon: 'active',
        earnOpportunities: 'partial',
        liveActivity: input.activityRows > 0 ? 'partial' : 'partial',
      },
      indexedProjects: input.indexedProjects,
      marketCards: input.marketCards.length,
    },
    reasonCodes,
    sources: ['registry', 'subgraph', 'farms-api', 'pools-api'],
    primaryActions: ['swap', 'build_import'],
    nextActions: ['trade', 'build_import', 'view_projects', 'open_command_center'],
  })
}
