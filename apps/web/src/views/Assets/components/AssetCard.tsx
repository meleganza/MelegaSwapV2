import React from 'react'
import styled from 'styled-components'
import { Card, Flex, Text, Heading } from '@pancakeswap/uikit'
import Link from 'next/link'
import { useTranslation } from '@pancakeswap/localization'
import { ASSET_TYPE_LABELS, CHAIN_LABELS } from 'registry/assets/constants'
import { StaticAssetRecord } from 'registry/assets/types'
import AssetTrustBadge from './AssetTrustBadge'
import AssetLifecycleBadge from './AssetLifecycleBadge'

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

interface AssetCardProps {
  asset: StaticAssetRecord
}

const AssetCard: React.FC<AssetCardProps> = ({ asset }) => {
  const { t } = useTranslation()

  return (
    <Link href={`/assets/${asset.slug}`} passHref legacyBehavior>
      <StyledCard as="a" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
        <Flex flexDirection="column" style={{ gap: '12px' }}>
          <Flex justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" style={{ gap: '8px' }}>
            <Heading as="h3" scale="lg" color="secondary">
              {asset.symbol}
            </Heading>
            <AssetLifecycleBadge lifecycle={asset.lifecycle} />
          </Flex>
          <Text fontSize="14px" color="textSubtle">
            {asset.name}
          </Text>
          <Text fontSize="12px" color="textDisabled">
            {t(ASSET_TYPE_LABELS[asset.assetType])} · {CHAIN_LABELS[asset.chainId] ?? asset.chainId}
          </Text>
          <AssetTrustBadge badges={asset.trust.badges} />
          <Text fontSize="11px" color="textDisabled">
            {t('Project')}: {asset.projectBinding.projectSlug}
          </Text>
        </Flex>
      </StyledCard>
    </Link>
  )
}

export default AssetCard
