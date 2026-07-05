import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { useDebounce } from '@pancakeswap/hooks'
import TradingView, { useTradingViewEvent } from 'components/TradingView'
import { tradeColors, tradeLayout } from '../tradeTokens'

const TV_ID = 'TV_TRADE_TERMINAL_CHART'
const SYMBOL_PREFIX = 'PANCAKESWAP:'

const gridShimmer = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
`

const candlePulse = keyframes`
  0%, 100% { opacity: 0.22; transform: scaleY(0.88); }
  50% { opacity: 0.42; transform: scaleY(1); }
`

const volumePulse = keyframes`
  0%, 100% { opacity: 0.14; }
  50% { opacity: 0.24; }
`

const loadingPulse = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
`

const crosshairPulse = keyframes`
  0%, 100% { opacity: 0.06; }
  50% { opacity: 0.14; }
`

const Area = styled.div<{ $compact?: boolean }>`
  height: ${({ $compact }) =>
    $compact ? tradeLayout.chartAreaHeightCompact : tradeLayout.chartAreaHeight};
  min-height: ${({ $compact }) =>
    $compact ? tradeLayout.chartAreaHeightCompact : tradeLayout.chartAreaHeight};
  margin: 0;
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
  overflow: hidden;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 48px 48px;
  animation: ${gridShimmer} 8s ease-in-out infinite;
`

const CrosshairH = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 42%;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  animation: ${crosshairPulse} 8s ease-in-out infinite;
`

const CrosshairV = styled.div`
  position: absolute;
  top: 0;
  bottom: 28%;
  left: 58%;
  width: 1px;
  background: rgba(255, 255, 255, 0.1);
  animation: ${crosshairPulse} 8s ease-in-out infinite;
`

const ChartBody = styled.div`
  position: absolute;
  left: 18px;
  right: 18px;
  top: 18px;
  bottom: 52px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 8px;
`

const CandleStick = styled.div<{ $h: number; $wick: number; $up?: boolean; $delay: number }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  width: 10px;
  animation: ${candlePulse} 2.8s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}ms;
`

const Wick = styled.span<{ $h: number; $up?: boolean }>`
  width: 1px;
  height: ${({ $h }) => $h}px;
  background: ${({ $up }) => ($up ? tradeColors.green : tradeColors.red)};
  opacity: 0.28;
`

const Body = styled.span<{ $h: number; $up?: boolean }>`
  width: 8px;
  height: ${({ $h }) => $h}px;
  border-radius: 1px;
  background: ${({ $up }) => ($up ? tradeColors.green : tradeColors.red)};
  opacity: 0.28;
`

const VolumeRow = styled.div`
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 36px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 8px;
  height: 28px;
`

const VolumeBar = styled.span<{ $h: number; $delay: number }>`
  width: 10px;
  height: ${({ $h }) => $h}px;
  border-radius: 1px;
  background: rgba(255, 255, 255, 0.2);
  animation: ${volumePulse} 2.8s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}ms;
`

const Footer = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`

const LoadingBar = styled.div`
  width: 140px;
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
  opacity: 0.18;
`

const UnavailableState = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  text-align: center;
  background: #080808;
`

const UnavailableTitle = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${tradeColors.muted};
`

const UnavailableDesc = styled.span`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  line-height: 1.45;
  max-width: 280px;
`

const CANDLES = [
  { h: 22, wick: 8, up: true, delay: 0, vol: 14 },
  { h: 34, wick: 10, up: false, delay: 140, vol: 22 },
  { h: 28, wick: 9, up: true, delay: 280, vol: 18 },
  { h: 40, wick: 12, up: true, delay: 420, vol: 24 },
  { h: 20, wick: 7, up: false, delay: 560, vol: 12 },
  { h: 32, wick: 10, up: true, delay: 700, vol: 20 },
  { h: 26, wick: 8, up: false, delay: 840, vol: 16 },
  { h: 36, wick: 11, up: true, delay: 980, vol: 22 },
]

const bnbToWBNB = (sym: string) => (sym === 'BNB' ? 'WBNB' : sym)

export interface TradeChartPanelProps {
  inputSymbol: string
  outputSymbol: string
  pairPrices?: Array<{ time: string; value: number }>
}

const SubgraphChart = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 18px 18px 14px;
  box-sizing: border-box;
  background: #080808;
`

const SubgraphSvg = styled.svg`
  width: 100%;
  height: calc(100% - 24px);
`

const SubgraphLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${tradeColors.muted};
  text-align: center;
`

function buildSubgraphPath(points: Array<{ value: number }>, width: number, height: number): string {
  if (points.length < 2) return ''
  const values = points.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  return points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * width
      const y = height - ((p.value - min) / range) * (height - 8) - 4
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
}

export const TradeChartPanel: React.FC<TradeChartPanelProps> = ({
  inputSymbol,
  outputSymbol,
  pairPrices = [],
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasNoData, setHasNoData] = useState(false)

  const hasSubgraphPrices = pairPrices.length >= 2

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
  const showTv = Boolean(symbol) && !hasNoData && !hasSubgraphPrices
  const showUnavailable = (hasNoData || !symbol) && !hasSubgraphPrices
  const showSkeleton = showTv && (isLoading || debouncedLoading)
  const subgraphPath = useMemo(() => buildSubgraphPath(pairPrices, 360, 160), [pairPrices])

  useEffect(() => {
    setIsLoading(true)
    setHasNoData(false)
  }, [symbol])

  return (
    <Area data-trade-chart-area $compact={showUnavailable && !hasSubgraphPrices}>
      {hasSubgraphPrices && (
        <SubgraphChart data-trade-chart-subgraph>
          <SubgraphSvg viewBox="0 0 360 160" preserveAspectRatio="none">
            <path
              d={subgraphPath}
              fill="none"
              stroke={tradeColors.green}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={`${subgraphPath} L 360 160 L 0 160 Z`}
              fill="url(#tradeSubgraphFill)"
              opacity="0.12"
            />
            <defs>
              <linearGradient id="tradeSubgraphFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={tradeColors.green} />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </SubgraphSvg>
          <SubgraphLabel>Indexed pair price · Melega subgraph</SubgraphLabel>
        </SubgraphChart>
      )}
      {showTv && (
        <TvWrap $show={!showSkeleton}>
          <TradingView id={TV_ID} symbol={`${SYMBOL_PREFIX}${symbol}`} />
        </TvWrap>
      )}
      {showUnavailable && (
        <UnavailableState data-trade-chart-unavailable>
          <UnavailableTitle>—</UnavailableTitle>
          <UnavailableDesc>Pair price history is not indexed for this market yet.</UnavailableDesc>
        </UnavailableState>
      )}
      {showSkeleton && (
        <Skeleton aria-hidden={!showSkeleton}>
          <CrosshairH />
          <CrosshairV />
          <ChartBody>
            {CANDLES.map((c, i) => (
              <CandleStick key={i} $h={c.h} $wick={c.wick} $up={c.up} $delay={c.delay}>
                <Wick $h={c.wick} $up={c.up} />
                <Body $h={c.h} $up={c.up} />
              </CandleStick>
            ))}
          </ChartBody>
          <VolumeRow>
            {CANDLES.map((c, i) => (
              <VolumeBar key={i} $h={c.vol} $delay={c.delay} />
            ))}
          </VolumeRow>
          <Footer>
            <LoadingBar />
            <SkeletonLabel>Loading chart…</SkeletonLabel>
          </Footer>
        </Skeleton>
      )}
    </Area>
  )
}

export default TradeChartPanel
