import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { StaticProjectRecord } from 'registry/projects/types'
import { getConnectedChainLabels, mapCapabilityToDisplayStatus } from 'registry/projects/intelligence'
import { CAPABILITY_LABELS } from 'registry/projects/constants'
import ProjectTrustBadge from './ProjectTrustBadge'
import CapabilityStatus from './CapabilityStatus'
import ProjectCapabilityMatrix from './ProjectCapabilityMatrix'

const Card = styled(Flex)`
  flex-direction: column;
  padding: 24px;
  border: 1px solid rgba(49, 208, 170, 0.25);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.03);
  gap: 20px;
`

const Section = styled(Flex)`
  flex-direction: column;
  gap: 8px;
`

const Row = styled(Flex)`
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  min-height: 44px;
`

const Mono = styled(Text)`
  font-family: monospace;
  font-size: 12px;
  word-break: break-all;
`

interface ProjectIntelligenceCardProps {
  project: StaticProjectRecord
}

const ProjectIntelligenceCard: React.FC<ProjectIntelligenceCardProps> = ({ project }) => {
  const { t } = useTranslation()
  const chains = getConnectedChainLabels(project)
  const { capabilities } = project

  return (
    <Card>
      <Flex justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" style={{ gap: '12px' }}>
        <Heading as="h2" scale="lg" color="secondary">
          {t('Project intelligence')}
        </Heading>
        <Text fontSize="12px" color="textSubtle">
          {t('Intelligence static label')}
        </Text>
      </Flex>

      <Section>
        <Text fontSize="14px" color="secondary" fontWeight={600}>
          {t('Canonical identity')}
        </Text>
        <Mono color="text">{project.upi}</Mono>
        {project.isCanonical && (
          <Text fontSize="12px" color="textSubtle">
            {t('Canonical project tooltip')}
          </Text>
        )}
      </Section>

      <Section>
        <Text fontSize="14px" color="secondary" fontWeight={600}>
          {t('Trust status')}
        </Text>
        <ProjectTrustBadge badges={project.trustBadges} />
        <Text fontSize="12px" color="textDisabled">
          {t('Verification status')}: {project.verificationStatus} · {t('Risk tier')}: {project.riskTier}
        </Text>
      </Section>

      <Section>
        <Text fontSize="14px" color="secondary" fontWeight={600} mb="8px">
          {t('Connected chains')}
        </Text>
        <Row>
          {chains.map((chain) => (
            <CapabilityStatus key={chain} status="connected" label={chain} />
          ))}
        </Row>
      </Section>

      <Section>
        <Text fontSize="14px" color="secondary" fontWeight={600} mb="8px">
          {t('Assets')}
        </Text>
        <Text fontSize="12px" color="textSubtle">
          {t('%count% linked tokens', { count: project.resources.tokens.length })}
        </Text>
        <Row>
          {project.resources.tokens.map((token) => (
            <CapabilityStatus key={token.ref} status="observed" label={token.symbol} notes={token.ref} />
          ))}
        </Row>
      </Section>

      <Section>
        <Text fontSize="14px" color="secondary" fontWeight={600} mb="8px">
          {t('Ecosystem surfaces')}
        </Text>
        <Row>
          <CapabilityStatus
            status={mapCapabilityToDisplayStatus(capabilities.treasuryCompatible.status)}
            label={t(CAPABILITY_LABELS.treasuryCompatible)}
            notes={capabilities.treasuryCompatible.notes}
          />
          <CapabilityStatus
            status={mapCapabilityToDisplayStatus(capabilities.radar.status)}
            label={t(CAPABILITY_LABELS.radar)}
            notes={capabilities.radar.notes}
          />
          <CapabilityStatus
            status={mapCapabilityToDisplayStatus(capabilities.smartdrop.status)}
            label={t(CAPABILITY_LABELS.smartdrop)}
            notes={capabilities.smartdrop.notes}
          />
          <CapabilityStatus
            status={mapCapabilityToDisplayStatus(capabilities.space.status)}
            label={t(CAPABILITY_LABELS.space)}
            notes={capabilities.space.notes}
          />
          <CapabilityStatus
            status={mapCapabilityToDisplayStatus(capabilities.labs.status)}
            label={t(CAPABILITY_LABELS.labs)}
            notes={capabilities.labs.notes}
          />
        </Row>
      </Section>

      <ProjectCapabilityMatrix capabilities={capabilities} />
    </Card>
  )
}

export default ProjectIntelligenceCard
