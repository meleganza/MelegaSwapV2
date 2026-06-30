import React from 'react'
import styled from 'styled-components'
import { Card, Flex, Text, Heading } from '@pancakeswap/uikit'
import Link from 'next/link'
import { useTranslation } from '@pancakeswap/localization'
import { StaticEventRecord } from 'registry/events/types'
import EventTypeBadge from './EventTypeBadge'
import EventStatusBadge from './EventStatusBadge'

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

interface EventCardProps {
  event: StaticEventRecord
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { t } = useTranslation()

  return (
    <Link href={`/events/${event.slug}`} passHref legacyBehavior>
      <StyledCard as="a" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
        <Flex flexDirection="column" style={{ gap: '12px' }}>
          <Flex justifyContent="space-between" flexWrap="wrap" style={{ gap: '8px' }}>
            <Heading as="h3" scale="lg" color="secondary">
              {event.displayName}
            </Heading>
            <EventStatusBadge status={event.status} />
          </Flex>
          <Flex flexWrap="wrap" style={{ gap: '8px' }}>
            <EventTypeBadge eventType={event.eventType} />
          </Flex>
          <Text fontSize="12px" color="textSubtle">
            {event.description}
          </Text>
          <Text fontSize="11px" color="textDisabled">
            {t('Recorded at')}: {event.recordedAt}
          </Text>
        </Flex>
      </StyledCard>
    </Link>
  )
}

export default EventCard
