import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import BigNumber from 'bignumber.js'
import { useAccount } from 'wagmi'
import { FarmWithStakedValue } from '@pancakeswap/farms'
import { useFarms, usePollFarmsWithUserData, usePriceCakeBusd } from 'state/farms/hooks'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useAppSelector } from 'state'
import { getFarmApr } from 'utils/apr'
import isArchivedPid from 'utils/farmHelpers'
import { RUNTIME_UNAVAILABLE_LABEL } from 'lib/runtime-truth'
import type { WalletPortfolio } from 'lib/wallet-portfolio/contracts'
import type { FarmFilterChip, FarmPreviewCard } from '../farmsStudioData'
import { displayFarmMetric, isUnavailableFarmMetric, stripTokenSymbol } from '../farmsStudioDisplay'
import {
  aggregateKpis,
  buildAprSparkline,
  formatUsd,
  listRewardingFarms,
  mapFarmToPreviewCard,
  selectFeaturedFarm,
} from './formatFarmsRuntime'
import { buildFarmsWalletPortfolio, type FarmsPortfolioViewMode } from './buildFarmsWalletPortfolio'
import { runtimeErrorFromPhase, type FarmsRuntimeError } from './farmsRuntimeErrors'
import { useFarmsTerminalData } from './useFarmsTerminalData'
import { useMasterChefEmission, type MasterChefEmission } from 'lib/data-truth/useMasterChefEmission'

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
  endedFarms?: number
  activeFarmNames?: string[]
  endedFarmNames?: string[]
  displayedFarms?: string[]
  sourceMethod?: string
  featuredFarm?: string
  rewardingFarms?: number
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
  /** Full unfiltered inventory for wallet portfolio (not UI filter chips). */
  portfolioFarms: FarmPreviewCard[]
  /** WalletPortfolio from portfolioFarms — no second farm scan. */
  farmsWalletPortfolio: WalletPortfolio
  portfolioViewMode: FarmsPortfolioViewMode
  setPortfolioViewMode: (mode: FarmsPortfolioViewMode) => void
  featured: FarmsFeaturedMetrics
  kpis: ReturnType<typeof aggregateKpis>
  advisorItems: FarmsAdvisorItem[]
  rewardingFarmCount: number
  terminal: ReturnType<typeof useFarmsTerminalData>
  masterChefEmission: MasterChefEmission
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

function sortEarnCardsDefault<T extends { status: string; apr?: string; tvl?: string }>(list: T[]): T[] {
  const statusRank: Record<string, number> = {
    live: 0,
    indexing: 1,
    finished: 2,
    ended: 2,
    'coming-soon': 3,
  }
  return [...list].sort((a, b) => {
    const sa = statusRank[a.status] ?? 1
    const sb = statusRank[b.status] ?? 1
    if (sa !== sb) return sa - sb
    const aprDiff = parseFloat(b.apr || '0') - parseFloat(a.apr || '0')
    if (aprDiff !== 0) return aprDiff
    const parseTvl = (v?: string) => parseFloat(v?.replace(/[^0-9.]/g, '') || '0')
    return parseTvl(b.tvl) - parseTvl(a.tvl)
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
      list = list
        .filter((f) => f.status !== 'finished')
        .sort((a, b) => {
          const aKey = a.rawFarm?.auctionHostingStartSeconds ?? a.rawFarm?.pid ?? a.pid ?? 0
          const bKey = b.rawFarm?.auctionHostingStartSeconds ?? b.rawFarm?.pid ?? b.pid ?? 0
          return bKey - aKey
        })
      break
    case 'My Farms':
      list = list.filter((f) => f.userStaked?.gt(0))
      break
    case 'Finished':
      list = list.filter((f) => f.status === 'finished')
      break
    case 'Featured Farm':
      list = list.sort((a, b) => parseFloat(b.apr || '0') - parseFloat(a.apr || '0')).slice(0, 3)
      break
    default:
      list = sortEarnCardsDefault(list)
      break
  }
  return list
}

export function useFarmsStakingRuntime(): FarmsStakingRuntime {
  const { address: account } = useAccount()
  const { chainId } = useActiveChainId()
  const router = useRouter()
  const initialFarmView = typeof router.query.view === 'string' ? router.query.view : undefined
  const [filter, setFilter] = useState<FarmFilterChip>(
    initialFarmView === 'explore' ? 'All' : 'My Farms',
  )
  const [portfolioViewMode, setPortfolioViewModeState] = useState<FarmsPortfolioViewMode>(
    initialFarmView === 'explore' ? 'ALL' : 'MY_FARMS',
  )
  const [modalRequest, setModalRequest] = useState<{
    farm: FarmPreviewCard
    action: Exclude<FarmsModalAction, null>
  } | null>(null)

  useEffect(() => {
    const view = typeof router.query.view === 'string' ? router.query.view : undefined
    if (view === 'explore') {
      setPortfolioViewModeState('ALL')
      setFilter('All')
    } else if (view === 'my') {
      setPortfolioViewModeState('MY_FARMS')
      setFilter('My Farms')
    }
  }, [router.query.view])

  const setPortfolioViewMode = useCallback(
    (mode: FarmsPortfolioViewMode) => {
      setPortfolioViewModeState(mode)
      setFilter(mode === 'MY_FARMS' ? 'My Farms' : 'All')
      const nextQuery = { ...router.query, view: mode === 'MY_FARMS' ? 'my' : 'explore' }
      void router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true })
    },
    [router],
  )

  const setFilterSynced = useCallback((next: FarmFilterChip) => {
    setFilter(next)
    if (next === 'My Farms') setPortfolioViewModeState('MY_FARMS')
    else if (next === 'All') setPortfolioViewModeState('ALL')
  }, [])

  usePollFarmsWithUserData()
  const loadingKeys = useAppSelector((state) => state.farms.loadingKeys)
  const { data: farmsLP, userDataLoaded, regularCakePerBlock } = useFarms()
  const farmPids = useMemo(
    () => (farmsLP ?? []).map((farm) => farm.pid).filter((pid) => Number.isInteger(pid) && pid >= 0),
    [farmsLP],
  )
  const masterChefEmission = useMasterChefEmission(farmPids)
  const canonicalPerBlock = masterChefEmission.perBlock > 0 ? masterChefEmission.perBlock : regularCakePerBlock
  const cakePrice = usePriceCakeBusd()
  const terminal = useFarmsTerminalData()

  const enrichedFarms = useMemo(() => {
    if (!farmsLP?.length || !chainId) return []
    const active = farmsLP.filter((farm) => farm.pid !== 0 && !isArchivedPid(farm.pid))
    return enrichFarmsWithApr(active, chainId, cakePrice, canonicalPerBlock)
  }, [farmsLP, chainId, cakePrice, canonicalPerBlock])

  const previewCards = useMemo(() => {
    if (!enrichedFarms.length) return []
    return enrichedFarms.map((f) => mapFarmToPreviewCard(f, masterChefEmission))
  }, [enrichedFarms, masterChefEmission])

  const chainName = chainId === 56 ? 'BNB Chain' : chainId === 97 ? 'BNB Testnet' : 'Unknown'
  const positionsLoading = Boolean(account) && !userDataLoaded
  const farmsWalletPortfolio = useMemo(
    () =>
      buildFarmsWalletPortfolio({
        wallet: account ?? null,
        chainId: chainId ?? null,
        chainName,
        generatedAt: '1970-01-01T00:00:00.000Z',
        farmCards: previewCards,
        positionsLoading,
      }),
    [account, chainId, chainName, positionsLoading, previewCards],
  )

  const filteredFarms = useMemo(() => filterFarms(previewCards, filter), [previewCards, filter])

  const featuredCard = useMemo(() => selectFeaturedFarm(previewCards), [previewCards])

  const rewardingFarmCount = useMemo(() => listRewardingFarms(previewCards).length, [previewCards])

  const featured = useMemo((): FarmsFeaturedMetrics => {
    const card = featuredCard
    const dailyRewardsRaw = card?.dailyRewards
    const dailyRewards =
      dailyRewardsRaw === '—'
        ? RUNTIME_UNAVAILABLE_LABEL
        : dailyRewardsRaw && !isUnavailableFarmMetric(dailyRewardsRaw)
          ? stripTokenSymbol(dailyRewardsRaw, card?.rewardToken ?? 'MARCO')
          : dailyRewardsRaw === '0.00'
            ? '0.00'
            : RUNTIME_UNAVAILABLE_LABEL
    return {
      pair: displayFarmMetric(card?.pair),
      tokens: card?.tokens ?? ['', ''],
      apr: displayFarmMetric(card?.apr),
      tvl: displayFarmMetric(card?.tvl),
      dailyRewards,
      multiplier: displayFarmMetric(card?.multiplier),
      rewardToken: card?.rewardToken ?? 'MARCO',
      participants: displayFarmMetric(card?.participants),
      card,
      sparkline: buildAprSparkline(enrichedFarms),
    }
  }, [featuredCard, enrichedFarms])

  const kpis = useMemo(
    () => aggregateKpis(enrichedFarms, masterChefEmission, featured.pair),
    [enrichedFarms, masterChefEmission, featured.pair],
  )

  const advisorItems = useMemo((): FarmsAdvisorItem[] => {
    const eligible = listRewardingFarms(previewCards)
    if (!eligible.length) {
      return [{ label: 'No eligible rewarding farms.', value: '', tone: 'muted' }]
    }
    const top = [...eligible].sort((a, b) => parseFloat(b.apr || '0') - parseFloat(a.apr || '0'))[0]
    const stableTop = [...eligible]
      .filter((f) => f.rawFarm?.isStable)
      .sort((a, b) => parseFloat(b.apr || '0') - parseFloat(a.apr || '0'))[0]
    const dailyReward =
      top?.dailyRewards === '—'
        ? RUNTIME_UNAVAILABLE_LABEL
        : top?.dailyRewards === '0.00'
          ? '0.00'
          : top?.dailyRewards && !isUnavailableFarmMetric(top.dailyRewards)
            ? stripTokenSymbol(top.dailyRewards, top.rewardToken ?? 'MARCO')
            : RUNTIME_UNAVAILABLE_LABEL
    return [
      {
        label: 'Top pick',
        value: displayFarmMetric(top?.pair),
        tone: 'green',
      },
      {
        label: 'APR',
        value: displayFarmMetric(top?.apr),
        tone: 'green',
      },
      {
        label: stableTop ? 'Highest Stable APR' : 'TVL',
        value: displayFarmMetric(stableTop?.apr ?? top?.tvl),
        tone: 'green',
      },
      {
        label: 'Rewards / day',
        value: dailyReward,
        tone: 'gold',
      },
    ]
  }, [previewCards])

  const phase: FarmsRuntimePhase = useMemo(() => {
    const fetching = Object.values(loadingKeys ?? {}).some(Boolean)
    if (fetching) return 'loading_farms'
    if (account && !userDataLoaded) return 'reading_wallet'
    return 'idle'
  }, [loadingKeys, account, userDataLoaded])

  const error = useMemo(() => runtimeErrorFromPhase(phase), [phase])

  const machine: FarmsMachinePayload = useMemo(() => {
    const live = previewCards.filter((f) => f.status === 'live')
    const ended = previewCards.filter((f) => f.status === 'finished')
    return {
      status: phase,
      chainId,
      wallet: account,
      filter,
      activeFarms: live.length,
      endedFarms: ended.length,
      activeFarmNames: live.map((f) => f.pair),
      endedFarmNames: ended.map((f) => f.pair),
      displayedFarms: filteredFarms.slice(0, 10).map((f) => f.pair),
      sourceMethod: 'master_chef_config_rpc',
      featuredFarm: featured.pair,
      rewardingFarms: rewardingFarmCount,
      error,
      timestamp: new Date().toISOString(),
    }
  }, [phase, chainId, account, filter, previewCards, filteredFarms, featured.pair, rewardingFarmCount, error])

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
    setFilter: setFilterSynced,
    farms: filteredFarms,
    portfolioFarms: previewCards,
    farmsWalletPortfolio,
    portfolioViewMode,
    setPortfolioViewMode,
    featured,
    kpis,
    advisorItems,
    rewardingFarmCount,
    terminal,
    masterChefEmission,
    machine,
    account,
    userDataLoaded,
    requestModal,
    modalRequest,
    clearModal,
  }
}
