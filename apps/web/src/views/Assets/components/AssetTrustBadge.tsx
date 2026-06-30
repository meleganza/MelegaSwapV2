import React from 'react'
import styled from 'styled-components'
import { Flex, Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { AssetTrustBadge as TrustBadgeType } from 'registry/assets/types'

const Badge = styled(Flex)<{ $variant: TrustBadgeType }>`
  align-items: center;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid
    ${({ $variant }) => {
      switch ($variant) {
        case 'canonical':
          return 'rgba(49, 208, 170, 0.5)'
        case 'verified':
          return 'rgba(49, 208, 170, 0.35)'
        case 'observed':
          return 'rgba(184, 173, 210, 0.4)'
        case 'deprecated':
        default:
          return 'rgba(255, 255, 255, 0.2)'
      }
    }};
  background: rgba(255, 255, 255, 0.04);
  min-height: 28px;
`

const BADGE_LABEL_KEYS: Record<TrustBadgeType, string> = {
  canonical: 'Canonical asset',
  observed: 'Observed',
  verified: 'Verified',
  deprecated: 'Deprecated',
}

const BADGE_TOOLTIP_KEYS: Record<TrustBadgeType, string> = {
  canonical: 'Canonical asset tooltip',
  observed: 'Observed badge tooltip',
  verified: 'Asset verified tooltip',
  deprecated: 'Asset deprecated tooltip',
}

interface AssetTrustBadgeProps {
  badges: TrustBadgeType[]
}

const AssetTrustBadge: React.FC<AssetTrustBadgeProps> = ({ badges }) => {
  const { t } = useTranslation()

  if (!badges.length) {
    return (
      <Badge $variant="observed">
        <Text fontSize="12px" color="textSubtle">
          {t('Observed')}
        </Text>
      </Badge>
    )
  }

  return (
    <Flex flexWrap="wrap" style={{ gap: '8px' }}>
      {badges.map((badge) => (
        <Badge key={badge} $variant={badge} title={t(BADGE_TOOLTIP_KEYS[badge])}>
          <Text fontSize="12px" color="text">
            {t(BADGE_LABEL_KEYS[badge])}
          </Text>
        </Badge>
      ))}
    </Flex>
  )
}

export default AssetTrustBadge
