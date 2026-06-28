import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { resolveEconomicGraph } from 'registry/graph/resolveGraph'
import { useCommandTranslation } from '../useCommandTranslation'
import { cmd } from '../tokens'
import { Panel, PanelTitle, PanelAction } from '../styles'

const Sparkline = styled.svg`
  width: 100%;
  height: 28px;
  margin-top: 6px;
  opacity: 0.55;

  polyline {
    fill: none;
    stroke: ${cmd.gold};
    stroke-width: 1.5;
  }
`

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`

const StatCard = styled.div`
  padding: 12px;
  border-radius: ${cmd.radiusSm};
  border: 1px solid ${cmd.border};
  background: rgba(0, 0, 0, 0.35);
`

const StatLabel = styled.div`
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${cmd.textSecondary};
  margin-bottom: 4px;
`

const StatValue = styled.div`
  font-family: ${cmd.fontDisplay};
  font-size: 20px;
  font-weight: 600;
  color: ${cmd.text};
`

const GraphNodesRow = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${cmd.border};
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: ${cmd.textSecondary};

  strong {
    color: ${cmd.text};
    font-family: ${cmd.fontDisplay};
  }
`

const SPARK_POINTS = '2,22 12,18 22,20 32,12 42,14 52,8 62,10 72,6'

const EconomicIntelligencePanel: React.FC = () => {
  const { t } = useCommandTranslation()
  const graph = resolveEconomicGraph()
  const nodeCount =
    graph.summary.projectCount +
    graph.summary.assetCount +
    graph.summary.venueCount +
    graph.summary.eventCount

  const stats = [
    { label: t('CMD stat projects'), value: graph.summary.projectCount },
    { label: t('CMD stat assets'), value: graph.summary.assetCount },
    { label: t('CMD stat venues'), value: graph.summary.venueCount },
    { label: t('CMD stat events'), value: graph.summary.eventCount },
  ]

  return (
    <Panel>
      <PanelTitle>{t('CMD intelligence title')}</PanelTitle>
      <StatGrid>
        {stats.map((stat) => (
          <StatCard key={stat.label}>
            <StatLabel>{stat.label}</StatLabel>
            <StatValue>{stat.value}</StatValue>
            <Sparkline viewBox="0 0 74 28" aria-hidden>
              <polyline points={SPARK_POINTS} />
            </Sparkline>
          </StatCard>
        ))}
      </StatGrid>
      <GraphNodesRow>
        <span>{t('CMD graph nodes')}</span>
        <strong>{nodeCount}</strong>
      </GraphNodesRow>
      <Link href="/graph" passHref legacyBehavior>
        <PanelAction>
          {t('CMD explore graph')}
          <span>→</span>
        </PanelAction>
      </Link>
    </Panel>
  )
}

export default EconomicIntelligencePanel
