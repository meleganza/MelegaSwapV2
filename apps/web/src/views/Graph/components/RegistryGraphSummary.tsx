import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { RegistryGraphSummary } from 'registry/graph/types'

const Grid = styled(Flex)`
  flex-wrap: wrap;
  gap: 12px;
`

const Cell = styled(Flex)`
  flex-direction: column;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  flex: 1 1 140px;
  gap: 4px;
`

interface RegistryGraphSummaryProps {
  summary: RegistryGraphSummary
}

const RegistryGraphSummaryView: React.FC<RegistryGraphSummaryProps> = ({ summary }) => {
  const { t } = useTranslation()

  const items = [
    { label: t('Projects'), value: summary.projectCount },
    { label: t('Assets'), value: summary.assetCount },
    { label: t('Venues'), value: summary.venueCount },
    { label: t('Events'), value: summary.eventCount },
    { label: t('Graph edges'), value: summary.edgeCount },
    { label: t('Linked edges'), value: summary.linkedEdgeCount },
    { label: t('Not indexed'), value: summary.notIndexedEdgeCount },
  ]

  return (
    <Flex flexDirection="column" style={{ gap: '16px' }}>
      <Heading as="h2" scale="md" color="secondary">
        {t('Registry graph summary')}
      </Heading>
      <Text fontSize="12px" color="textSubtle">
        {t('Primary project')}: {summary.primaryProjectSlug}
      </Text>
      <Grid>
        {items.map((item) => (
          <Cell key={item.label}>
            <Text fontSize="11px" color="textDisabled">
              {item.label}
            </Text>
            <Text fontSize="20px" fontWeight={600} color="secondary">
              {item.value}
            </Text>
          </Cell>
        ))}
      </Grid>
    </Flex>
  )
}

export default RegistryGraphSummaryView
