import React from 'react'
import styled from 'styled-components'
import TradePriceChart from './components/TradePriceChart'
import TradeRecentSwaps from './components/TradeRecentSwaps'
import TradePairStats from './components/TradePairStats'
import TradeWatchlist from './components/TradeWatchlist'
import useTradeTerminalData from './useTradeTerminalData'

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
`

const LowerGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 16px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`

export interface TradeMarketPanelProps {
  inputSymbol: string
  outputSymbol: string
  inputCurrencyId?: string
  outputCurrencyId?: string
}

export const TradeMarketPanel: React.FC<TradeMarketPanelProps> = ({
  inputSymbol,
  outputSymbol,
  inputCurrencyId,
  outputCurrencyId,
}) => {
  const { recentSwaps, pairStats, pairPrice } = useTradeTerminalData(
    inputSymbol,
    outputSymbol,
    outputCurrencyId,
  )

  return (
    <Shell data-trade-market-panel>
      <TradePriceChart
        inputSymbol={inputSymbol}
        outputSymbol={outputSymbol}
        inputCurrencyId={inputCurrencyId}
        outputCurrencyId={outputCurrencyId}
        priceUsd={pairPrice?.value}
        change24h={pairPrice?.change24h}
      />
      <TradePairStats stats={pairStats} />
      <LowerGrid>
        <TradeRecentSwaps rows={recentSwaps} />
        <TradeWatchlist currentPair={`${inputSymbol} / ${outputSymbol}`} />
      </LowerGrid>
    </Shell>
  )
}

export default TradeMarketPanel
