import React, { useMemo } from 'react'
import styled from 'styled-components'
import { tradeColors, tradeLayout } from '../tradeTokens'
import TradeTechnicalDetails from './TradeTechnicalDetails'

const Area = styled.div`
  height: ${tradeLayout.chartAreaHeight};
  min-height: ${tradeLayout.chartAreaHeight};
  margin: 0;
  box-sizing: border-box;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  background: #080808;
  border: 1px solid rgba(255, 255, 255, 0.06);
`

const IndexedChart = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 18px 18px 14px;
  box-sizing: border-box;
  background: #080808;
`

const IndexedSvg = styled.svg`
  width: 100%;
  height: calc(100% - 24px);
`

const IndexedLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${tradeColors.muted};
  text-align: center;
`

const CompactState = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 16px;
  text-align: center;
`

const CompactTitle = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${tradeColors.text};
`

const CompactDesc = styled.span`
  font-size: 12px;
  color: ${tradeColors.muted};
  line-height: 1.4;
  max-width: 280px;
`

const PriceMarker = styled.div`
  margin-top: 4px;
  font-size: 18px;
  font-weight: 800;
  color: ${tradeColors.goldBright};
  font-variant-numeric: tabular-nums;
`

const LoadingState = styled(CompactState)`
  color: ${tradeColors.muted};
  font-size: 13px;
`

function buildIndexedPath(points: Array<{ value: number }>, width: number, height: number): string {
  if (points.length < 2) return ''
  const values = points.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const toY = (value: number) => height - ((value - min) / range) * (height - 8) - 4
  return points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * width
      const y = toY(p.value)
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
}

export interface TradeChartPanelProps {
  pairPrices?: Array<{ time: string; value: number }>
  emptyReason?: string | null
  emptyDetail?: string
  currentPriceUsd?: number
  isLoading?: boolean
}

export const TradeChartPanel: React.FC<TradeChartPanelProps> = ({
  pairPrices = [],
  emptyReason,
  emptyDetail,
  currentPriceUsd,
  isLoading = false,
}) => {
  const hasChartHistory = pairPrices.length >= 2
  const indexedPath = useMemo(() => buildIndexedPath(pairPrices, 360, 160), [pairPrices])

  const priceMarker =
    currentPriceUsd != null && Number.isFinite(currentPriceUsd) && currentPriceUsd > 0
      ? currentPriceUsd < 0.01
        ? `$${currentPriceUsd.toFixed(6)}`
        : `$${currentPriceUsd.toFixed(4)}`
      : undefined

  if (isLoading) {
    return (
      <Area data-trade-chart-area>
        <LoadingState>Loading indexed candles…</LoadingState>
      </Area>
    )
  }

  if (hasChartHistory) {
    return (
      <Area data-trade-chart-area>
        <IndexedChart data-trade-chart-indexed>
          <IndexedSvg viewBox="0 0 360 160" preserveAspectRatio="none">
            <path
              d={indexedPath}
              fill="none"
              stroke={tradeColors.green}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={`${indexedPath} L 360 160 L 0 160 Z`}
              fill="url(#tradeIndexedFill)"
              opacity="0.12"
            />
            <defs>
              <linearGradient id="tradeIndexedFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={tradeColors.green} />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </IndexedSvg>
          <IndexedLabel>Indexed candles · Melega durable indexer</IndexedLabel>
        </IndexedChart>
      </Area>
    )
  }

  return (
    <Area data-trade-chart-area>
      <CompactState data-trade-chart-insufficient>
        <CompactTitle>
          {emptyReason === 'insufficient_history' || pairPrices.length < 2
            ? 'Insufficient indexed history'
            : 'No indexed candles yet'}
        </CompactTitle>
        <CompactDesc>
          Chart renders only canonical indexer candles. Trend lines appear after two or more indexed
          points in the selected window.
        </CompactDesc>
        {priceMarker ? <PriceMarker>{priceMarker}</PriceMarker> : null}
        <TradeTechnicalDetails detail={emptyDetail} />
      </CompactState>
    </Area>
  )
}

export default TradeChartPanel
