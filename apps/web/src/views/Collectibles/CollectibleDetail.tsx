import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading, Link } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import {
  COLLECTIBLE_CATEGORY_LABELS,
  COLLECTIBLE_STATUS_LABELS,
} from 'registry/collectibles/collectible-constants'
import { StaticCollectibleRecord } from 'registry/collectibles/collectible-types'
import { CollectibleStatusBadge, MetadataStorageBadge } from './components/CollectibleBadges'
import CollectibleManifestViewer from './components/CollectibleManifestViewer'

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

const WarningList = styled.ul`
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  color: #f87171;
  line-height: 1.5;
`

interface CollectibleDetailProps {
  record: StaticCollectibleRecord
  manifest: Record<string, unknown>
}

const CollectibleDetail: React.FC<CollectibleDetailProps> = ({ record, manifest }) => {
  const { t } = useTranslation()

  return (
    <Stack px="16px">
      <Flex flexDirection="column" style={{ gap: '8px' }}>
        <Heading as="h1" scale="xxl" color="secondary">
          {record.displayName}
        </Heading>
        <Text color="textSubtle">{record.description}</Text>
        <Flex flexWrap="wrap" style={{ gap: '8px' }}>
          <CollectibleStatusBadge status={record.status} />
          <MetadataStorageBadge storage={record.metadata.status} />
        </Flex>
      </Flex>

      <Section>
        <Heading as="h2" scale="md" color="secondary">
          {t('Collectibles identity')}
        </Heading>
        <Mono color="text">{record.collectibleId}</Mono>
        <Text fontSize="12px" color="textSubtle">
          {COLLECTIBLE_CATEGORY_LABELS[record.category]} · {COLLECTIBLE_STATUS_LABELS[record.status]}
        </Text>
        <Text fontSize="12px" color="textSubtle">
          {t('Collectibles role')}: {record.role}
        </Text>
      </Section>

      <Section>
        <Heading as="h2" scale="md" color="secondary">
          {t('Collectibles metadata storage')}
        </Heading>
        <Text fontSize="12px" color="textSubtle">
          {record.metadata.notes}
        </Text>
        {record.metadata.gateway && (
          <Mono color="textSubtle">{record.metadata.gateway}</Mono>
        )}
        {record.metadata.imagePattern && (
          <Text fontSize="12px" color="textSubtle">
            {t('Collectibles image pattern')}: {record.metadata.imagePattern}
          </Text>
        )}
        {record.metadata.tokenUriSource && (
          <Text fontSize="12px" color="textSubtle">
            tokenURI: {record.metadata.tokenUriSource}
          </Text>
        )}
      </Section>

      <Section>
        <Heading as="h2" scale="md" color="secondary">
          {t('Collectibles supply')}
        </Heading>
        <Text fontSize="12px" color="textSubtle">
          {record.supply.notes}
        </Text>
        {record.supply.statedMaxSupply !== undefined && (
          <Text fontSize="12px" color="text">
            {t('Collectibles stated max')}: {record.supply.statedMaxSupply} ({record.supply.supplySource})
          </Text>
        )}
        <Text fontSize="11px" color="textDisabled">
          {t('Collectibles no minted count')}
        </Text>
      </Section>

      {record.contract.indexed && record.contract.address && (
        <Section>
          <Heading as="h2" scale="md" color="secondary">
            {t('Collectibles contract ref')}
          </Heading>
          <Mono color="textSubtle">{record.contract.address}</Mono>
          <Text fontSize="12px" color="textSubtle">
            {record.contract.label} · chain {record.contract.chainId}
          </Text>
          <Text fontSize="11px" color="textDisabled">
            {record.contract.notes}
          </Text>
        </Section>
      )}

      <Section>
        <Heading as="h2" scale="md" color="secondary">
          {t('Collectibles surfaces')}
        </Heading>
        <Text fontSize="12px" color="textSubtle">
          {record.mint.notes}
        </Text>
        {record.mint.route && (
          <Text color="text">
            {t('Collectibles mint route')}:{' '}
            <Link href={record.mint.route}>
              <Text as="span" color="primary">
                {record.mint.route}
              </Text>
            </Link>
            {record.mint.chainLabel && ` (${record.mint.chainLabel})`}
          </Text>
        )}
        {record.links.wallet && (
          <Text color="text">
            {t('Collectibles wallet route')}:{' '}
            <Link href={record.links.wallet}>
              <Text as="span" color="primary">
                {record.links.wallet}
              </Text>
            </Link>
          </Text>
        )}
        {record.links.market && (
          <Text color="text">
            {t('Collectibles market route')}:{' '}
            <Link href={record.links.market}>
              <Text as="span" color="primary">
                {record.links.market}
              </Text>
            </Link>
          </Text>
        )}
        {record.links.external && (
          <Text color="text">
            {t('External')}:{' '}
            <a href={record.links.external} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
              {record.links.external}
            </a>
          </Text>
        )}
        {!record.mint.route && (
          <Text fontSize="11px" color="textDisabled">
            {t('Collectibles no mint button')}
          </Text>
        )}
      </Section>

      {record.warnings.length > 0 && (
        <Section>
          <Heading as="h2" scale="md" color="secondary">
            {t('Warnings')}
          </Heading>
          <WarningList>
            {record.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </WarningList>
        </Section>
      )}

      <CollectibleManifestViewer manifest={manifest} slug={record.slug} />

      <Text fontSize="12px" color="textDisabled" textAlign="center">
        <Link href="/collectibles">
          <Text as="span" color="primary">
            ← {t('Collectibles page title')}
          </Text>
        </Link>
      </Text>
    </Stack>
  )
}

export default CollectibleDetail
