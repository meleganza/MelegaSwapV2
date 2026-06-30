import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading, Link } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { CHAIN_EXPLORER_TOKEN_URL } from 'registry/assets/constants'
import { getAssetBySlug } from 'registry/assets/getAssetBySlug'
import { CHAIN_LABELS } from 'registry/venues/constants'
import { StaticVenueRecord } from 'registry/venues/types'
import VenueTypeBadge from './components/VenueTypeBadge'
import VenueLifecycleBadge from './components/VenueLifecycleBadge'
import VenueCapabilityMatrix from './components/VenueCapabilityMatrix'
import VenueEventsSection from './components/VenueEventsSection'
import GraphExploreLink from 'views/Graph/components/GraphExploreLink'
import VenueManifestViewer from './components/VenueManifestViewer'

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

interface VenueDetailProps {
  venue: StaticVenueRecord
  manifest: Record<string, unknown>
}

const VenueDetail: React.FC<VenueDetailProps> = ({ venue, manifest }) => {
  const { t } = useTranslation()
  const explorer = venue.contractAddress
    ? CHAIN_EXPLORER_TOKEN_URL[venue.chainId]?.(venue.contractAddress)
    : undefined

  return (
    <Stack px="16px">
      <Flex flexDirection="column" style={{ gap: '8px' }}>
        <Heading as="h1" scale="xxl" color="secondary">
          {venue.displayName}
        </Heading>
        <Text color="textSubtle">{venue.description}</Text>
        <Flex flexWrap="wrap" style={{ gap: '8px' }}>
          <VenueTypeBadge venueType={venue.venueType} />
          <VenueLifecycleBadge lifecycle={venue.lifecycle} />
        </Flex>
      </Flex>

      <Section>
        <Heading as="h2" scale="md" color="secondary">
          {t('Canonical venue identity')}
        </Heading>
        <Mono color="text">{venue.uvi}</Mono>
        {venue.legacyRef && (
          <Text fontSize="12px" color="textSubtle">
            {t('Legacy venue ref')}: {venue.legacyRef}
          </Text>
        )}
        <Text fontSize="12px" color="textSubtle">
          {CHAIN_LABELS[venue.chainId]}
        </Text>
      </Section>

      <Section>
        <Heading as="h2" scale="md" color="secondary">
          {t('Project binding')}
        </Heading>
        <Text color="text">
          {t('Project')}:{' '}
          <Link href={`/projects/${venue.projectBinding.projectSlug}`}>
            <Text as="span" color="primary">
              {venue.projectBinding.projectSlug}
            </Text>
          </Link>
        </Text>
        <Mono color="textSubtle">{venue.projectBinding.projectUpi}</Mono>
      </Section>

      <Section>
        <Heading as="h2" scale="md" color="secondary">
          {t('Asset bindings')}
        </Heading>
        {venue.assetBindings.map((binding) => {
          const asset = getAssetBySlug(binding.assetSlug)
          const href = asset ? `/assets/${binding.assetSlug}` : `/venues/${binding.assetSlug}`
          return (
            <Flex key={`${binding.assetSlug}-${binding.role}`} flexDirection="column" style={{ gap: '4px' }}>
              <Text fontSize="12px" color="textSubtle">
                {binding.role}:{' '}
                <Link href={href}>
                  <Text as="span" color="primary">
                    {binding.assetSlug}
                  </Text>
                </Link>
              </Text>
              <Mono color="textDisabled">{binding.assetUai}</Mono>
            </Flex>
          )
        })}
      </Section>

      {(venue.contractAddress || venue.pid !== undefined || venue.sousId !== undefined) && (
        <Section>
          <Heading as="h2" scale="md" color="secondary">
            {t('Venue contract')}
          </Heading>
          {venue.contractAddress && <Mono color="text">{venue.contractAddress}</Mono>}
          {venue.pid !== undefined && (
            <Text fontSize="12px" color="textSubtle">
              {t('Farm pid')}: {venue.pid}
            </Text>
          )}
          {venue.sousId !== undefined && (
            <Text fontSize="12px" color="textSubtle">
              {t('Stake sousId')}: {venue.sousId}
            </Text>
          )}
          {explorer && (
            <Link href={explorer} external>
              <Text fontSize="12px" color="primary">
                {t('View on Explorer')}
              </Text>
            </Link>
          )}
        </Section>
      )}

      <Section>
        <Heading as="h2" scale="md" color="secondary">
          {t('Venue metrics')}
        </Heading>
        <Text fontSize="12px" color="textSubtle">
          {venue.metrics.notes}
        </Text>
        <Text fontSize="12px" color="textDisabled">
          {t('Venue metrics disclaimer')}
        </Text>
      </Section>

      <VenueCapabilityMatrix capabilities={venue.capabilities} />

      <VenueEventsSection venueSlug={venue.slug} />

      <VenueManifestViewer manifest={manifest} slug={venue.slug} />

      <GraphExploreLink />

      <Text fontSize="12px" color="textDisabled" textAlign="center">
        {venue.disclaimer}
      </Text>
    </Stack>
  )
}

export default VenueDetail
