/**
 * Section 4 — Charts (indexed candles only).
 */
import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import dynamic from 'next/dynamic'
import { isMarcoSymbol } from 'design-system/melega/constants/brand'
import { useIndexerCandles } from 'lib/bsc-indexer/client/useIndexerCandles'
import { MARCO_WBNB_PAIR_BSC } from 'lib/bsc-indexer/constants'
import type { ProjectMarketsDocument } from 'registry/projects/identity/markets'
import { formatPrice } from '../presentation/humanLabels'
import { isChartSupported } from './helpers'
import { Band, BandHead, BandMeta, BandTitle, Grid, Muted, pp } from './theme'
import { Metric, indexed, live, UNAVAILABLE } from './Metric'

const TradeChartPanel = dynamic(() => import('views/Trade/components/TradeChartPanel'), {
  ssr: false,
  loading: () => <ChartSkeleton aria-hidden />,
}) as React.ComponentType<React.ComponentProps<typeof import('views/Trade/components/TradeChartPanel').TradeChartPanel>>

const ChartSkeleton = styled.div`
  min-height: 200px;
  border-radius: 10px;
  background: #101010;
  border: 1px solid ${pp.line};
`

const Timeframes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 8px 0;
`

const TfButton = styled.button<{ $active?: boolean }>`
  min-width: 40px;
  min-height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid ${({ $active }) => ($active ? pp.gold : pp.line)};
  background: ${({ $active }) => ($active ? pp.goldDim : 'transparent')};
  color: ${({ $active }) => ($active ? pp.gold : pp.mute)};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
`

const PriceLine = styled.div`
  font-size: 22px;
  font-weight: 800;
  color: #fff;
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

const ProjectCharts: React.FC<Props> = ({ slug, marketsDocument }) => {
  const [interval, setInterval] = useState<'1H' | '4H' | '1D'>('1H')
  const supported = isChartSupported(slug, marketsDocument)
  const preferred = marketsDocument.preferredMarkets[0]
  const pairLabel =
    slug === 'marco' || isMarcoSymbol(preferred?.baseSymbol, preferred?.baseSymbol)
      ? 'MARCO / WBNB'
      : preferred
        ? `${preferred.baseSymbol} / ${preferred.quoteSymbol}`
        : 'Project pair'

  const { chartEntries, status } = useIndexerCandles(supported ? MARCO_WBNB_PAIR_BSC : undefined, interval)

  const pairPrices = useMemo(
    () => chartEntries.map((c) => ({ time: String(c.time), value: c.close })),
    [chartEntries],
  )

  const latestClose = pairPrices.length ? pairPrices[pairPrices.length - 1]?.value : null
  const priceText = formatPrice(latestClose)

  return (
    <Band aria-labelledby="pp-v1-charts" data-project-section="charts" data-testid="project-v1-charts">
      <BandHead>
        <BandTitle id="pp-v1-charts">Charts</BandTitle>
        <BandMeta>{supported ? 'indexed candles' : 'unavailable'}</BandMeta>
      </BandHead>
      <Grid $cols={5} style={{ marginBottom: 8 }}>
        <Metric
          label="Price"
          value={priceText || 'Unavailable'}
          provenance={priceText ? live('melega-dex-index', status) : UNAVAILABLE}
        />
        <Metric label="Volume" value="Unavailable" provenance={UNAVAILABLE} />
        <Metric label="Liquidity" value="See Live Market" provenance={indexed('project-page-cross-ref')} />
        <Metric label="Market Cap" value="Unavailable" provenance={UNAVAILABLE} />
        <Metric label="Holders" value="Unavailable" provenance={UNAVAILABLE} />
      </Grid>
      {!supported ? (
        <Muted>
          Indexed price chart is not available yet for this project. Charts render when a supported Melega
          indexer pair is registered.
        </Muted>
      ) : (
        <>
          <Muted>
            {pairLabel} · Indexed candles only · timeframe {interval}
          </Muted>
          {priceText ? <PriceLine>{priceText}</PriceLine> : <Muted>Not available yet</Muted>}
          <Timeframes role="group" aria-label="Chart timeframe">
            {TIMEFRAMES.map((tf) => (
              <TfButton
                key={tf.id}
                type="button"
                aria-pressed={interval === tf.id}
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
        </>
      )}
    </Band>
  )
}

export default ProjectCharts
