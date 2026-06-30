import React from 'react'
import styled from 'styled-components'
import { Flex } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import Page from 'components/Layout/Page'
import { getAllAssets } from 'registry/assets/getAllAssets'
import { HumanPageHeader } from 'views/HumanCore'
import { EconomicAiLayer, EconomicManifestLink } from 'views/EconomicOS/components'
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
      <Flex flexDirection="column" maxWidth="1400px" margin="0 auto" px="16px" style={{ gap: '28px' }}>
        <HumanPageHeader
          title="Assets"
          subtitle="Canonical and indexed assets across the Melega civilization."
          primaryAction={{ href: '/projects', label: 'Explore projects' }}
        />

        <Grid width="100%">
          {assets.map((asset) => (
            <Flex key={asset.slug} style={{ flex: '1 1 320px', maxWidth: '400px' }}>
              <AssetCard asset={asset} />
            </Flex>
          ))}
        </Grid>

        <EconomicAiLayer title={t('Machine discovery index')}>
          <EconomicManifestLink manifests={[{ label: 'Asset registry', uri: '/registry/assets/index.json' }]} />
        </EconomicAiLayer>
      </Flex>
    </Page>
  )
}

export default Assets
