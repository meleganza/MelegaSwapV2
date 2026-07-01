import React from 'react'
import styled from 'styled-components'
import TradePriceChart from './components/TradePriceChart'
import TradePairStats from './components/TradePairStats'
import useTradeTerminalData from './useTradeTerminalData'

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
  width: 100%;
  height: 100%;
`

export interface TradeCenterPanelProps {
  inputSymbol: string
  outputSymbol: string
  inputCurrencyId?: string
  outputCurrencyId?: string
}

export const TradeCenterPanel: React.FC<TradeCenterPanelProps> = ({
  inputSymbol,
  outputSymbol,
  inputCurrencyId,
  outputCurrencyId,
}) => {
  const { pairStats, pairPrice } = useTradeTerminalData(inputSymbol, outputSymbol, outputCurrencyId)

  const centerStats = pairStats.filter((s) =>
    ['volume', 'liquidity', 'transactions', 'holders'].includes(s.id),
  )

  return (
    <Shell data-trade-center-panel>
      <TradePriceChart
        inputSymbol={outputSymbol}
        outputSymbol={inputSymbol}
        inputCurrencyId={outputCurrencyId}
        outputCurrencyId={inputCurrencyId}
        priceUsd={pairPrice?.value}
        change24h={pairPrice?.change24h}
        stats={centerStats}
      />
    </Shell>
  )
}

export default TradeCenterPanel
