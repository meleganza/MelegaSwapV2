import { useMemo } from 'react'
import { Token } from '@pancakeswap/sdk'
import { useAccount } from 'wagmi'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useTokenBalancesWithLoadingIndicator } from 'state/wallet/hooks'
import type { CanonicalProjectDocument } from 'registry/projects/identity/types'
import type { ProjectEvidencePack } from 'registry/projects/identity/evidence/types'
import {
  buildWalletRelationshipDocument,
  disconnectedObservation,
  walletAccountFromAddressAndChain,
  type LiveAssetBalanceFact,
  type LiveFarmPositionFact,
  type LiveLiquidityPositionFact,
  type LivePoolPositionFact,
  type LiveWalletObservation,
  type ProjectWalletRelationshipDocument,
} from 'registry/projects/identity/walletRelationship'
import { useLiquidityPositions } from 'views/LiquidityStudio/liquidityRuntime/useLiquidityPositions'
import { useFarmsStakingRuntime } from 'views/FarmsStudio/farmsRuntime/useFarmsStakingRuntime'
import { usePoolsStakingRuntime } from 'views/PoolsStudio/poolsRuntime/usePoolsStakingRuntime'
import { normalizeEvmAddress } from 'registry/projects/identity/caip'
import type { FarmPreviewCard } from 'views/FarmsStudio/farmsStudioData'
import type { PoolPreviewCard } from 'views/PoolsStudio/poolsStudioData'

function bnRaw(value: { toFixed?: (d: number) => string; toString: () => string } | null | undefined): string | null {
  if (!value) return null
  try {
    if (typeof value.toFixed === 'function') return value.toFixed(0)
    return value.toString()
  } catch {
    return null
  }
}

function bnPositive(value: { gt?: (n: number) => boolean } | null | undefined): boolean {
  try {
    return Boolean(value?.gt?.(0))
  } catch {
    return false
  }
}

/**
 * Client observation + shared pure resolver.
 * Skips live studio reads when wallet is disconnected.
 */
export function useProjectWalletRelationship(
  document: CanonicalProjectDocument,
  evidencePack: ProjectEvidencePack,
): {
  relationshipDocument: ProjectWalletRelationshipDocument
  loading: boolean
} {
  const { address, isConnecting, isReconnecting, isConnected } = useAccount()
  const { chainId } = useActiveChainId()
  const observedAt = useMemo(() => new Date().toISOString(), [address, chainId, isConnected])

  const projectTokens = useMemo(() => {
    if (!chainId || !isConnected) return [] as Token[]
    const tokens: Token[] = []
    const seen = new Set<string>()
    for (const asset of document.assets) {
      if (asset.chainId !== chainId || !asset.contractAddress) continue
      const addr = normalizeEvmAddress(asset.contractAddress)
      if (!addr || seen.has(addr)) continue
      const decimals =
        asset.decimals.meta.availability === 'AVAILABLE' && typeof asset.decimals.value === 'number'
          ? asset.decimals.value
          : 18
      const symbol =
        asset.symbol.meta.availability === 'AVAILABLE' && asset.symbol.value ? asset.symbol.value : 'TOKEN'
      const name =
        asset.name.meta.availability === 'AVAILABLE' && asset.name.value ? asset.name.value : symbol
      try {
        tokens.push(new Token(chainId, addr, decimals, symbol, name))
        seen.add(addr)
      } catch {
        // skip
      }
    }
    return tokens
  }, [document.assets, chainId, isConnected])

  const [balances, balancesLoading] = useTokenBalancesWithLoadingIndicator(
    isConnected && address ? address : undefined,
    isConnected ? projectTokens : [],
  )

  const { positions: liquidityPositions, isLoading: liquidityLoading } = useLiquidityPositions()
  const farmsRuntime = useFarmsStakingRuntime()
  const poolsRuntime = usePoolsStakingRuntime()

  const farmsLoading =
    farmsRuntime.phase === 'loading_farms' || farmsRuntime.phase === 'reading_wallet'
  const poolsLoading =
    poolsRuntime.phase === 'loading_pools' || poolsRuntime.phase === 'reading_wallet'

  const loading =
    Boolean(isConnecting || isReconnecting) ||
    (Boolean(isConnected) && (balancesLoading || liquidityLoading || farmsLoading || poolsLoading))

  const relationshipDocument = useMemo(() => {
    if (!isConnected || !address || !chainId) {
      if (isConnecting || isReconnecting) {
        const obs: LiveWalletObservation = {
          ...disconnectedObservation(observedAt),
          connectionState: isReconnecting ? 'RECONNECTING' : 'CONNECTING',
        }
        return buildWalletRelationshipDocument({ document, evidencePack, observation: obs, generatedAt: observedAt })
      }
      return buildWalletRelationshipDocument({
        document,
        evidencePack,
        observation: disconnectedObservation(observedAt),
        generatedAt: observedAt,
      })
    }

    const walletAccountCaip10 = walletAccountFromAddressAndChain(address, chainId)
    const assetBalances: LiveAssetBalanceFact[] = []
    for (const token of projectTokens) {
      const amount = balances[token.address]
      const asset = document.assets.find(
        (a) => a.chainId === chainId && normalizeEvmAddress(a.contractAddress ?? '') === token.address.toLowerCase(),
      )
      if (!asset) continue
      assetBalances.push({
        assetId: asset.assetId,
        chainId,
        contractAddress: token.address.toLowerCase(),
        symbol: token.symbol ?? 'TOKEN',
        rawAmount: amount ? amount.quotient.toString() : '0',
        formattedAmount: amount ? amount.toSignificant(6) : '0',
        decimals: token.decimals,
        source: 'state.wallet.useTokenBalances',
        observedAt,
      })
    }

    const liquidityFacts: LiveLiquidityPositionFact[] = (liquidityPositions ?? []).map((pos) => ({
      positionId: pos.id,
      chainId: pos.chainId ?? chainId,
      pairAddress: (pos.pairAddress ?? pos.pair.liquidityToken.address).toLowerCase(),
      pairLabel: pos.pairLabel,
      tokenAddresses: [pos.pair.token0.address, pos.pair.token1.address],
      lpRawAmount: pos.lpBalance.quotient.toString(),
      lpFormattedAmount: pos.lpBalance.toSignificant(6),
      source: 'liquidityStudio.useLiquidityPositions',
      observedAt,
    }))

    const farmCards = (farmsRuntime.portfolioFarms ?? []) as FarmPreviewCard[]
    const farmFacts: LiveFarmPositionFact[] = farmCards
      .filter((farm) => bnPositive(farm.userStaked))
      .map((farm) => {
        const farmId = String(farm.pid ?? farm.id)
        const related = [
          farm.rawFarm?.token?.address,
          farm.rawFarm?.quoteToken?.address,
          farm.rawFarm?.lpAddress,
        ].filter(Boolean) as string[]
        const stakedRaw = bnRaw(farm.userStaked) ?? '0'
        const pendingRaw = bnPositive(farm.pendingReward) ? bnRaw(farm.pendingReward) : null
        return {
          positionId: `farm:${farmId}`,
          chainId,
          farmId,
          label: farm.pair ?? `Farm ${farmId}`,
          stakedRawAmount: stakedRaw,
          stakedFormattedAmount: farm.userStaked?.toFixed?.(6) ?? stakedRaw,
          pendingRewardRaw: pendingRaw,
          pendingRewardFormatted: pendingRaw ? farm.pendingReward?.toFixed?.(6) ?? pendingRaw : null,
          relatedTokenAddresses: related,
          source: 'farmsStudio.useFarmsStakingRuntime',
          observedAt,
        }
      })

    const poolCards = (poolsRuntime.portfolioPools ?? []) as PoolPreviewCard[]
    const poolFacts: LivePoolPositionFact[] = poolCards
      .filter((pool) => bnPositive(pool.userStaked))
      .map((pool) => {
        const poolId = String(pool.sousId ?? pool.id)
        const stakedRaw = bnRaw(pool.userStaked) ?? '0'
        const pendingRaw = bnPositive(pool.pendingReward) ? bnRaw(pool.pendingReward) : null
        return {
          positionId: `pool:${poolId}`,
          chainId,
          poolId,
          label: pool.name ?? `Pool ${poolId}`,
          stakedRawAmount: stakedRaw,
          stakedFormattedAmount: pool.userStaked?.toFixed?.(6) ?? stakedRaw,
          pendingRewardRaw: pendingRaw,
          pendingRewardFormatted: pendingRaw ? pool.pendingReward?.toFixed?.(6) ?? pendingRaw : null,
          relatedTokenAddresses: [
            pool.rawPool?.earningToken?.address,
            pool.rawPool?.stakingToken?.address,
            pool.contractAddress,
          ].filter(Boolean) as string[],
          source: 'poolsStudio.usePoolsStakingRuntime',
          observedAt,
        }
      })

    const observation: LiveWalletObservation = {
      walletAccountCaip10,
      connectionState: isReconnecting ? 'RECONNECTING' : 'CONNECTED',
      activeChainId: chainId,
      observedAt,
      assetBalances,
      assetBalanceAvailability: 'AVAILABLE',
      assetBalanceReason: null,
      liquidityPositions: liquidityFacts,
      liquidityAvailability: 'AVAILABLE',
      liquidityReason: null,
      farmPositions: farmFacts,
      farmAvailability: 'AVAILABLE',
      farmReason: null,
      poolPositions: poolFacts,
      poolAvailability: 'AVAILABLE',
      poolReason: null,
    }

    return buildWalletRelationshipDocument({
      document,
      evidencePack,
      observation,
      generatedAt: observedAt,
    })
  }, [
    address,
    balances,
    chainId,
    document,
    evidencePack,
    farmsRuntime.phase,
    farmsRuntime.portfolioFarms,
    isConnected,
    isConnecting,
    isReconnecting,
    liquidityPositions,
    observedAt,
    poolsRuntime.phase,
    poolsRuntime.portfolioPools,
    projectTokens,
  ])

  return { relationshipDocument, loading }
}
