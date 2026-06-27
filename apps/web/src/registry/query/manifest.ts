import { stripUndefinedDeep } from 'registry/venues/manifest'
import { QUERY_PRESETS, QUERY_REGISTRY_API_VERSION, QUERY_REGISTRY_AS_OF, QUERY_REGISTRY_DISCLAIMER } from './constants'
import { runAllQueryPresets } from './queries'

export const serializeQueryManifest = (): Record<string, unknown> => {
  const presets = runAllQueryPresets()

  return stripUndefinedDeep({
    manifest: 'manifest://melega/platform/registry-query@0.1.0',
    api_version: QUERY_REGISTRY_API_VERSION,
    phase: 'mvp_static',
    constitution: 'MELEGA_DEX_CONSTITUTION_V1',
    schema: 'https://melega.finance/schemas/registry-query/v1',
    graph_registry: '/registry/graph/index.json',
    project_registry: '/registry/projects/index.json',
    asset_registry: '/registry/assets/index.json',
    venue_registry: '/registry/venues/index.json',
    event_registry: '/registry/events/index.json',
    capabilities: [
      'find_projects_by_asset',
      'find_projects_by_capability',
      'find_projects_by_treasury_compatibility',
      'find_assets_by_project',
      'find_venues_by_project',
      'find_venues_by_asset',
      'find_venues_by_type',
      'find_events_by_project',
      'find_events_by_asset',
      'find_events_by_venue',
      'find_machine_ready_nodes',
      'find_not_indexed_relationships',
    ],
    presets: QUERY_PRESETS.map((preset) => ({
      id: preset.id,
      label: preset.label,
      description: preset.description,
    })),
    preset_results: presets.map((result) => ({
      query_id: result.queryId,
      label: result.label,
      result_count: result.resultCount,
      items: result.items.map((item) => ({
        node_type: item.nodeType,
        slug: item.slug,
        identity: item.identity,
        display_name: item.displayName,
        href: item.href,
        status: item.status,
        notes: item.notes,
      })),
    })),
    treasury: {
      status: 'not_indexed',
      notes: 'Treasury query attribution — Treasury Runtime Phase 2',
    },
    disclaimer: QUERY_REGISTRY_DISCLAIMER,
    data_source: 'registry-query-static',
    as_of: QUERY_REGISTRY_AS_OF,
  })
}
