import React from 'react'
import styled from 'styled-components'
import { Flex, Heading, Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import Page from 'components/Layout/Page'
import { getAllPresence } from 'registry/presence/getAllPresence'
import CanonicalEconomyBanner from './components/CanonicalEconomyBanner'
import PresenceCard from './components/PresenceCard'

const Grid = styled(Flex)`
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
`

const Presence: React.FC = () => {
  const { t } = useTranslation()
  const records = getAllPresence()

  return (
    <Page>
      <Flex
        flexDirection="column"
        alignItems="center"
        maxWidth="1200px"
        margin="0 auto"
        px="16px"
        style={{ gap: '24px' }}
      >
        <Flex flexDirection="column" alignItems="center" style={{ gap: '8px' }}>
          <Heading as="h1" scale="xxl" color="secondary" textAlign="center">
            {t('Presence page title')}
          </Heading>
          <Text color="textSubtle" textAlign="center" maxWidth="720px">
            {t('Presence page subtitle')}
          </Text>
          <Text fontSize="12px" color="textDisabled" textAlign="center" maxWidth="720px">
            {t('Presence registry disclaimer')}
          </Text>
        </Flex>

        <CanonicalEconomyBanner />

        <Grid width="100%">
          {records.map((record) => (
            <Flex key={record.slug} style={{ flex: '1 1 320px', maxWidth: '400px' }}>
              <PresenceCard record={record} />
            </Flex>
          ))}
        </Grid>

        <Text fontSize="12px" color="textDisabled" textAlign="center">
          {t('Machine discovery index')}:{' '}
          <a href="/registry/presence/index.json" style={{ color: 'inherit' }}>
            /registry/presence/index.json
          </a>
          {' · '}
          <a href="/.well-known/melega-dex-presence.json" style={{ color: 'inherit' }}>
            /.well-known/melega-dex-presence.json
          </a>
        </Text>
      </Flex>
    </Page>
  )
}

export default Presence
