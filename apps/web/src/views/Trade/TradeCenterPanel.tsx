import React, { useMemo } from 'react'
import styled from 'styled-components'
import TradePriceChart from './components/TradePriceChart'
import TradePairStats from './components/TradePairStats'
import useTradeTerminalData from './useTradeTerminalData'
import { tradeLayout } from './tradeTokens'
import type { TradePairStat } from './useTradeTerminalData'

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${tradeLayout.sectionGap};
  min-width: 0;
  width: 100%;
  height: 100%;
`

const TRADE_STAT_ORDER = ['price', 'liquidity', 'volume', 'transactions', 'fdv', 'holders'] as const

const STAT_LABELS: Record<string, string> = {
  price: 'Price',
  liquidity: 'Liquidity',
  volume: 'Volume',
  transactions: 'Trades',
  fdv: 'FDV',
  holders: 'Holders',
}

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
  const { pairStats, pairPrice, missingReason, missingReasonDetail, chartUnavailableDetail, isIndexingMetrics, reconciliationStatus } =
    useTradeTerminalData(inputSymbol, outputSymbol, outputCurrencyId)

  const orderedStats = useMemo((): TradePairStat[] => {
    if (reconciliationStatus === 'inconsistent' || reconciliationStatus === 'unavailable') return []
    const priceChange =
      pairPrice?.change24h != null && Number.isFinite(pairPrice.change24h)
        ? {
            text: `${pairPrice.change24h >= 0 ? '+' : ''}${pairPrice.change24h.toFixed(2)}%`,
            positive: pairPrice.change24h >= 0,
          }
        : undefined

    const priceStat: TradePairStat = {
      id: 'price',
      label: STAT_LABELS.price,
      value: pairPrice?.formatted,
      change: priceChange?.text,
      changePositive: priceChange?.positive,
      reasonCode: isIndexingMetrics
        ? 'SUBGRAPH_LOADING'
        : pairPrice?.formatted
          ? undefined
          : 'NO_EVENTS_INDEXED',
    }

    const byId = Object.fromEntries(pairStats.map((stat) => [stat.id, stat]))
    const merged = TRADE_STAT_ORDER.map((id) => {
      if (id === 'price') return priceStat
      const stat = byId[id]
      if (!stat) return null
      return { ...stat, label: STAT_LABELS[id] ?? stat.label }
    }).filter((stat): stat is TradePairStat => stat != null)

    return merged
  }, [pairStats, pairPrice, isIndexingMetrics, reconciliationStatus])

  return (
    <Shell data-trade-center-panel>
      <TradePriceChart
        inputSymbol={outputSymbol}
        outputSymbol={inputSymbol}
        inputCurrencyId={outputCurrencyId}
        outputCurrencyId={inputCurrencyId}
        priceUsd={pairPrice?.value}
        change24h={pairPrice?.change24h}
        chartEmptyReason={
          reconciliationStatus === 'inconsistent'
            ? 'data_inconsistent'
            : missingReason ?? (chartUnavailableDetail ? 'chart_unavailable' : null)
        }
        chartEmptyDetail={
          reconciliationStatus === 'inconsistent'
            ? chartUnavailableDetail ?? 'Trade metrics could not be reconciled with indexed swap events.'
            : chartUnavailableDetail ?? missingReasonDetail
        }
        isIndexingMetrics={isIndexingMetrics}
      />
      <TradePairStats stats={orderedStats} />
    </Shell>
  )
}

export default TradeCenterPanel
