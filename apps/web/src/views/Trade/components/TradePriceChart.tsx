import React, { useMemo, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import dynamic from 'next/dynamic'
import { colors } from 'design-system/melega'
import { useFetchPairPrices } from 'state/swap/hooks'
import { PairDataTimeWindowEnum } from 'state/swap/types'
import { getTokenAddress } from 'views/Swap/components/Chart/utils'
import { getTimeWindowChange } from 'views/Swap/components/Chart/utils'
import { TRADE_TIMEFRAMES, type TradeTimeframeId } from '../tradeTokens'

const SwapLineChart = dynamic(() => import('views/Swap/components/Chart/SwapLineChart'), { ssr: false })

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const Shell = styled.div`
  background: #0b0b0b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px 12px;
  flex-wrap: wrap;
`

const PairTitle = styled.div`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8a8a8a;
`

const PairName = styled.div`
  margin-top: 4px;
  font-size: 18px;
  font-weight: 700;
  color: ${colors.textPrimary};
`

const PriceBlock = styled.div`
  text-align: right;
`

const Price = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.05;
  animation: ${fadeIn} 180ms ease;
`

const Change = styled.div<{ $positive?: boolean }>`
  margin-top: 4px;
  font-size: 13px;
  font-weight: 600;
  color: ${({ $positive }) => ($positive ? colors.green : '#ef4444')};
`

const Timeframes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0 20px 12px;
`

const TfButton = styled.button<{ $active?: boolean }>`
  height: 30px;
  min-width: 40px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(212, 175, 55, 0.55)' : 'rgba(255, 255, 255, 0.06)')};
  background: ${({ $active }) => ($active ? 'rgba(212, 175, 55, 0.12)' : 'transparent')};
  color: ${({ $active }) => ($active ? colors.gold : '#8a8a8a')};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: border-color 150ms ease, background 150ms ease, color 150ms ease;

  &:hover {
    color: ${colors.textPrimary};
  }
`

const ChartArea = styled.div`
  height: 420px;
  min-height: 420px;
  padding: 0 12px 12px;
  box-sizing: border-box;
`

const EmptyChart = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #8a8a8a;
  font-size: 14px;
`

const timeframeToEnum = (id: TradeTimeframeId): PairDataTimeWindowEnum => {
  if (id === '1w') return PairDataTimeWindowEnum.WEEK
  if (id === '1m' || id === 'all') return PairDataTimeWindowEnum.YEAR
  return PairDataTimeWindowEnum.DAY
}

export interface TradePriceChartProps {
  inputSymbol: string
  outputSymbol: string
  inputCurrencyId?: string
  outputCurrencyId?: string
  priceUsd?: number
  change24h?: number
}

export const TradePriceChart: React.FC<TradePriceChartProps> = ({
  inputSymbol,
  outputSymbol,
  inputCurrencyId,
  outputCurrencyId,
  priceUsd,
  change24h,
}) => {
  const [timeframe, setTimeframe] = useState<TradeTimeframeId>('1d')
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

  return (
    <Shell data-trade-price-chart>
      <Header>
        <div>
          <PairTitle>Pair</PairTitle>
          <PairName>
            {inputSymbol} / {outputSymbol}
          </PairName>
        </div>
        <PriceBlock>
          <Price>
            {displayPrice != null && Number.isFinite(displayPrice)
              ? displayPrice < 0.01
                ? displayPrice.toFixed(6)
                : displayPrice.toFixed(4)
              : 'Indexing...'}
          </Price>
          {Number.isFinite(displayChange) && (
            <Change $positive={displayChange >= 0}>
              {displayChange >= 0 ? '+' : ''}
              {displayChange.toFixed(2)}% (24H)
            </Change>
          )}
        </PriceBlock>
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
      <ChartArea>
        {hasChart ? (
          <SwapLineChart
            data={pairPrices}
            isChangePositive={chartChange.changeValue >= 0}
            timeWindow={timeframeToEnum(timeframe)}
            isChartExpanded={false}
            style={{ height: '100%', width: '100%' }}
          />
        ) : (
          <EmptyChart>Indexing chart data...</EmptyChart>
        )}
      </ChartArea>
    </Shell>
  )
}

export default TradePriceChart
