import { useMemo } from 'react'
import { useFarmsStakingRuntime } from 'views/FarmsStudio/farmsRuntime/useFarmsStakingRuntime'
import { usePoolsStakingRuntime } from 'views/PoolsStudio/poolsRuntime/usePoolsStakingRuntime'

export type ProjectYieldSlice = {
  id: string
  label: string
  tvlUsd: number | null
  sharePct: number | null
  apr: string
  dailyRewards: string
  historicalRewards: string
}

type ProjectYieldGroup = {
  totalTvlUsd: number | null
  items: ProjectYieldSlice[]
  loading: boolean
}

function address(value?: string | null): string | null {
  return value && /^0x[a-fA-F0-9]{40}$/.test(value) ? value.toLowerCase() : null
}

function parseUsdDisplay(value?: string | null): number | null {
  if (!value || /unavailable|indexing|—/i.test(value)) return null
  const numeric = Number(value.replace(/[^0-9.-]/g, ''))
  if (!Number.isFinite(numeric)) return null
  if (/b/i.test(value)) return numeric * 1_000_000_000
  if (/m/i.test(value)) return numeric * 1_000_000
  if (/k/i.test(value)) return numeric * 1_000
  return numeric
}

function withShares(items: Omit<ProjectYieldSlice, 'sharePct'>[], loading: boolean): ProjectYieldGroup {
  const valued = items.filter((item) => item.tvlUsd != null && item.tvlUsd > 0)
  const total = valued.reduce((sum, item) => sum + (item.tvlUsd ?? 0), 0)
  return {
    totalTvlUsd: total > 0 ? total : null,
    items: items.map((item) => ({
      ...item,
      sharePct: total > 0 && item.tvlUsd != null ? (item.tvlUsd / total) * 100 : null,
    })),
    loading,
  }
}

export function useProjectYieldAnalytics(chainId: number, tokenAddress?: string | null) {
  const farmsRuntime = useFarmsStakingRuntime()
  const poolsRuntime = usePoolsStakingRuntime()
  const target = address(tokenAddress)

  const farms = useMemo(() => {
    const items = farmsRuntime.portfolioFarms
      .filter((card) => {
        if (!target) return false
        return [card.rawFarm?.token?.address, card.rawFarm?.quoteToken?.address].map(address).includes(target)
      })
      .map((card) => ({
        id: card.id,
        label: card.pair,
        tvlUsd: parseUsdDisplay(card.tvl),
        apr: card.apr && !/unavailable|indexing/i.test(card.apr) ? card.apr : '—',
        dailyRewards: card.dailyRewards && !/unavailable|indexing/i.test(card.dailyRewards) ? card.dailyRewards : '—',
        // No indexed lifetime reward-distribution producer exists yet; never infer it from emissions.
        historicalRewards: '—',
      }))
    return withShares(items, farmsRuntime.phase === 'loading_farms' || farmsRuntime.phase === 'calculating_rewards')
  }, [farmsRuntime.portfolioFarms, farmsRuntime.phase, target])

  const pools = useMemo(() => {
    const items = poolsRuntime.portfolioPools
      .filter((card) => {
        if (!target) return false
        return [
          card.stakeContractAddress,
          card.rewardContractAddress,
          card.rawPool?.stakingToken?.address,
          card.rawPool?.earningToken?.address,
        ]
          .map(address)
          .includes(target)
      })
      .map((card) => ({
        id: card.id,
        label: card.name,
        tvlUsd: parseUsdDisplay(card.tvl),
        apr:
          card.sustainableAprDisplay && !/unavailable|indexing/i.test(card.sustainableAprDisplay)
            ? card.sustainableAprDisplay
            : card.apr && !/unavailable|indexing/i.test(card.apr)
            ? card.apr
            : '—',
        dailyRewards: card.dailyRewards && !/unavailable|indexing/i.test(card.dailyRewards) ? card.dailyRewards : '—',
        historicalRewards: '—',
      }))
    return withShares(items, poolsRuntime.phase === 'loading_pools' || poolsRuntime.phase === 'calculating_rewards')
  }, [poolsRuntime.portfolioPools, poolsRuntime.phase, target])

  return { farms, pools }
}

export default useProjectYieldAnalytics
