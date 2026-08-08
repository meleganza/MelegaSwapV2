/**
 * Project Economy — match farms/pools by chainId + token address (not slug).
 * Phase A: sync config inventory. Phase B: hydrate APR/TVL from runtime when present.
 */
import { useEffect, useMemo, useState } from 'react'
import {
  resolveFarmAprPercent,
  resolveFarmLiquidityUsd,
  resolvePoolAprPercent,
  resolvePoolTvlUsd,
} from 'lib/data-truth/yieldMetricHelpers'
import { normalizeEvmAddress } from 'registry/projects/identity/caip'
import { useFarms, usePollFarmsWithUserData } from 'state/farms/hooks'
import { useFetchPublicPoolsData, usePoolsWithVault } from 'state/pools/hooks'
import { afterFirstPaint } from '../v5/projectPagePerf'
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

function bestAprDisplay(values: Array<number | undefined>): string {
  const nums = values.filter((n): n is number => typeof n === 'number' && Number.isFinite(n) && n > 0)
  if (!nums.length) return '—'
  return `${Math.max(...nums).toFixed(2)}%`
}

function sumTvlDisplay(values: number[]): string {
  const sum = values.filter((n) => Number.isFinite(n) && n > 0).reduce((a, b) => a + b, 0)
  if (!(sum > 0)) return '—'
  if (sum >= 1_000_000) return `$${(sum / 1_000_000).toFixed(2)}M`
  if (sum >= 1_000) return `$${(sum / 1_000).toFixed(1)}K`
  return `$${sum.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

export { matchFarmsByToken, matchPoolsByToken }

export function useProjectEconomyByToken(input: {
  chainId: number
  tokenAddress: string | null | undefined
  liquidityPairCount?: number
  largestPairLabel?: string | null
}) {
  const { chainId, tokenAddress } = input
  const [hydrate, setHydrate] = useState(false)

  useEffect(() => {
    const cancel = afterFirstPaint(() => setHydrate(true))
    return cancel
  }, [])

  const configFarms = useMemo(() => matchFarmsByToken(chainId, tokenAddress), [chainId, tokenAddress])
  const configPools = useMemo(() => matchPoolsByToken(chainId, tokenAddress), [chainId, tokenAddress])

  usePollFarmsWithUserData()
  useFetchPublicPoolsData(chainId)
  const { data: runtimeFarms } = useFarms()
  const { pools: runtimePools } = usePoolsWithVault(chainId)

  const farms: ProjectEconomyFarmSummary = useMemo(() => {
    const addr = tokenAddress ? normalizeEvmAddress(tokenAddress) : null
    const matchedRuntime =
      hydrate && addr
        ? (runtimeFarms || []).filter((f) => {
            const t0 = f.token?.address ? normalizeEvmAddress(f.token.address) : null
            const t1 = f.quoteToken?.address ? normalizeEvmAddress(f.quoteToken.address) : null
            const lp = f.lpAddress ? normalizeEvmAddress(f.lpAddress) : null
            return f.pid !== 0 && (t0 === addr || t1 === addr || lp === addr)
          })
        : []

    const aprs = matchedRuntime.map((f) => resolveFarmAprPercent(f))
    const tvls = matchedRuntime.map((f) => resolveFarmLiquidityUsd(f)).filter((n) => n > 0)
    const reward =
      matchedRuntime[0]?.dual?.earnLabel ||
      matchedRuntime[0]?.token?.symbol ||
      configFarms[0]?.token0Symbol ||
      null
    const topLabel = matchedRuntime[0]
      ? `${matchedRuntime[0].token?.symbol}/${matchedRuntime[0].quoteToken?.symbol}`
      : configFarms[0]
        ? `${configFarms[0].token0Symbol}/${configFarms[0].token1Symbol}`
        : null

    return {
      count: Math.max(configFarms.length, matchedRuntime.length),
      searched: true,
      bestAprDisplay: matchedRuntime.length ? bestAprDisplay(aprs) : '—',
      tvlDisplay: matchedRuntime.length ? sumTvlDisplay(tvls) : '—',
      rewardToken: reward,
      topLabel,
    }
  }, [configFarms, runtimeFarms, hydrate, tokenAddress])

  const pools: ProjectEconomyPoolSummary = useMemo(() => {
    const addr = tokenAddress ? normalizeEvmAddress(tokenAddress) : null
    const matchedRuntime =
      hydrate && addr
        ? (runtimePools || []).filter((p) => {
            const stake = p.stakingToken?.address ? normalizeEvmAddress(p.stakingToken.address) : null
            const earn = p.earningToken?.address ? normalizeEvmAddress(p.earningToken.address) : null
            return stake === addr || earn === addr
          })
        : []

    const aprs = matchedRuntime.map((p) => resolvePoolAprPercent(p))
    const tvls = matchedRuntime.map((p) => resolvePoolTvlUsd(p)).filter((n) => n > 0)
    const reward = matchedRuntime[0]?.earningToken?.symbol || configPools[0]?.earningToken?.symbol || null
    const topLabel = matchedRuntime[0]
      ? `${matchedRuntime[0].stakingToken?.symbol} → ${matchedRuntime[0].earningToken?.symbol}`
      : configPools[0]
        ? `${configPools[0]?.stakingToken?.symbol} → ${configPools[0]?.earningToken?.symbol}`
        : null

    return {
      count: Math.max(configPools.length, matchedRuntime.length),
      searched: true,
      bestAprDisplay: matchedRuntime.length ? bestAprDisplay(aprs) : '—',
      tvlDisplay: matchedRuntime.length ? sumTvlDisplay(tvls) : '—',
      rewardToken: reward || null,
      topLabel,
    }
  }, [configPools, runtimePools, hydrate, tokenAddress])

  const liquidity: ProjectEconomyLiquiditySummary = {
    pairCount: input.liquidityPairCount ?? 0,
    largestPair: input.largestPairLabel ?? null,
  }

  return {
    farms,
    pools,
    liquidity,
    hydrate,
    configFarmCount: configFarms.length,
    configPoolCount: configPools.length,
  }
}
