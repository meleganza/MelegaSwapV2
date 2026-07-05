import React, { useMemo } from 'react'
import styled from 'styled-components'
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
            {kpi.subline ? (
              <ValueStack>
                <PrKpiValue $muted={kpi.value === '—'}>{kpi.value}</PrKpiValue>
                <PrKpiSubline>{kpi.subline}</PrKpiSubline>
              </ValueStack>
            ) : kpi.value === 'Unavailable' || kpi.value === '—' ? (
              <ValueStack>
                <PrKpiValue $muted>—</PrKpiValue>
                <PrKpiSubline>
                  {kpi.id === 'holders' ? 'Waiting for explorer' : kpi.subline ?? 'Waiting for indexing'}
                </PrKpiSubline>
              </ValueStack>
            ) : (
              <PrKpiValue>{kpi.value}</PrKpiValue>
            )}
          </PrKpiCard>
        ) : null,
      )}
    </Row>
  )
}

export default ProjectsKpiRow
