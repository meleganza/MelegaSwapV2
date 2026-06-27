import { stripUndefinedDeep } from 'registry/venues/manifest'
import { GRAPH_REGISTRY_API_VERSION, GRAPH_REGISTRY_AS_OF, GRAPH_REGISTRY_DISCLAIMER } from './constants'
import { resolveEconomicGraph } from './resolveGraph'

export const serializeGraphManifest = (): Record<string, unknown> => {
  const graph = resolveEconomicGraph()

  return stripUndefinedDeep({
    manifest: 'manifest://melega/platform/registry-graph@0.1.0',
    api_version: GRAPH_REGISTRY_API_VERSION,
    phase: 'mvp_static',
    constitution: 'MELEGA_DEX_CONSTITUTION_V1',
    schema: 'https://melega.finance/schemas/registry-graph/v1',
    project_registry: '/registry/projects/index.json',
    asset_registry: '/registry/assets/index.json',
    venue_registry: '/registry/venues/index.json',
    event_registry: '/registry/events/index.json',
    summary: graph.summary,
    layers: {
      projects: graph.layers.projects,
      assets: graph.layers.assets,
      venues: graph.layers.venues,
      events: graph.layers.events,
    },
    chains: graph.chains,
    edges: graph.edges.map((edge) => ({
      from_type: edge.from.type,
      from_slug: edge.from.slug,
      from_identity: edge.from.identity,
      to_type: edge.to.type,
      to_slug: edge.to.slug,
      to_identity: edge.to.identity,
      relation: edge.relation,
      status: edge.status,
    })),
    treasury: {
      status: 'not_indexed',
      notes: 'Treasury SKU attribution — Treasury Runtime Phase 2',
    },
    disclaimer: GRAPH_REGISTRY_DISCLAIMER,
    data_source: 'registry-graph-static',
    as_of: GRAPH_REGISTRY_AS_OF,
  })
}
