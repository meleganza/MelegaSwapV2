/**
 * Pure Passport V1 aggregation — factual only, no invented USD or identity.
 */
import type { PassportLiquidityPosition } from 'views/PassportStudio/passportLiquidityTypes'
import type { FarmsWalletPosition } from 'views/FarmsStudio/modules/farmsMyFarmsTypes'
import type { PoolsWalletPosition } from 'views/PoolsStudio/modules/poolsMyPositionsTypes'
import type { PassportProjectCardModel } from 'views/PassportStudio/passportProjectsTypes'
import type { PassportHeroIdentityViewModel } from 'views/PassportStudio/passportHeroIdentityTypes'
import {
  FARMS_HREF,
  LIQUIDITY_MANAGE_HREF,
  LIQUIDITY_REMOVE_HREF,
  LIST_CLAIM_PROJECT_HREF,
  LIST_CREATE_PROJECT_HREF,
  POOLS_HREF,
  explorerAddressUrl,
  formatUsd,
  parseUsdLoose,
  shortenAddress,
} from './helpers'
import {
  resolvePassportSurfaceState,
  type PassportSurfaceState,
} from './passportState'

export type PositionDomain = 'liquidity' | 'farms' | 'pools'

export type PassportMetricStatus = 'live' | 'indexed' | 'partial' | 'unavailable' | 'zero' | 'loading'

export type PassportSummaryMetric = {
  id: string
  label: string
  value: string
  status: PassportMetricStatus
  source: string
  partial?: boolean
}

export type PassportClaimableRow = {
  id: string
  group: 'Farms' | 'Pools' | 'Other'
  source: string
  token: string
  amount: string
  estimatedUsd: string | null
  actionLabel: string
  actionHref: string
  contractHref: string | null
}

export type PassportHeroCta = {
  kind: 'create' | 'view' | 'verify' | 'manage' | 'connect'
  label: string
  href: string | null
  enabled: boolean
  primary: boolean
  reason?: string
}

export type PassportV1Model = {
  surfaceState: PassportSurfaceState
  wallet: string | null
  chainId: number | null
  identity: PassportHeroIdentityViewModel
  heroCtas: PassportHeroCta[]
  summary: PassportSummaryMetric[]
  portfolioPartialValuation: boolean
  portfolioValueNote: string | null
  liquidity: PassportLiquidityPosition[]
  farms: FarmsWalletPosition[]
  pools: PoolsWalletPosition[]
  claimables: PassportClaimableRow[]
  projects: readonly PassportProjectCardModel[]
  projectsEmptyCopy: string
  createProjectHref: typeof LIST_CREATE_PROJECT_HREF
  claimProjectHref: typeof LIST_CLAIM_PROJECT_HREF
  mCreditsStatus: 'unavailable' | 'upcoming' | 'available'
  mCreditsNote: string
}

function amountLooksNonZero(formatted: string | null | undefined): boolean {
  if (!formatted || formatted === '—' || formatted === 'Unavailable') return false
  const trimmed = formatted.trim()
  if (/^0(\.0+)?(\s|$)/.test(trimmed)) return false
  return true
}

export function buildClaimables(args: {
  farms: FarmsWalletPosition[]
  pools: PoolsWalletPosition[]
}): PassportClaimableRow[] {
  const rows: PassportClaimableRow[] = []

  for (const farm of args.farms) {
    if (!amountLooksNonZero(farm.pendingFormatted)) continue
    rows.push({
      id: `farm-claim:${farm.positionId}`,
      group: 'Farms',
      source: farm.title || farm.lpToken.symbol || 'Farm',
      token: farm.rewardToken.symbol || '—',
      amount: farm.pendingFormatted,
      estimatedUsd: farm.pendingValue,
      actionLabel: 'Harvest',
      actionHref: FARMS_HREF,
      contractHref:
        explorerAddressUrl(farm.masterChef, farm.chainId) ||
        explorerAddressUrl(farm.lpToken.address, farm.chainId),
    })
  }

  for (const pool of args.pools) {
    if (!amountLooksNonZero(pool.claimableFormatted)) continue
    rows.push({
      id: `pool-claim:${pool.positionId}`,
      group: 'Pools',
      source: pool.title || pool.stakeToken.symbol || 'Pool',
      token: pool.rewardToken.symbol || '—',
      amount: pool.claimableFormatted,
      estimatedUsd: pool.claimableValue,
      actionLabel: 'Claim',
      actionHref: POOLS_HREF,
      contractHref: explorerAddressUrl(pool.poolContract, pool.chainId),
    })
  }

  return rows
}

export function assertPositionDomainSeparation(args: {
  liquidityIds: string[]
  farmIds: string[]
  poolIds: string[]
}): { ok: boolean; violations: string[] } {
  const violations: string[] = []
  const farmSet = new Set(args.farmIds)
  const poolSet = new Set(args.poolIds)
  for (const id of args.liquidityIds) {
    if (farmSet.has(id)) violations.push(`liquidity/farm overlap: ${id}`)
    if (poolSet.has(id)) violations.push(`liquidity/pool overlap: ${id}`)
  }
  for (const id of args.farmIds) {
    if (poolSet.has(id)) violations.push(`farm/pool overlap: ${id}`)
  }
  return { ok: violations.length === 0, violations }
}

export function buildHeroCtas(identity: PassportHeroIdentityViewModel): PassportHeroCta[] {
  if (!identity.walletConnected) {
    return [
      {
        kind: 'connect',
        label: 'Connect Wallet',
        href: null,
        enabled: true,
        primary: true,
      },
    ]
  }

  // Never show Connect Wallet when already connected.
  if (!identity.sourceAvailable) {
    return [
      {
        kind: 'view',
        label: 'View Passport',
        href: '/passport',
        enabled: true,
        primary: true,
        reason: 'Identity runtime unavailable — portfolio domains may still load.',
      },
    ]
  }

  if (!identity.passportExists) {
    return [
      {
        kind: 'create',
        label: 'Create Passport',
        href: null,
        enabled: false,
        primary: true,
        reason: 'Passport enrollment route is not available in production yet.',
      },
    ]
  }

  const ctas: PassportHeroCta[] = [
    {
      kind: 'view',
      label: 'View Passport',
      href: '/passport',
      enabled: true,
      primary: true,
    },
  ]

  if (
    identity.verificationState === 'not_verified' ||
    identity.verificationState === 'pending' ||
    identity.verificationState === 'review_required'
  ) {
    ctas.push({
      kind: 'verify',
      label: 'Verify Identity',
      href: null,
      enabled: false,
      primary: false,
      reason: 'Verification flow is not available until Passport enrollment ships.',
    })
  }

  if (identity.managementRoute) {
    ctas.push({
      kind: 'manage',
      label: 'Manage Passport',
      href: identity.managementRoute,
      enabled: true,
      primary: false,
    })
  }

  return ctas
}

export function buildPortfolioSummary(args: {
  walletConnected: boolean
  liquidity: PassportLiquidityPosition[]
  farms: FarmsWalletPosition[]
  pools: PoolsWalletPosition[]
  claimables: PassportClaimableRow[]
  projectCount: number
  domains: {
    liquidityLoading: boolean
    farmsLoading: boolean
    poolsLoading: boolean
    projectsLoading: boolean
    farmsUnavailable?: boolean
    poolsUnavailable?: boolean
    liquidityUnavailable?: boolean
  }
}): { metrics: PassportSummaryMetric[]; partialValuation: boolean; note: string | null } {
  if (!args.walletConnected) {
    return {
      metrics: [
        metric('portfolio', 'Estimated Portfolio Value', '—', 'unavailable', 'Wallet disconnected'),
        metric('liquidity', 'Liquidity Positions', '—', 'unavailable', 'Wallet disconnected'),
        metric('farms', 'Farm Positions', '—', 'unavailable', 'Wallet disconnected'),
        metric('pools', 'Pool Positions', '—', 'unavailable', 'Wallet disconnected'),
        metric('claimables', 'Claimable Rewards', '—', 'unavailable', 'Wallet disconnected'),
        metric('projects', 'Controlled Projects', '—', 'unavailable', 'Wallet disconnected'),
      ],
      partialValuation: false,
      note: null,
    }
  }

  let pricedUsd = 0
  let pricedCount = 0
  let unpricedCount = 0

  for (const row of args.liquidity) {
    const usd = parseUsdLoose(row.estimatedValue)
    if (usd != null && usd > 0) {
      pricedUsd += usd
      pricedCount += 1
    } else if (row.estimatedValueState !== 'unavailable' || row.source === 'wallet-lp') {
      unpricedCount += 1
    } else {
      unpricedCount += 1
    }
  }
  for (const farm of args.farms) {
    const usd = parseUsdLoose(farm.stakedValue)
    if (usd != null && usd > 0) {
      pricedUsd += usd
      pricedCount += 1
    } else if (amountLooksNonZero(farm.stakedFormatted)) {
      unpricedCount += 1
    }
    const pendingUsd = parseUsdLoose(farm.pendingValue)
    if (pendingUsd != null && pendingUsd > 0) {
      pricedUsd += pendingUsd
      pricedCount += 1
    }
  }
  for (const pool of args.pools) {
    const usd = parseUsdLoose(pool.stakedValue)
    if (usd != null && usd > 0) {
      pricedUsd += usd
      pricedCount += 1
    } else if (amountLooksNonZero(pool.stakedFormatted)) {
      unpricedCount += 1
    }
    const claimUsd = parseUsdLoose(pool.claimableValue)
    if (claimUsd != null && claimUsd > 0) {
      pricedUsd += claimUsd
      pricedCount += 1
    }
  }

  const partialValuation = pricedCount > 0 && unpricedCount > 0
  const anyLoading =
    args.domains.liquidityLoading || args.domains.farmsLoading || args.domains.poolsLoading

  let portfolioValue = '—'
  let portfolioStatus: PassportMetricStatus = 'unavailable'
  let portfolioSource = 'No priced positions yet'
  if (anyLoading && pricedCount === 0) {
    portfolioValue = '—'
    portfolioStatus = 'loading'
    portfolioSource = 'Loading position domains…'
  } else if (pricedCount > 0) {
    portfolioValue = formatUsd(pricedUsd)
    portfolioStatus = partialValuation ? 'partial' : 'live'
    portfolioSource = partialValuation
      ? `Partial valuation · ${pricedCount} priced · ${unpricedCount} unpriced (excluded)`
      : `Priced positions only · ${pricedCount} assets`
  } else if (
    args.liquidity.length + args.farms.length + args.pools.length > 0 &&
    unpricedCount > 0
  ) {
    portfolioValue = '—'
    portfolioStatus = 'partial'
    portfolioSource = 'Positions known · trusted prices unavailable'
  } else {
    portfolioValue = '$0.00'
    portfolioStatus = 'zero'
    portfolioSource = 'No priced Melega positions'
  }

  const liqCount = args.liquidity.length
  const farmCount = args.farms.length
  const poolCount = args.pools.length
  const claimCount = args.claimables.length

  return {
    metrics: [
      metric('portfolio', 'Estimated Portfolio Value', portfolioValue, portfolioStatus, portfolioSource, partialValuation),
      metric(
        'liquidity',
        'Liquidity Positions',
        args.domains.liquidityLoading ? '—' : String(liqCount),
        args.domains.liquidityLoading ? 'loading' : liqCount === 0 ? 'zero' : 'live',
        'AMM LP ownership · Liquidity Studio',
      ),
      metric(
        'farms',
        'Farm Positions',
        args.domains.farmsUnavailable
          ? UNAVAILABLE_SHORT
          : args.domains.farmsLoading
            ? '—'
            : String(farmCount),
        args.domains.farmsUnavailable
          ? 'unavailable'
          : args.domains.farmsLoading
            ? 'loading'
            : farmCount === 0
              ? 'zero'
              : 'live',
        'MasterBuilder / MasterChef LP staking',
      ),
      metric(
        'pools',
        'Pool Positions',
        args.domains.poolsUnavailable
          ? UNAVAILABLE_SHORT
          : args.domains.poolsLoading
            ? '—'
            : String(poolCount),
        args.domains.poolsUnavailable
          ? 'unavailable'
          : args.domains.poolsLoading
            ? 'loading'
            : poolCount === 0
              ? 'zero'
              : 'live',
        'SmartChef single-token staking',
      ),
      metric(
        'claimables',
        'Claimable Rewards',
        String(claimCount),
        claimCount === 0 ? 'zero' : 'live',
        'Non-zero farm/pool pending rewards only',
      ),
      metric(
        'projects',
        'Controlled Projects',
        args.domains.projectsLoading ? '—' : String(args.projectCount),
        args.domains.projectsLoading ? 'loading' : args.projectCount === 0 ? 'zero' : 'indexed',
        'Verified wallet control only · never from holdings',
      ),
    ],
    partialValuation,
    note: partialValuation
      ? 'Portfolio value excludes unpriced assets, M-Credits, and project ownership estimates.'
      : 'Portfolio value excludes unpriced assets, M-Credits, and project ownership estimates.',
  }
}

const UNAVAILABLE_SHORT = '—'

function metric(
  id: string,
  label: string,
  value: string,
  status: PassportMetricStatus,
  source: string,
  partial?: boolean,
): PassportSummaryMetric {
  return { id, label, value, status, source, partial }
}

export function buildPassportV1Model(input: {
  identity: PassportHeroIdentityViewModel
  chainId: number | null
  liquidity: PassportLiquidityPosition[]
  farms: FarmsWalletPosition[]
  pools: PoolsWalletPosition[]
  projects: readonly PassportProjectCardModel[]
  projectsEmptyExplanation: string
  domains: {
    identityLoading: boolean
    liquidityLoading: boolean
    farmsLoading: boolean
    poolsLoading: boolean
    projectsLoading: boolean
    anyDomainError: boolean
    anyDomainPartial: boolean
    hasLastGoodPositions: boolean
    farmsUnavailable?: boolean
    poolsUnavailable?: boolean
    liquidityUnavailable?: boolean
  }
}): PassportV1Model {
  const claimables = buildClaimables({ farms: input.farms, pools: input.pools })
  const hasAny =
    input.liquidity.length + input.farms.length + input.pools.length + claimables.length > 0

  const surfaceState = resolvePassportSurfaceState(
    {
      walletConnected: input.identity.walletConnected,
      walletLoading: input.identity.loading,
      passportExists: input.identity.passportExists,
      verificationState: input.identity.verificationState,
      sourceAvailable: input.identity.sourceAvailable,
      walletAddress: input.identity.shortenedWallet,
    },
    {
      identityLoading: input.domains.identityLoading,
      liquidityLoading: input.domains.liquidityLoading,
      farmsLoading: input.domains.farmsLoading,
      poolsLoading: input.domains.poolsLoading,
      projectsLoading: input.domains.projectsLoading,
      anyDomainError: input.domains.anyDomainError,
      anyDomainPartial: input.domains.anyDomainPartial,
      hasLastGoodPositions: input.domains.hasLastGoodPositions,
      hasAnyFactualPositions: hasAny,
    },
  )

  const summary = buildPortfolioSummary({
    walletConnected: input.identity.walletConnected,
    liquidity: input.liquidity,
    farms: input.farms,
    pools: input.pools,
    claimables,
    projectCount: input.projects.length,
    domains: input.domains,
  })

  return {
    surfaceState,
    wallet: input.identity.walletConnected ? input.identity.shortenedWallet : null,
    chainId: input.chainId,
    identity: input.identity,
    heroCtas: buildHeroCtas(input.identity),
    summary: summary.metrics,
    portfolioPartialValuation: summary.partialValuation,
    portfolioValueNote: summary.note,
    liquidity: input.liquidity,
    farms: input.farms,
    pools: input.pools,
    claimables,
    projects: input.projects,
    projectsEmptyCopy:
      input.projectsEmptyExplanation ||
      'No verified projects are controlled by this wallet.',
    createProjectHref: LIST_CREATE_PROJECT_HREF,
    claimProjectHref: LIST_CLAIM_PROJECT_HREF,
    mCreditsStatus: 'unavailable',
    mCreditsNote: 'M-Credits runtime unavailable — not shown as an ERC-20 wallet balance.',
  }
}

export function positionActionLinks(domain: PositionDomain, id?: string): {
  manageHref: string
  removeHref?: string
  harvestHref?: string
  claimHref?: string
} {
  if (domain === 'liquidity') {
    return {
      manageHref: id ? `${LIQUIDITY_MANAGE_HREF}&position=${encodeURIComponent(id)}` : LIQUIDITY_MANAGE_HREF,
      removeHref: LIQUIDITY_REMOVE_HREF,
    }
  }
  if (domain === 'farms') {
    return { manageHref: FARMS_HREF, harvestHref: FARMS_HREF }
  }
  return { manageHref: POOLS_HREF, claimHref: POOLS_HREF }
}

export { explorerAddressUrl }
