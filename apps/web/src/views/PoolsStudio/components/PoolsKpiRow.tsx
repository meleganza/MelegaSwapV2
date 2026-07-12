import React from 'react'
import styled from 'styled-components'
import { formatCompactDisplay, STUDIO_KPI_VALUE, displayStudioMetric } from 'design-system/melega'
import { RUNTIME_UNAVAILABLE_LABEL } from 'lib/runtime-truth'
import { isForbiddenAprDisplay } from '../poolsRuntime/poolsAprRules'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 198px);
  gap: 16px;
  min-width: 0;

  @media (max-width: 1099px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 767px) {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    gap: 12px;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`

const KpiCard = styled.div`
  width: 198px;
  height: 112px;
  min-height: 112px;
  max-height: 112px;
  padding: 18px 0 0 20px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: #141414;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  overflow: hidden;
  transition: border-color 180ms ease;

  &:hover {
    border-color: rgba(242, 201, 76, 0.28);
  }

  @media (max-width: 767px) {
    width: 170px;
    min-width: 170px;
    flex-shrink: 0;
  }
`

const KpiIcon = styled.span`
  display: block;
  width: 16px;
  height: 16px;
  font-size: 16px;
  line-height: 16px;
  opacity: 0.4;
  color: #ffffff;
`

const KpiLabel = styled.span`
  font-family: Inter, sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.56);
  line-height: 1.2;
`

const KpiValue = styled.span<{ $green?: boolean; $center?: boolean }>`
  font-family: Inter, sans-serif;
  font-size: ${STUDIO_KPI_VALUE.size};
  font-weight: ${STUDIO_KPI_VALUE.weight};
  line-height: ${STUDIO_KPI_VALUE.lineHeight};
  font-variant-numeric: ${STUDIO_KPI_VALUE.fontVariantNumeric};
  color: ${({ $green }) => ($green ? '#00d97e' : '#ffffff')};
  white-space: nowrap;
  text-align: ${({ $center }) => ($center ? 'center' : 'left')};
`

const KpiSecondary = styled.span`
  display: block;
  font-family: Inter, sans-serif;
  font-size: 16px;
  line-height: 1.2;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
`

const KPI_LABELS: Record<string, string> = {
  tvl: 'Total Value Locked',
  active: 'Pools Discovered',
  budget: 'Pools Rewarding',
  highestApr: 'Highest Sustainable APR',
  featured: 'Featured Pool',
}

const KPI_ICONS: Record<string, string> = {
  tvl: '◆',
  active: '◎',
  budget: '↗',
  highestApr: '★',
  featured: '◇',
}

function formatKpiValue(id: string, value: string): string {
  const normalized = displayStudioMetric(value)
  if (id === 'budget' || id === 'active') return normalized
  return formatCompactDisplay(normalized)
}

export const PoolsKpiRow: React.FC = () => {
  const { kpis, loadingLabel } = usePoolsRuntime()

  return (
    <Row data-ps-kpi-row>
      {loadingLabel ? (
        <KpiCard data-ps-kpi-card>
          <KpiLabel>{loadingLabel}</KpiLabel>
        </KpiCard>
      ) : (
        kpis.map((kpi) => {
          const label = KPI_LABELS[kpi.id] ?? kpi.label
          const isFeaturedEmpty = kpi.id === 'featured' && !kpi.green
          const isUnavailableApr =
            kpi.id === 'highestApr' &&
            (kpi.value === RUNTIME_UNAVAILABLE_LABEL || isForbiddenAprDisplay(kpi.value))

          return (
            <KpiCard key={kpi.id} data-ps-kpi-card>
              <KpiIcon aria-hidden>{KPI_ICONS[kpi.id] ?? '•'}</KpiIcon>
              <KpiLabel>{label}</KpiLabel>
              {isFeaturedEmpty ? (
                <KpiSecondary data-ps-kpi-value>{RUNTIME_UNAVAILABLE_LABEL}</KpiSecondary>
              ) : kpi.id === 'featured' ? (
                <>
                  <KpiValue data-ps-kpi-value>{kpi.value}</KpiValue>
                  {kpi.secondary ? <KpiSecondary>{kpi.secondary}</KpiSecondary> : null}
                </>
              ) : (
                <>
                  <KpiValue
                    $green={kpi.green && !isUnavailableApr}
                    $center={isUnavailableApr}
                    data-ps-kpi-value
                  >
                    {isUnavailableApr ? RUNTIME_UNAVAILABLE_LABEL : formatKpiValue(kpi.id, kpi.value)}
                  </KpiValue>
                  {kpi.secondary ? <KpiSecondary>{kpi.secondary}</KpiSecondary> : null}
                </>
              )}
            </KpiCard>
          )
        })
      )}
    </Row>
  )
}

export default PoolsKpiRow
