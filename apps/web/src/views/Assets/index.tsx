import React from 'react'
import styled from 'styled-components'
import { Flex, Heading, Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import Page from 'components/Layout/Page'
import { getAllAssets } from 'registry/assets/getAllAssets'
import AssetCard from './components/AssetCard'

const Grid = styled(Flex)`
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
`

const Assets: React.FC = () => {
  const { t } = useTranslation()
  const assets = getAllAssets()

  return (
    <Page>
      <Flex flexDirection="column" alignItems="center" maxWidth="1200px" margin="0 auto" px="16px" style={{ gap: '24px' }}>
        <Flex flexDirection="column" alignItems="center" style={{ gap: '8px' }}>
          <Heading as="h1" scale="xxl" color="secondary" textAlign="center">
            {t('Asset Registry')}
          </Heading>
          <Text color="textSubtle" textAlign="center" maxWidth="720px">
            {t('Asset registry intro')}
          </Text>
          <Text fontSize="12px" color="textDisabled" textAlign="center" maxWidth="720px">
            {t('Asset registry disclaimer')}
          </Text>
        </Flex>

        <Grid width="100%">
          {assets.map((asset) => (
            <Flex key={asset.slug} style={{ flex: '1 1 320px', maxWidth: '400px' }}>
              <AssetCard asset={asset} />
            </Flex>
          ))}
        </Grid>

        <Text fontSize="12px" color="textDisabled" textAlign="center">
          {t('Machine discovery index')}:{' '}
          <a href="/registry/assets/index.json" style={{ color: 'inherit' }}>
            /registry/assets/index.json
          </a>
        </Text>
      </Flex>
    </Page>
  )
}

export default Assets
