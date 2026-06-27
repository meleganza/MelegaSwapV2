import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { ProjectHealthMetrics } from 'registry/projects/intelligence'
import CapabilityStatus from './CapabilityStatus'

const Card = styled(Flex)`
  flex-direction: column;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.02);
  gap: 12px;
`

const Row = styled(Flex)`
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 44px;
`

interface ProjectHealthSummaryProps {
  health: ProjectHealthMetrics
}

const ProjectHealthSummary: React.FC<ProjectHealthSummaryProps> = ({ health }) => {
  const { t } = useTranslation()

  return (
    <Card>
      <Heading as="h2" scale="md" color="secondary">
        {t('Project health summary')}
      </Heading>
      <Text fontSize="12px" color="textSubtle" mb="8px">
        {t('Health summary disclaimer')}
      </Text>
      <Row>
        <Text color="text">{t('Identity completeness')}</Text>
        <Text color="secondary" fontWeight={600}>
          {health.identityCompleteness}%
        </Text>
      </Row>
      <Row>
        <Text color="text">{t('Capability completeness')}</Text>
        <Text color="secondary" fontWeight={600}>
          {health.capabilityCompleteness}%
        </Text>
      </Row>
      <Row>
        <Text color="text">{t('Machine manifest availability')}</Text>
        <CapabilityStatus status={health.machineManifestAvailable ? 'live' : 'unavailable'} />
      </Row>
      <Row>
        <Text color="text">{t('Observability readiness')}</Text>
        <CapabilityStatus
          status={health.observabilityReadiness}
          notes={t('Observability planned tooltip')}
        />
      </Row>
      <Row>
        <Text color="text">{t('Treasury compatibility')}</Text>
        <CapabilityStatus status={health.treasuryCompatibility} />
      </Row>
    </Card>
  )
}

export default ProjectHealthSummary
