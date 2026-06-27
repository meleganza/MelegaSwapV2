import { getAssetBySlug } from 'registry/assets/getAssetBySlug'
import { getProjectBySlug } from 'registry/projects/getProjectBySlug'
import {
  LEGACY_BSC_IFO_V3,
  LEGACY_BSC_MARCO_BNB_LP,
  LEGACY_BSC_MARCO_FARM_PID,
  LEGACY_BSC_MASTER_CHEF,
  LEGACY_BSC_STAKE_SOUS_ID,
  LEGACY_WBNB,
  VENUE_REGISTRY_AS_OF,
  VENUE_REGISTRY_DISCLAIMER,
  buildUvi,
} from './constants'
import { StaticVenueRecord, VenueCapabilities } from './types'

const baseCapabilities = (): VenueCapabilities => ({
  swap: { status: 'planned', notes: 'Routing quotes — Smart Routing organ' },
  liquidity: { status: 'planned', notes: 'Depth metrics not indexed in MVP' },
  farm: { status: 'planned', notes: 'Reward rates not indexed in MVP' },
  stake: { status: 'planned', notes: 'Stake metrics not indexed in MVP' },
  launch: { status: 'planned', notes: 'Campaign metrics not indexed in MVP' },
  lock: { status: 'planned', notes: 'Lock Center — Phase 2' },
  treasury: { status: 'planned', notes: 'Treasury SKU attribution — Phase 2' },
  radar: { status: 'planned', notes: 'Radar feed — Phase 2' },
})

const buildVenues = (): StaticVenueRecord[] => {
  const project = getProjectBySlug('melega-dex')
  const marcoBsc = getAssetBySlug('marco')
  if (!project || !marcoBsc) {
    return []
  }

  const projectBinding = {
    projectUpi: project.upi,
    projectSlug: project.slug,
    bindingSource: 'legacy_import' as const,
    boundAt: VENUE_REGISTRY_AS_OF,
  }

  const marcoBnbLp: StaticVenueRecord = {
    uvi: buildUvi('spot_lp', 56, LEGACY_BSC_MARCO_BNB_LP.toLowerCase()),
    slug: 'marco-bnb-lp',
    venueType: 'spot_lp',
    lifecycle: 'observed',
    displayName: 'MARCO-BNB LP',
    description: 'MARCO/WBNB liquidity pair on BSC — LP address from legacy farm config snapshot.',
    tags: ['marco', 'bnb', 'spot_lp'],
    chainId: 56,
    contractAddress: LEGACY_BSC_MARCO_BNB_LP,
    legacyRef: `lp://56/${LEGACY_BSC_MARCO_BNB_LP}`,
    projectBinding,
    assetBindings: [
      { assetUai: marcoBsc.uai, assetSlug: marcoBsc.slug, role: 'base' },
      { assetUai: `token://56/${LEGACY_WBNB}`, assetSlug: 'wbnb-bsc', role: 'quote' },
    ],
    trust: { badges: ['observed'], verificationStatus: 'observed' },
    capabilities: {
      ...baseCapabilities(),
      swap: { status: 'partial', notes: 'Swappable via legacy router — no registry quote index' },
      liquidity: { status: 'live', notes: 'LP add/remove via /liquidity' },
    },
    metrics: {
      status: 'not_indexed',
      notes: 'No TVL, volume, or APR in static MVP.',
    },
    deepLinks: {
      swap: '/swap',
      liquidity: '/liquidity',
    },
    disclaimer: VENUE_REGISTRY_DISCLAIMER,
    dataSource: 'venue-registry-static',
    asOf: VENUE_REGISTRY_AS_OF,
    mvpStatic: true,
  }

  const marcoBnbFarm: StaticVenueRecord = {
    uvi: buildUvi('farm', 56, `pid-${LEGACY_BSC_MARCO_FARM_PID}`),
    slug: 'marco-bnb-farm',
    venueType: 'farm',
    lifecycle: 'observed',
    displayName: 'MARCO-BNB Farm',
    description: `MasterChef farm pid ${LEGACY_BSC_MARCO_FARM_PID} for MARCO-BNB LP on BSC.`,
    tags: ['marco', 'bnb', 'farm'],
    chainId: 56,
    contractAddress: LEGACY_BSC_MASTER_CHEF,
    legacyRef: `farm://56/${LEGACY_BSC_MASTER_CHEF}/pid/${LEGACY_BSC_MARCO_FARM_PID}`,
    pid: LEGACY_BSC_MARCO_FARM_PID,
    projectBinding,
    assetBindings: [
      { assetUai: marcoBsc.uai, assetSlug: marcoBsc.slug, role: 'base' },
      { assetUai: marcoBnbLp.uvi, assetSlug: marcoBnbLp.slug, role: 'lp' },
    ],
    trust: { badges: ['observed'], verificationStatus: 'observed' },
    capabilities: {
      ...baseCapabilities(),
      farm: { status: 'live', notes: 'Legacy MasterChef via /farms' },
    },
    metrics: {
      status: 'not_indexed',
      notes: 'No APR or emission data in static MVP.',
    },
    deepLinks: {
      farms: '/farms',
    },
    disclaimer: VENUE_REGISTRY_DISCLAIMER,
    dataSource: 'venue-registry-static',
    asOf: VENUE_REGISTRY_AS_OF,
    mvpStatic: true,
  }

  const marcoStakePool: StaticVenueRecord = {
    uvi: buildUvi('stake_pool', 56, `sous-${LEGACY_BSC_STAKE_SOUS_ID}`),
    slug: 'marco-stake-sous-0',
    venueType: 'stake_pool',
    lifecycle: 'observed',
    displayName: 'MARCO Stake Pool (sousId 0)',
    description: 'MARCO single-asset staking pool sousId 0 on BSC — contract from legacy pool config snapshot.',
    tags: ['marco', 'stake_pool'],
    chainId: 56,
    contractAddress: LEGACY_BSC_MASTER_CHEF,
    legacyRef: `pool://56/${LEGACY_BSC_MASTER_CHEF}/sous/${LEGACY_BSC_STAKE_SOUS_ID}`,
    sousId: LEGACY_BSC_STAKE_SOUS_ID,
    projectBinding,
    assetBindings: [{ assetUai: marcoBsc.uai, assetSlug: marcoBsc.slug, role: 'stake' }],
    trust: { badges: ['observed'], verificationStatus: 'observed' },
    capabilities: {
      ...baseCapabilities(),
      stake: { status: 'live', notes: 'MARCO staking via /pools' },
    },
    metrics: {
      status: 'not_indexed',
      notes: 'No APR or TVL in static MVP.',
    },
    deepLinks: {
      pools: '/pools',
    },
    disclaimer: VENUE_REGISTRY_DISCLAIMER,
    dataSource: 'venue-registry-static',
    asOf: VENUE_REGISTRY_AS_OF,
    mvpStatic: true,
  }

  const melegaIlo: StaticVenueRecord = {
    uvi: buildUvi('launch', 56, LEGACY_BSC_IFO_V3.toLowerCase()),
    slug: 'melega-ilo-bsc',
    venueType: 'launch',
    lifecycle: 'observed',
    displayName: 'Melega ILO (BSC)',
    description: 'Legacy IFOv3 launch surface on BSC — contract from platform config snapshot.',
    tags: ['launch', 'ilo', 'bsc'],
    chainId: 56,
    contractAddress: LEGACY_BSC_IFO_V3,
    legacyRef: `launch://56/${LEGACY_BSC_IFO_V3}`,
    projectBinding,
    assetBindings: [{ assetUai: marcoBsc.uai, assetSlug: marcoBsc.slug, role: 'base' }],
    trust: { badges: ['observed'], verificationStatus: 'observed' },
    capabilities: {
      ...baseCapabilities(),
      launch: { status: 'partial', notes: 'ILO route /ilo on BSC' },
    },
    metrics: {
      status: 'not_indexed',
      notes: 'No sale metrics in static MVP.',
    },
    deepLinks: {
      launch: '/ilo',
    },
    disclaimer: VENUE_REGISTRY_DISCLAIMER,
    dataSource: 'venue-registry-static',
    asOf: VENUE_REGISTRY_AS_OF,
    mvpStatic: true,
  }

  return [marcoBnbLp, marcoBnbFarm, marcoStakePool, melegaIlo]
}

export const STATIC_VENUES: StaticVenueRecord[] = buildVenues()
