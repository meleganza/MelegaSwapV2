/**
 * Charts — indexed candles only.
 * UI windows: 1H / 24H / 7D / 30D / ALL mapped onto indexer intervals.
 * Variants: full | compact | hero (large in-hero chart for V3).
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
import { useFeaturedProjectMarkets } from 'views/HomeTrade/useFeaturedProjectMarkets'
import { Band, BandHead, BandMeta, BandTitle, Muted, pp } from './theme'

const TradeChartPanel = dynamic(() => import('views/Trade/components/TradeChartPanel'), {
  ssr: false,
  loading: () => <ChartSkeleton aria-hidden />,
}) as React.ComponentType<React.ComponentProps<typeof import('views/Trade/components/TradeChartPanel').TradeChartPanel>>

const ChartSkeleton = styled.div<{ $size?: 'compact' | 'hero' | 'full' }>`
  min-height: ${({ $size }) => ($size === 'compact' ? '96px' : $size === 'hero' ? '280px' : '200px')};
  max-height: ${({ $size }) => ($size === 'hero' ? '380px' : 'none')};
  border-radius: 10px;
  background: #101010;
  border: 1px solid ${pp.line};
`

const Timeframes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 6px 0 8px;
`

const TfButton = styled.button<{ $active?: boolean }>`
  min-width: 36px;
  min-height: 28px;
  padding: 0 8px;
  border-radius: 8px;
  border: 1px solid ${({ $active }) => ($active ? pp.gold : pp.line)};
  background: ${({ $active }) => ($active ? pp.goldDim : 'transparent')};
  color: ${({ $active }) => ($active ? pp.gold : pp.mute)};
  font-size: 11px;
  font-weight: 750;
  cursor: pointer;
`

const PriceLine = styled.div`
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  font-variant-numeric: tabular-nums;
`

const ElegantPlaceholder = styled.div<{ $hero?: boolean }>`
  min-height: ${({ $hero }) => ($hero ? '180px' : '96px')};
  max-height: ${({ $hero }) => ($hero ? '260px' : 'none')};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 12px;
  border: 1px solid ${pp.line};
  background:
    radial-gradient(ellipse 70% 60% at 50% 30%, rgba(221, 185, 47, 0.08), transparent 65%),
    linear-gradient(165deg, rgba(18, 18, 18, 0.96), rgba(10, 10, 10, 0.98));
  color: ${pp.mute};
  font-size: 13px;
  font-weight: 650;
  padding: 16px;
  text-align: center;
`

const PlaceholderTitle = styled.div`
  color: rgba(255, 255, 255, 0.78);
  font-weight: 750;
  font-size: 14px;
`

const HeroChartWrap = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;

  [data-trade-chart-area],
  [data-testid='project-v3-chart-placeholder'],
  [data-testid='project-v4-chart-placeholder'],
  [data-testid='project-v5-chart-placeholder'] {
    height: 180px;
    min-height: 180px;
    max-height: 210px;
  }

  @media (min-width: 768px) {
    [data-trade-chart-area],
    [data-testid='project-v3-chart-placeholder'],
    [data-testid='project-v4-chart-placeholder'],
    [data-testid='project-v5-chart-placeholder'] {
      height: 200px;
      min-height: 200px;
      max-height: 220px;
    }
  }

  @media (min-width: 960px) {
    [data-trade-chart-area],
    [data-testid='project-v3-chart-placeholder'],
    [data-testid='project-v4-chart-placeholder'],
    [data-testid='project-v5-chart-placeholder'] {
      height: 240px;
      min-height: 220px;
      max-height: 260px;
    }
  }
`

type UiWindow = '1H' | '24H' | '7D' | '30D' | 'ALL'

const TIMEFRAMES: { id: UiWindow; label: string; interval: OhlcvCandle['interval']; limit: number }[] = [
  { id: '1H', label: '1H', interval: '1H', limit: 2 },
  { id: '24H', label: '24H', interval: '1H', limit: 24 },
  { id: '7D', label: '7D', interval: '1D', limit: 7 },
  { id: '30D', label: '30D', interval: '1D', limit: 30 },
  { id: 'ALL', label: 'ALL', interval: '1D', limit: 180 },
]

interface Props {
  slug: string
  marketsDocument: ProjectMarketsDocument
  variant?: 'full' | 'compact' | 'hero'
  pairAddress?: string | null
}

function resolveChartPair(
  slug: string,
  marketsDocument: ProjectMarketsDocument,
  featuredPair?: string,
  explicitPair?: string | null,
): string | undefined {
  if (explicitPair && /^0x[a-fA-F0-9]{40}$/.test(explicitPair)) return explicitPair.toLowerCase()
  if (featuredPair && /^0x[a-fA-F0-9]{40}$/.test(featuredPair)) return featuredPair.toLowerCase()
  if (slug === 'marco' || isChartSupported(slug, marketsDocument)) {
    return MARCO_WBNB_PAIR_BSC.toLowerCase()
  }
  return undefined
}

const ProjectCharts: React.FC<Props> = ({
  slug,
  marketsDocument,
  variant = 'full',
  pairAddress: pairProp,
}) => {
  const compact = variant === 'compact'
  const hero = variant === 'hero'
  const [windowId, setWindowId] = useState<UiWindow>('24H')
  const tf = TIMEFRAMES.find((t) => t.id === windowId) ?? TIMEFRAMES[1]
  const { rowsBySlug } = useFeaturedProjectMarkets()
  const featuredRow = rowsBySlug[slug] ?? (slug === 'marco' ? rowsBySlug['marco-wbnb'] : undefined)
  const pairAddress = resolveChartPair(slug, marketsDocument, featuredRow?.pairAddress, pairProp)
  const supported = Boolean(pairAddress)
  const preferred = marketsDocument.preferredMarkets[0]
  const pairLabel =
    slug === 'marco' || isMarcoSymbol(preferred?.baseSymbol, preferred?.baseSymbol)
      ? 'MARCO / WBNB'
      : preferred
        ? `${preferred.baseSymbol} / ${preferred.quoteSymbol}`
        : featuredRow?.symbol
          ? `${featuredRow.symbol} / WBNB`
          : 'Project pair'

  const { chartEntries, status } = useIndexerCandles(supported ? pairAddress : undefined, tf.interval)

  const pairPrices = useMemo(() => {
    const sliced = chartEntries.slice(-tf.limit)
    return sliced.map((c) => ({ time: String(c.time), value: c.close }))
  }, [chartEntries, tf.limit])

  const latestClose = pairPrices.length ? pairPrices[pairPrices.length - 1]?.value : null
  const priceText = formatPrice(latestClose)
  const hasSpark = pairPrices.length >= 2
  const showPlaceholder = !supported || (!hasSpark && status !== 'loading')

  const timeframeRow = (
    <Timeframes
      role="group"
      aria-label="Chart timeframe"
      data-testid={hero ? 'project-v3-chart-timeframes' : 'project-v1-chart-timeframes'}
    >
      {TIMEFRAMES.map((item) => (
        <TfButton
          key={item.id}
          type="button"
          aria-pressed={windowId === item.id}
          $active={windowId === item.id}
          data-testid={`project-chart-tf-${item.id.toLowerCase()}`}
          onClick={() => setWindowId(item.id)}
        >
          {item.label}
        </TfButton>
      ))}
    </Timeframes>
  )

  if (compact) {
    return (
      <div data-testid="project-v2-chart-compact" data-chart-variant="compact">
        <BandHead style={{ marginBottom: 6 }}>
          <BandTitle>Chart</BandTitle>
          <BandMeta>{supported && hasSpark ? 'indexed' : '—'}</BandMeta>
        </BandHead>
        {showPlaceholder ? (
          <ElegantPlaceholder data-testid="project-v2-chart-unavailable">
            <PlaceholderTitle>Unavailable</PlaceholderTitle>
            <span>Indexed candles will appear when the pair is live.</span>
          </ElegantPlaceholder>
        ) : (
          <TradeChartPanel
            pairPrices={pairPrices}
            emptyReason={pairPrices.length < 2 && status === 'loading' ? 'loading' : 'insufficient_history'}
            isLoading={status === 'loading'}
            currentPriceUsd={latestClose ?? undefined}
          />
        )}
      </div>
    )
  }

  if (hero) {
    return (
      <HeroChartWrap data-testid="project-v5-chart-panel" data-chart-variant="hero">
        <BandHead style={{ marginBottom: 4 }}>
          <BandMeta>{pairLabel}</BandMeta>
          {priceText ? <PriceLine style={{ fontSize: 16 }}>{priceText}</PriceLine> : null}
        </BandHead>
        {timeframeRow}
        {showPlaceholder ? (
          <ElegantPlaceholder $hero data-testid="project-v5-chart-placeholder">
            <PlaceholderTitle>Market history not available yet</PlaceholderTitle>
            <span aria-hidden style={{ opacity: 0.45, letterSpacing: 2 }}>
              ━╱╲╱╲━
            </span>
          </ElegantPlaceholder>
        ) : status === 'loading' && !hasSpark ? (
          <ChartSkeleton $size="hero" aria-hidden />
        ) : (
          <TradeChartPanel
            pairPrices={pairPrices}
            emptyReason={pairPrices.length < 2 && status === 'loading' ? 'loading' : 'insufficient_history'}
            isLoading={status === 'loading'}
            currentPriceUsd={latestClose ?? undefined}
          />
        )}
      </HeroChartWrap>
    )
  }

  return (
    <Band aria-labelledby="pp-v1-charts" data-project-section="charts" data-testid="project-v1-charts">
      <BandHead>
        <BandTitle id="pp-v1-charts">Chart</BandTitle>
        <BandMeta>{supported ? 'indexed candles' : '—'}</BandMeta>
      </BandHead>
      {!supported ? (
        <ElegantPlaceholder data-testid="project-chart-unavailable">
          <PlaceholderTitle>Chart unavailable</PlaceholderTitle>
        </ElegantPlaceholder>
      ) : (
        <>
          <Muted>
            {pairLabel} · Indexed candles only · {windowId}
          </Muted>
          {priceText ? <PriceLine>{priceText}</PriceLine> : <Muted>—</Muted>}
          {timeframeRow}
          {!hasSpark && status !== 'loading' ? (
            <ElegantPlaceholder>
              <PlaceholderTitle>Insufficient history</PlaceholderTitle>
            </ElegantPlaceholder>
          ) : (
            <TradeChartPanel
              pairPrices={pairPrices}
              emptyReason={pairPrices.length < 2 && status === 'loading' ? 'loading' : 'insufficient_history'}
              isLoading={status === 'loading'}
              currentPriceUsd={latestClose ?? undefined}
            />
          )}
        </>
      )}
    </Band>
  )
}

export default ProjectCharts
