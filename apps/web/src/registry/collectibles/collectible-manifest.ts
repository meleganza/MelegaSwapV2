import { stripUndefinedDeep } from 'registry/venues/manifest'
import { getAllCollectibles } from './getAllCollectibles'
import {
  COLLECTIBLES_REGISTRY_API_VERSION,
  COLLECTIBLES_REGISTRY_AS_OF,
  COLLECTIBLES_REGISTRY_DISCLAIMER,
} from './collectible-constants'
import { StaticCollectibleRecord } from './collectible-types'

export const serializeCollectibleManifest = (
  record: StaticCollectibleRecord,
): Record<string, unknown> => ({
  $schema: 'https://melega.finance/schemas/collectibles/v1',
  collectible_id: record.collectibleId,
  slug: record.slug,
  display_name: record.displayName,
  description: record.description,
  status: record.status,
  category: record.category,
  role: record.role,
  contract: record.contract,
  metadata: record.metadata,
  supply: record.supply,
  mint: record.mint,
  related_routes: record.relatedRoutes,
  warnings: record.warnings,
  links: record.links,
  mvp_static: record.mvpStatic,
  data_source: record.dataSource,
  as_of: record.asOf,
  disclaimer: record.disclaimer,
})

export const serializeCollectiblesRegistryIndex = (): Record<string, unknown> => {
  const records = getAllCollectibles()

  return {
    manifest: 'manifest://melega/platform/collectibles-registry@0.1.0',
    api_version: COLLECTIBLES_REGISTRY_API_VERSION,
    phase: 'mvp_static',
    constitution: 'MELEGA_DEX_CONSTITUTION_V1',
    schema: 'https://melega.finance/schemas/collectibles/v1',
    framing: 'Civilization Collectibles — not generic NFT minting',
    collectibles: records.map((record) => ({
      collectible_id: record.collectibleId,
      slug: record.slug,
      display_name: record.displayName,
      status: record.status,
      category: record.category,
      mint_route: record.mint.route,
      manifest_url: `/registry/collectibles/${record.slug}.json`,
    })),
    disclaimer: COLLECTIBLES_REGISTRY_DISCLAIMER,
    data_source: 'collectibles-registry-static',
    as_of: COLLECTIBLES_REGISTRY_AS_OF,
  }
}

export const serializeCollectiblesWellKnown = (): Record<string, unknown> => ({
  name: 'Melega DEX Civilization Collectibles Registry',
  version: COLLECTIBLES_REGISTRY_API_VERSION,
  status: 'mvp_static',
  index: '/registry/collectibles/index.json',
  framing: 'Civilization Collectibles read model — legacy NFT surfaces preserved',
  legacy_nft_routes: {
    mint: '/nft/',
    wallet: '/viewNFTs/',
    market: '/nftmarket/',
  },
  ui: '/collectibles',
})

export const stripCollectibleManifest = (value: Record<string, unknown>): Record<string, unknown> =>
  stripUndefinedDeep(value) as Record<string, unknown>
