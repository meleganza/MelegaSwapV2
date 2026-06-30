import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { DiscoverySummary } from 'registry/projects/discovery'

const Card = styled(Flex)`
  flex-direction: column;
  padding: 20px;
  border: 1px solid rgba(49, 208, 170, 0.2);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.02);
  gap: 12px;
  width: 100%;
`

const Grid = styled(Flex)`
  flex-wrap: wrap;
  gap: 16px;
`

const Stat = styled(Flex)`
  flex-direction: column;
  flex: 1 1 140px;
  min-width: 120px;
  gap: 4px;
`

interface DiscoverySummaryPanelProps {
  summary: DiscoverySummary
}

const DiscoverySummaryPanel: React.FC<DiscoverySummaryPanelProps> = ({ summary }) => {
  const { t } = useTranslation()

  const stats = [
    { label: t('Projects'), value: summary.matchingProjects, hint: t('Discovery matching of total', { count: summary.matchingProjects, total: summary.totalProjects }) },
    { label: t('Capabilities'), value: summary.liveCapabilityTypes, hint: t('Discovery live capability types') },
    { label: t('Chains'), value: summary.uniqueChains, hint: t('Discovery unique chains') },
    { label: t('Machine-ready Projects'), value: summary.machineReadyProjects, hint: t('Discovery machine ready hint') },
    { label: t('Treasury-compatible Projects'), value: summary.treasuryCompatibleProjects, hint: t('Discovery treasury hint') },
  ]

  return (
    <Card>
      <Heading as="h2" scale="md" color="secondary">
        {t('Discovery summary')}
      </Heading>
      <Text fontSize="12px" color="textSubtle">
        {t('Discovery summary disclaimer')}
      </Text>
      <Grid>
        {stats.map((stat) => (
          <Stat key={stat.label}>
            <Text fontSize="12px" color="textSubtle">
              {stat.label}
            </Text>
            <Text fontSize="24px" color="secondary" fontWeight={600}>
              {stat.value}
            </Text>
            <Text fontSize="11px" color="textDisabled">
              {stat.hint}
            </Text>
          </Stat>
        ))}
      </Grid>
    </Card>
  )
}

export default DiscoverySummaryPanel
