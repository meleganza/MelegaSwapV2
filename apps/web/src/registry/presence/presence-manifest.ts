import { stripUndefinedDeep } from 'registry/venues/manifest'
import { getAllPresence } from './getAllPresence'
import {
  CONSTITUTIONAL_CANONICAL_ASSET,
  CONSTITUTIONAL_CANONICAL_CHAIN,
  CONSTITUTIONAL_CANONICAL_STATUS,
  PRESENCE_REGISTRY_API_VERSION,
  PRESENCE_REGISTRY_AS_OF,
  PRESENCE_REGISTRY_DISCLAIMER,
} from './presence-constants'
import { StaticPresenceRecord } from './presence-types'

export const serializePresenceManifest = (record: StaticPresenceRecord): Record<string, unknown> => ({
  $schema: 'https://melega.finance/schemas/presence/v1',
  presence_id: record.presenceId,
  slug: record.slug,
  display_name: record.displayName,
  description: record.description,
  project_upi: record.projectUpi,
  project_slug: record.projectSlug,
  canonical_asset_uai: record.canonicalAssetUai,
  asset_slug: record.assetSlug,
  chain_id: record.chainId,
  chain_label: record.chainLabel,
  venue_source: record.venueSource,
  presence_type: record.presenceType,
  status: record.status,
  liquidity_confidence: record.liquidityConfidence,
  execution_eligibility: record.executionEligibility,
  canonical_relationship: record.canonicalRelationship,
  is_canonical: record.isCanonical,
  warnings: record.warnings,
  links: record.links,
  constitutional: {
    canonical_chain: CONSTITUTIONAL_CANONICAL_CHAIN,
    canonical_asset: CONSTITUTIONAL_CANONICAL_ASSET,
    status: CONSTITUTIONAL_CANONICAL_STATUS,
    immutable: true,
  },
  mvp_static: record.mvpStatic,
  data_source: record.dataSource,
  as_of: record.asOf,
  disclaimer: record.disclaimer,
})

export const serializePresenceRegistryIndex = (): Record<string, unknown> => {
  const records = getAllPresence()

  return {
    manifest: 'manifest://melega/platform/presence-registry@0.1.0',
    api_version: PRESENCE_REGISTRY_API_VERSION,
    phase: 'mvp_static',
    constitution: 'MELEGA_DEX_CONSTITUTION_V1',
    schema: 'https://melega.finance/schemas/presence/v1',
    constitutional: {
      canonical_chain: CONSTITUTIONAL_CANONICAL_CHAIN,
      canonical_asset: CONSTITUTIONAL_CANONICAL_ASSET,
      status: CONSTITUTIONAL_CANONICAL_STATUS,
      immutable: true,
    },
    project_registry: '/registry/projects/index.json',
    asset_registry: '/registry/assets/index.json',
    presence: records.map((record) => ({
      presence_id: record.presenceId,
      slug: record.slug,
      display_name: record.displayName,
      chain_label: record.chainLabel,
      presence_type: record.presenceType,
      status: record.status,
      liquidity_confidence: record.liquidityConfidence,
      is_canonical: record.isCanonical,
      manifest_url: `/registry/presence/${record.slug}.json`,
    })),
    disclaimer: PRESENCE_REGISTRY_DISCLAIMER,
    data_source: 'presence-registry-static',
    as_of: PRESENCE_REGISTRY_AS_OF,
  }
}

export const serializePresenceWellKnown = (): Record<string, unknown> => ({
  name: 'Melega DEX Economic Presence Registry',
  version: PRESENCE_REGISTRY_API_VERSION,
  status: 'mvp_static',
  index: '/registry/presence/index.json',
  project_registry: '/registry/projects/index.json',
  asset_registry: '/registry/assets/index.json',
  constitutional: {
    canonical_chain: CONSTITUTIONAL_CANONICAL_CHAIN,
    canonical_asset: CONSTITUTIONAL_CANONICAL_ASSET,
    note: 'Economic Presence is NOT Canonical Economy',
  },
})

export const stripPresenceManifest = (value: Record<string, unknown>): Record<string, unknown> =>
  stripUndefinedDeep(value) as Record<string, unknown>
