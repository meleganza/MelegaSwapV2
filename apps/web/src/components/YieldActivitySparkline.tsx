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
  width: 100%;
  height: 2px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
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
  testId?: string
}

export const YieldActivitySparkline: React.FC<YieldActivitySparklineProps> = ({
  pairAddress,
  series,
  testId = 'yield-activity-sparkline',
}) => {
  const addr = isAddr(pairAddress) ? pairAddress : undefined
  const { chartEntries, status } = useIndexerCandles(addr, '1H')

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
    return (
      <Wrap data-testid={testId} data-spark-state={status === 'loading' ? 'loading' : 'baseline'}>
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
