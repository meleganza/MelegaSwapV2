import { VENUE_REGISTRY_API_VERSION, VENUE_REGISTRY_AS_OF, VENUE_REGISTRY_DISCLAIMER } from './constants'
import { getAllVenues } from './getAllVenues'
import { StaticVenueRecord } from './types'

export const serializeVenueManifest = (venue: StaticVenueRecord): Record<string, unknown> => ({
  $schema: 'https://melega.finance/schemas/venue/v1',
  uvi: venue.uvi,
  slug: venue.slug,
  venue_type: venue.venueType,
  lifecycle: venue.lifecycle,
  display_name: venue.displayName,
  description: venue.description,
  tags: venue.tags,
  chain_id: venue.chainId,
  contract_address: venue.contractAddress,
  legacy_ref: venue.legacyRef,
  pid: venue.pid,
  sous_id: venue.sousId,
  project_binding: {
    project_upi: venue.projectBinding.projectUpi,
    project_slug: venue.projectBinding.projectSlug,
    binding_source: venue.projectBinding.bindingSource,
    bound_at: venue.projectBinding.boundAt,
  },
  asset_bindings: venue.assetBindings.map((binding) => ({
    asset_uai: binding.assetUai,
    asset_slug: binding.assetSlug,
    role: binding.role,
  })),
  trust: {
    badges: venue.trust.badges,
    verification_status: venue.trust.verificationStatus,
  },
  capabilities: venue.capabilities,
  metrics: {
    status: venue.metrics.status,
    notes: venue.metrics.notes,
  },
  deep_links: venue.deepLinks,
  mvp_static: venue.mvpStatic,
  data_source: venue.dataSource,
  as_of: venue.asOf,
  disclaimer: venue.disclaimer,
})

export const serializeVenueRegistryIndex = (): Record<string, unknown> => {
  const venues = getAllVenues()

  return {
    manifest: 'manifest://melega/platform/venue-registry@0.1.0',
    api_version: VENUE_REGISTRY_API_VERSION,
    phase: 'mvp_static',
    constitution: 'MELEGA_DEX_CONSTITUTION_V1',
    schema: 'https://melega.finance/schemas/venue/v1',
    project_registry: '/registry/projects/index.json',
    asset_registry: '/registry/assets/index.json',
    venues: venues.map((venue) => ({
      uvi: venue.uvi,
      slug: venue.slug,
      venue_type: venue.venueType,
      lifecycle: venue.lifecycle,
      display_name: venue.displayName,
      project_upi: venue.projectBinding.projectUpi,
      project_slug: venue.projectBinding.projectSlug,
      chain_id: venue.chainId,
      manifest_url: `/registry/venues/${venue.slug}.json`,
    })),
    disclaimer: VENUE_REGISTRY_DISCLAIMER,
    data_source: 'venue-registry-static',
    as_of: VENUE_REGISTRY_AS_OF,
  }
}
