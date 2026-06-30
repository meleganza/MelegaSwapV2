import { getProjectBySlug } from 'registry/projects/getProjectBySlug'
import { TokenRef } from 'registry/projects/types'
import {
  ASSET_REGISTRY_AS_OF,
  ASSET_REGISTRY_DISCLAIMER,
  buildUai,
  CHAIN_LABELS,
} from './constants'
import { AssetCapabilities, StaticAssetRecord } from './types'

const SLUG_BY_CHAIN: Record<number, string> = {
  56: 'marco',
  1: 'marco-ethereum',
  137: 'marco-polygon',
  8453: 'marco-base',
}

const buildMarcoCapabilities = (): AssetCapabilities => ({
  tradable: { status: 'live', notes: 'MARCO on legacy default token lists' },
  liquidity: { status: 'live', notes: 'Platform liquidity routes via /liquidity' },
  farm: { status: 'live', notes: 'Legacy MasterChef farms via /farms' },
  pool: { status: 'live', notes: 'MARCO staking pools via /pools' },
  lock: { status: 'planned', notes: 'Lock Center indexing — Phase 2' },
  governance: { status: 'planned', notes: 'Governance linkage — Phase 2' },
  smartdrop: { status: 'planned', notes: 'SmartDrop campaigns — Phase 2' },
  radar: { status: 'planned', notes: 'Radar incident feed — Phase 2' },
  space: { status: 'partial', notes: 'Community link only; bind not live' },
  labs: { status: 'planned', notes: 'Labs experiments — Phase 2' },
  treasury: { status: 'planned', notes: 'MARCO fee SKUs — Treasury Runtime Phase 2' },
})

const tokenRefToAsset = (token: TokenRef, projectSlug: string, projectUpi: string): StaticAssetRecord => {
  const slug = SLUG_BY_CHAIN[token.chainId] ?? `marco-chain-${token.chainId}`
  const chainLabel = CHAIN_LABELS[token.chainId] ?? `Chain ${token.chainId}`

  return {
    uai: buildUai('fungible', token.chainId, token.address),
    slug,
    legacyRef: token.ref,
    assetType: 'fungible',
    lifecycle: 'observed',
    projectBinding: {
      projectUpi,
      projectSlug,
      isPrimary: true,
      bindingSource: 'legacy_import',
      boundAt: ASSET_REGISTRY_AS_OF,
    },
    chainId: token.chainId,
    contractAddress: token.address,
    symbol: token.symbol,
    decimals: 18,
    name: `MARCO (${chainLabel})`,
    description: `MARCO coordination token on ${chainLabel} — linked asset of Melega DEX project.`,
    tags: ['native', 'coordination', 'fungible'],
    trust: {
      badges: ['canonical', 'observed'],
      verificationStatus: 'observed',
    },
    capabilities: buildMarcoCapabilities(),
    relationships: {
      liquidityPools: [],
      markets: [],
      locks: [],
      campaigns: [],
      treasurySkus: [],
      relationshipStatus: 'not_indexed',
      relationshipNotes: 'Relationship placeholders only — no indexed pools or campaigns in static MVP.',
    },
    disclaimer: ASSET_REGISTRY_DISCLAIMER,
    dataSource: 'asset-registry-static',
    asOf: ASSET_REGISTRY_AS_OF,
    mvpStatic: true,
  }
}

const buildStaticAssets = (): StaticAssetRecord[] => {
  const project = getProjectBySlug('melega-dex')
  if (!project) {
    return []
  }

  return project.resources.tokens.map((token) => tokenRefToAsset(token, project.slug, project.upi))
}

export const STATIC_ASSETS: StaticAssetRecord[] = buildStaticAssets()
