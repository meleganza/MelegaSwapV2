import React from 'react'
import styled from 'styled-components'
import { Flex, Heading, Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { getVenuesByAssetSlug } from 'registry/venues/getVenueBySlug'
import VenueCard from 'views/Venues/components/VenueCard'

const Grid = styled(Flex)`
  flex-wrap: wrap;
  gap: 12px;
`

interface AssetVenuesSectionProps {
  assetSlug: string
}

const AssetVenuesSection: React.FC<AssetVenuesSectionProps> = ({ assetSlug }) => {
  const { t } = useTranslation()
  const venues = getVenuesByAssetSlug(assetSlug)

  if (!venues.length) {
    return null
  }

  return (
    <Flex flexDirection="column" width="100%" style={{ gap: '16px' }}>
      <Heading as="h2" scale="md" color="secondary">
        {t('Linked economic venues')}
      </Heading>
      <Text fontSize="12px" color="textSubtle">
        {t('Asset venues intro')}
      </Text>
      <Grid>
        {venues.map((venue) => (
          <Flex key={venue.slug} style={{ flex: '1 1 280px', maxWidth: '360px' }}>
            <VenueCard venue={venue} />
          </Flex>
        ))}
      </Grid>
      <Text fontSize="12px" color="textDisabled">
        <a href="/venues" style={{ color: 'inherit' }}>
          {t('Browse venue registry')}
        </a>
      </Text>
    </Flex>
  )
}

export default AssetVenuesSection
