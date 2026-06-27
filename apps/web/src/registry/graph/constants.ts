import { GraphRelation } from './types'

export const GRAPH_REGISTRY_AS_OF = '2026-06-26'

export const GRAPH_REGISTRY_DISCLAIMER =
  'Static registry integration graph — derived from Organ 01–04 manifests only. No live indexing, metrics, tx hashes, or treasury amounts.'

export const GRAPH_REGISTRY_API_VERSION = '0.1.0'

export const GRAPH_RELATION_LABELS: Record<GraphRelation, string> = {
  project_to_asset: 'Project → Asset',
  project_to_venue: 'Project → Venue',
  project_to_event: 'Project → Event',
  asset_to_project: 'Asset → Project',
  asset_to_venue: 'Asset → Venue',
  asset_to_event: 'Asset → Event',
  venue_to_project: 'Venue → Project',
  venue_to_asset: 'Venue → Asset',
  venue_to_event: 'Venue → Event',
  event_to_project: 'Event → Project',
  event_to_asset: 'Event → Asset',
  event_to_venue: 'Event → Venue',
  treasury_placeholder: 'Treasury placeholder',
}
