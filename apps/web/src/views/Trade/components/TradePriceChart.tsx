import React, { useMemo, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import dynamic from 'next/dynamic'
import { tradeColors, tradeLayout, TRADE_TIMEFRAMES, type TradeTimeframeId } from '../tradeTokens'
import { useFetchPairPrices } from 'state/swap/hooks'
import { PairDataTimeWindowEnum } from 'state/swap/types'
import { getTokenAddress } from 'views/Swap/components/Chart/utils'
import { getTimeWindowChange } from 'views/Swap/components/Chart/utils'
import type { TradePairStat } from '../useTradeTerminalData'

const SwapLineChart = dynamic(() => import('views/Swap/components/Chart/SwapLineChart'), { ssr: false })

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const gridShimmer = keyframes`
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.65; }
`

const loadingPulse = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
`

const Shell = styled.div`
  background: ${tradeColors.panel};
  border: 1px solid ${tradeColors.border};
  border-radius: 18px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  transition: transform 160ms ease, box-shadow 160ms ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }
`

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 18px 8px;
  box-sizing: border-box;
`

const PairBlock = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
`

const TokenIcon = styled.span`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #171717;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: ${tradeColors.goldBright};
  flex-shrink: 0;
`

const PairName = styled.div`
  font-size: 18px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.2;
  display: flex;
  align-items: center;
  gap: 4px;
`

const PriceMain = styled.div`
  margin-top: 8px;
  font-size: 34px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1;
  animation: ${fadeIn} 180ms ease;
`

const PriceUsd = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: ${tradeColors.muted};
`

const HeaderRight = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex-shrink: 0;
`

const Change = styled.div<{ $positive?: boolean }>`
  font-size: 15px;
  font-weight: 700;
  color: ${({ $positive }) => ($positive ? tradeColors.green : tradeColors.red)};
  white-space: nowrap;
  padding-top: 8px;
`

const IconBtn = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #121212;
  color: #b5b5b5;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: transform 120ms ease;

  &:active {
    transform: scale(0.99);
  }
`

const Timeframes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 30px;
  padding: 0 18px 8px;
`

const TfButton = styled.button<{ $active?: boolean }>`
  width: 38px;
  height: 30px;
  padding: 0;
  border-radius: 8px;
  border: 1px solid ${({ $active }) => ($active ? tradeColors.gold : 'rgba(255, 255, 255, 0.06)')};
  background: ${({ $active }) => ($active ? 'rgba(212, 175, 55, 0.08)' : 'transparent')};
  color: ${({ $active }) => ($active ? tradeColors.goldBright : '#8a8a8a')};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 150ms ease, background 150ms ease, color 150ms ease, transform 120ms ease;

  &:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(212, 175, 55, 0.35);
  }

  &:active {
    transform: scale(0.99);
  }
`

const ChartArea = styled.div`
  height: ${tradeLayout.chartAreaHeight};
  min-height: ${tradeLayout.chartAreaHeight};
  margin: 0 18px;
  box-sizing: border-box;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  background: #080808;
`

const EmptyChart = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  height: 100%;
  color: ${tradeColors.muted};
  font-size: 14px;
  position: relative;
  overflow: hidden;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 48px 48px;
  animation: ${gridShimmer} 8s ease-in-out infinite;

  &::before {
    content: '';
    position: absolute;
    left: 18px;
    right: 18px;
    top: 38%;
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
  }

  &::after {
    content: '';
    position: absolute;
    left: 18px;
    right: 18px;
    top: 62%;
    height: 1px;
    background: rgba(255, 255, 255, 0.06);
  }
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

const ChartLabel = styled.span`
  position: relative;
  z-index: 1;
`

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  min-height: 82px;
  padding: 12px 18px 18px;
  box-sizing: border-box;

  @media (max-width: 767px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const StatCard = styled.div`
  background: #101010;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 12px;
  box-sizing: border-box;
  min-height: 82px;
  height: 82px;
  transition: transform 160ms ease;

  &:hover {
    transform: translateY(-2px);
  }
`

const StatLabel = styled.div`
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${tradeColors.muted};
`

const StatValue = styled.div`
  margin-top: 6px;
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.1;
  animation: ${fadeIn} 180ms ease;
`

const StatDelta = styled.div<{ $positive?: boolean }>`
  margin-top: 4px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ $positive }) => ($positive ? tradeColors.green : tradeColors.red)};
`

const timeframeToEnum = (id: TradeTimeframeId): PairDataTimeWindowEnum => {
  if (id === '1d' || id === '4h') return PairDataTimeWindowEnum.DAY
  if (id === '1h' || id === '15m') return PairDataTimeWindowEnum.WEEK
  return PairDataTimeWindowEnum.DAY
}

export interface TradePriceChartProps {
  inputSymbol: string
  outputSymbol: string
  inputCurrencyId?: string
  outputCurrencyId?: string
  priceUsd?: number
  change24h?: number
  stats?: TradePairStat[]
}

export const TradePriceChart: React.FC<TradePriceChartProps> = ({
  inputSymbol,
  outputSymbol,
  inputCurrencyId,
  outputCurrencyId,
  priceUsd,
  change24h,
  stats = [],
}) => {
  const [timeframe, setTimeframe] = useState<TradeTimeframeId>('1h')
  const token0Address = getTokenAddress(inputCurrencyId)
  const token1Address = getTokenAddress(outputCurrencyId)

  const { pairPrices = [] } = useFetchPairPrices({
    token0Address,
    token1Address,
    timeWindow: timeframeToEnum(timeframe),
    currentSwapPrice: {},
  })

  const chartChange = useMemo(() => getTimeWindowChange(pairPrices), [pairPrices])
  const lastPrice = pairPrices[pairPrices.length - 1]?.value
  const displayPrice = priceUsd ?? lastPrice
  const displayChange = change24h ?? Number(chartChange.changePercentage)
  const hasChart = pairPrices.length > 1 && pairPrices.some((p) => p.value > 0)

  const priceText =
    displayPrice != null && Number.isFinite(displayPrice)
      ? displayPrice < 0.01
        ? displayPrice.toFixed(6)
        : displayPrice.toFixed(4)
      : null

  return (
    <Shell data-trade-price-chart>
      <Header>
        <PairBlock>
          <TokenIcon>{inputSymbol.slice(0, 1)}</TokenIcon>
          <div>
            <PairName>
              {inputSymbol} / {outputSymbol}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8a8a8a" strokeWidth="2" aria-hidden>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </PairName>
            <PriceMain>{priceText ?? '—'}</PriceMain>
            {priceText ? <PriceUsd>USD ${priceText}</PriceUsd> : null}
          </div>
        </PairBlock>
        <HeaderRight>
          {Number.isFinite(displayChange) ? (
            <Change $positive={displayChange >= 0}>
              {displayChange >= 0 ? '+' : ''}
              {displayChange.toFixed(2)}% (24H)
            </Change>
          ) : (
            <Change $positive>— (24H)</Change>
          )}
          <IconBtn type="button" aria-label="Favorite pair">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </IconBtn>
          <IconBtn type="button" aria-label="Open pair explorer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
            </svg>
          </IconBtn>
        </HeaderRight>
      </Header>
      <Timeframes role="tablist" aria-label="Chart timeframe">
        {TRADE_TIMEFRAMES.map((tf) => (
          <TfButton
            key={tf.id}
            type="button"
            role="tab"
            aria-selected={timeframe === tf.id}
            $active={timeframe === tf.id}
            onClick={() => setTimeframe(tf.id)}
          >
            {tf.label}
          </TfButton>
        ))}
      </Timeframes>
      <ChartArea data-trade-chart-area>
        {hasChart ? (
          <SwapLineChart
            data={pairPrices}
            isChangePositive={chartChange.changeValue >= 0}
            timeWindow={timeframeToEnum(timeframe)}
            isChartExpanded={false}
            style={{ height: '100%', width: '100%' }}
          />
        ) : (
          <EmptyChart>
            <LoadingBar aria-hidden />
            <ChartLabel>Indexing chart data...</ChartLabel>
          </EmptyChart>
        )}
      </ChartArea>
      <StatsRow data-trade-pair-stats>
        {stats.map((stat) => (
          <StatCard key={stat.id}>
            <StatLabel>{stat.label}</StatLabel>
            <StatValue>{stat.value ?? 'Indexing...'}</StatValue>
            {stat.change && <StatDelta $positive={stat.changePositive}>{stat.change}</StatDelta>}
          </StatCard>
        ))}
      </StatsRow>
    </Shell>
  )
}

export default TradePriceChart
