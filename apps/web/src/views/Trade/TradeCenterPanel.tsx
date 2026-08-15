import React, { useMemo } from 'react'
import styled from 'styled-components'
import { TradePriceChart } from './components/TradePriceChart'
import { TradePairStats } from './components/TradePairStats'
import { useTradeTerminalData } from './useTradeTerminalData'
import { tradeLayout } from './tradeTokens'
import type { TradePairStat } from './useTradeTerminalData'

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${tradeLayout.verticalRhythm};
  min-width: 0;
  width: 100%;
  height: 100%;
`

const TRADE_STAT_ORDER = ['liquidity', 'volume', 'transactions', 'fdv', 'holders'] as const

const STAT_LABELS: Record<string, string> = {
  liquidity: 'Liquidity',
  volume: 'Volume',
  transactions: 'Trades',
  fdv: 'FDV',
  holders: 'Holders',
}

export interface TradeCenterPanelProps {
  data: ReturnType<typeof useTradeTerminalData>
  inputSymbol: string
  outputSymbol: string
  inputCurrencyId?: string
  outputCurrencyId?: string
}

export const TradeCenterPanel: React.FC<TradeCenterPanelProps> = ({
  data,
  inputSymbol,
  outputSymbol,
  inputCurrencyId,
  outputCurrencyId,
}) => {
  const { pairStats, pairPrice, missingReason, missingReasonDetail, chartUnavailableDetail, isIndexingMetrics } = data

  const orderedStats = useMemo((): TradePairStat[] => {
    const byId = Object.fromEntries(pairStats.map((stat) => [stat.id, stat]))
    const merged = TRADE_STAT_ORDER.map((id) => {
      const stat = byId[id]
      if (!stat) {
        return {
          id,
          label: STAT_LABELS[id] ?? id,
          value: undefined,
          reasonCode: isIndexingMetrics ? 'SUBGRAPH_LOADING' : 'NO_EVENTS_INDEXED',
        } satisfies TradePairStat
      }
      return { ...stat, label: STAT_LABELS[id] ?? stat.label }
    })

    return merged
  }, [pairStats, isIndexingMetrics])

  return (
    <Shell data-trade-center-panel>
      <TradePriceChart
        inputSymbol={outputSymbol}
        outputSymbol={inputSymbol}
        inputCurrencyId={outputCurrencyId}
        outputCurrencyId={inputCurrencyId}
        priceUsd={pairPrice?.value}
        change24h={pairPrice?.change24h}
        chartEmptyReason={missingReason ?? (chartUnavailableDetail ? 'chart_unavailable' : null)}
        chartEmptyDetail={chartUnavailableDetail ?? missingReasonDetail}
        isIndexingMetrics={isIndexingMetrics}
        pairAddress={data.primaryPairAddress}
      />
      <TradePairStats stats={orderedStats} />
    </Shell>
  )
}

export default TradeCenterPanel
