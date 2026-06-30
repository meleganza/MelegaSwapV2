import React from 'react'
import styled from 'styled-components'
import { Flex, Heading, Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import Page from 'components/Layout/Page'
import { getAllEvents } from 'registry/events/getAllEvents'
import EventCard from './components/EventCard'

const Grid = styled(Flex)`
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
`

const Events: React.FC = () => {
  const { t } = useTranslation()
  const events = getAllEvents()

  return (
    <Page>
      <Flex flexDirection="column" alignItems="center" maxWidth="1200px" margin="0 auto" px="16px" style={{ gap: '24px' }}>
        <Flex flexDirection="column" alignItems="center" style={{ gap: '8px' }}>
          <Heading as="h1" scale="xxl" color="secondary" textAlign="center">
            {t('Economic Event Registry')}
          </Heading>
          <Text color="textSubtle" textAlign="center" maxWidth="720px">
            {t('Event registry intro')}
          </Text>
          <Text fontSize="12px" color="textDisabled" textAlign="center" maxWidth="720px">
            {t('Event registry disclaimer')}
          </Text>
        </Flex>

        <Grid width="100%">
          {events.map((event) => (
            <Flex key={event.slug} style={{ flex: '1 1 320px', maxWidth: '400px' }}>
              <EventCard event={event} />
            </Flex>
          ))}
        </Grid>

        <Text fontSize="12px" color="textDisabled" textAlign="center">
          {t('Machine discovery index')}:{' '}
          <a href="/registry/events/index.json" style={{ color: 'inherit' }}>
            /registry/events/index.json
          </a>
        </Text>
      </Flex>
    </Page>
  )
}

export default Events
