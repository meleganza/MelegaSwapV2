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

export const formatUsd = (value?: number | null): string => {
  if (value === undefined || value === null || !Number.isFinite(value) || value <= 0) return '—'
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(2)}`
}

export const formatApr = (apr?: number | null): string => {
  if (apr === undefined || apr === null || !Number.isFinite(apr)) return '—'
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
  if (emissionState === 'unavailable') return '—'
  if (emissionState === 'active' && dailyMarco > 0) {
    return formatHumanTokenAmount(dailyMarco, rewardSymbol)
  }
  return '0.00'
}

export function formatFarmDisplayApr(farm: FarmWithStakedValue, status: FarmStatus): string | undefined {
  if (status !== 'live') return undefined
  const totalApr = (farm.apr ?? 0) + (farm.lpRewardsApr ?? 0)
  if (!Number.isFinite(totalApr) || totalApr <= 0) return undefined
  return formatApr(totalApr)
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

export function selectFeaturedFarm(cards: FarmPreviewCard[]): FarmPreviewCard | undefined {
  const rewarding = listRewardingFarms(cards)
  if (!rewarding.length) return undefined
  return [...rewarding].sort((a, b) => parseFloat(b.apr || '0') - parseFloat(a.apr || '0'))[0]
}

export function mapFarmToPreviewCard(
  farm: FarmWithStakedValue,
  emission: MasterChefEmission,
): FarmPreviewCard {
  const status = farmStatus(farm)
  const liquidityUsd = farm.liquidity?.toNumber() ?? 0
  const aprDisplay = formatFarmDisplayApr(farm, status)

  const pid = farm.pid ?? -1
  const poolWeight = farm.poolWeight ? new BigNumber(farm.poolWeight).toNumber() : undefined
  const { dailyMarco, state: emissionState } = resolveFarmEmissionState(emission, pid, poolWeight)
  const rewardSymbol = farm.earningToken?.symbol ?? 'MARCO'

  const token0 = farm.token?.symbol ?? '?'
  const token1 = farm.quoteToken?.symbol ?? '?'

  const chainId = farm.token?.chainId ?? 56
  const lpExplorerUrl = farm.lpAddress ? getAddressExplorerUrl(farm.lpAddress, chainId) : undefined
  const masterChefExplorerUrl = getAddressExplorerUrl(getMasterChefAddress(chainId), chainId)

  const analyzePreview: FarmAnalyzePreview = {
    aprHistory: aprDisplay ?? '—',
    rewardToken: farm.earningToken?.symbol ?? 'MARCO',
    emission: dailyMarco > 0 ? `${formatHumanTokenAmount(dailyMarco, rewardSymbol)} / day` : '—',
    contract: farm.lpAddress ?? 'On-chain',
    contractExplorerUrl: lpExplorerUrl,
    risk: farm.isStable ? 'Stable pair' : 'Standard',
  }

  const lpStaked = farm.lpTotalSupply ? getBalanceNumber(farm.lpTotalSupply, 18) : 0

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
    multiplier: farm.multiplier && farm.multiplier !== '0X' ? farm.multiplier.toLowerCase() : '—',
    rewardToken: farm.earningToken?.symbol ?? 'MARCO',
    participants: lpStaked > 0 ? formatTokenAmount(farm.lpTotalSupply) : '—',
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
    const liq = farm.liquidity?.toNumber() ?? 0
    totalTvl += liq
    const apr = (farm.apr ?? 0) + (farm.lpRewardsApr ?? 0)
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
    { id: 'apr', label: 'Highest APR', value: highestApr > 0 ? formatApr(highestApr) : '—', gold: true },
    { id: 'ai', label: 'Featured Farm', value: featuredPair ?? '—', gold: true },
  ]
}

export function buildAprSparkline(_farms: FarmWithStakedValue[]): number[] {
  return []
}
