import BigNumber from 'bignumber.js'
import { FarmWithStakedValue } from '@pancakeswap/farms'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import { BLOCKS_PER_DAY } from 'config'
import { getDisplayApr } from 'views/Farms/components/getDisplayApr'
import type { FarmAnalyzePreview, FarmPreviewCard, FarmStatus, FarmsKpiItem } from '../farmsStudioData'

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

function farmStatus(farm: FarmWithStakedValue): FarmStatus {
  if (farm.multiplier === '0X') return 'finished'
  if (!farm.lpTotalInQuoteToken || !farm.quoteTokenPriceBusd) return 'indexing'
  return 'live'
}

export function mapFarmToPreviewCard(
  farm: FarmWithStakedValue,
  regularCakePerBlock: number,
): FarmPreviewCard {
  const status = farmStatus(farm)
  const liquidityUsd = farm.liquidity?.toNumber() ?? 0
  const totalApr = (farm.apr ?? 0) + (farm.lpRewardsApr ?? 0)
  const displayApr = getDisplayApr(farm.apr, farm.lpRewardsApr)

  const dailyRewardBn =
    farm.poolWeight && regularCakePerBlock
      ? farm.poolWeight.times(regularCakePerBlock).times(BLOCKS_PER_DAY)
      : null

  const token0 = farm.token?.symbol ?? '?'
  const token1 = farm.quoteToken?.symbol ?? '?'

  const analyzePreview: FarmAnalyzePreview = {
    aprHistory: displayApr ? `${displayApr}%` : '—',
    rewardToken: 'MARCO',
    emission: dailyRewardBn ? `${formatTokenAmount(dailyRewardBn)} / day` : '—',
    contract: farm.lpAddress ? `${farm.lpAddress.slice(0, 6)}…${farm.lpAddress.slice(-4)}` : 'On-chain',
    risk: farm.isStable ? 'Stable pair' : 'Standard',
  }

  const lpStaked = farm.lpTotalSupply ? getBalanceNumber(farm.lpTotalSupply, 18) : 0

  return {
    id: `farm-${farm.pid}`,
    pid: farm.pid,
    pair: `${token0} / ${token1}`,
    tokens: [token0, token1],
    apr: status === 'live' && totalApr > 0 ? formatApr(totalApr) : status === 'indexing' ? undefined : undefined,
    status,
    tvl: formatUsd(liquidityUsd),
    liquidity: formatUsd(liquidityUsd),
    dailyRewards: dailyRewardBn ? formatTokenAmount(dailyRewardBn) : '—',
    multiplier: farm.multiplier && farm.multiplier !== '0X' ? farm.multiplier.toLowerCase() : '—',
    rewardToken: 'MARCO',
    participants: lpStaked > 0 ? formatTokenAmount(farm.lpTotalSupply) : '—',
    cta: status === 'finished' ? 'none' : status === 'indexing' ? 'analyze' : 'stake',
    analyzePreview,
    rawFarm: farm,
    userStaked: farm.userData?.stakedBalance,
    pendingReward: farm.userData?.earnings,
    displayApr: displayApr ?? undefined,
    lpLabel: farm.lpSymbol,
  }
}

export function aggregateKpis(
  farms: FarmWithStakedValue[],
  regularCakePerBlock: number,
  featuredPair?: string,
): FarmsKpiItem[] {
  let totalTvl = 0
  let activeFarms = 0
  let dailyEmissions = 0
  let highestApr = 0

  farms.forEach((farm) => {
    if (farm.multiplier !== '0X' && farm.pid !== 0) activeFarms += 1
    const liq = farm.liquidity?.toNumber() ?? 0
    totalTvl += liq
    const apr = (farm.apr ?? 0) + (farm.lpRewardsApr ?? 0)
    if (apr > highestApr) highestApr = apr
    if (farm.poolWeight && regularCakePerBlock) {
      dailyEmissions += getBalanceNumber(farm.poolWeight.times(regularCakePerBlock).times(BLOCKS_PER_DAY))
    }
  })

  return [
    { id: 'tvl', label: 'Total TVL', value: formatUsd(totalTvl) },
    { id: 'active', label: 'Active Farms', value: String(activeFarms) },
    {
      id: 'rewards',
      label: 'MARCO REWARDS TODAY',
      value: dailyEmissions > 0 ? formatTokenAmount(new BigNumber(dailyEmissions)) : '—',
    },
    { id: 'apr', label: 'Highest APR', value: highestApr > 0 ? formatApr(highestApr) : '—', gold: true },
    { id: 'ai', label: 'AI Suggested', value: featuredPair ?? '—', gold: true },
  ]
}

export function buildAprSparkline(farms: FarmWithStakedValue[]): number[] {
  const aprs = farms
    .filter((f) => f.multiplier !== '0X')
    .map((f) => (f.apr ?? 0) + (f.lpRewardsApr ?? 0))
    .filter((a) => a > 0)
    .sort((a, b) => a - b)
    .slice(-8)
  while (aprs.length < 8) aprs.unshift(4)
  return aprs.map((a) => Math.min(10, Math.max(3, Math.round(a / 4))))
}
