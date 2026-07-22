import React, { useMemo, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import { isMarcoSymbol, MARCO_BSC_ADDRESS, MARCO_BSC_CHAIN_ID } from 'design-system/melega/constants/brand'
import { BSC_TESTNET_ADDRESSES } from 'config/constants/bscTestnet'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { RUNTIME_LOADING_LABEL, RUNTIME_UNAVAILABLE_LABEL } from 'lib/runtime-truth'
import { tradeColors, TRADE_TIMEFRAMES, tradeTypography, type TradeTimeframeId } from '../tradeTokens'
import { getTokenAddress } from 'views/Swap/components/Chart/utils'
import { useIndexerCandles } from 'lib/bsc-indexer/client/useIndexerCandles'
import { MARCO_WBNB_PAIR_BSC } from 'lib/bsc-indexer/constants'
import TradeChartPanel from './TradeChartPanel'

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const Shell = styled.div`
  background: ${tradeColors.panel};
  border: 1px solid ${tradeColors.border};
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  width: 100%;
  max-width: 520px;
  box-sizing: border-box;
  padding: 16px;
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

const PairName = styled.div`
  font-size: 18px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.2;
  display: flex;
  align-items: center;
  gap: 4px;
`

const PriceMain = styled.div<{ $loading?: boolean }>`
  margin-top: 8px;
  font-size: ${tradeTypography.heroPrice.size};
  font-weight: ${tradeTypography.heroPrice.weight};
  line-height: ${tradeTypography.heroPrice.lineHeight};
  color: ${({ $loading }) => ($loading ? tradeColors.gold : '#ffffff')};
  font-variant-numeric: ${tradeTypography.fontVariantNumeric};
  animation: ${fadeIn} 180ms ease;
`

const PriceUsd = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: ${tradeColors.muted};
  font-variant-numeric: ${tradeTypography.fontVariantNumeric};
`

const Change = styled.div<{ $positive?: boolean }>`
  font-size: ${tradeTypography.heroChange.size};
  font-weight: ${tradeTypography.heroChange.weight};
  color: ${({ $positive }) => ($positive ? tradeColors.green : tradeColors.red)};
  white-space: nowrap;
  padding-top: 8px;
  font-variant-numeric: ${tradeTypography.fontVariantNumeric};
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
  background: ${({ $active }) => ($active ? 'rgba(244, 196, 48, 0.08)' : 'transparent')};
  color: ${({ $active }) => ($active ? tradeColors.goldBright : '#8a8a8a')};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 150ms ease, background 150ms ease, color 150ms ease;

  &:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(244, 196, 48, 0.35);
  }
`

const ChartBlock = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`

const timeframeToIndexerInterval = (id: TradeTimeframeId): '1H' | '4H' | '1D' => {
  if (id === '4h') return '4H'
  if (id === '1d') return '1D'
  return '1H'
}

export interface TradePriceChartProps {
  inputSymbol: string
  outputSymbol: string
  inputCurrencyId?: string
  outputCurrencyId?: string
  priceUsd?: number
  change24h?: number
  chartEmptyReason?: string | null
  chartEmptyDetail?: string
  isIndexingMetrics?: boolean
}

export const TradePriceChart: React.FC<TradePriceChartProps> = ({
  inputSymbol,
  outputSymbol,
  inputCurrencyId,
  outputCurrencyId,
  priceUsd,
  change24h,
  chartEmptyReason,
  chartEmptyDetail,
  isIndexingMetrics,
}) => {
  const [timeframe, setTimeframe] = useState<TradeTimeframeId>('1h')
  const { chainId: activeChainId } = useActiveChainId()
  const token0Address = getTokenAddress(inputCurrencyId)

  const avatarChainId = useMemo(() => {
    if (activeChainId) return activeChainId
    if (isMarcoSymbol(inputSymbol)) return MARCO_BSC_CHAIN_ID
    return 56
  }, [activeChainId, inputSymbol])

  const avatarAddress = useMemo(() => {
    if (isMarcoSymbol(inputSymbol)) {
      return activeChainId === 97 ? BSC_TESTNET_ADDRESSES.marco : MARCO_BSC_ADDRESS
    }
    return token0Address
  }, [inputSymbol, activeChainId, token0Address])

  const indexerInterval = timeframeToIndexerInterval(timeframe)
  const pairForIndexer =
    isMarcoSymbol(inputSymbol) || isMarcoSymbol(outputSymbol) ? MARCO_WBNB_PAIR_BSC : undefined
  const { chartEntries: indexerCandles, status: indexerCandleStatus } = useIndexerCandles(
    pairForIndexer,
    indexerInterval,
  )

  const pairPrices = useMemo(() => {
    if (indexerCandles.length >= 2) {
      return indexerCandles.map((c) => ({ time: c.time, value: c.close }))
    }
    if (indexerCandles.length === 1) {
      return indexerCandles.map((c) => ({ time: c.time, value: c.close }))
    }
    return []
  }, [indexerCandles])

  const resolvedChartEmptyReason =
    chartEmptyReason ??
    (pairPrices.length > 0 && pairPrices.length < 2
      ? 'insufficient_history'
      : pairPrices.length < 1 && indexerCandleStatus === 'loading'
        ? 'loading'
        : pairPrices.length < 1
          ? 'insufficient_history'
          : null)

  const displayPrice = priceUsd
  const validChange =
    change24h != null && Number.isFinite(change24h) && Math.abs(change24h) > 0.0001
      ? change24h
      : undefined

  const priceText =
    displayPrice != null && Number.isFinite(displayPrice)
      ? displayPrice < 0.01
        ? displayPrice.toFixed(6)
        : displayPrice.toFixed(4)
      : null

  const priceLoading = isIndexingMetrics && !priceText

  return (
    <Shell data-trade-price-chart>
      <Header>
        <PairBlock>
          <MelegaTokenAvatar
            name={inputSymbol}
            symbol={inputSymbol}
            size={36}
            address={avatarAddress}
            chainId={avatarChainId}
            radius="circle"
          />
          <div>
            <PairName>
              {inputSymbol} / {outputSymbol}
            </PairName>
            <PriceMain $loading={priceLoading}>
              {priceLoading ? RUNTIME_LOADING_LABEL : priceText ?? RUNTIME_UNAVAILABLE_LABEL}
            </PriceMain>
            {priceText ? <PriceUsd>USD ${priceText}</PriceUsd> : null}
          </div>
        </PairBlock>
        {validChange != null && !priceLoading ? (
          <Change $positive={validChange >= 0}>
            {validChange >= 0 ? '+' : ''}
            {validChange.toFixed(2)}% (24H)
          </Change>
        ) : null}
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
          pairPrices={pairPrices}
          emptyReason={resolvedChartEmptyReason}
          emptyDetail={chartEmptyDetail}
          currentPriceUsd={displayPrice}
          isLoading={indexerCandleStatus === 'loading'}
        />
      </ChartBlock>
    </Shell>
  )
}

export default TradePriceChart
