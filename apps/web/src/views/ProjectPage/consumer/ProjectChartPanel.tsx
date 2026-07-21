import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import dynamic from 'next/dynamic'
import { isMarcoSymbol } from 'design-system/melega/constants/brand'
import { useIndexerCandles } from 'lib/bsc-indexer/client/useIndexerCandles'
import { MARCO_WBNB_PAIR_BSC } from 'lib/bsc-indexer/constants'
import type { ProjectMarketsDocument } from 'registry/projects/identity/markets'
import { formatPrice } from '../presentation/humanLabels'
import { isChartSupported } from './helpers'
import { Card, MutedText, SectionTitle } from './theme'

const TradeChartPanel = dynamic(() => import('views/Trade/components/TradeChartPanel'), {
  ssr: false,
  loading: () => <ChartSkeleton aria-hidden />,
}) as React.ComponentType<React.ComponentProps<typeof import('views/Trade/components/TradeChartPanel').TradeChartPanel>>

const ChartSkeleton = styled.div`
  min-height: 220px;
  border-radius: 12px;
  background: #101010;
  border: 1px solid rgba(255, 255, 255, 0.06);
`

const Timeframes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const TfButton = styled.button<{ $active?: boolean }>`
  min-width: 44px;
  min-height: 44px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid ${({ $active }) => ($active ? '#d4af37' : '#2a2a2a')};
  background: ${({ $active }) => ($active ? 'rgba(212, 175, 55, 0.1)' : 'transparent')};
  color: ${({ $active }) => ($active ? '#d4af37' : '#8f8f8f')};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #d4af37;
    outline-offset: 2px;
  }
`

const PriceLine = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  font-variant-numeric: tabular-nums;
`

const TIMEFRAMES = [
  { id: '1H' as const, label: '1H' },
  { id: '4H' as const, label: '4H' },
  { id: '1D' as const, label: '1D' },
]

interface Props {
  slug: string
  marketsDocument: ProjectMarketsDocument
}

const ProjectChartPanel: React.FC<Props> = ({ slug, marketsDocument }) => {
  const [interval, setInterval] = useState<'1H' | '4H' | '1D'>('1H')
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
      <Card aria-labelledby="chart-heading">
        <SectionTitle as="h2" id="chart-heading" style={{ fontSize: '22px' }}>
          Chart
        </SectionTitle>
        <MutedText>
          Indexed price chart is not available yet for this project. Charts render when a supported
          Melega indexer pair is registered.
        </MutedText>
      </Card>
    )
  }

  return (
    <Card aria-labelledby="chart-heading" data-testid="project-consumer-chart">
      <SectionTitle as="h2" id="chart-heading" style={{ fontSize: '22px' }}>
        Chart
      </SectionTitle>
      <MutedText>{pairLabel} · Indexed candles only</MutedText>
      {priceText ? <PriceLine>{priceText}</PriceLine> : <MutedText>Not available yet</MutedText>}
      <Timeframes role="tablist" aria-label="Chart timeframe">
        {TIMEFRAMES.map((tf) => (
          <TfButton
            key={tf.id}
            type="button"
            role="tab"
            aria-selected={interval === tf.id}
            $active={interval === tf.id}
            onClick={() => setInterval(tf.id)}
          >
            {tf.label}
          </TfButton>
        ))}
      </Timeframes>
      <TradeChartPanel
        pairPrices={pairPrices}
        emptyReason={pairPrices.length < 2 && status === 'loading' ? 'loading' : 'insufficient_history'}
        isLoading={status === 'loading'}
        currentPriceUsd={latestClose ?? undefined}
      />
    </Card>
  )
}

export default ProjectChartPanel
