import { useCallback, useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import { useAccount } from 'wagmi'
import { FarmWithStakedValue } from '@pancakeswap/farms'
import { useFarms, usePollFarmsWithUserData, usePriceCakeBusd } from 'state/farms/hooks'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { getFarmApr } from 'utils/apr'
import isArchivedPid from 'utils/farmHelpers'
import type { FarmFilterChip, FarmPreviewCard } from '../farmsStudioData'
import {
  aggregateKpis,
  buildAprSparkline,
  formatUsd,
  mapFarmToPreviewCard,
} from './formatFarmsRuntime'
import { runtimeErrorFromPhase, type FarmsRuntimeError } from './farmsRuntimeErrors'
import useFarmsTerminalData from './useFarmsTerminalData'

export type FarmsRuntimePhase =
  | 'idle'
  | 'loading_farms'
  | 'reading_wallet'
  | 'calculating_rewards'
  | 'preparing_deposit'
  | 'preparing_withdraw'
  | 'claiming'
  | 'wallet_required'
  | 'approval_required'
  | 'error'

export type FarmsModalAction = 'stake' | 'unstake' | 'claim' | null

export interface FarmsMachinePayload {
  status: FarmsRuntimePhase
  chainId?: number
  wallet?: string
  filter: string
  activeFarms: number
  featuredFarm?: string
  error?: FarmsRuntimeError | null
  timestamp: string
}

export interface FarmsFeaturedMetrics {
  pair: string
  tokens: [string, string]
  apr: string
  tvl: string
  dailyRewards: string
  multiplier: string
  rewardToken: string
  participants: string
  card?: FarmPreviewCard
  sparkline: number[]
}

export interface FarmsAdvisorItem {
  label: string
  value: string
  tone: 'green' | 'gold' | 'muted'
}

export interface FarmsStakingRuntime {
  phase: FarmsRuntimePhase
  loadingLabel?: string
  error: FarmsRuntimeError | null
  filter: FarmFilterChip
  setFilter: (chip: FarmFilterChip) => void
  farms: FarmPreviewCard[]
  featured: FarmsFeaturedMetrics
  kpis: ReturnType<typeof aggregateKpis>
  advisorItems: FarmsAdvisorItem[]
  terminal: ReturnType<typeof useFarmsTerminalData>
  machine: FarmsMachinePayload
  account?: string
  userDataLoaded: boolean
  requestModal: (farm: FarmPreviewCard, action: Exclude<FarmsModalAction, null>) => void
  modalRequest: { farm: FarmPreviewCard; action: Exclude<FarmsModalAction, null> } | null
  clearModal: () => void
}

function enrichFarmsWithApr(
  farms: FarmWithStakedValue[],
  chainId: number,
  cakePrice: BigNumber,
  regularCakePerBlock: number,
): FarmWithStakedValue[] {
  return farms.map((farm) => {
    if (!farm.lpTotalInQuoteToken || !farm.quoteTokenPriceBusd) return farm
    const totalLiquidity = farm.isTokenOnly
      ? new BigNumber(farm.lpTotalInQuoteToken).times(farm.tokenPriceBusd ?? 0)
      : new BigNumber(farm.lpTotalInQuoteToken).times(farm.quoteTokenPriceBusd)
    const { cakeRewardsApr, lpRewardsApr } = getFarmApr(
      chainId,
      new BigNumber(farm.poolWeight ?? 0),
      cakePrice,
      totalLiquidity,
      farm.lpAddress,
      regularCakePerBlock,
    )
    return { ...farm, apr: cakeRewardsApr, lpRewardsApr, liquidity: totalLiquidity }
  })
}

function filterFarms(cards: FarmPreviewCard[], filter: FarmFilterChip): FarmPreviewCard[] {
  let list = [...cards]
  switch (filter) {
    case 'MARCO':
      list = list.filter((f) => f.tokens.includes('MARCO') || f.pair.includes('MARCO'))
      break
    case 'Stable':
      list = list.filter((f) => f.rawFarm?.isStable)
      break
    case 'High APR':
      list = list.sort((a, b) => parseFloat(b.apr || '0') - parseFloat(a.apr || '0'))
      break
    case 'New':
      list = list.sort((a, b) => (b.pid ?? 0) - (a.pid ?? 0))
      break
    case 'My Farms':
      list = list.filter((f) => f.userStaked?.gt(0))
      break
    case 'Finished':
      list = list.filter((f) => f.status === 'finished')
      break
    case 'AI Suggested':
      list = list.sort((a, b) => parseFloat(b.apr || '0') - parseFloat(a.apr || '0')).slice(0, 3)
      break
    default:
      break
  }
  return list
}

export function useFarmsStakingRuntime(): FarmsStakingRuntime {
  const { address: account } = useAccount()
  const { chainId } = useActiveChainId()
  const [filter, setFilter] = useState<FarmFilterChip>('All')
  const [modalRequest, setModalRequest] = useState<{
    farm: FarmPreviewCard
    action: Exclude<FarmsModalAction, null>
  } | null>(null)

  usePollFarmsWithUserData()
  const { data: farmsLP, userDataLoaded, regularCakePerBlock } = useFarms()
  const cakePrice = usePriceCakeBusd()
  const terminal = useFarmsTerminalData()

  const enrichedFarms = useMemo(() => {
    if (!farmsLP?.length || !chainId) return []
    const active = farmsLP.filter((farm) => farm.pid !== 0 && !isArchivedPid(farm.pid))
    return enrichFarmsWithApr(active, chainId, cakePrice, regularCakePerBlock)
  }, [farmsLP, chainId, cakePrice, regularCakePerBlock])

  const previewCards = useMemo(() => {
    if (!enrichedFarms.length) return []
    return enrichedFarms.map((f) => mapFarmToPreviewCard(f, regularCakePerBlock))
  }, [enrichedFarms, regularCakePerBlock])

  const filteredFarms = useMemo(() => filterFarms(previewCards, filter), [previewCards, filter])

  const featuredCard = useMemo(() => {
    const live = previewCards.filter((f) => f.status === 'live' && f.apr)
    const byApr = live.sort((a, b) => parseFloat(b.apr || '0') - parseFloat(a.apr || '0'))[0]
    if (byApr) return byApr
    const byWeight = [...previewCards]
      .filter((f) => f.status === 'live')
      .sort((a, b) => {
        const aW = a.rawFarm?.poolWeight?.toNumber() ?? 0
        const bW = b.rawFarm?.poolWeight?.toNumber() ?? 0
        return bW - aW
      })[0]
    return byWeight ?? previewCards[0]
  }, [previewCards])

  const featured = useMemo((): FarmsFeaturedMetrics => {
    const card = featuredCard
    return {
      pair: card?.pair ?? '—',
      tokens: card?.tokens ?? ['—', '—'],
      apr: card?.apr ?? '—',
      tvl: card?.tvl ?? '—',
      dailyRewards: card?.dailyRewards !== '—' ? `${card?.dailyRewards ?? '—'} MARCO` : '—',
      multiplier: card?.multiplier ?? '—',
      rewardToken: card?.rewardToken ?? 'MARCO',
      participants: card?.participants ?? '—',
      card,
      sparkline: buildAprSparkline(enrichedFarms),
    }
  }, [featuredCard, enrichedFarms])

  const kpis = useMemo(
    () => aggregateKpis(enrichedFarms, regularCakePerBlock, featured.pair),
    [enrichedFarms, regularCakePerBlock, featured.pair],
  )

  const advisorItems = useMemo((): FarmsAdvisorItem[] => {
    const highest = [...previewCards].sort((a, b) => parseFloat(b.apr || '0') - parseFloat(a.apr || '0'))[0]
    const stable = previewCards.find((f) => f.rawFarm?.isStable && f.status === 'live')
    const utilization =
      enrichedFarms.length > 0
        ? enrichedFarms.filter((f) => f.liquidity?.gt(0)).length / enrichedFarms.length
        : 0
    const budgetFarm = [...previewCards].sort((a, b) => {
      const aW = a.rawFarm?.poolWeight?.toNumber() ?? 0
      const bW = b.rawFarm?.poolWeight?.toNumber() ?? 0
      return bW - aW
    })[0]
    return [
      {
        label: 'Best Risk / Reward',
        value: stable?.pair ?? highest?.pair ?? '—',
        tone: 'green',
      },
      {
        label: 'Highest Stable APR',
        value: stable?.pair ?? highest?.pair ?? '—',
        tone: 'green',
      },
      {
        label: 'Best for AI Agents',
        value: budgetFarm?.pair ?? highest?.pair ?? '—',
        tone: 'gold',
      },
      {
        label: 'Auto-compound',
        value: utilization > 0.5 ? 'Manual harvest' : 'Available soon',
        tone: utilization > 0.5 ? 'muted' : 'muted',
      },
      {
        label: 'Risk',
        value: utilization >= 0.6 ? 'Low' : utilization >= 0.3 ? 'Moderate' : 'Indexing',
        tone: utilization >= 0.6 ? 'green' : 'gold',
      },
    ]
  }, [previewCards, enrichedFarms])

  const phase: FarmsRuntimePhase = useMemo(() => {
    if (!farmsLP) return 'loading_farms'
    if (account && !userDataLoaded) return 'reading_wallet'
    return 'idle'
  }, [farmsLP, account, userDataLoaded])

  const error = useMemo(() => runtimeErrorFromPhase(phase), [phase])

  const machine: FarmsMachinePayload = useMemo(
    () => ({
      status: phase,
      chainId,
      wallet: account,
      filter,
      activeFarms: previewCards.filter((f) => f.status === 'live').length,
      featuredFarm: featured.pair,
      error,
      timestamp: new Date().toISOString(),
    }),
    [phase, chainId, account, filter, previewCards, featured.pair, error],
  )

  const loadingLabel =
    phase === 'loading_farms'
      ? 'Loading farms…'
      : phase === 'reading_wallet'
        ? 'Reading wallet…'
        : phase === 'calculating_rewards'
          ? 'Calculating rewards…'
          : undefined

  const requestModal = useCallback((farm: FarmPreviewCard, action: Exclude<FarmsModalAction, null>) => {
    setModalRequest({ farm, action })
  }, [])

  const clearModal = useCallback(() => setModalRequest(null), [])

  return {
    phase,
    loadingLabel,
    error,
    filter,
    setFilter,
    farms: filteredFarms,
    featured,
    kpis,
    advisorItems,
    terminal,
    machine,
    account,
    userDataLoaded,
    requestModal,
    modalRequest,
    clearModal,
  }
}
