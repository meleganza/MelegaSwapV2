import { QueryPreset, QueryPresetId } from './types'

export const QUERY_REGISTRY_AS_OF = '2026-06-26'

export const QUERY_REGISTRY_DISCLAIMER =
  'Static economic query layer — derived from registry graph only. No live indexing, metrics, tx hashes, or treasury amounts.'

export const QUERY_REGISTRY_API_VERSION = '0.1.0'

export const MACHINE_MANIFEST_SURFACES = [
  { slug: 'projects-index', displayName: 'Project Registry Index', href: '/registry/projects/index.json', identity: 'manifest://melega/platform/project-registry@0.1.0' },
  { slug: 'assets-index', displayName: 'Asset Registry Index', href: '/registry/assets/index.json', identity: 'manifest://melega/platform/asset-registry@0.1.0' },
  { slug: 'venues-index', displayName: 'Venue Registry Index', href: '/registry/venues/index.json', identity: 'manifest://melega/platform/venue-registry@0.1.0' },
  { slug: 'events-index', displayName: 'Event Registry Index', href: '/registry/events/index.json', identity: 'manifest://melega/platform/event-registry@0.1.0' },
  { slug: 'graph-index', displayName: 'Registry Graph Index', href: '/registry/graph/index.json', identity: 'manifest://melega/platform/registry-graph@0.1.0' },
  { slug: 'query-index', displayName: 'Query Layer Index', href: '/registry/query/index.json', identity: 'manifest://melega/platform/registry-query@0.1.0' },
] as const

export const QUERY_PRESETS: QueryPreset[] = [
  {
    id: 'projects-with-marco-assets',
    label: 'Projects with MARCO assets',
    description: 'Projects linked to the MARCO (BSC) asset in the registry graph.',
  },
  {
    id: 'treasury-compatible-projects',
    label: 'Treasury-compatible projects',
    description: 'Projects with treasuryCompatible capability partial or live — not planned-only.',
  },
  {
    id: 'venues-connected-to-marco',
    label: 'Venues connected to MARCO',
    description: 'Economic venues with a linked MARCO asset binding in the static registry.',
  },
  {
    id: 'events-derived-from-marco',
    label: 'Events derived from MARCO',
    description: 'Registry-derived economic events linked to the MARCO asset.',
  },
  {
    id: 'machine-ready-surfaces',
    label: 'Machine-ready surfaces',
    description: 'Projects with live machine manifests and static registry discovery indexes.',
  },
  {
    id: 'not-indexed-relationships',
    label: 'Not-indexed relationships',
    description: 'Unresolved bindings and treasury placeholders — not_indexed only.',
  },
]

export const getQueryPreset = (id: QueryPresetId): QueryPreset | undefined =>
  QUERY_PRESETS.find((preset) => preset.id === id)
