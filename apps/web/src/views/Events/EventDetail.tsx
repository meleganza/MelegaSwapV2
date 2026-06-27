import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { CHAIN_LABELS } from 'registry/assets/constants'
import { StaticEventRecord } from 'registry/events/types'
import EventTypeBadge from './components/EventTypeBadge'
import EventStatusBadge from './components/EventStatusBadge'
import EventRelationshipsSection from './components/EventRelationshipsSection'
import EventManifestViewer from './components/EventManifestViewer'
import GraphExploreLink from 'views/Graph/components/GraphExploreLink'

const Stack = styled(Flex)`
  flex-direction: column;
  gap: 24px;
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
`

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

interface EventDetailProps {
  event: StaticEventRecord
  manifest: Record<string, unknown>
}

const EventDetail: React.FC<EventDetailProps> = ({ event, manifest }) => {
  const { t } = useTranslation()

  return (
    <Stack px="16px">
      <Flex flexDirection="column" style={{ gap: '8px' }}>
        <Heading as="h1" scale="xxl" color="secondary">
          {event.displayName}
        </Heading>
        <Text color="textSubtle">{event.description}</Text>
        <Flex flexWrap="wrap" style={{ gap: '8px' }}>
          <EventTypeBadge eventType={event.eventType} />
          <EventStatusBadge status={event.status} />
        </Flex>
      </Flex>

      <Section>
        <Heading as="h2" scale="md" color="secondary">
          {t('Canonical event identity')}
        </Heading>
        <Mono color="text">{event.uei}</Mono>
        <Text fontSize="12px" color="textSubtle">
          {t('Recorded at')}: {event.recordedAt}
        </Text>
        {event.chainId && (
          <Text fontSize="12px" color="textSubtle">
            {CHAIN_LABELS[event.chainId] ?? `Chain ${event.chainId}`}
          </Text>
        )}
      </Section>

      <EventRelationshipsSection relationships={event.relationships} />

      <Section>
        <Heading as="h2" scale="md" color="secondary">
          {t('Event provenance')}
        </Heading>
        <Text fontSize="12px" color="textSubtle">
          {t('Derived from')}: {event.provenance.derivedFrom}
        </Text>
        {event.provenance.registryRef && (
          <Text fontSize="12px" color="textSubtle">
            {t('Registry ref')}: {event.provenance.registryRef}
          </Text>
        )}
        {event.provenance.notes && (
          <Text fontSize="11px" color="textDisabled">
            {event.provenance.notes}
          </Text>
        )}
      </Section>

      <EventManifestViewer manifest={manifest} slug={event.slug} />

      <GraphExploreLink />

      <Text fontSize="12px" color="textDisabled" textAlign="center">
        {event.disclaimer}
      </Text>
    </Stack>
  )
}

export default EventDetail
