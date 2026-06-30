import React from 'react'
import styled from 'styled-components'
import { Flex, Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { VenueLifecycle } from 'registry/venues/types'

const Badge = styled(Flex)<{ $variant: VenueLifecycle }>`
  align-items: center;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid
    ${({ $variant }) => {
      switch ($variant) {
        case 'verified':
          return 'rgba(49, 208, 170, 0.55)'
        case 'observed':
          return 'rgba(184, 173, 210, 0.45)'
        case 'draft':
          return 'rgba(82, 50, 146, 0.45)'
        case 'deprecated':
          return 'rgba(128, 128, 128, 0.45)'
        default:
          return 'rgba(255, 255, 255, 0.15)'
      }
    }};
  background: rgba(255, 255, 255, 0.04);
  min-height: 28px;
`

const LABELS: Record<VenueLifecycle, string> = {
  draft: 'Draft',
  observed: 'Observed',
  verified: 'Verified',
  deprecated: 'Deprecated',
  archived: 'Archived',
}

interface VenueLifecycleBadgeProps {
  lifecycle: VenueLifecycle
}

const VenueLifecycleBadge: React.FC<VenueLifecycleBadgeProps> = ({ lifecycle }) => {
  const { t } = useTranslation()
  return (
    <Badge $variant={lifecycle}>
      <Text fontSize="12px" color="text">
        {t(LABELS[lifecycle])}
      </Text>
    </Badge>
  )
}

export default VenueLifecycleBadge
