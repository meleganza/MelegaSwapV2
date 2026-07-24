/**
 * PASSPORT_MODULE_005 — factual Liquidity Positions source for Passport.
 * Reuses certified Liquidity hooks; never invents production positions.
 */
import { useEffect, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { useLiquidityPositions } from 'views/LiquidityStudio/liquidityRuntime/useLiquidityPositions'
import { useProgramReadModel } from 'views/LiquidityStudio/liquidityBuilding/useProgramReadModel'
import {
  buildPassportLiquidityPositionsViewModel,
  type LbProgramInput,
  type ManualLpInput,
  type PassportLiquidityPositionsInput,
} from './buildPassportLiquidityPositionsViewModel'
import type {
  PassportLiquidityPosition,
  PassportLiquidityPositionsViewModel,
} from './passportLiquidityTypes'

export type UsePassportLiquidityPositionsOptions = {
  fixturePositions?: readonly PassportLiquidityPosition[] | null
  forceDisconnected?: boolean
}

function chainLabel(chainId?: number): string {
  if (chainId === 56) return 'BNB Chain'
  if (chainId === 97) return 'BSC Testnet'
  if (chainId == null) return 'BNB Chain'
  return `Chain ${chainId}`
}

function readLocalhostFixture(): PassportLiquidityPositionsInput['fixturePositions'] {
  if (typeof window === 'undefined') return null
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return null
  }
  return window.__PASSPORT_MODULE_005_FIXTURE__?.positions ?? null
}

export function usePassportLiquidityPositions(
  options: UsePassportLiquidityPositionsOptions = {},
): PassportLiquidityPositionsViewModel {
  const { address, isConnecting, isReconnecting } = useAccount()
  const { positions: lpRows, isLoading: positionsLoading } = useLiquidityPositions()
  const programRead = useProgramReadModel({
    owner: address ?? null,
    projectTokenAddress: null,
  })

  const [hostFixture, setHostFixture] = useState<readonly PassportLiquidityPosition[] | null>(null)

  useEffect(() => {
    setHostFixture(readLocalhostFixture())
    const onMsg = () => setHostFixture(readLocalhostFixture())
    window.addEventListener('passport-module-005-fixture', onMsg)
    return () => window.removeEventListener('passport-module-005-fixture', onMsg)
  }, [])

  const manualPositions = useMemo((): ManualLpInput[] => {
    return (lpRows ?? []).map((row) => ({
      id: row.id,
      pairLabel: row.pairLabel,
      token0Symbol: row.pair?.token0?.symbol || '—',
      token1Symbol: row.pair?.token1?.symbol || '—',
      token0LogoUrl: null,
      token1LogoUrl: null,
      pairAddress: row.pairAddress ?? row.id,
      chainLabel: chainLabel(row.chainId),
      estimatedValueUsd: null,
      poolShare: null,
      feesEarnedUsd: null,
      freshness: 'unavailable' as const,
    }))
  }, [lpRows])

  const lbPrograms = useMemo((): LbProgramInput[] => {
    if (programRead.source !== 'ON_CHAIN' || !programRead.snapshot.status) return []
    const snap = programRead.snapshot
    const status = snap.status
    if (!status || status === 'NOT_ACTIVE' || status === 'STOPPED') return []
    const pairLabel = snap.pair || '— / —'
    return [
      {
        id: snap.programAddress || 'lb-program',
        pairLabel,
        pairAddress: snap.pair,
        programAddress: snap.programAddress,
        status,
        liquidityBuiltLabel: snap.metrics?.liquidityBuiltLabel ?? null,
        chainLabel: 'BNB Chain',
        freshness: 'indexed',
      },
    ]
  }, [programRead])

  return useMemo(() => {
    const fixturePositions = options.fixturePositions ?? hostFixture
    const fixtureMeta =
      typeof window !== 'undefined' ? window.__PASSPORT_MODULE_005_FIXTURE__ : undefined
    const forceDisconnected =
      options.forceDisconnected ??
      (fixtureMeta && typeof fixtureMeta.walletConnected === 'boolean'
        ? !fixtureMeta.walletConnected
        : undefined)

    return buildPassportLiquidityPositionsViewModel({
      address: address ?? null,
      loading: Boolean(isConnecting || isReconnecting || positionsLoading),
      manualPositions,
      lbPrograms,
      fixturePositions,
      forceDisconnected,
    })
  }, [
    address,
    isConnecting,
    isReconnecting,
    positionsLoading,
    manualPositions,
    lbPrograms,
    options.fixturePositions,
    options.forceDisconnected,
    hostFixture,
  ])
}
