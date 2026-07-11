import React from 'react'
import styled from 'styled-components'
import { formatCompactDisplay } from 'design-system/melega'
import { RUNTIME_UNAVAILABLE_LABEL } from 'lib/runtime-truth'
import TradeTechnicalDetails from 'views/Trade/components/TradeTechnicalDetails'
import { farmsStudioColors, farmsStudioLayout } from '../farmsStudioTokens'
import {
  isUnavailableFarmMetric,
  MARCO_EMITS_TODAY_LABEL,
  MARCO_EMISSION_UNAVAILABLE_REASON,
  stripTokenSymbol,
} from '../farmsStudioDisplay'
import { useFarmsRuntime } from '../farmsRuntime/FarmsRuntimeContext'
import { FsKpiCard, FsKpiDelta, FsKpiLabel, FsKpiValue } from './farmsStudioPrimitives'

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: ${farmsStudioLayout.kpiGap};
  min-width: 0;

  @media (max-width: 1099px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 767px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

const ValueBlock = styled.div<{ $hasSparkline?: boolean }>`
  position: relative;
  min-height: 38px;
  padding-right: ${({ $hasSparkline }) =>
    $hasSparkline ? farmsStudioLayout.sparklineW + Number.parseInt(farmsStudioLayout.kpiSparkGap, 10) : 0}px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
`

const ValueRow = styled.div`
  display: flex;
  align-items: baseline;
  min-width: 0;
  flex: 1;
  gap: 8px;
`

const Sparkline = styled.svg`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: ${farmsStudioLayout.sparklineW}px;
  height: ${farmsStudioLayout.sparklineH}px;
`

const LoadingLine = styled.span`
  font-size: 12px;
  color: ${farmsStudioColors.muted};
`

function MiniSparkline({ points }: { points: number[] }) {
  if (!points.length) return null
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const w = farmsStudioLayout.sparklineW
  const h = farmsStudioLayout.sparklineH
  const denom = Math.max(points.length - 1, 1)
  const d = points
    .map((p, i) => {
      const x = (i / denom) * w
      const y = h - ((p - min) / range) * (h - 2) - 1
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <Sparkline viewBox={`0 0 ${w} ${h}`} data-fs-sparkline aria-hidden>
      <path d={d} fill="none" stroke="#00E676" strokeWidth="1.5" strokeLinecap="round" />
    </Sparkline>
  )
}

function formatKpiDisplayValue(id: string, raw: string, gold?: boolean): string {
  if (isUnavailableFarmMetric(raw)) return RUNTIME_UNAVAILABLE_LABEL
  if (id === 'rewards') return formatCompactDisplay(stripTokenSymbol(raw))
  if (gold) return raw
  return formatCompactDisplay(raw)
}

export const FarmsKpiRow: React.FC = () => {
  const { kpis, loadingLabel, featured } = useFarmsRuntime()
  const sparkline = featured.sparkline

  return (
    <Row data-fs-kpi-row>
      {loadingLabel ? (
        <FsKpiCard data-fs-kpi-card>
          <LoadingLine>{loadingLabel}</LoadingLine>
        </FsKpiCard>
      ) : (
        kpis.map((kpi) => {
          const label = kpi.id === 'rewards' ? MARCO_EMITS_TODAY_LABEL : kpi.label
          const displayValue = formatKpiDisplayValue(kpi.id, kpi.value, kpi.gold)
          const emissionUnavailable = kpi.id === 'rewards' && displayValue === RUNTIME_UNAVAILABLE_LABEL

          return (
            <FsKpiCard key={kpi.id} data-fs-kpi-card>
              <FsKpiLabel>{label}</FsKpiLabel>
              <ValueBlock $hasSparkline={kpi.id === 'tvl' && sparkline.length > 0}>
                <ValueRow>
                  <FsKpiValue $gold={kpi.gold} data-fs-kpi-value>
                    {displayValue}
                  </FsKpiValue>
                  {kpi.delta ? <FsKpiDelta $positive={kpi.deltaPositive}>{kpi.delta}</FsKpiDelta> : null}
                </ValueRow>
                {emissionUnavailable ? (
                  <TradeTechnicalDetails detail={MARCO_EMISSION_UNAVAILABLE_REASON} />
                ) : null}
                {kpi.id === 'tvl' && sparkline.length > 0 ? <MiniSparkline points={sparkline} /> : null}
              </ValueBlock>
            </FsKpiCard>
          )
        })
      )}
    </Row>
  )
}

export default FarmsKpiRow
