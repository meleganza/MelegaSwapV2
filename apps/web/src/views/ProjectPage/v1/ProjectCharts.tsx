/**
 * Charts — indexed candles only.
 * UI windows: 1H / 24H / 7D / 30D mapped onto indexer intervals (1H / 1D).
 */
import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import dynamic from 'next/dynamic'
import { isMarcoSymbol } from 'design-system/melega/constants/brand'
import { useIndexerCandles } from 'lib/bsc-indexer/client/useIndexerCandles'
import { MARCO_WBNB_PAIR_BSC } from 'lib/bsc-indexer/constants'
import type { OhlcvCandle } from 'lib/bsc-indexer/types'
import type { ProjectMarketsDocument } from 'registry/projects/identity/markets'
import { formatPrice } from '../presentation/humanLabels'
import { isChartSupported } from './helpers'
import { Band, BandHead, BandMeta, BandTitle, Muted, pp } from './theme'

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

type UiWindow = '1H' | '24H' | '7D' | '30D'

const TIMEFRAMES: { id: UiWindow; label: string; interval: OhlcvCandle['interval']; limit: number }[] = [
  { id: '1H', label: '1H', interval: '1H', limit: 2 },
  { id: '24H', label: '24H', interval: '1H', limit: 24 },
  { id: '7D', label: '7D', interval: '1D', limit: 7 },
  { id: '30D', label: '30D', interval: '1D', limit: 30 },
]

interface Props {
  slug: string
  marketsDocument: ProjectMarketsDocument
}

const ProjectCharts: React.FC<Props> = ({ slug, marketsDocument }) => {
  const [windowId, setWindowId] = useState<UiWindow>('24H')
  const tf = TIMEFRAMES.find((t) => t.id === windowId) ?? TIMEFRAMES[1]
  const supported = isChartSupported(slug, marketsDocument)
  const preferred = marketsDocument.preferredMarkets[0]
  const pairLabel =
    slug === 'marco' || isMarcoSymbol(preferred?.baseSymbol, preferred?.baseSymbol)
      ? 'MARCO / WBNB'
      : preferred
        ? `${preferred.baseSymbol} / ${preferred.quoteSymbol}`
        : 'Project pair'

  const { chartEntries, status } = useIndexerCandles(supported ? MARCO_WBNB_PAIR_BSC : undefined, tf.interval)

  const pairPrices = useMemo(() => {
    const sliced = chartEntries.slice(-tf.limit)
    return sliced.map((c) => ({ time: String(c.time), value: c.close }))
  }, [chartEntries, tf.limit])

  const latestClose = pairPrices.length ? pairPrices[pairPrices.length - 1]?.value : null
  const priceText = formatPrice(latestClose)

  return (
    <Band aria-labelledby="pp-v1-charts" data-project-section="charts" data-testid="project-v1-charts">
      <BandHead>
        <BandTitle id="pp-v1-charts">Chart</BandTitle>
        <BandMeta>{supported ? 'indexed candles' : 'unavailable'}</BandMeta>
      </BandHead>
      {!supported ? (
        <Muted>
          Indexed price chart is not available yet for this project. Charts render when a supported Melega
          indexer pair is registered.
        </Muted>
      ) : (
        <>
          <Muted>
            {pairLabel} · Indexed candles only · {windowId}
          </Muted>
          {priceText ? <PriceLine>{priceText}</PriceLine> : <Muted>Not available yet</Muted>}
          <Timeframes role="group" aria-label="Chart timeframe" data-testid="project-v1-chart-timeframes">
            {TIMEFRAMES.map((item) => (
              <TfButton
                key={item.id}
                type="button"
                aria-pressed={windowId === item.id}
                $active={windowId === item.id}
                data-testid={`project-v1-chart-tf-${item.id.toLowerCase()}`}
                onClick={() => setWindowId(item.id)}
              >
                {item.label}
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
