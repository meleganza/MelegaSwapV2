import { getProjectBySlug } from 'registry/projects/getProjectBySlug'
import { TokenRef } from 'registry/projects/types'
import {
  ASSET_REGISTRY_AS_OF,
  ASSET_REGISTRY_DISCLAIMER,
  buildUai,
  CHAIN_LABELS,
} from './constants'
import { AssetCapabilities, StaticAssetRecord } from './types'

const POLYGON_CANONICAL_MARCO = '0xF31A621A0e75d90fdA320EeE52956D718Fa34615'
const POLYGON_LEGACY_MARCO = '0xD3e28c74177B812d1543A406aD1A97ee3C398AC2'

const SLUG_BY_CHAIN: Record<number, string> = {
  56: 'marco',
  1: 'marco-ethereum',
  137: 'marco-polygon-canonical',
  8453: 'marco-base',
  42161: 'marco-arbitrum',
}

function slugFor(token: TokenRef): string {
  const address = token.address.toLowerCase()
  if (token.chainId === 137 && address === POLYGON_LEGACY_MARCO.toLowerCase()) return 'marco-polygon'
  if (token.chainId === 137 && address === POLYGON_CANONICAL_MARCO.toLowerCase()) return 'marco-polygon-canonical'
  return SLUG_BY_CHAIN[token.chainId] ?? `marco-chain-${token.chainId}`
}

function isArchivedPolygonLegacy(token: TokenRef): boolean {
  return token.chainId === 137 && token.address.toLowerCase() === POLYGON_LEGACY_MARCO.toLowerCase()
}

function isCanonicalPolygon(token: TokenRef): boolean {
  return token.chainId === 137 && token.address.toLowerCase() === POLYGON_CANONICAL_MARCO.toLowerCase()
}

const ARCHIVED_POLYGON_CAPABILITIES = (): AssetCapabilities => ({
  tradable: {
    status: 'partial',
    notes: 'Archived ERC-20. Existing balances and withdrawals remain. Not the official Polygon MARCO.',
  },
  liquidity: {
    status: 'partial',
    notes: 'Historical Melega LP only. Reserves stay in this token and are not canonical OFT liquidity.',
  },
  farm: { status: 'partial', notes: 'Existing MasterChef positions withdraw against this token.' },
  pool: { status: 'partial', notes: 'Existing SmartChef positions withdraw against this token.' },
  lock: { status: 'none', notes: 'Not an official lock asset.' },
  governance: { status: 'none', notes: 'Not an official governance asset.' },
  smartdrop: { status: 'none', notes: 'Not an official distribution asset.' },
  radar: { status: 'none', notes: 'Not promoted.' },
  space: { status: 'none', notes: 'Not promoted.' },
  labs: { status: 'none', notes: 'Not promoted.' },
  treasury: { status: 'none', notes: 'Buy-MARCO fee does not treat this address as official MARCO.' },
})

const CANONICAL_POLYGON_CAPABILITIES = (): AssetCapabilities => ({
  tradable: {
    status: 'partial',
    notes: 'Official Polygon identity. No Melega pair is registered, so a quote is unavailable.',
  },
  liquidity: { status: 'none', notes: 'No Melega Polygon pair for this token.' },
  farm: { status: 'none', notes: 'Farms remain on the archived ERC-20.' },
  pool: { status: 'none', notes: 'Pools remain on the archived ERC-20.' },
  lock: { status: 'none', notes: 'Not indexed.' },
  governance: { status: 'none', notes: 'Not indexed.' },
  smartdrop: { status: 'none', notes: 'Not indexed.' },
  radar: { status: 'none', notes: 'Not indexed.' },
  space: { status: 'none', notes: 'Not indexed.' },
  labs: { status: 'none', notes: 'Not indexed.' },
  treasury: { status: 'partial', notes: 'Buy-MARCO classification uses this address on Polygon.' },
})

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
  treasury: { status: 'planned', notes: 'MARCO fee SKUs — beneficiary MELEGA TREASURY WALLET' },
})

const tokenRefToAsset = (token: TokenRef, projectSlug: string, projectUpi: string): StaticAssetRecord => {
  const slug = slugFor(token)
  const chainLabel = CHAIN_LABELS[token.chainId] ?? `Chain ${token.chainId}`
  const archived = isArchivedPolygonLegacy(token)

  return {
    uai: buildUai('fungible', token.chainId, token.address),
    slug,
    legacyRef: token.ref,
    assetType: 'fungible',
    lifecycle: archived ? 'archived' : 'observed',
    projectBinding: {
      projectUpi,
      projectSlug,
      isPrimary: !archived,
      bindingSource: 'legacy_import',
      boundAt: ASSET_REGISTRY_AS_OF,
    },
    chainId: token.chainId,
    contractAddress: token.address,
    symbol: token.symbol,
    decimals: 18,
    name: archived ? 'MARCO Legacy (Polygon)' : `MARCO (${chainLabel})`,
    description: archived
      ? 'Archived Polygon ERC-20 previously used for Melega DEX liquidity and farms. Not the official Polygon MARCO. Existing positions remain withdrawable.'
      : `MARCO coordination token on ${chainLabel} — primary asset of the MARCO project.`,
    tags: archived ? ['archived', 'deprecated', 'fungible'] : ['native', 'coordination', 'fungible'],
    trust: {
      badges: archived ? ['deprecated', 'observed'] : ['canonical', 'observed'],
      verificationStatus: 'observed',
    },
    capabilities: archived
      ? ARCHIVED_POLYGON_CAPABILITIES()
      : isCanonicalPolygon(token)
        ? CANONICAL_POLYGON_CAPABILITIES()
        : buildMarcoCapabilities(),
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
  const project = getProjectBySlug('marco')
  if (!project) {
    return []
  }

  return project.resources.tokens.map((token) => tokenRefToAsset(token, project.slug, project.upi))
}

export const STATIC_ASSETS: StaticAssetRecord[] = buildStaticAssets()
