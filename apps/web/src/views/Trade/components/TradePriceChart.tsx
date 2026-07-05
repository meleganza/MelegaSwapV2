import React, { useMemo, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import { isMarcoSymbol, MARCO_BSC_ADDRESS, MARCO_BSC_CHAIN_ID } from 'design-system/melega/constants/brand'
import { tradeUiReasonLabel } from 'lib/data-policy/uiReasonLabels'
import { tradeColors, TRADE_TIMEFRAMES, type TradeTimeframeId } from '../tradeTokens'
import { useFetchPairPrices } from 'state/swap/hooks'
import { PairDataTimeWindowEnum } from 'state/swap/types'
import { getTokenAddress } from 'views/Swap/components/Chart/utils'
import { getTimeWindowChange } from 'views/Swap/components/Chart/utils'
import type { TradePairStat } from '../useTradeTerminalData'
import TradeChartPanel from './TradeChartPanel'

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
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
  width: 100%;
  max-width: 520px;
  box-sizing: border-box;
  padding: 16px;
  transition: transform 160ms ease, box-shadow 160ms ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(212, 175, 55, 0.08);
  }
`

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 0 0 8px;
  box-sizing: border-box;
`

const PairBlock = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
`

const TokenLogo = styled.img`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  flex-shrink: 0;
  object-fit: cover;
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
  font-size: 14px;
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
  padding: 0 0 8px;
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

const ChartBlock = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  width: 100%;
  margin-top: auto;
  padding-top: 12px;
  flex-shrink: 0;
  box-sizing: border-box;

  @media (max-width: 767px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

const StatCard = styled.div`
  background: #101010;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 12px;
  box-sizing: border-box;
  min-width: 0;
  min-height: 72px;
  height: auto;
  transition: transform 140ms ease, box-shadow 140ms ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(212, 175, 55, 0.08);
  }
`

const StatLabel = styled.div`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8a8a8a;
  line-height: 12px;
`

const StatValue = styled.div`
  margin-top: 6px;
  font-size: 16px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.25;
  max-width: 100%;
  word-break: break-word;
  animation: ${fadeIn} 180ms ease;
`

const StatDelta = styled.div<{ $positive?: boolean }>`
  margin-top: 4px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ $positive }) => ($positive ? tradeColors.green : tradeColors.red)};
`

const StatSubline = styled.div`
  margin-top: 4px;
  font-size: 11px;
  color: ${tradeColors.muted};
  line-height: 1.35;
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
  chartEmptyReason?: string | null
  chartEmptyDetail?: string
  externalChartHref?: string
}

export const TradePriceChart: React.FC<TradePriceChartProps> = ({
  inputSymbol,
  outputSymbol,
  inputCurrencyId,
  outputCurrencyId,
  priceUsd,
  change24h,
  stats = [],
  chartEmptyReason,
  chartEmptyDetail,
  externalChartHref,
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
          <MelegaTokenAvatar
            name={inputSymbol}
            symbol={inputSymbol}
            size={36}
            address={
              isMarcoSymbol(inputSymbol)
                ? MARCO_BSC_ADDRESS
                : token0Address
            }
            chainId={isMarcoSymbol(inputSymbol) ? MARCO_BSC_CHAIN_ID : 56}
            radius="circle"
          />
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
      <ChartBlock>
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
        <TradeChartPanel
          inputSymbol={inputSymbol}
          outputSymbol={outputSymbol}
          pairPrices={pairPrices}
          emptyReason={chartEmptyReason}
          emptyDetail={chartEmptyDetail}
          externalChartHref={externalChartHref}
        />
      </ChartBlock>
      <StatsRow data-trade-pair-stats>
        {stats.map((stat) => {
          const muted = !stat.value
          const subline = muted ? tradeUiReasonLabel(stat.reasonCode) : undefined
          return (
            <StatCard key={stat.id}>
              <StatLabel>{stat.label}</StatLabel>
              <StatValue>{stat.value ?? '—'}</StatValue>
              {stat.change && !muted ? (
                <StatDelta $positive={stat.changePositive}>{stat.change}</StatDelta>
              ) : null}
              {subline ? <StatSubline>{subline}</StatSubline> : null}
            </StatCard>
          )
        })}
      </StatsRow>
    </Shell>
  )
}

export default TradePriceChart
