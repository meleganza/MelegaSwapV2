import React from 'react'
import styled from 'styled-components'
import { Flex, Heading, Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import Page from 'components/Layout/Page'
import { getAllVenues } from 'registry/venues/getAllVenues'
import VenueCard from './components/VenueCard'

const Grid = styled(Flex)`
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
`

const Venues: React.FC = () => {
  const { t } = useTranslation()
  const venues = getAllVenues()

  return (
    <Page>
      <Flex flexDirection="column" alignItems="center" maxWidth="1200px" margin="0 auto" px="16px" style={{ gap: '24px' }}>
        <Flex flexDirection="column" alignItems="center" style={{ gap: '8px' }}>
          <Heading as="h1" scale="xxl" color="secondary" textAlign="center">
            {t('Economic Venue Registry')}
          </Heading>
          <Text color="textSubtle" textAlign="center" maxWidth="720px">
            {t('Venue registry intro')}
          </Text>
          <Text fontSize="12px" color="textDisabled" textAlign="center" maxWidth="720px">
            {t('Venue registry disclaimer')}
          </Text>
        </Flex>

        <Grid width="100%">
          {venues.map((venue) => (
            <Flex key={venue.slug} style={{ flex: '1 1 320px', maxWidth: '400px' }}>
              <VenueCard venue={venue} />
            </Flex>
          ))}
        </Grid>

        <Text fontSize="12px" color="textDisabled" textAlign="center">
          {t('Machine discovery index')}:{' '}
          <a href="/registry/venues/index.json" style={{ color: 'inherit' }}>
            /registry/venues/index.json
          </a>
        </Text>
      </Flex>
    </Page>
  )
}

export default Venues
