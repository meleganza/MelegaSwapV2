import BigNumber from 'bignumber.js'
import { FarmWithStakedValue } from '@pancakeswap/farms'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import { getMasterChefAddress } from 'utils/addressHelpers'
import { getAddressExplorerUrl } from 'utils/blockExplorer'
import type { MasterChefEmission } from 'lib/data-truth/useMasterChefEmission'
import { resolveFarmEmissionState, formatTotalDailyEmissionKpi, formatHumanMarcoAmount } from 'lib/data-truth/masterChefEmissionMath'
import { isUnavailableFarmMetric } from '../farmsStudioDisplay'
import type { FarmAnalyzePreview, FarmPreviewCard, FarmStatus, FarmsKpiItem } from '../farmsStudioData'
import type { FarmEmissionState } from 'lib/data-truth/masterChefEmissionMath'
import { APR_UNAVAILABLE_LABEL, METRIC_STATUS } from 'lib/data-policy/metricStatus'
import {
  formatFarmAprDisplay,
  resolveFarmAprPercent,
  resolveFarmChainId,
  resolveFarmLiquidityUsd,
  resolveFarmRewardToken,
} from 'lib/data-truth/yieldMetricHelpers'

export const formatUsd = (value?: number | null): string => {
  if (value === undefined || value === null || !Number.isFinite(value) || value <= 0) {
    return METRIC_STATUS.UNAVAILABLE
  }
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(2)}`
}

export const formatApr = (apr?: number | null): string => {
  if (apr === undefined || apr === null || !Number.isFinite(apr)) return APR_UNAVAILABLE_LABEL
  return `${apr.toFixed(2)}%`
}

export const formatTokenAmount = (amount?: BigNumber, decimals = 18, symbol?: string): string => {
  if (!amount || amount.isZero()) return '—'
  const n = getBalanceNumber(amount, decimals)
  const text =
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : n.toFixed(2)
  return symbol ? `${text} ${symbol}` : text
}

export const formatHumanTokenAmount = formatHumanMarcoAmount

function farmStatus(farm: FarmWithStakedValue): FarmStatus {
  if (farm.multiplier === '0X') return 'finished'
  if (!farm.lpTotalInQuoteToken || !farm.quoteTokenPriceBusd) return 'indexing'
  return 'live'
}

function formatFarmDailyRewards(
  emissionState: FarmEmissionState,
  dailyMarco: number,
  rewardSymbol: string,
): string {
  if (emissionState === 'unavailable') return METRIC_STATUS.UNAVAILABLE
  if (emissionState === 'active' && dailyMarco > 0) {
    return formatHumanTokenAmount(dailyMarco, rewardSymbol)
  }
  return METRIC_STATUS.UNAVAILABLE
}

export function formatFarmDisplayApr(farm: FarmWithStakedValue, status: FarmStatus): string | undefined {
  if (status === 'finished') return undefined
  if (status !== 'live' && status !== 'indexing') return undefined
  const apr = resolveFarmAprPercent(farm)
  if (apr == null) return APR_UNAVAILABLE_LABEL
  return formatFarmAprDisplay(farm)
}

export function listRewardingFarms(cards: FarmPreviewCard[]): FarmPreviewCard[] {
  return cards.filter(
    (f) =>
      f.status === 'live' &&
      f.emissionState === 'active' &&
      f.apr &&
      !isUnavailableFarmMetric(f.apr) &&
      f.rawFarm?.multiplier !== '0X',
  )
}

function farmLiquidityUsd(card: FarmPreviewCard): number {
  if (!card.rawFarm) return 0
  return resolveFarmLiquidityUsd(card.rawFarm)
}

/** Featured = active + emission + TVL + sustainable APR; tie-break by lowest pid. */
export function selectFeaturedFarm(cards: FarmPreviewCard[]): FarmPreviewCard | undefined {
  const eligible = cards.filter((f) => {
    if (f.status !== 'live') return false
    if (f.rawFarm?.multiplier === '0X') return false
    if (f.emissionState !== 'active') return false
    // liquidity is a BigNumber on FarmWithStakedValue — never compare the object as a number
    if (!(farmLiquidityUsd(f) > 0)) return false
    if (!f.apr || isUnavailableFarmMetric(f.apr)) return false
    const aprN = parseFloat(String(f.apr).replace('%', ''))
    if (!Number.isFinite(aprN) || aprN <= 0 || aprN > 1_000_000) return false
    return true
  })
  if (!eligible.length) return undefined
  return [...eligible].sort((a, b) => {
    const tvlDiff = farmLiquidityUsd(b) - farmLiquidityUsd(a)
    if (tvlDiff !== 0) return tvlDiff
    const aprDiff = parseFloat(String(b.apr || '0')) - parseFloat(String(a.apr || '0'))
    if (aprDiff !== 0) return aprDiff
    return (a.pid ?? 0) - (b.pid ?? 0)
  })[0]
}

export function mapFarmToPreviewCard(
  farm: FarmWithStakedValue,
  emission: MasterChefEmission,
): FarmPreviewCard {
  const status = farmStatus(farm)
  const liquidityUsd = resolveFarmLiquidityUsd(farm)
  const aprDisplay = formatFarmDisplayApr(farm, status)

  const pid = farm.pid ?? -1
  const poolWeight = farm.poolWeight ? new BigNumber(farm.poolWeight).toNumber() : undefined
  const { dailyMarco, state: emissionState } = resolveFarmEmissionState(emission, pid, poolWeight)
  const rewardSymbol = resolveFarmRewardToken(farm)

  const token0 = farm.token?.symbol ?? '?'
  const token1 = farm.quoteToken?.symbol ?? '?'

  const chainId = resolveFarmChainId(farm, 56)
  const lpExplorerUrl = farm.lpAddress ? getAddressExplorerUrl(farm.lpAddress, chainId) : undefined
  const masterChefExplorerUrl = getAddressExplorerUrl(getMasterChefAddress(chainId), chainId)

  const analyzePreview: FarmAnalyzePreview = {
    aprHistory: aprDisplay && aprDisplay !== APR_UNAVAILABLE_LABEL ? aprDisplay : METRIC_STATUS.UNAVAILABLE,
    rewardToken: rewardSymbol,
    emission: dailyMarco > 0 ? `${formatHumanTokenAmount(dailyMarco, rewardSymbol)} / day` : METRIC_STATUS.UNAVAILABLE,
    contract: farm.lpAddress ?? 'On-chain',
    contractExplorerUrl: lpExplorerUrl,
    risk: farm.isStable ? 'Stable pair' : 'Standard',
  }

  return {
    id: `farm-${farm.pid}`,
    pid: farm.pid,
    pair: `${token0} / ${token1}`,
    tokens: [token0, token1],
    apr: aprDisplay,
    status,
    tvl: formatUsd(liquidityUsd),
    liquidity: formatUsd(liquidityUsd),
    dailyRewards: formatFarmDailyRewards(emissionState, dailyMarco, rewardSymbol),
    multiplier: farm.multiplier && farm.multiplier !== '0X' ? farm.multiplier.toLowerCase() : METRIC_STATUS.UNAVAILABLE,
    rewardToken: rewardSymbol,
    // Never map LP supply / emission amounts to participants (e.g. "1.505.47M").
    // Show — until a verified participant census exists.
    participants: METRIC_STATUS.UNAVAILABLE,
    cta: status === 'finished' ? 'none' : status === 'indexing' ? 'analyze' : 'stake',
    analyzePreview,
    rawFarm: farm,
    userStaked: farm.userData?.stakedBalance,
    pendingReward: farm.userData?.earnings,
    displayApr: aprDisplay,
    lpLabel: farm.lpSymbol,
    explorerUrl: lpExplorerUrl,
    masterChefExplorerUrl,
    emissionState,
  }
}

export function aggregateKpis(
  farms: FarmWithStakedValue[],
  emission: MasterChefEmission,
  featuredPair?: string,
): FarmsKpiItem[] {
  let totalTvl = 0
  let activeFarms = 0
  let highestApr = 0

  farms.forEach((farm) => {
    if (farm.multiplier !== '0X' && farm.pid !== 0) activeFarms += 1
    totalTvl += resolveFarmLiquidityUsd(farm)
    const apr = resolveFarmAprPercent(farm) ?? 0
    if (apr > highestApr) highestApr = apr
  })

  const perBlock = emission.perBlock
  const emissionValue = formatTotalDailyEmissionKpi(emission)

  return [
    { id: 'tvl', label: 'Total TVL', value: formatUsd(totalTvl) },
    { id: 'active', label: 'Active Farms', value: String(activeFarms) },
    {
      id: 'rewards',
      label: 'MARCO Emitted Today',
      value: emissionValue,
    },
    {
      id: 'apr',
      label: 'Highest APR',
      value: highestApr > 0 ? formatApr(highestApr) : APR_UNAVAILABLE_LABEL,
      gold: true,
    },
    { id: 'ai', label: 'Featured Farm', value: featuredPair ?? METRIC_STATUS.UNAVAILABLE, gold: true },
  ]
}

export function buildAprSparkline(_farms: FarmWithStakedValue[]): number[] {
  return []
}
