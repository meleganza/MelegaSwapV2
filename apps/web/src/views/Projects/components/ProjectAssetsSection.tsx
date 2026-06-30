import React from 'react'
import styled from 'styled-components'
import { Flex, Heading, Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { getAssetsByProjectSlug } from 'registry/assets/getAssetBySlug'
import AssetCard from 'views/Assets/components/AssetCard'

const Grid = styled(Flex)`
  flex-wrap: wrap;
  gap: 12px;
`

interface ProjectAssetsSectionProps {
  projectSlug: string
}

const ProjectAssetsSection: React.FC<ProjectAssetsSectionProps> = ({ projectSlug }) => {
  const { t } = useTranslation()
  const assets = getAssetsByProjectSlug(projectSlug)

  if (!assets.length) {
    return null
  }

  return (
    <Flex flexDirection="column" width="100%" style={{ gap: '16px' }}>
      <Heading as="h2" scale="md" color="secondary">
        {t('Registered assets')}
      </Heading>
      <Text fontSize="12px" color="textSubtle">
        {t('Project assets intro')}
      </Text>
      <Grid>
        {assets.map((asset) => (
          <Flex key={asset.slug} style={{ flex: '1 1 280px', maxWidth: '360px' }}>
            <AssetCard asset={asset} />
          </Flex>
        ))}
      </Grid>
      <Text fontSize="12px" color="textDisabled">
        <a href="/assets" style={{ color: 'inherit' }}>
          {t('Browse asset registry')}
        </a>
      </Text>
    </Flex>
  )
}

export default ProjectAssetsSection
