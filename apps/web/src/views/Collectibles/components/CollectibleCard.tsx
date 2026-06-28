import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import {
  COLLECTIBLE_CATEGORY_LABELS,
  COLLECTIBLE_STATUS_LABELS,
} from 'registry/collectibles/collectible-constants'
import { StaticCollectibleRecord } from 'registry/collectibles/collectible-types'
import { CollectibleStatusBadge, MetadataStorageBadge } from './CollectibleBadges'

const StyledCard = styled(Flex)`
  flex-direction: column;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.02);
  height: 100%;
  gap: 12px;
  transition: border-color 0.2s ease;
  cursor: pointer;
  text-decoration: none;
  color: inherit;

  &:hover {
    border-color: rgba(49, 208, 170, 0.4);
  }
`

interface CollectibleCardProps {
  record: StaticCollectibleRecord
}

const CollectibleCard: React.FC<CollectibleCardProps> = ({ record }) => {
  const { t } = useTranslation()

  return (
    <StyledCard as="a" href={`/collectibles/${record.slug}`}>
      <Flex justifyContent="space-between" flexWrap="wrap" style={{ gap: '8px' }}>
        <Heading as="h3" scale="lg" color="secondary">
          {record.displayName}
        </Heading>
        <CollectibleStatusBadge status={record.status} />
      </Flex>
      <Text fontSize="12px" color="textSubtle">
        {COLLECTIBLE_CATEGORY_LABELS[record.category]}
      </Text>
      <Text fontSize="12px" color="textSubtle" style={{ lineHeight: 1.5 }}>
        {record.role}
      </Text>
      <Flex flexWrap="wrap" style={{ gap: '6px' }}>
        <MetadataStorageBadge storage={record.metadata.status} />
      </Flex>
      {record.mint.route && (
        <Text fontSize="11px" color="textDisabled">
          {t('Collectibles mint route')}: {record.mint.route}
        </Text>
      )}
      {record.warnings[0] && (
        <Text fontSize="11px" color="textDisabled">
          {record.warnings[0]}
        </Text>
      )}
    </StyledCard>
  )
}

export default CollectibleCard
