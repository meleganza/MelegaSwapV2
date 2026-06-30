import React from 'react'
import styled from 'styled-components'
import { Flex, Heading, Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { getEventsByProjectSlug } from 'registry/events/getEventBySlug'
import EventCard from 'views/Events/components/EventCard'

const Grid = styled(Flex)`
  flex-wrap: wrap;
  gap: 12px;
`

interface ProjectEventsSectionProps {
  projectSlug: string
}

const ProjectEventsSection: React.FC<ProjectEventsSectionProps> = ({ projectSlug }) => {
  const { t } = useTranslation()
  const events = getEventsByProjectSlug(projectSlug)

  if (!events.length) {
    return null
  }

  return (
    <Flex flexDirection="column" width="100%" style={{ gap: '16px' }}>
      <Heading as="h2" scale="md" color="secondary">
        {t('Economic events')}
      </Heading>
      <Text fontSize="12px" color="textSubtle">
        {t('Project events intro')}
      </Text>
      <Grid>
        {events.map((event) => (
          <Flex key={event.slug} style={{ flex: '1 1 280px', maxWidth: '360px' }}>
            <EventCard event={event} />
          </Flex>
        ))}
      </Grid>
      <Text fontSize="12px" color="textDisabled">
        <a href="/events" style={{ color: 'inherit' }}>
          {t('Browse event registry')}
        </a>
      </Text>
    </Flex>
  )
}

export default ProjectEventsSection
