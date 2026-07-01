import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import dynamic from 'next/dynamic'
import { useDebounce } from '@pancakeswap/hooks'
import TradingView, { useTradingViewEvent } from 'components/TradingView'
import { tradeColors, tradeLayout } from '../tradeTokens'

const TV_ID = 'TV_TRADE_TERMINAL_CHART'
const SYMBOL_PREFIX = 'PANCAKESWAP:'

const gridShimmer = keyframes`
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.65; }
`

const candlePulse = keyframes`
  0%, 100% { opacity: 0.35; transform: scaleY(0.85); }
  50% { opacity: 0.9; transform: scaleY(1); }
`

const loadingPulse = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
`

const Area = styled.div`
  height: ${tradeLayout.chartAreaHeight};
  min-height: ${tradeLayout.chartAreaHeight};
  margin: 0 18px;
  box-sizing: border-box;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  background: #080808;
`

const TvWrap = styled.div<{ $show: boolean }>`
  position: absolute;
  inset: 0;
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  transition: opacity 200ms ease;
`

const Skeleton = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 48px 48px;
  animation: ${gridShimmer} 8s ease-in-out infinite;
`

const CandleRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 6px;
  height: 72px;
  padding: 0 24px;
`

const Candle = styled.span<{ $h: number; $delay: number; $up?: boolean }>`
  width: 8px;
  height: ${({ $h }) => $h}px;
  border-radius: 2px;
  background: ${({ $up }) => ($up ? tradeColors.green : tradeColors.red)};
  opacity: 0.55;
  transform-origin: bottom center;
  animation: ${candlePulse} 2.4s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}ms;
`

const LoadingBar = styled.div`
  width: 120px;
  height: 2px;
  border-radius: 1px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 40%;
    height: 100%;
    background: linear-gradient(90deg, transparent, ${tradeColors.goldBright}, transparent);
    animation: ${loadingPulse} 2.4s ease-in-out infinite;
  }
`

const SkeletonLabel = styled.span`
  font-size: 14px;
  color: ${tradeColors.muted};
`

const CANDLES = [
  { h: 28, up: true, delay: 0 },
  { h: 44, up: false, delay: 120 },
  { h: 36, up: true, delay: 240 },
  { h: 52, up: true, delay: 360 },
  { h: 30, up: false, delay: 480 },
  { h: 40, up: true, delay: 600 },
  { h: 34, up: false, delay: 720 },
  { h: 48, up: true, delay: 840 },
]

const bnbToWBNB = (sym: string) => (sym === 'BNB' ? 'WBNB' : sym)

export interface TradeChartPanelProps {
  inputSymbol: string
  outputSymbol: string
}

export const TradeChartPanel: React.FC<TradeChartPanelProps> = ({ inputSymbol, outputSymbol }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasNoData, setHasNoData] = useState(false)

  const symbol = useMemo(() => {
    if (!inputSymbol || !outputSymbol) return null
    return `${bnbToWBNB(inputSymbol)}${bnbToWBNB(outputSymbol)}`
  }, [inputSymbol, outputSymbol])

  const onNoDataEvent = useCallback(() => setHasNoData(true), [])
  const onLoadedEvent = useCallback(() => setIsLoading(false), [])

  useTradingViewEvent({
    id: TV_ID,
    onNoDataEvent,
    onLoadedEvent,
  })

  const debouncedLoading = useDebounce(isLoading, 800)
  const showTv = Boolean(symbol) && !hasNoData
  const showSkeleton = !showTv || isLoading || debouncedLoading

  useEffect(() => {
    setIsLoading(true)
    setHasNoData(false)
  }, [symbol])

  return (
    <Area data-trade-chart-area>
      {showTv && (
        <TvWrap $show={!showSkeleton}>
          <TradingView id={TV_ID} symbol={`${SYMBOL_PREFIX}${symbol}`} />
        </TvWrap>
      )}
      {showSkeleton && (
        <Skeleton aria-hidden={!showSkeleton}>
          <CandleRow>
            {CANDLES.map((c, i) => (
              <Candle key={i} $h={c.h} $up={c.up} $delay={c.delay} />
            ))}
          </CandleRow>
          <LoadingBar />
          <SkeletonLabel>Indexing chart data...</SkeletonLabel>
        </Skeleton>
      )}
    </Area>
  )
}

export default TradeChartPanel
