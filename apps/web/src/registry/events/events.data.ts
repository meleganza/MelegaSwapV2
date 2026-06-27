import { getAssetBySlug } from 'registry/assets/getAssetBySlug'
import { getProjectBySlug } from 'registry/projects/getProjectBySlug'
import { getVenueBySlug } from 'registry/venues/getVenueBySlug'
import { buildUei, EVENT_REGISTRY_AS_OF, EVENT_REGISTRY_DISCLAIMER } from './constants'
import { StaticEventRecord } from './types'

const treasuryPlaceholder = () => ({
  status: 'not_indexed' as const,
  notes: 'Treasury SKU attribution — Treasury Runtime Phase 2',
})

const buildEvents = (): StaticEventRecord[] => {
  const project = getProjectBySlug('melega-dex')
  const marco = getAssetBySlug('marco')
  const marcoBnbLp = getVenueBySlug('marco-bnb-lp')
  const marcoBnbFarm = getVenueBySlug('marco-bnb-farm')
  const marcoStake = getVenueBySlug('marco-stake-sous-0')
  const melegaIlo = getVenueBySlug('melega-ilo-bsc')

  if (!project || !marco || !marcoBnbLp || !marcoBnbFarm || !marcoStake || !melegaIlo) {
    return []
  }

  const base = {
    disclaimer: EVENT_REGISTRY_DISCLAIMER,
    dataSource: 'event-registry-static',
    asOf: EVENT_REGISTRY_AS_OF,
    mvpStatic: true as const,
    recordedAt: EVENT_REGISTRY_AS_OF,
  }

  const marcoAssetRegistered: StaticEventRecord = {
    uei: buildUei('asset_registered', 'marco-asset-registered'),
    slug: 'marco-asset-registered',
    eventType: 'asset_registered',
    status: 'registry_derived',
    displayName: 'MARCO asset registered',
    description: 'MARCO (BSC) asset entry derived from Organ 02 Asset Registry.',
    tags: ['marco', 'asset', 'bsc'],
    chainId: marco.chainId,
    relationships: {
      projectUpi: project.upi,
      projectSlug: project.slug,
      assetUai: marco.uai,
      assetSlug: marco.slug,
      treasury: treasuryPlaceholder(),
    },
    provenance: {
      derivedFrom: 'asset-registry',
      registryRef: `/registry/assets/${marco.slug}.json`,
      notes: 'Synthesized from static asset manifest — not an on-chain mint event.',
    },
    ...base,
  }

  const venueEvent = (
    slug: string,
    venue: NonNullable<ReturnType<typeof getVenueBySlug>>,
    displayName: string,
    description: string,
    tags: string[],
  ): StaticEventRecord => ({
    uei: buildUei('venue_registered', slug),
    slug,
    eventType: 'venue_registered',
    status: 'observed',
    displayName,
    description,
    tags,
    chainId: venue.chainId,
    relationships: {
      projectUpi: project.upi,
      projectSlug: project.slug,
      assetUai: marco.uai,
      assetSlug: marco.slug,
      venueUvi: venue.uvi,
      venueSlug: venue.slug,
      treasury: treasuryPlaceholder(),
    },
    provenance: {
      derivedFrom: 'venue-registry',
      registryRef: `/registry/venues/${venue.slug}.json`,
      notes: 'Venue observation from Organ 03 — not a live creation transaction.',
    },
    ...base,
  })

  return [
    marcoAssetRegistered,
    venueEvent(
      'marco-bnb-lp-venue-observed',
      marcoBnbLp,
      'MARCO-BNB LP venue observed',
      'Spot LP venue observed in Organ 03 from legacy farm config snapshot.',
      ['marco', 'bnb', 'spot_lp', 'venue'],
    ),
    venueEvent(
      'marco-bnb-farm-venue-observed',
      marcoBnbFarm,
      'MARCO-BNB farm venue observed',
      'MasterChef farm venue observed in Organ 03 from legacy config snapshot.',
      ['marco', 'bnb', 'farm', 'venue'],
    ),
    venueEvent(
      'marco-stake-venue-observed',
      marcoStake,
      'MARCO stake pool venue observed',
      'MARCO staking pool venue observed in Organ 03 from legacy pool config snapshot.',
      ['marco', 'stake_pool', 'venue'],
    ),
    venueEvent(
      'melega-ilo-venue-observed',
      melegaIlo,
      'Melega ILO venue observed',
      'ILO launch venue observed in Organ 03 from legacy platform config snapshot.',
      ['launch', 'ilo', 'venue'],
    ),
  ]
}

export const STATIC_EVENTS: StaticEventRecord[] = buildEvents()
