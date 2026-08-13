import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { useCurrency } from 'hooks/Tokens'
import {
  LiquidityRuntimeProvider,
  useLiquidityRuntime,
} from 'views/LiquidityStudio/liquidityRuntime/LiquidityRuntimeContext'
import { LiquidityAddModule } from 'views/LiquidityStudio/modules/LiquidityAddModule'

type Props = {
  tokenAddress: string
  chainId: number
  onConfirmed: () => void
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
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 13px;
  border: 1px solid rgba(42, 190, 125, 0.24);
  border-radius: 12px;
  background: rgba(42, 190, 125, 0.07);
`

const IntroCopy = styled.div`
  min-width: 0;

  strong {
    display: block;
    color: #f3f3f3;
    font-size: 13px;
  }

  span {
    display: block;
    margin-top: 3px;
    color: rgba(255, 255, 255, 0.58);
    font-size: 11px;
    line-height: 16px;
  }
`

const Done = styled.span`
  flex: 0 0 auto;
  color: #62d9a0;
  font-size: 11px;
  font-weight: 800;
`

function nativeSymbol(chainId: number) {
  if (chainId === 56) return 'BNB'
  if (chainId === 137) return 'MATIC'
  if (chainId === 43114) return 'AVAX'
  return 'ETH'
}

const ListInlineLiquidityRuntime: React.FC<Props> = ({ tokenAddress, chainId, onConfirmed }) => {
  const runtime = useLiquidityRuntime()
  const projectToken = useCurrency(tokenAddress || undefined)
  const nativeToken = useCurrency(nativeSymbol(chainId))
  const notifiedRef = useRef(false)

  useEffect(() => {
    notifiedRef.current = false
  }, [tokenAddress, chainId])

  useEffect(() => {
    if (projectToken) runtime.setCurrencyA(projectToken)
    if (nativeToken) runtime.setCurrencyB(nativeToken)
  }, [projectToken, nativeToken, runtime.setCurrencyA, runtime.setCurrencyB])

  useEffect(() => {
    if (runtime.addTxLifecycle !== 'confirmed' || notifiedRef.current) return
    notifiedRef.current = true
    onConfirmed()
  }, [runtime.addTxLifecycle, onConfirmed])

  const confirmed = runtime.addTxLifecycle === 'confirmed'

  return (
    <Surface data-testid="list-inline-liquidity" data-list-liquidity-flow="inline">
      <Intro>
        <IntroCopy>
          <strong>{confirmed ? 'Liquidity confirmed' : 'Add liquidity'}</strong>
          <span>Select the paired asset and confirm the required wallet transactions without leaving this flow.</span>
        </IntroCopy>
        {confirmed ? <Done>DONE</Done> : null}
      </Intro>
      <LiquidityAddModule embedded />
    </Surface>
  )
}

export const ListInlineLiquidityStep: React.FC<Props> = (props) => (
  <LiquidityRuntimeProvider initialMode="Add Liquidity" positionsEnabled={false} terminalEnabled={false}>
    <ListInlineLiquidityRuntime {...props} />
  </LiquidityRuntimeProvider>
)

export default ListInlineLiquidityStep
