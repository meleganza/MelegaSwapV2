import { stripUndefinedDeep } from 'registry/venues/manifest'
import {
  EVENT_REGISTRY_API_VERSION,
  EVENT_REGISTRY_AS_OF,
  EVENT_REGISTRY_DISCLAIMER,
} from './constants'
import { getAllEvents } from './getAllEvents'
import { StaticEventRecord } from './types'

export const serializeEventManifest = (event: StaticEventRecord): Record<string, unknown> =>
  stripUndefinedDeep({
    $schema: 'https://melega.finance/schemas/event/v1',
    uei: event.uei,
    slug: event.slug,
    event_type: event.eventType,
    status: event.status,
    display_name: event.displayName,
    description: event.description,
    tags: event.tags,
    chain_id: event.chainId,
    recorded_at: event.recordedAt,
    relationships: {
      project_upi: event.relationships.projectUpi,
      project_slug: event.relationships.projectSlug,
      asset_uai: event.relationships.assetUai,
      asset_slug: event.relationships.assetSlug,
      venue_uvi: event.relationships.venueUvi,
      venue_slug: event.relationships.venueSlug,
      treasury: {
        status: event.relationships.treasury.status,
        notes: event.relationships.treasury.notes,
      },
    },
    provenance: {
      derived_from: event.provenance.derivedFrom,
      registry_ref: event.provenance.registryRef,
      notes: event.provenance.notes,
    },
    mvp_static: event.mvpStatic,
    data_source: event.dataSource,
    as_of: event.asOf,
    disclaimer: event.disclaimer,
  })

export const serializeEventRegistryIndex = (): Record<string, unknown> => {
  const events = getAllEvents()

  return {
    manifest: 'manifest://melega/platform/event-registry@0.1.0',
    api_version: EVENT_REGISTRY_API_VERSION,
    phase: 'mvp_static',
    constitution: 'MELEGA_DEX_CONSTITUTION_V1',
    schema: 'https://melega.finance/schemas/event/v1',
    project_registry: '/registry/projects/index.json',
    asset_registry: '/registry/assets/index.json',
    venue_registry: '/registry/venues/index.json',
    events: events.map((event) => ({
      uei: event.uei,
      slug: event.slug,
      event_type: event.eventType,
      status: event.status,
      display_name: event.displayName,
      project_slug: event.relationships.projectSlug,
      asset_slug: event.relationships.assetSlug,
      venue_slug: event.relationships.venueSlug,
      chain_id: event.chainId,
      manifest_url: `/registry/events/${event.slug}.json`,
    })),
    disclaimer: EVENT_REGISTRY_DISCLAIMER,
    data_source: 'event-registry-static',
    as_of: EVENT_REGISTRY_AS_OF,
  }
}
