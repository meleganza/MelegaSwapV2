/**
 * Compact factual activity sparkline for Farm/Pool cards.
 * Uses indexed pair candles when available — never invents oscillation.
 */
import React, { useMemo } from 'react'
import styled from 'styled-components'
import { useIndexerCandles } from 'lib/bsc-indexer/client/useIndexerCandles'
import { AnimatedSparkline } from 'views/TrendingStudio/components/trendingStudioPrimitives'

const Wrap = styled.div`
  height: 40px;
  min-height: 36px;
  max-height: 48px;
  display: flex;
  align-items: center;
  justify-content: stretch;
  min-width: 0;
  margin-top: 2px;
`

const Baseline = styled.div`
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(244, 196, 48, 0.14), rgba(244, 196, 48, 0.34), rgba(244, 196, 48, 0.14));

  &::after {
    content: '';
    position: absolute;
    inset: -2px auto -2px -18%;
    width: 18%;
    border-radius: inherit;
    background: linear-gradient(90deg, transparent, #f4c430, transparent);
    filter: drop-shadow(0 0 6px rgba(244, 196, 48, 0.5));
    animation: melega-farm-activity 2.8s ease-in-out infinite;
  }

  @keyframes melega-farm-activity {
    0% { transform: translateX(0); opacity: 0; }
    18% { opacity: 1; }
    82% { opacity: 1; }
    100% { transform: translateX(650%); opacity: 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    &::after { animation: none; left: 42%; opacity: 0.7; }
  }
`

const SparkHost = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;

  svg path {
    stroke: #c9a84a;
    stroke-width: 1.6;
  }
`

function isAddr(v?: string | null): v is string {
  return Boolean(v && /^0x[a-fA-F0-9]{40}$/.test(v))
}

export type YieldActivitySparklineProps = {
  /** Preferred: LP / pair address for factual TVL/price history */
  pairAddress?: string | null
  /** Optional precomputed factual series (TVL / volume / APR). Factual series only. */
  series?: number[] | null
  loading?: boolean
  testId?: string
}

export const YieldActivitySparkline: React.FC<YieldActivitySparklineProps> = ({
  pairAddress,
  series,
  loading = false,
  testId = 'yield-activity-sparkline',
}) => {
  const addr = isAddr(pairAddress) ? pairAddress : undefined
  const suppliedSeries = series !== undefined
  const { chartEntries, status } = useIndexerCandles(addr, '1H', !suppliedSeries)

  const points = useMemo(() => {
    if (series && series.length >= 2) {
      const cleaned = series.filter((n) => Number.isFinite(n) && n >= 0)
      if (cleaned.length >= 2) return cleaned.slice(-24)
    }
    return chartEntries
      .slice(-24)
      .map((c) => c.close)
      .filter((n) => Number.isFinite(n) && n > 0)
  }, [series, chartEntries])

  if (points.length < 2) {
    const sparkState = loading || status === 'loading' ? 'loading' : 'activity'
    return (
      <Wrap
        data-testid={testId}
        data-spark-state={sparkState}
        title={sparkState === 'activity' ? 'Farm active · historical OHLCV not yet indexed' : 'Loading activity'}
      >
        <Baseline aria-hidden data-testid={`${testId}-baseline`} />
      </Wrap>
    )
  }

  return (
    <Wrap data-testid={testId} data-spark-state="live">
      <SparkHost>
        <AnimatedSparkline points={points} width={220} height={36} />
      </SparkHost>
    </Wrap>
  )
}

export default YieldActivitySparkline
