/**
 * Passport consumes the same WalletPortfolio → NormalizedUserPortfolio model
 * as Liquidity Studio (via shared LP discovery + createWalletPortfolio).
 */

import { useMemo } from 'react'
import { useAccount, useNetwork } from 'wagmi'
import { useActiveChainId } from 'hooks/useActiveChainId'
import {
  buildLiquidityWalletPortfolio,
  selectNormalizedLiquidityPortfolio,
} from 'views/LiquidityStudio/liquidityRuntime/buildLiquidityWalletPortfolio'
import { useLiquidityPositions } from 'views/LiquidityStudio/liquidityRuntime/useLiquidityPositions'
import type { NormalizedUserPortfolio } from 'lib/melega-user-portfolio'

export function usePassportNormalizedPortfolio(): {
  normalized: NormalizedUserPortfolio
  isLoading: boolean
  account?: string
  factoryPairCount: number | null
} {
  const { address: account } = useAccount()
  const { chain } = useNetwork()
  const { chainId } = useActiveChainId()
  const { positions, isLoading, factoryPairCount } = useLiquidityPositions()

  const walletPortfolio = useMemo(
    () =>
      buildLiquidityWalletPortfolio({
        wallet: account ?? null,
        chainId: chainId ?? null,
        chainName: chain?.name ?? 'BNB Chain',
        generatedAt: new Date().toISOString(),
        liquidityRows: positions,
        positionsLoading: isLoading,
      }),
    [account, chain?.name, chainId, positions, isLoading],
  )

  const normalized = useMemo(
    () => selectNormalizedLiquidityPortfolio(walletPortfolio),
    [walletPortfolio],
  )

  return {
    normalized,
    isLoading,
    account,
    factoryPairCount: factoryPairCount ?? null,
  }
}
