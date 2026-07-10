import React, { useMemo } from 'react'
import styled from 'styled-components'
import { displayStudioMetric, isStudioMetricUnavailable, STUDIO_KPI_VALUE } from 'design-system/melega'
import TradeTechnicalDetails from 'views/Trade/components/TradeTechnicalDetails'
import { useProjectsRuntime } from '../projectsRuntime/ProjectsRuntimeContext'
import { projectsStudioLayout } from '../projectsStudioTokens'
import { PrKpiCard, PrKpiLabel, PrKpiSubline, PrKpiValue } from './projectsStudioPrimitives'

const KPI_IDS = ['indexed', 'live', 'verified', 'holders', 'ai'] as const

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: ${projectsStudioLayout.cardGap};
  min-width: 0;

  @media (max-width: ${projectsStudioLayout.stackBreakpoint}) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: ${projectsStudioLayout.mobileBreakpoint}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

const ValueStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const ProjectsKpiRow: React.FC = () => {
  const { kpis } = useProjectsRuntime()

  const displayKpis = useMemo(() => {
    const map = new Map(kpis.map((k) => [k.id, k]))
    return KPI_IDS.map((id) => map.get(id)).filter(Boolean)
  }, [kpis])

  return (
    <Row data-pr-kpi-row>
      {displayKpis.map((kpi) =>
        kpi ? (
          <PrKpiCard key={kpi.id} data-pr-kpi-card>
            <PrKpiLabel>{kpi.label}</PrKpiLabel>
            {(() => {
              const value = displayStudioMetric(kpi.value)
              const unavailable = isStudioMetricUnavailable(kpi.value)
              const technical =
                kpi.id === 'holders'
                  ? 'Holder count requires BscScan or indexer when deployed.'
                  : 'Project metrics require DEX asset index and registry hydration.'

              if (kpi.subline && !unavailable) {
                return (
                  <ValueStack>
                    <PrKpiValue>{value}</PrKpiValue>
                    <PrKpiSubline>{kpi.subline}</PrKpiSubline>
                  </ValueStack>
                )
              }

              if (unavailable) {
                return (
                  <ValueStack>
                    <PrKpiValue $muted>{value}</PrKpiValue>
                    <TradeTechnicalDetails detail={technical} />
                  </ValueStack>
                )
              }

              return <PrKpiValue style={{ fontVariantNumeric: STUDIO_KPI_VALUE.fontVariantNumeric }}>{value}</PrKpiValue>
            })()}
          </PrKpiCard>
        ) : null,
      )}
    </Row>
  )
}

export default ProjectsKpiRow
