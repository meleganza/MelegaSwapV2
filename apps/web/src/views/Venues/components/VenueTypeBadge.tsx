import React from 'react'
import styled from 'styled-components'
import { Flex, Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { VenueType } from 'registry/venues/types'
import { VENUE_TYPE_LABELS } from 'registry/venues/constants'

const Badge = styled(Flex)<{ $type: VenueType }>`
  align-items: center;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgba(73, 170, 242, 0.45);
  background: rgba(73, 170, 242, 0.1);
  min-height: 28px;
`

interface VenueTypeBadgeProps {
  venueType: VenueType
}

const VenueTypeBadge: React.FC<VenueTypeBadgeProps> = ({ venueType }) => {
  const { t } = useTranslation()
  return (
    <Badge $type={venueType}>
      <Text fontSize="12px" color="text">
        {t(VENUE_TYPE_LABELS[venueType])}
      </Text>
    </Badge>
  )
}

export default VenueTypeBadge
