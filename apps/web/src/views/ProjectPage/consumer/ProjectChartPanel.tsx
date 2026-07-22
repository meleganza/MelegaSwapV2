import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import dynamic from 'next/dynamic'
import { isMarcoSymbol } from 'design-system/melega/constants/brand'
import { useIndexerCandles } from 'lib/bsc-indexer/client/useIndexerCandles'
import { MARCO_WBNB_PAIR_BSC } from 'lib/bsc-indexer/constants'
import type { ProjectMarketsDocument } from 'registry/projects/identity/markets'
import { PREMIUM_FONT_DISPLAY } from 'design-system/melega/tokens/premiumStudio'
import { formatPrice } from '../presentation/humanLabels'
import { isChartSupported } from './helpers'
import { Card, MutedText } from './theme'

const TradeChartPanel = dynamic(() => import('views/Trade/components/TradeChartPanel'), {
  ssr: false,
  loading: () => <ChartSkeleton aria-hidden />,
}) as React.ComponentType<
  React.ComponentProps<typeof import('views/Trade/components/TradeChartPanel').TradeChartPanel>
>

const ChartCard = styled(Card)<{ $dense?: boolean }>`
  background: #111111;
  border: 1px solid rgba(255, 255, 255, 0.075);
  border-radius: 16px;
  padding: ${({ $dense }) => ($dense ? '18px' : '18px')};
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.28);
  min-height: ${({ $dense }) => ($dense ? '270px' : 'auto')};
  gap: 10px;

  @media (min-width: 1024px) {
    min-height: ${({ $dense }) => ($dense ? '280px' : 'auto')};
    max-height: ${({ $dense }) => ($dense ? '306px' : 'none')};
    overflow: hidden;
  }
`

const ChartSkeleton = styled.div`
  min-height: 160px;
  border-radius: 12px;
  background: #101010;
  border: 1px solid rgba(255, 255, 255, 0.06);
  flex: 1;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  min-height: 58px;
`

const PairLabel = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.42);
  margin-bottom: 4px;
`

const PriceLine = styled.div`
  font-family: ${PREMIUM_FONT_DISPLAY};
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  font-variant-numeric: tabular-nums;
`

const Source = styled.div`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.42);
  white-space: nowrap;
`

const Timeframes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`

const TfButton = styled.button<{ $active?: boolean; $disabled?: boolean }>`
  min-width: 36px;
  height: 30px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid
    ${({ $active }) => ($active ? 'rgba(221, 185, 47, 0.7)' : 'rgba(255, 255, 255, 0.08)')};
  background: ${({ $active }) => ($active ? 'rgba(221, 185, 47, 0.1)' : 'transparent')};
  color: ${({ $active, $disabled }) =>
    $disabled ? 'rgba(255,255,255,0.25)' : $active ? '#ddb92f' : 'rgba(255,255,255,0.55)'};
  font-size: 11px;
  font-weight: 600;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};

  &:focus-visible {
    outline: 2px solid #ddb92f;
    outline-offset: 2px;
  }
`

const ChartBody = styled.div`
  flex: 1;
  min-height: 140px;
  display: flex;
  flex-direction: column;
`

type LiveInterval = '1H' | '4H' | '1D'

const TIMEFRAMES: Array<{ id: string; label: string; live?: LiveInterval }> = [
  { id: '1H', label: '1H', live: '1H' },
  { id: '4H', label: '4H', live: '4H' },
  { id: '1D', label: '1D', live: '1D' },
  { id: '1W', label: '1W' },
  { id: '1M', label: '1M' },
  { id: '1Y', label: '1Y' },
  { id: 'ALL', label: 'ALL' },
]

interface Props {
  slug: string
  marketsDocument: ProjectMarketsDocument
  dense?: boolean
}

const ProjectChartPanel: React.FC<Props> = ({ slug, marketsDocument, dense = false }) => {
  const [interval, setInterval] = useState<LiveInterval>('1H')
  const supported = isChartSupported(slug, marketsDocument)
  const preferred = marketsDocument.preferredMarkets[0]
  const pairLabel =
    slug === 'marco' || isMarcoSymbol(preferred?.baseSymbol, preferred?.baseSymbol)
      ? 'MARCO / WBNB'
      : preferred
        ? `${preferred.baseSymbol} / ${preferred.quoteSymbol}`
        : 'Project pair'

  const { chartEntries, status } = useIndexerCandles(
    supported ? MARCO_WBNB_PAIR_BSC : undefined,
    interval,
  )

  const pairPrices = useMemo(
    () => chartEntries.map((c) => ({ time: String(c.time), value: c.close })),
    [chartEntries],
  )

  const latestClose = pairPrices.length ? pairPrices[pairPrices.length - 1]?.value : null
  const priceText = formatPrice(latestClose)

  if (!supported) {
    return (
      <ChartCard $dense={dense} aria-labelledby="chart-heading" data-testid="project-consumer-chart">
        <Header>
          <div>
            <PairLabel id="chart-heading">{pairLabel}</PairLabel>
            <MutedText>Indexed price chart is not available yet for this project.</MutedText>
          </div>
        </Header>
      </ChartCard>
    )
  }

  return (
    <ChartCard $dense={dense} aria-labelledby="chart-heading" data-testid="project-consumer-chart">
      <Header>
        <div>
          <PairLabel id="chart-heading">{pairLabel}</PairLabel>
          {priceText ? <PriceLine>{priceText}</PriceLine> : <MutedText>Not available</MutedText>}
        </div>
        <Source>Indexed candles</Source>
      </Header>
      <Timeframes role="tablist" aria-label="Chart timeframe">
        {TIMEFRAMES.map((tf) => {
          const live = Boolean(tf.live)
          const active = tf.live === interval
          return (
            <TfButton
              key={tf.id}
              type="button"
              role="tab"
              aria-selected={active}
              $active={active}
              $disabled={!live}
              disabled={!live}
              title={live ? undefined : 'Not available for this pair yet'}
              onClick={() => {
                if (tf.live) setInterval(tf.live)
              }}
            >
              {tf.label}
            </TfButton>
          )
        })}
      </Timeframes>
      <ChartBody>
        <TradeChartPanel
          pairPrices={pairPrices}
          emptyReason={
            pairPrices.length < 2 && status === 'loading' ? 'loading' : 'insufficient_history'
          }
          isLoading={status === 'loading'}
          currentPriceUsd={latestClose ?? undefined}
        />
      </ChartBody>
    </ChartCard>
  )
}

export default ProjectChartPanel
