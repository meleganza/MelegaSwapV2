import React from 'react'
import styled from 'styled-components'
import { Flex, Heading, Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import Page from 'components/Layout/Page'
import { getAllCollectibles } from 'registry/collectibles/getAllCollectibles'
import CollectibleCard from './components/CollectibleCard'

const Grid = styled(Flex)`
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
`

const Banner = styled(Flex)`
  flex-direction: column;
  padding: 16px 20px;
  border: 1px solid rgba(49, 208, 170, 0.3);
  border-radius: 12px;
  background: rgba(49, 208, 170, 0.06);
  gap: 8px;
  max-width: 720px;
`

const Collectibles: React.FC = () => {
  const { t } = useTranslation()
  const records = getAllCollectibles()

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
            {t('Collectibles page title')}
          </Heading>
          <Text color="textSubtle" textAlign="center" maxWidth="720px">
            {t('Collectibles page subtitle')}
          </Text>
          <Text fontSize="12px" color="textDisabled" textAlign="center" maxWidth="720px">
            {t('Collectibles registry disclaimer')}
          </Text>
        </Flex>

        <Banner>
          <Text fontSize="12px" color="textSubtle" textAlign="center">
            {t('Collectibles framing note')}
          </Text>
        </Banner>

        <Grid width="100%">
          {records.map((record) => (
            <Flex key={record.slug} style={{ flex: '1 1 320px', maxWidth: '400px' }}>
              <CollectibleCard record={record} />
            </Flex>
          ))}
        </Grid>

        <Text fontSize="12px" color="textDisabled" textAlign="center">
          {t('Identity cross link')}:{' '}
          <a href="/identity" style={{ color: 'inherit' }}>
            /identity
          </a>
          {' · '}
          {t('Machine discovery index')}:{' '}
          <a href="/registry/collectibles/index.json" style={{ color: 'inherit' }}>
            /registry/collectibles/index.json
          </a>
          {' · '}
          <a href="/.well-known/melega-dex-collectibles.json" style={{ color: 'inherit' }}>
            /.well-known/melega-dex-collectibles.json
          </a>
        </Text>
      </Flex>
    </Page>
  )
}

export default Collectibles
