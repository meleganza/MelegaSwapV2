import React from 'react'
import styled from 'styled-components'
import { Card, Flex, Text, Heading } from '@pancakeswap/uikit'
import Link from 'next/link'
import { useTranslation } from '@pancakeswap/localization'
import {
  DISCOVERY_CAPABILITY_CHIPS,
  DISCOVERY_CHAIN_CHIPS,
  EnrichedProjectRecord,
  getLiveCapabilityKeys,
} from 'registry/projects/discovery'
import ProjectTrustBadge from './ProjectTrustBadge'
import CapabilityChip from './CapabilityChip'
import ChainChip from './ChainChip'

const StyledCard = styled(Card)`
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  padding: 20px;
  height: 100%;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: rgba(49, 208, 170, 0.4);
  }
`

const ChipRow = styled(Flex)`
  flex-wrap: wrap;
  gap: 6px;
`

interface DiscoveryProjectCardProps {
  project: EnrichedProjectRecord
}

const DiscoveryProjectCard: React.FC<DiscoveryProjectCardProps> = ({ project }) => {
  const { t } = useTranslation()
  const liveCapabilities = getLiveCapabilityKeys(project)
  const capabilityLabels = DISCOVERY_CAPABILITY_CHIPS.filter((chip) =>
    liveCapabilities.includes(chip.key),
  )

  return (
    <Link href={`/projects/${project.slug}`} passHref legacyBehavior>
      <StyledCard as="a" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
        <Flex flexDirection="column" style={{ gap: '12px' }}>
          <Flex justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" style={{ gap: '8px' }}>
            <Heading as="h3" scale="lg" color="secondary">
              {project.displayName}
            </Heading>
            <Text fontSize="12px" color="textSubtle">
              {t('Civilization Readiness')}: {project.civilizationReadiness}%
            </Text>
          </Flex>

          {project.tagline && (
            <Text fontSize="14px" color="textSubtle">
              {project.tagline}
            </Text>
          )}

          {project.tickers.length > 0 && (
            <Text fontSize="12px" color="textDisabled">
              {t('Tickers')}: {project.tickers.join(' · ')}
            </Text>
          )}

          <ProjectTrustBadge badges={project.trustBadges} />

          <ChipRow>
            {DISCOVERY_CHAIN_CHIPS.filter((chain) => project.supportedChains.includes(chain.chainId)).map(
              (chain) => (
                <ChainChip key={chain.chainId} chainId={chain.chainId} label={chain.label} readOnly />
              ),
            )}
          </ChipRow>

          {capabilityLabels.length > 0 && (
            <ChipRow>
              {capabilityLabels.map((chip) => (
                <CapabilityChip
                  key={chip.key}
                  capabilityKey={chip.key}
                  label={chip.label}
                  readOnly
                  active
                />
              ))}
            </ChipRow>
          )}

          <Text fontSize="11px" color="textDisabled">
            {t('Capability completeness')}: {project.capabilityCompleteness}% · {project.sectorTags.join(' · ')}
          </Text>
        </Flex>
      </StyledCard>
    </Link>
  )
}

export default DiscoveryProjectCard
