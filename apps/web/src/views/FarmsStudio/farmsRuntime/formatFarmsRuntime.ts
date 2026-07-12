import BigNumber from 'bignumber.js'
import { FarmWithStakedValue } from '@pancakeswap/farms'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import { BLOCKS_PER_DAY } from 'config'
import { RUNTIME_UNAVAILABLE_LABEL } from 'lib/runtime-truth'
import { getMasterChefAddress } from 'utils/addressHelpers'
import { getAddressExplorerUrl } from 'utils/blockExplorer'
import { getDisplayApr } from 'views/Farms/components/getDisplayApr'
import type { MasterChefEmission } from 'lib/data-truth/useMasterChefEmission'
import { resolveFarmEmissionState, formatTotalDailyEmissionKpi, formatHumanMarcoAmount } from 'lib/data-truth/masterChefEmissionMath'
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

export const formatHumanTokenAmount = formatHumanMarcoAmount

function farmStatus(farm: FarmWithStakedValue): FarmStatus {
  if (farm.multiplier === '0X') return 'finished'
  if (!farm.lpTotalInQuoteToken || !farm.quoteTokenPriceBusd) return 'indexing'
  return 'live'
}

export function mapFarmToPreviewCard(
  farm: FarmWithStakedValue,
  emission: MasterChefEmission,
): FarmPreviewCard {
  const status = farmStatus(farm)
  const liquidityUsd = farm.liquidity?.toNumber() ?? 0
  const totalApr = (farm.apr ?? 0) + (farm.lpRewardsApr ?? 0)
  const displayApr = getDisplayApr(farm.apr, farm.lpRewardsApr)

  const pid = farm.pid ?? -1
  const poolWeight = farm.poolWeight?.toNumber()
  const { dailyMarco, state: emissionState } = resolveFarmEmissionState(emission, pid, poolWeight)
  const rewardSymbol = farm.earningToken?.symbol ?? 'MARCO'

  const token0 = farm.token?.symbol ?? '?'
  const token1 = farm.quoteToken?.symbol ?? '?'

  const chainId = farm.token?.chainId ?? 56
  const lpExplorerUrl = farm.lpAddress ? getAddressExplorerUrl(farm.lpAddress, chainId) : undefined
  const masterChefExplorerUrl = getAddressExplorerUrl(getMasterChefAddress(chainId), chainId)

  const analyzePreview: FarmAnalyzePreview = {
    aprHistory: displayApr ? `${displayApr}%` : '—',
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
    apr: status === 'live' && totalApr > 0 ? formatApr(totalApr) : status === 'indexing' ? undefined : undefined,
    status,
    tvl: formatUsd(liquidityUsd),
    liquidity: formatUsd(liquidityUsd),
    dailyRewards:
      emissionState === 'active'
        ? formatHumanTokenAmount(dailyMarco, rewardSymbol)
        : emissionState === 'unavailable'
          ? '—'
          : '0 MARCO',
    multiplier: farm.multiplier && farm.multiplier !== '0X' ? farm.multiplier.toLowerCase() : '—',
    rewardToken: farm.earningToken?.symbol ?? 'MARCO',
    participants: lpStaked > 0 ? formatTokenAmount(farm.lpTotalSupply) : '—',
    cta: status === 'finished' ? 'none' : status === 'indexing' ? 'analyze' : 'stake',
    analyzePreview,
    rawFarm: farm,
    userStaked: farm.userData?.stakedBalance,
    pendingReward: farm.userData?.earnings,
    displayApr: displayApr ?? undefined,
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
