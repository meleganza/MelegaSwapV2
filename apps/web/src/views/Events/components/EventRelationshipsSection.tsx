import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading, Link } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { EventRelationships } from 'registry/events/types'

const Section = styled(Flex)`
  flex-direction: column;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.02);
  gap: 12px;
`

const Mono = styled(Text)`
  font-family: monospace;
  font-size: 12px;
  word-break: break-all;
`

interface EventRelationshipsSectionProps {
  relationships: EventRelationships
}

const EventRelationshipsSection: React.FC<EventRelationshipsSectionProps> = ({ relationships }) => {
  const { t } = useTranslation()

  return (
    <Section>
      <Heading as="h2" scale="md" color="secondary">
        {t('Event relationships')}
      </Heading>

      {relationships.projectSlug && (
        <Flex flexDirection="column" style={{ gap: '4px' }}>
          <Text fontSize="12px" color="textSubtle">
            {t('Project')}:{' '}
            <Link href={`/projects/${relationships.projectSlug}`}>
              <Text as="span" color="primary">
                {relationships.projectSlug}
              </Text>
            </Link>
          </Text>
          {relationships.projectUpi && <Mono color="textDisabled">{relationships.projectUpi}</Mono>}
        </Flex>
      )}

      {relationships.assetSlug && (
        <Flex flexDirection="column" style={{ gap: '4px' }}>
          <Text fontSize="12px" color="textSubtle">
            {t('Asset')}:{' '}
            <Link href={`/assets/${relationships.assetSlug}`}>
              <Text as="span" color="primary">
                {relationships.assetSlug}
              </Text>
            </Link>
          </Text>
          {relationships.assetUai && <Mono color="textDisabled">{relationships.assetUai}</Mono>}
        </Flex>
      )}

      {relationships.venueSlug && (
        <Flex flexDirection="column" style={{ gap: '4px' }}>
          <Text fontSize="12px" color="textSubtle">
            {t('Venue')}:{' '}
            <Link href={`/venues/${relationships.venueSlug}`}>
              <Text as="span" color="primary">
                {relationships.venueSlug}
              </Text>
            </Link>
          </Text>
          {relationships.venueUvi && <Mono color="textDisabled">{relationships.venueUvi}</Mono>}
        </Flex>
      )}

      <Flex flexDirection="column" style={{ gap: '4px' }}>
        <Text fontSize="12px" color="textSubtle">
          {t('Treasury attribution')}: {relationships.treasury.status}
        </Text>
        {relationships.treasury.notes && (
          <Text fontSize="11px" color="textDisabled">
            {relationships.treasury.notes}
          </Text>
        )}
      </Flex>
    </Section>
  )
}

export default EventRelationshipsSection
