import React, { useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'
import { useCurrency } from 'hooks/Tokens'
import {
  LiquidityRuntimeProvider,
  useLiquidityRuntime,
} from 'views/LiquidityStudio/liquidityRuntime/LiquidityRuntimeContext'
import { LiquidityAddModule } from 'views/LiquidityStudio/modules/LiquidityAddModule'
import { WBNB_BSC } from './publicFarmEligibility'
import type { PublicFarmSelectedPair } from './publicFarmFactoryDraft'

export type FarmLiquidityResolution = {
  pairAddress: string | null
  token0: string
  token1: string
}

type Props = {
  pair: PublicFarmSelectedPair | null
  onConfirmed: (resolution: FarmLiquidityResolution) => void
}

const Surface = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;

  [data-testid='liquidity-add-module'] {
    margin: 0;
    padding: 0;
  }

  [data-testid='liquidity-add-layout'] {
    width: 100%;
    min-width: 0;
  }
`

const Intro = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const Title = styled.strong`
  color: #f5f5f5;
  font-size: 15px;
  line-height: 20px;
`

const Copy = styled.span`
  color: rgba(255, 255, 255, 0.58);
  font-size: 13px;
  line-height: 18px;
`

function currencySeed(address: string | undefined): string | undefined {
  if (!address) return undefined
  return address.toLowerCase() === WBNB_BSC.toLowerCase() ? 'BNB' : address
}

const FarmInlineLiquidityRuntime: React.FC<Props> = ({ pair, onConfirmed }) => {
  const runtime = useLiquidityRuntime()
  const seedA = useCurrency(currencySeed(pair?.token0))
  const seedB = useCurrency(currencySeed(pair?.token1))
  const notifiedRef = useRef(false)

  useEffect(() => {
    if (seedA) runtime.setCurrencyA(seedA)
    if (seedB) runtime.setCurrencyB(seedB)
  }, [runtime.setCurrencyA, runtime.setCurrencyB, seedA, seedB])

  const resolution = useMemo<FarmLiquidityResolution | null>(() => {
    const token0 = runtime.currencyA?.wrapped?.address
    const token1 = runtime.currencyB?.wrapped?.address
    if (!token0 || !token1) return null
    return {
      pairAddress: runtime.machine.poolAddress ?? pair?.pairAddress ?? null,
      token0,
      token1,
    }
  }, [runtime.currencyA, runtime.currencyB, runtime.machine.poolAddress, pair?.pairAddress])

  useEffect(() => {
    if (runtime.addTxLifecycle !== 'confirmed' || !resolution || notifiedRef.current) return
    notifiedRef.current = true
    onConfirmed(resolution)
  }, [runtime.addTxLifecycle, resolution, onConfirmed])

  return (
    <Surface data-testid="create-farm-inline-liquidity" data-farm-liquidity-flow="inline">
      <Intro>
        <Title>{pair ? 'Increase this pair’s liquidity' : 'Create the pair'}</Title>
        <Copy>
          Choose the amounts, approve if required and confirm in your wallet. Your farm draft remains open throughout.
        </Copy>
      </Intro>
      <LiquidityAddModule embedded />
    </Surface>
  )
}

export const FarmInlineLiquidityStep: React.FC<Props> = (props) => (
  <LiquidityRuntimeProvider initialMode="Add Liquidity" positionsEnabled={false} terminalEnabled={false}>
    <FarmInlineLiquidityRuntime {...props} />
  </LiquidityRuntimeProvider>
)

export default FarmInlineLiquidityStep
