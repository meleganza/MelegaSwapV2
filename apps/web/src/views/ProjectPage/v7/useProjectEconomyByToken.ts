/**
 * Project Economy — match farms/pools by chainId + token address (not slug).
 * Phase A: sync config inventory. Phase B: hydrate APR/TVL from runtime when present.
 */
import { useMemo } from 'react'
import { matchFarmsByToken, matchPoolsByToken } from './matchProjectYieldByToken'

export type ProjectEconomyFarmSummary = {
  count: number
  searched: boolean
  bestAprDisplay: string
  tvlDisplay: string
  rewardToken: string | null
  topLabel: string | null
}

export type ProjectEconomyPoolSummary = {
  count: number
  searched: boolean
  bestAprDisplay: string
  tvlDisplay: string
  rewardToken: string | null
  topLabel: string | null
}

export type ProjectEconomyLiquiditySummary = {
  pairCount: number
  largestPair: string | null
}

export { matchFarmsByToken, matchPoolsByToken }

export function useProjectEconomyByToken(input: {
  chainId: number
  tokenAddress: string | null | undefined
  liquidityPairCount?: number
  largestPairLabel?: string | null
}) {
  const { chainId, tokenAddress } = input
  const configFarms = useMemo(() => matchFarmsByToken(chainId, tokenAddress), [chainId, tokenAddress])
  const configPools = useMemo(() => matchPoolsByToken(chainId, tokenAddress), [chainId, tokenAddress])

  const farms: ProjectEconomyFarmSummary = useMemo(() => {
    const reward = configFarms[0]?.token0Symbol || null
    const topLabel = configFarms[0] ? `${configFarms[0].token0Symbol}/${configFarms[0].token1Symbol}` : null

    return {
      count: configFarms.length,
      searched: true,
      bestAprDisplay: '—',
      tvlDisplay: '—',
      rewardToken: reward,
      topLabel,
    }
  }, [configFarms])

  const pools: ProjectEconomyPoolSummary = useMemo(() => {
    const reward = configPools[0]?.earningToken?.symbol || null
    const topLabel = configPools[0]
      ? `${configPools[0]?.stakingToken?.symbol} → ${configPools[0]?.earningToken?.symbol}`
      : null

    return {
      count: configPools.length,
      searched: true,
      bestAprDisplay: '—',
      tvlDisplay: '—',
      rewardToken: reward || null,
      topLabel,
    }
  }, [configPools])

  const liquidity: ProjectEconomyLiquiditySummary = {
    pairCount: input.liquidityPairCount ?? 0,
    largestPair: input.largestPairLabel ?? null,
  }

  return {
    farms,
    pools,
    liquidity,
    hydrate: false,
    configFarmCount: configFarms.length,
    configPoolCount: configPools.length,
  }
}
