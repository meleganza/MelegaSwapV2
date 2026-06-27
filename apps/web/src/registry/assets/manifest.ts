import { ASSET_REGISTRY_API_VERSION, ASSET_REGISTRY_AS_OF, ASSET_REGISTRY_DISCLAIMER } from './constants'
import { getAllAssets } from './getAllAssets'
import { StaticAssetRecord } from './types'

export const serializeAssetManifest = (asset: StaticAssetRecord): Record<string, unknown> => ({
  $schema: 'https://melega.finance/schemas/asset/v1',
  uai: asset.uai,
  legacy_ref: asset.legacyRef,
  slug: asset.slug,
  asset_type: asset.assetType,
  lifecycle: asset.lifecycle,
  project_binding: {
    project_upi: asset.projectBinding.projectUpi,
    project_slug: asset.projectBinding.projectSlug,
    is_primary: asset.projectBinding.isPrimary,
    binding_source: asset.projectBinding.bindingSource,
    bound_at: asset.projectBinding.boundAt,
  },
  chain_id: asset.chainId,
  contract_address: asset.contractAddress,
  symbol: asset.symbol,
  decimals: asset.decimals,
  name: asset.name,
  description: asset.description,
  tags: asset.tags,
  trust: {
    badges: asset.trust.badges,
    verification_status: asset.trust.verificationStatus,
  },
  capabilities: asset.capabilities,
  relationships: {
    liquidity_pools: asset.relationships.liquidityPools,
    markets: asset.relationships.markets,
    locks: asset.relationships.locks,
    campaigns: asset.relationships.campaigns,
    treasury_skus: asset.relationships.treasurySkus,
    relationship_status: asset.relationships.relationshipStatus,
    relationship_notes: asset.relationships.relationshipNotes,
  },
  mvp_static: asset.mvpStatic,
  data_source: asset.dataSource,
  as_of: asset.asOf,
  disclaimer: asset.disclaimer,
})

export const serializeAssetRegistryIndex = (): Record<string, unknown> => {
  const assets = getAllAssets()

  return {
    manifest: 'manifest://melega/platform/asset-registry@0.1.0',
    api_version: ASSET_REGISTRY_API_VERSION,
    phase: 'mvp_static',
    constitution: 'MELEGA_DEX_CONSTITUTION_V1',
    schema: 'https://melega.finance/schemas/asset/v1',
    project_registry: '/registry/projects/index.json',
    assets: assets.map((asset) => ({
      uai: asset.uai,
      slug: asset.slug,
      symbol: asset.symbol,
      asset_type: asset.assetType,
      lifecycle: asset.lifecycle,
      project_upi: asset.projectBinding.projectUpi,
      project_slug: asset.projectBinding.projectSlug,
      chain_id: asset.chainId,
      manifest_url: `/registry/assets/${asset.slug}.json`,
    })),
    disclaimer: ASSET_REGISTRY_DISCLAIMER,
    data_source: 'asset-registry-static',
    as_of: ASSET_REGISTRY_AS_OF,
  }
}

export const serializeAssetDiscoveryIndex = (): Record<string, unknown> => {
  const assets = getAllAssets()

  return {
    $schema: 'https://melega.finance/schemas/asset-discovery/v1',
    api_version: ASSET_REGISTRY_API_VERSION,
    phase: 'mvp_static',
    data_source: 'asset-registry-static',
    as_of: ASSET_REGISTRY_AS_OF,
    disclaimer: ASSET_REGISTRY_DISCLAIMER,
    summary: {
      total_assets: assets.length,
      unique_projects: new Set(assets.map((a) => a.projectBinding.projectUpi)).size,
      unique_chains: new Set(assets.map((a) => a.chainId)).size,
      observed_assets: assets.filter((a) => a.lifecycle === 'observed').length,
    },
    assets: assets.map((asset) => ({
      slug: asset.slug,
      uai: asset.uai,
      symbol: asset.symbol,
      name: asset.name,
      asset_type: asset.assetType,
      lifecycle: asset.lifecycle,
      chain_id: asset.chainId,
      project_slug: asset.projectBinding.projectSlug,
      trust_badges: asset.trust.badges,
      manifest_url: `/registry/assets/${asset.slug}.json`,
    })),
  }
}
