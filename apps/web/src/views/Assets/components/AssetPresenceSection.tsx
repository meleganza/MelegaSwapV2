import React from 'react'
import styled from 'styled-components'
import { Flex, Heading, Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { getPresenceByAssetSlug } from 'registry/presence/getPresenceBySlug'
import PresenceCard from 'views/Presence/components/PresenceCard'
import PresenceExploreLink from 'views/Presence/components/PresenceExploreLink'

const Grid = styled(Flex)`
  flex-wrap: wrap;
  gap: 12px;
`

interface AssetPresenceSectionProps {
  assetSlug: string
}

const AssetPresenceSection: React.FC<AssetPresenceSectionProps> = ({ assetSlug }) => {
  const { t } = useTranslation()
  const records = getPresenceByAssetSlug(assetSlug)

  if (!records.length) {
    return <PresenceExploreLink />
  }

  return (
    <Flex flexDirection="column" width="100%" style={{ gap: '16px' }}>
      <Heading as="h2" scale="md" color="secondary">
        {t('Economic presence')}
      </Heading>
      <Text fontSize="12px" color="textSubtle">
        {t('Asset presence intro')}
      </Text>
      <Grid>
        {records.map((record) => (
          <Flex key={record.slug} style={{ flex: '1 1 280px', maxWidth: '360px' }}>
            <PresenceCard record={record} />
          </Flex>
        ))}
      </Grid>
      <PresenceExploreLink />
    </Flex>
  )
}

export default AssetPresenceSection
