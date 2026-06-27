import React from 'react'
import styled from 'styled-components'
import { Card, Flex, Text, Heading } from '@pancakeswap/uikit'
import Link from 'next/link'
import { useTranslation } from '@pancakeswap/localization'
import { CHAIN_LABELS } from 'registry/venues/constants'
import { StaticVenueRecord } from 'registry/venues/types'
import VenueTypeBadge from './VenueTypeBadge'
import VenueLifecycleBadge from './VenueLifecycleBadge'

const StyledCard = styled(Card)`
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  padding: 20px;
  height: 100%;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: rgba(49, 208, 170, 0.4);
  }
`

interface VenueCardProps {
  venue: StaticVenueRecord
}

const VenueCard: React.FC<VenueCardProps> = ({ venue }) => {
  const { t } = useTranslation()

  return (
    <Link href={`/venues/${venue.slug}`} passHref legacyBehavior>
      <StyledCard as="a" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
        <Flex flexDirection="column" style={{ gap: '12px' }}>
          <Flex justifyContent="space-between" flexWrap="wrap" style={{ gap: '8px' }}>
            <Heading as="h3" scale="lg" color="secondary">
              {venue.displayName}
            </Heading>
            <VenueLifecycleBadge lifecycle={venue.lifecycle} />
          </Flex>
          <Flex flexWrap="wrap" style={{ gap: '8px' }}>
            <VenueTypeBadge venueType={venue.venueType} />
            <Text fontSize="12px" color="textSubtle">
              {CHAIN_LABELS[venue.chainId]}
            </Text>
          </Flex>
          <Text fontSize="12px" color="textDisabled">
            {t('Project')}: {venue.projectBinding.projectSlug}
          </Text>
          <Text fontSize="11px" color="textDisabled">
            {venue.metrics.notes}
          </Text>
        </Flex>
      </StyledCard>
    </Link>
  )
}

export default VenueCard
