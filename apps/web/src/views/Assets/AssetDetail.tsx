import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading, Link } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { ASSET_TYPE_LABELS, CHAIN_EXPLORER_TOKEN_URL, CHAIN_LABELS } from 'registry/assets/constants'
import { StaticAssetRecord } from 'registry/assets/types'
import AssetTrustBadge from './AssetTrustBadge'
import AssetLifecycleBadge from './AssetLifecycleBadge'
import AssetCapabilityMatrix from './AssetCapabilityMatrix'
import AssetManifestViewer from './AssetManifestViewer'
import AssetVenuesSection from './components/AssetVenuesSection'

const Stack = styled(Flex)`
  flex-direction: column;
  gap: 24px;
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
`

const Section = styled(Flex)`
  flex-direction: column;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.02);
  gap: 12px;
`

const Mono = styled(Text)`
  font-family: monospace;
  font-size: 12px;
  word-break: break-all;
`

interface AssetDetailProps {
  asset: StaticAssetRecord
  manifest: Record<string, unknown>
}

const AssetDetail: React.FC<AssetDetailProps> = ({ asset, manifest }) => {
  const { t } = useTranslation()
  const explorer = CHAIN_EXPLORER_TOKEN_URL[asset.chainId]?.(asset.contractAddress)

  return (
    <Stack px="16px">
      <Flex flexDirection="column" style={{ gap: '8px' }}>
        <Heading as="h1" scale="xxl" color="secondary">
          {asset.name}
        </Heading>
        <Text color="textSubtle">{asset.description}</Text>
        <Flex flexWrap="wrap" style={{ gap: '8px' }}>
          <AssetLifecycleBadge lifecycle={asset.lifecycle} />
          <AssetTrustBadge badges={asset.trust.badges} />
        </Flex>
      </Flex>

      <Section>
        <Heading as="h2" scale="md" color="secondary">
          {t('Canonical asset identity')}
        </Heading>
        <Mono color="text">{asset.uai}</Mono>
        <Text fontSize="12px" color="textSubtle">
          {t('Legacy token ref')}: {asset.legacyRef}
        </Text>
        <Text fontSize="12px" color="textSubtle">
          {t(ASSET_TYPE_LABELS[asset.assetType])} · {CHAIN_LABELS[asset.chainId]}
        </Text>
      </Section>

      <Section>
        <Heading as="h2" scale="md" color="secondary">
          {t('Project binding')}
        </Heading>
        <Text color="text">
          {t('Project')}:{' '}
          <Link href={`/projects/${asset.projectBinding.projectSlug}`}>
            <Text as="span" color="primary">
              {asset.projectBinding.projectSlug}
            </Text>
          </Link>
        </Text>
        <Mono color="textSubtle">{asset.projectBinding.projectUpi}</Mono>
        {asset.projectBinding.isPrimary && (
          <Text fontSize="12px" color="textSubtle">
            {t('Primary project asset')}
          </Text>
        )}
      </Section>

      <Section>
        <Heading as="h2" scale="md" color="secondary">
          {t('Contract')}
        </Heading>
        <Mono color="text">{asset.contractAddress}</Mono>
        <Text fontSize="12px" color="textSubtle">
          {t('Decimals')}: {asset.decimals} · {t('Symbol')}: {asset.symbol}
        </Text>
        {explorer && (
          <Link href={explorer} external>
            <Text fontSize="12px" color="primary">
              {t('View on Explorer')}
            </Text>
          </Link>
        )}
      </Section>

      <AssetCapabilityMatrix capabilities={asset.capabilities} />

      <AssetVenuesSection assetSlug={asset.slug} />

      <Section>
        <Heading as="h2" scale="md" color="secondary">
          {t('Relationships')}
        </Heading>
        <Text fontSize="12px" color="textSubtle">
          {asset.relationships.relationshipNotes ?? t('Relationship not indexed')}
        </Text>
        <Text fontSize="12px" color="textDisabled">
          {t('Relationships disclaimer')}
        </Text>
      </Section>

      <AssetManifestViewer manifest={manifest} slug={asset.slug} />

      <Text fontSize="12px" color="textDisabled" textAlign="center">
        {asset.disclaimer}
      </Text>
    </Stack>
  )
}

export default AssetDetail
