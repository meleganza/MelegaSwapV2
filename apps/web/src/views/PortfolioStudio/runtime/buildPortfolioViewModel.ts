/**
 * Portfolio view model — factual aggregation only.
 * No Passport, identity, verification, Guest, or Subject concepts.
 */
import type { PassportLiquidityPosition } from 'views/PassportStudio/passportLiquidityTypes'
import type { FarmsWalletPosition } from 'views/FarmsStudio/modules/farmsMyFarmsTypes'
import type { PoolsWalletPosition } from 'views/PoolsStudio/modules/poolsMyPositionsTypes'
import {
  FARMS_HREF,
  LIQUIDITY_MANAGE_HREF,
  LIQUIDITY_REMOVE_HREF,
  POOLS_HREF,
  explorerAddressUrl,
  formatUsd,
  parseUsdLoose,
  shortenAddress,
} from '../helpers'
import { resolvePortfolioSurfaceState, type PortfolioSurfaceState } from './portfolioState'

export type PositionDomain = 'liquidity' | 'farms' | 'pools'

export type PortfolioMetricStatus = 'live' | 'indexed' | 'partial' | 'unavailable' | 'zero' | 'loading'

export type PortfolioSummaryMetric = {
  id: string
  label: string
  value: string
  status: PortfolioMetricStatus
  source: string
  partial?: boolean
}

export type PortfolioClaimableRow = {
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

export type PortfolioHeroCta = {
  kind: 'connect' | 'farms' | 'pools' | 'liquidity'
  label: string
  href: string | null
  enabled: boolean
  primary: boolean
}

export type PortfolioWallet = {
  connected: boolean
  loading: boolean
  address: string | null
  shortened: string | null
}

export type PortfolioViewModel = {
  surfaceState: PortfolioSurfaceState
  wallet: PortfolioWallet
  chainId: number | null
  heroCtas: PortfolioHeroCta[]
  summary: PortfolioSummaryMetric[]
  portfolioPartialValuation: boolean
  portfolioValueNote: string | null
  liquidity: PassportLiquidityPosition[]
  farms: FarmsWalletPosition[]
  pools: PoolsWalletPosition[]
  claimables: PortfolioClaimableRow[]
  activityEmpty: boolean
  activityNote: string
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
}): PortfolioClaimableRow[] {
  const rows: PortfolioClaimableRow[] = []

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

export function buildHeroCtas(walletConnected: boolean): PortfolioHeroCta[] {
  if (!walletConnected) {
    return [{ kind: 'connect', label: 'Connect Wallet', href: null, enabled: true, primary: true }]
  }
  return [
    { kind: 'farms', label: 'View Farms', href: '/farms', enabled: true, primary: true },
    { kind: 'pools', label: 'View Pools', href: '/pools', enabled: true, primary: false },
    { kind: 'liquidity', label: 'Liquidity', href: '/liquidity-studio', enabled: true, primary: false },
  ]
}

const UNAVAILABLE_SHORT = '—'

function metric(
  id: string,
  label: string,
  value: string,
  status: PortfolioMetricStatus,
  source: string,
  partial?: boolean,
): PortfolioSummaryMetric {
  return { id, label, value, status, source, partial }
}

export function buildAssetsSummary(args: {
  walletConnected: boolean
  liquidity: PassportLiquidityPosition[]
  farms: FarmsWalletPosition[]
  pools: PoolsWalletPosition[]
  claimables: PortfolioClaimableRow[]
  domains: {
    liquidityLoading: boolean
    farmsLoading: boolean
    poolsLoading: boolean
    farmsUnavailable?: boolean
    poolsUnavailable?: boolean
  }
}): { metrics: PortfolioSummaryMetric[]; partialValuation: boolean; note: string | null } {
  if (!args.walletConnected) {
    return {
      metrics: [
        metric('portfolio', 'Estimated Value', '—', 'unavailable', 'Wallet disconnected'),
        metric('liquidity', 'Liquidity', '—', 'unavailable', 'Wallet disconnected'),
        metric('farms', 'Farms', '—', 'unavailable', 'Wallet disconnected'),
        metric('pools', 'Pools', '—', 'unavailable', 'Wallet disconnected'),
        metric('rewards', 'Rewards', '—', 'unavailable', 'Wallet disconnected'),
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
  let portfolioStatus: PortfolioMetricStatus = 'unavailable'
  let portfolioSource = 'No priced positions yet'
  if (anyLoading && pricedCount === 0) {
    portfolioStatus = 'loading'
    portfolioSource = 'Loading positions…'
  } else if (pricedCount > 0) {
    portfolioValue = formatUsd(pricedUsd)
    portfolioStatus = partialValuation ? 'partial' : 'live'
    portfolioSource = partialValuation
      ? `Partial · ${pricedCount} priced · ${unpricedCount} unpriced`
      : `Priced positions · ${pricedCount}`
  } else if (args.liquidity.length + args.farms.length + args.pools.length > 0 && unpricedCount > 0) {
    portfolioStatus = 'partial'
    portfolioSource = 'Positions known · prices unavailable'
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
      metric('portfolio', 'Estimated Value', portfolioValue, portfolioStatus, portfolioSource, partialValuation),
      metric(
        'liquidity',
        'Liquidity',
        args.domains.liquidityLoading ? '—' : String(liqCount),
        args.domains.liquidityLoading ? 'loading' : liqCount === 0 ? 'zero' : 'live',
        'AMM LP · Liquidity Studio',
      ),
      metric(
        'farms',
        'Farms',
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
        'MasterChef LP staking',
      ),
      metric(
        'pools',
        'Pools',
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
        'SmartChef staking',
      ),
      metric(
        'rewards',
        'Rewards',
        String(claimCount),
        claimCount === 0 ? 'zero' : 'live',
        'Non-zero pending rewards only',
      ),
    ],
    partialValuation,
    note: 'Value excludes unpriced assets.',
  }
}

export function buildPortfolioViewModel(input: {
  wallet: PortfolioWallet
  chainId: number | null
  liquidity: PassportLiquidityPosition[]
  farms: FarmsWalletPosition[]
  pools: PoolsWalletPosition[]
  domains: {
    liquidityLoading: boolean
    farmsLoading: boolean
    poolsLoading: boolean
    anyDomainError: boolean
    anyDomainPartial: boolean
    hasLastGoodPositions: boolean
    farmsUnavailable?: boolean
    poolsUnavailable?: boolean
  }
}): PortfolioViewModel {
  const claimables = buildClaimables({ farms: input.farms, pools: input.pools })
  const hasAny =
    input.liquidity.length + input.farms.length + input.pools.length + claimables.length > 0

  const surfaceState = resolvePortfolioSurfaceState(input.wallet.connected, {
    walletLoading: input.wallet.loading,
    liquidityLoading: input.domains.liquidityLoading,
    farmsLoading: input.domains.farmsLoading,
    poolsLoading: input.domains.poolsLoading,
    anyDomainError: input.domains.anyDomainError,
    anyDomainPartial: input.domains.anyDomainPartial,
    hasLastGoodPositions: input.domains.hasLastGoodPositions,
    hasAnyFactualPositions: hasAny,
  })

  const summary = buildAssetsSummary({
    walletConnected: input.wallet.connected,
    liquidity: input.liquidity,
    farms: input.farms,
    pools: input.pools,
    claimables,
    domains: input.domains,
  })

  return {
    surfaceState,
    wallet: input.wallet,
    chainId: input.chainId,
    heroCtas: buildHeroCtas(input.wallet.connected),
    summary: summary.metrics,
    portfolioPartialValuation: summary.partialValuation,
    portfolioValueNote: summary.note,
    liquidity: input.liquidity,
    farms: input.farms,
    pools: input.pools,
    claimables,
    activityEmpty: true,
    activityNote: input.wallet.connected
      ? 'No recent wallet activity indexed yet.'
      : 'Connect a wallet to load recent activity.',
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

export { explorerAddressUrl, shortenAddress }
