import type { StaticProjectRecord } from '../../types'
import type { CanonicalProjectDocument } from '../types'
import { normalizeEvmAddress, toCaip2ChainId } from '../caip'
import { getVenuesByProjectSlug } from 'registry/venues/getVenueBySlug'
import type { StaticVenueRecord } from 'registry/venues/types'
import { resolveProjectBySlug } from '../resolveProject'
import { normalizeProjectDocument } from '../normalizeProject'
import { buildMarketId } from '../markets/ids'
import { addressFromAssetRef as marketAddressFromRef } from '../markets/ids'
import {
  buildWalletRelationshipDocument,
  disconnectedObservation,
  normalizeWalletAccountInput,
  type LiveWalletObservation,
  type ProjectWalletRelationshipDocument,
} from '../walletRelationship'
import type { ProjectEvidencePack } from '../evidence/types'
import {
  PARTICIPATION_LIMITATIONS,
  PARTICIPATION_RESOLVER_REVISION,
  PROJECT_PARTICIPATION_SCHEMA_VERSION,
  PROJECT_PAGE_PARTICIPATION_SUMMARY_EXTENSION,
  STUDIO_DESTINATION_ROUTES,
  type ParticipationAvailability,
  type ParticipationOpportunityType,
  type ParticipationStatus,
} from './schema'
import {
  addressFromAssetRef,
  buildDestinationId,
  buildParticipationId,
  buildParticipationRevision,
} from './ids'
import type {
  ParticipationDestination,
  ParticipationOpportunityRecord,
  ParticipationSummaryForProjectApi,
  ParticipationUserRelationship,
  ParticipationWarning,
  ProjectParticipationContextualDocument,
  ProjectParticipationDocument,
} from './types'

function venueStatus(venue: StaticVenueRecord): {
  status: ParticipationStatus
  availability: ParticipationAvailability
} {
  if (venue.lifecycle === 'deprecated' || venue.lifecycle === 'archived') {
    return { status: 'DEPRECATED', availability: 'UNAVAILABLE' }
  }
  if (venue.lifecycle === 'draft') {
    return { status: 'INACTIVE', availability: 'UNAVAILABLE' }
  }
  return { status: 'ACTIVE', availability: 'AVAILABLE' }
}

function projectTokenSet(document: CanonicalProjectDocument, chainId: number): Set<string> {
  const set = new Set<string>()
  for (const asset of document.assets) {
    if (asset.chainId !== chainId) continue
    const addr = normalizeEvmAddress(asset.contractAddress ?? '')
    if (addr) set.add(addr)
  }
  return set
}

function resolveAssetIds(
  document: CanonicalProjectDocument,
  chainId: number,
  addresses: string[],
): string[] {
  const ids: string[] = []
  for (const addr of addresses) {
    const n = normalizeEvmAddress(addr)
    if (!n) continue
    const match = document.assets.find(
      (a) => a.chainId === chainId && normalizeEvmAddress(a.contractAddress ?? '') === n,
    )
    ids.push(match?.assetId ?? `eip155:${chainId}/erc20:${n}`)
  }
  return [...new Set(ids)].sort()
}

function makeDestination(parts: {
  projectId: string
  module: ParticipationDestination['module']
  href: string
  label: string
  available: boolean
}): ParticipationDestination {
  return {
    destinationId: buildDestinationId({
      projectId: parts.projectId,
      module: parts.module,
      href: parts.href,
    }),
    href: parts.href,
    label: parts.label,
    module: parts.module,
    availability: parts.available ? 'AVAILABLE' : 'UNAVAILABLE',
    reasonCode: parts.available ? null : 'DESTINATION_UNAVAILABLE',
    limitations: [
      'Navigation context only — opens an existing Melega DEX studio.',
      'No transaction preparation or execution is included.',
    ],
  }
}

function opportunityFromVenue(input: {
  document: CanonicalProjectDocument
  venue: StaticVenueRecord
  generatedAt: string
}): ParticipationOpportunityRecord | null {
  const { document, venue, generatedAt } = input
  const tokens = projectTokenSet(document, venue.chainId)
  const { status, availability } = venueStatus(venue)

  if (venue.venueType === 'spot_lp') {
    const pair = venue.contractAddress ? normalizeEvmAddress(venue.contractAddress) : null
    const base = addressFromAssetRef(venue.assetBindings.find((b) => b.role === 'base')?.assetUai)
    const quote = addressFromAssetRef(venue.assetBindings.find((b) => b.role === 'quote')?.assetUai)
    if (!pair || !base || !quote) return null
    if (!tokens.has(base) && !tokens.has(quote)) return null

    const relatedMarketId = buildMarketId({
      projectId: document.projectId,
      marketType: 'AMM_V2_PAIR',
      chainId: venue.chainId,
      venue: 'melega-dex',
      pairOrPoolContract: pair,
      tokenA: base,
      tokenB: quote,
    })

    const type: ParticipationOpportunityType = 'LIQUIDITY_POOL'
    const participationId = buildParticipationId({
      projectId: document.projectId,
      type,
      chainId: venue.chainId,
      subjectKey: `lp:${pair}`,
    })

    return {
      participationId,
      projectId: document.projectId,
      type,
      chainId: venue.chainId,
      caip2: toCaip2ChainId(venue.chainId),
      venue: 'melega-dex',
      venueSlug: venue.slug,
      displayLabel: venue.displayName,
      assetIds: resolveAssetIds(document, venue.chainId, [base, quote]),
      contractIds: [pair],
      relatedMarketId,
      farmPid: null,
      sousId: null,
      status,
      availability,
      source: 'VENUE_REGISTRY',
      observedAt: venue.asOf ? `${venue.asOf}T00:00:00.000Z` : generatedAt,
      updatedAt: generatedAt,
      dataRevision: buildParticipationRevision([participationId, pair, venue.lifecycle]),
      destination: makeDestination({
        projectId: document.projectId,
        module: 'LIQUIDITY_STUDIO',
        href: STUDIO_DESTINATION_ROUTES.liquidity,
        label: 'Open Liquidity Studio',
        available: availability === 'AVAILABLE' && status === 'ACTIVE',
      }),
      limitations: [
        'Attributed via certified venue registry project binding.',
        'No APR, TVL, or volume metrics are exposed.',
      ],
      reasonCode: null,
    }
  }

  if (venue.venueType === 'farm') {
    const masterChef = venue.contractAddress ? normalizeEvmAddress(venue.contractAddress) : null
    const base = addressFromAssetRef(venue.assetBindings.find((b) => b.role === 'base')?.assetUai)
    const lpRef = venue.assetBindings.find((b) => b.role === 'lp')?.assetUai
    if (!masterChef || venue.pid == null || !base || !tokens.has(base)) return null

    const type: ParticipationOpportunityType = 'FARM'
    const participationId = buildParticipationId({
      projectId: document.projectId,
      type,
      chainId: venue.chainId,
      subjectKey: `farm:pid:${venue.pid}`,
    })

    const relatedLp = lpRef ? marketAddressFromRef(lpRef) ?? addressFromAssetRef(lpRef) : null

    return {
      participationId,
      projectId: document.projectId,
      type,
      chainId: venue.chainId,
      caip2: toCaip2ChainId(venue.chainId),
      venue: 'melega-dex',
      venueSlug: venue.slug,
      displayLabel: venue.displayName,
      assetIds: base ? resolveAssetIds(document, venue.chainId, [base]) : [],
      contractIds: [masterChef, ...(relatedLp ? [relatedLp] : [])],
      relatedMarketId: null,
      farmPid: venue.pid,
      sousId: null,
      status,
      availability,
      source: 'VENUE_REGISTRY',
      observedAt: venue.asOf ? `${venue.asOf}T00:00:00.000Z` : generatedAt,
      updatedAt: generatedAt,
      dataRevision: buildParticipationRevision([participationId, String(venue.pid), venue.lifecycle]),
      destination: makeDestination({
        projectId: document.projectId,
        module: 'FARMS_STUDIO',
        href: STUDIO_DESTINATION_ROUTES.farms,
        label: 'Open Farms Studio',
        available: availability === 'AVAILABLE' && status === 'ACTIVE',
      }),
      limitations: [
        'Attributed via certified venue registry project binding.',
        'No emission or APR calculations are performed in PP006.',
      ],
      reasonCode: null,
    }
  }

  if (venue.venueType === 'stake_pool') {
    const contract = venue.contractAddress ? normalizeEvmAddress(venue.contractAddress) : null
    const stake = addressFromAssetRef(venue.assetBindings.find((b) => b.role === 'stake')?.assetUai)
    if (!contract || venue.sousId == null || !stake) return null
    if (!tokens.has(stake)) return null

    const type: ParticipationOpportunityType = 'STAKING_POOL'
    const participationId = buildParticipationId({
      projectId: document.projectId,
      type,
      chainId: venue.chainId,
      subjectKey: `stake:sous:${venue.sousId}`,
    })

    return {
      participationId,
      projectId: document.projectId,
      type,
      chainId: venue.chainId,
      caip2: toCaip2ChainId(venue.chainId),
      venue: 'melega-dex',
      venueSlug: venue.slug,
      displayLabel: venue.displayName,
      assetIds: resolveAssetIds(document, venue.chainId, [stake]),
      contractIds: [contract],
      relatedMarketId: null,
      farmPid: null,
      sousId: venue.sousId,
      status,
      availability,
      source: 'VENUE_REGISTRY',
      observedAt: venue.asOf ? `${venue.asOf}T00:00:00.000Z` : generatedAt,
      updatedAt: generatedAt,
      dataRevision: buildParticipationRevision([participationId, String(venue.sousId), venue.lifecycle]),
      destination: makeDestination({
        projectId: document.projectId,
        module: 'POOLS_STUDIO',
        href: STUDIO_DESTINATION_ROUTES.pools,
        label: 'Open Pools Studio',
        available: availability === 'AVAILABLE' && status === 'ACTIVE',
      }),
      limitations: [
        'Attributed via certified venue registry project binding.',
        'Staking pool is distinct from liquidity pool and farm concepts.',
      ],
      reasonCode: null,
    }
  }

  return null
}

/**
 * Shared public participation resolver — opportunities only, no wallet data.
 */
export function buildProjectParticipationDocument(input: {
  project: StaticProjectRecord
  document: CanonicalProjectDocument
  generatedAt?: string
}): ProjectParticipationDocument {
  const generatedAt = input.generatedAt ?? new Date().toISOString()
  const warnings: ParticipationWarning[] = []
  const opportunities: ParticipationOpportunityRecord[] = []
  const seen = new Set<string>()

  if (input.document.assets.length === 0) {
    warnings.push({
      reasonCode: 'PROJECT_HAS_NO_ASSETS',
      message: 'Project has no registered assets for participation attribution.',
      participationId: null,
      chainId: null,
    })
  }

  for (const venue of getVenuesByProjectSlug(input.document.slug)) {
    const opp = opportunityFromVenue({
      document: input.document,
      venue,
      generatedAt,
    })
    if (!opp) continue
    if (seen.has(opp.participationId)) continue
    seen.add(opp.participationId)
    opportunities.push(opp)
  }

  opportunities.sort((a, b) => a.participationId.localeCompare(b.participationId))

  const pools = opportunities.filter((o) => o.type === 'LIQUIDITY_POOL')
  const farms = opportunities.filter((o) => o.type === 'FARM')
  const stakingPools = opportunities.filter((o) => o.type === 'STAKING_POOL')

  if (opportunities.length === 0) {
    warnings.push({
      reasonCode: 'PROJECT_HAS_NO_PARTICIPATION',
      message: 'No Melega DEX participation opportunities are currently registered for this project.',
      participationId: null,
      chainId: null,
    })
  }

  const destinations = opportunities
    .map((o) => o.destination)
    .filter((d): d is ParticipationDestination => Boolean(d))
    .sort((a, b) => a.destinationId.localeCompare(b.destinationId))

  // Dedupe destinations by href
  const destByHref = new Map<string, ParticipationDestination>()
  for (const d of destinations) {
    if (!destByHref.has(d.href)) destByHref.set(d.href, d)
  }
  const uniqueDestinations = [...destByHref.values()].sort((a, b) =>
    a.destinationId.localeCompare(b.destinationId),
  )

  const supportedTypes = [
    ...(pools.length ? (['LIQUIDITY_POOL'] as const) : []),
    ...(farms.length ? (['FARM'] as const) : []),
    ...(stakingPools.length ? (['STAKING_POOL'] as const) : []),
  ]

  const supportedChains = [...new Set(opportunities.map((o) => o.chainId))].sort((a, b) => a - b)
  const active = opportunities.filter((o) => o.status === 'ACTIVE' && o.availability === 'AVAILABLE')
  const partial = warnings.some((w) => w.reasonCode === 'PARTIAL_PARTICIPATION_COVERAGE')

  const availability: ParticipationAvailability =
    active.length > 0
      ? 'AVAILABLE'
      : input.document.assets.length === 0
        ? 'NOT_APPLICABLE'
        : 'UNAVAILABLE'

  const participationRevision = buildParticipationRevision([
    input.document.revision,
    ...opportunities.map((o) => o.dataRevision),
  ])

  return {
    schemaVersion: PROJECT_PARTICIPATION_SCHEMA_VERSION,
    projectId: input.document.projectId,
    slug: input.document.slug,
    canonicalUrl: input.document.canonicalUrl,
    projectRevision: input.document.revision,
    participationRevision,
    resolverRevision: PARTICIPATION_RESOLVER_REVISION,
    generatedAt,
    summary: {
      participationSupport: availability,
      liquidityPoolCount: pools.length,
      farmCount: farms.length,
      stakingPoolCount: stakingPools.length,
      supportedTypes: [...supportedTypes],
      supportedChains,
      participationEndpoint: `/api/public/projects/${input.document.slug}/participation/`,
      contextualEndpoint: `/api/projects/${input.document.slug}/participation/`,
      schemaVersion: PROJECT_PARTICIPATION_SCHEMA_VERSION,
      lastObservationAt: opportunities[0]?.observedAt ?? null,
      partial,
    },
    pools,
    farms,
    stakingPools,
    destinations: uniqueDestinations,
    capabilities: {
      VIEW_LIQUIDITY: pools.length ? 'AVAILABLE' : 'UNAVAILABLE',
      VIEW_FARMS: farms.length ? 'AVAILABLE' : 'UNAVAILABLE',
      VIEW_POOLS: stakingPools.length ? 'AVAILABLE' : 'UNAVAILABLE',
      ADD_LIQUIDITY:
        pools.some((p) => p.destination?.availability === 'AVAILABLE') ? 'AVAILABLE' : 'UNAVAILABLE',
      OPEN_FARM:
        farms.some((f) => f.destination?.availability === 'AVAILABLE') ? 'AVAILABLE' : 'UNAVAILABLE',
      OPEN_POOL:
        stakingPools.some((p) => p.destination?.availability === 'AVAILABLE')
          ? 'AVAILABLE'
          : 'UNAVAILABLE',
    },
    walletRelationshipSupport: {
      supported: true,
      contextualEndpoint: `/api/projects/${input.document.slug}/participation/`,
      notes: [
        'Wallet positions are resolved through the PP004 Wallet Relationship Layer.',
        'Public participation documents never include wallet-specific fields.',
      ],
    },
    availability,
    warnings: warnings.sort((a, b) => a.reasonCode.localeCompare(b.reasonCode)),
    limitations: PARTICIPATION_LIMITATIONS,
  }
}

function mapPp004ToUserRelationships(
  wr: ProjectWalletRelationshipDocument,
  opportunities: ParticipationOpportunityRecord[],
): ParticipationUserRelationship[] {
  if (!wr.walletAccount) return []
  const rows: ParticipationUserRelationship[] = []

  for (const rel of wr.relationships) {
    if (rel.relationshipType === 'LIQUIDITY_POSITION' && rel.status === 'ACTIVE') {
      const match = opportunities.find((o) => o.type === 'LIQUIDITY_POOL')
      rows.push({
        participationId: `urel_${rel.relationshipId}`,
        projectId: wr.projectId,
        type: 'USER_LIQUIDITY_POSITION',
        walletAccount: wr.walletAccount,
        chainId: rel.chainId,
        status: rel.status,
        availability: rel.availability === 'AVAILABLE' ? 'AVAILABLE' : 'UNAVAILABLE',
        positionReference: rel.positionReference,
        displaySummary: rel.displaySummary,
        relatedOpportunityId: match?.participationId ?? null,
        destination: makeDestination({
          projectId: wr.projectId,
          module: 'LIQUIDITY_STUDIO',
          href: STUDIO_DESTINATION_ROUTES.liquidity,
          label: 'Open Liquidity Studio',
          available: true,
        }),
        source: rel.source,
        observedAt: rel.observedAt,
        limitations: ['Mapped from PP004 wallet relationship — not a second portfolio system.'],
        reasonCode: null,
      })
    }
    if (rel.relationshipType === 'FARM_POSITION' && rel.status === 'ACTIVE') {
      rows.push({
        participationId: `urel_${rel.relationshipId}`,
        projectId: wr.projectId,
        type: 'USER_FARM_POSITION',
        walletAccount: wr.walletAccount,
        chainId: rel.chainId,
        status: rel.status,
        availability: 'AVAILABLE',
        positionReference: rel.positionReference,
        displaySummary: rel.displaySummary,
        relatedOpportunityId:
          opportunities.find((o) => o.type === 'FARM')?.participationId ?? null,
        destination: makeDestination({
          projectId: wr.projectId,
          module: 'FARMS_STUDIO',
          href: STUDIO_DESTINATION_ROUTES.farms,
          label: 'Open Farms Studio',
          available: true,
        }),
        source: rel.source,
        observedAt: rel.observedAt,
        limitations: ['Mapped from PP004 wallet relationship — not a second portfolio system.'],
        reasonCode: null,
      })
    }
    if (rel.relationshipType === 'POOL_POSITION' && rel.status === 'ACTIVE') {
      rows.push({
        participationId: `urel_${rel.relationshipId}`,
        projectId: wr.projectId,
        type: 'USER_POOL_POSITION',
        walletAccount: wr.walletAccount,
        chainId: rel.chainId,
        status: rel.status,
        availability: 'AVAILABLE',
        positionReference: rel.positionReference,
        displaySummary: rel.displaySummary,
        relatedOpportunityId:
          opportunities.find((o) => o.type === 'STAKING_POOL')?.participationId ?? null,
        destination: makeDestination({
          projectId: wr.projectId,
          module: 'POOLS_STUDIO',
          href: STUDIO_DESTINATION_ROUTES.pools,
          label: 'Open Pools Studio',
          available: true,
        }),
        source: rel.source,
        observedAt: rel.observedAt,
        limitations: ['Mapped from PP004 wallet relationship — not a second portfolio system.'],
        reasonCode: null,
      })
    }
    if (rel.relationshipType === 'CLAIMABLE_REWARD' && rel.status === 'CLAIMABLE') {
      rows.push({
        participationId: `urel_${rel.relationshipId}`,
        projectId: wr.projectId,
        type: 'REWARD_RELATIONSHIP',
        walletAccount: wr.walletAccount,
        chainId: rel.chainId,
        status: rel.status,
        availability: 'AVAILABLE',
        positionReference: rel.positionReference,
        displaySummary: rel.displaySummary,
        relatedOpportunityId: null,
        destination: makeDestination({
          projectId: wr.projectId,
          module: 'COMMAND_CENTER',
          href: STUDIO_DESTINATION_ROUTES.commandCenter,
          label: 'Open Command Center',
          available: true,
        }),
        source: rel.source,
        observedAt: rel.observedAt,
        limitations: ['Mapped from PP004 — PP006 does not prepare or execute claims.'],
        reasonCode: null,
      })
    }
  }

  return rows.sort((a, b) => a.participationId.localeCompare(b.participationId))
}

/**
 * Contextual participation document — public opportunities + PP004-mapped wallet relationships.
 * Live position amounts require client observation; API may return LIVE_READ_CLIENT_REQUIRED.
 */
export function buildProjectParticipationContextualDocument(input: {
  project: StaticProjectRecord
  document: CanonicalProjectDocument
  evidencePack: ProjectEvidencePack
  observation?: LiveWalletObservation
  generatedAt?: string
}): ProjectParticipationContextualDocument {
  const generatedAt = input.generatedAt ?? new Date().toISOString()
  const base = buildProjectParticipationDocument({
    project: input.project,
    document: input.document,
    generatedAt,
  })

  const observation = input.observation ?? disconnectedObservation(generatedAt)
  const wr = buildWalletRelationshipDocument({
    document: input.document,
    evidencePack: input.evidencePack,
    observation,
    generatedAt,
  })

  const allOpps = [...base.pools, ...base.farms, ...base.stakingPools]

  if (observation.connectionState === 'DISCONNECTED' || !observation.walletAccountCaip10) {
    return {
      ...base,
      walletAccount: null,
      walletConnectionState: 'DISCONNECTED',
      userRelationships: [],
      warnings: [
        ...base.warnings,
        {
          reasonCode: 'WALLET_DISCONNECTED',
          message: 'Connect a wallet to evaluate project participation positions.',
          participationId: null,
          chainId: null,
        },
      ],
    }
  }

  const account = normalizeWalletAccountInput(observation.walletAccountCaip10)
  if (!account) {
    return {
      ...base,
      walletAccount: null,
      walletConnectionState: 'INVALID_ACCOUNT',
      userRelationships: [],
      warnings: [
        ...base.warnings,
        {
          reasonCode: 'ACCOUNT_INVALID',
          message: 'Wallet account must be a valid CAIP-10 identifier.',
          participationId: null,
          chainId: null,
        },
      ],
    }
  }

  const userRelationships = mapPp004ToUserRelationships(wr, allOpps)
  const warnings = [...base.warnings]
  if (
    observation.liquidityPositions === null ||
    observation.farmPositions === null ||
    observation.poolPositions === null
  ) {
    warnings.push({
      reasonCode: 'LIVE_READ_CLIENT_REQUIRED',
      message: 'Live position reads require the client-side PP004 observation path.',
      participationId: null,
      chainId: observation.activeChainId,
    })
  }

  return {
    ...base,
    walletAccount: account,
    walletConnectionState: 'CONNECTED',
    userRelationships,
    warnings: warnings.sort((a, b) => a.reasonCode.localeCompare(b.reasonCode)),
  }
}

export function toParticipationSummaryForProjectApi(
  doc: ProjectParticipationDocument,
): ParticipationSummaryForProjectApi {
  return {
    extension: PROJECT_PAGE_PARTICIPATION_SUMMARY_EXTENSION,
    schemaVersion: doc.schemaVersion,
    participationSupport: doc.summary.participationSupport,
    supportedTypes: doc.summary.supportedTypes,
    liquidityPoolCount: doc.summary.liquidityPoolCount,
    farmCount: doc.summary.farmCount,
    stakingPoolCount: doc.summary.stakingPoolCount,
    supportedChains: doc.summary.supportedChains,
    participationEndpoint: doc.summary.participationEndpoint,
    contextualEndpoint: doc.summary.contextualEndpoint,
    lastObservationAt: doc.summary.lastObservationAt,
    partial: doc.summary.partial,
  }
}

export function loadProjectParticipationDocument(
  slug: string,
  generatedAt?: string,
): ProjectParticipationDocument | null {
  const resolved = resolveProjectBySlug(slug)
  if (!resolved.ok) return null
  const at = generatedAt ?? new Date().toISOString()
  const document = normalizeProjectDocument(resolved.project, { generatedAt: at })
  return buildProjectParticipationDocument({ project: resolved.project, document, generatedAt: at })
}
