import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading, Link } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import {
  CANONICAL_RELATIONSHIP_LABELS,
  PRESENCE_TYPE_LABELS,
} from 'registry/presence/presence-constants'
import { StaticPresenceRecord } from 'registry/presence/presence-types'
import CanonicalEconomyBanner from './components/CanonicalEconomyBanner'
import {
  ExecutionEligibilityBadge,
  LiquidityConfidenceBadge,
  NotCanonicalMarker,
  PresenceStatusBadge,
} from './components/PresenceBadges'
import PresenceManifestViewer from './components/PresenceManifestViewer'

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

interface PresenceDetailProps {
  record: StaticPresenceRecord
  manifest: Record<string, unknown>
}

const PresenceDetail: React.FC<PresenceDetailProps> = ({ record, manifest }) => {
  const { t } = useTranslation()

  return (
    <Stack px="16px">
      <CanonicalEconomyBanner />

      <Flex flexDirection="column" style={{ gap: '8px' }}>
        <Heading as="h1" scale="xxl" color="secondary">
          {record.displayName}
        </Heading>
        <Text color="textSubtle">{record.description}</Text>
        <Flex flexWrap="wrap" style={{ gap: '8px' }}>
          <PresenceStatusBadge status={record.status} />
          <LiquidityConfidenceBadge confidence={record.liquidityConfidence} />
          <ExecutionEligibilityBadge eligibility={record.executionEligibility} />
          {!record.isCanonical && <NotCanonicalMarker />}
        </Flex>
      </Flex>

      <Section>
        <Heading as="h2" scale="md" color="secondary">
          {t('Presence identity')}
        </Heading>
        <Mono color="text">{record.presenceId}</Mono>
        <Text fontSize="12px" color="textSubtle">
          {PRESENCE_TYPE_LABELS[record.presenceType]} · {record.chainLabel}
        </Text>
        <Text fontSize="12px" color="textSubtle">
          {t('Canonical relationship')}: {CANONICAL_RELATIONSHIP_LABELS[record.canonicalRelationship]}
        </Text>
      </Section>

      <Section>
        <Heading as="h2" scale="md" color="secondary">
          {t('Project and asset binding')}
        </Heading>
        <Text color="text">
          {t('Project')}:{' '}
          <Link href={`/@${record.projectSlug}/`}>
            <Text as="span" color="primary">
              {record.projectSlug}
            </Text>
          </Link>
        </Text>
        <Mono color="textSubtle">{record.projectUpi}</Mono>
        <Text fontSize="12px" color="textSubtle">
          {t('Canonical asset UAI')}: {record.canonicalAssetUai}
        </Text>
        {record.assetSlug && (
          <Link href={`/assets/${record.assetSlug}`}>
            <Text fontSize="12px" color="primary">
              {t('View asset')}: /assets/{record.assetSlug}
            </Text>
          </Link>
        )}
      </Section>

      <Section>
        <Heading as="h2" scale="md" color="secondary">
          {t('Venue source')}
        </Heading>
        <Text color="text">{record.venueSource}</Text>
        {record.links.venue && (
          <Link href={record.links.venue}>
            <Text fontSize="12px" color="primary">
              {record.links.venue}
            </Text>
          </Link>
        )}
      </Section>

      {record.warnings.length > 0 && (
        <Section>
          <Heading as="h2" scale="md" color="secondary">
            {t('Presence warnings')}
          </Heading>
          <WarningList>
            {record.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </WarningList>
        </Section>
      )}

      <Section>
        <Heading as="h2" scale="md" color="secondary">
          {t('Registry cross-links')}
        </Heading>
        <Flex flexDirection="column" style={{ gap: '6px' }}>
          <Link href={record.links.graph}>
            <Text fontSize="12px" color="primary">
              {t('View economic graph')} →
            </Text>
          </Link>
          <Link href={record.links.query}>
            <Text fontSize="12px" color="primary">
              {t('Query')} →
            </Text>
          </Link>
          {record.links.execution && (
            <Link href={record.links.execution}>
              <Text fontSize="12px" color="primary">
                {t('Smart Economic Execution')} →
              </Text>
            </Link>
          )}
        </Flex>
      </Section>

      <PresenceManifestViewer manifest={manifest} slug={record.slug} />

      <Text fontSize="12px" color="textDisabled" textAlign="center">
        {record.disclaimer}
      </Text>
    </Stack>
  )
}

export default PresenceDetail
