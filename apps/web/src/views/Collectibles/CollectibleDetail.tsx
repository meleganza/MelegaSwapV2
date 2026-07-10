import React, { useState } from 'react'
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
import { buildCollectiblePrivileges, privilegeLabels } from 'views/CollectiblesStudio/collectiblesRuntime/buildCollectiblePrivileges'

const Page = styled.div`
  max-width: 880px;
  margin: 0 auto;
  width: 100%;
  padding: 0 16px 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const Hero = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 28px;
  padding: 24px;
  border-radius: 24px;
  border: 1px solid rgba(212, 175, 55, 0.35);
  background: linear-gradient(145deg, rgba(212, 175, 55, 0.06) 0%, rgba(255, 255, 255, 0.02) 55%);
  overflow: hidden;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`

const ArtFrame = styled.div`
  aspect-ratio: 1;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #111;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`

const HeroBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  justify-content: center;
`

const Story = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.55;
  color: #c8c8c8;
`

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr 1fr;
  }
`

const Metric = styled.div`
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
`

const MetricLabel = styled.div`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8a8a8a;
  margin-bottom: 4px;
`

const MetricValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
`

const Section = styled.div`
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.02);
`

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const Chip = styled.span`
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(212, 175, 55, 0.35);
  font-size: 12px;
  font-weight: 600;
  color: #d4af37;
`

const ToggleBtn = styled.button`
  align-self: flex-start;
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: transparent;
  color: #a8a8a8;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    border-color: rgba(212, 175, 55, 0.45);
    color: #fff;
  }
`

interface CollectibleDetailProps {
  record: StaticCollectibleRecord
  manifest: Record<string, unknown>
}

const CollectibleDetail: React.FC<CollectibleDetailProps> = ({ record, manifest }) => {
  const { t } = useTranslation()
  const [manifestOpen, setManifestOpen] = useState(false)
  const privileges = privilegeLabels(
    buildCollectiblePrivileges(record, { status: 'Unknown', transferable: undefined }),
  )
  const previewUrl = record.metadata.gateway
    ? `${record.metadata.gateway.replace(/\/$/, '')}/1.png`
    : undefined

  return (
    <Page>
      <Hero>
        <ArtFrame>
          {previewUrl ? <img src={previewUrl} alt={record.displayName} /> : null}
        </ArtFrame>
        <HeroBody>
          <Heading as="h1" scale="xxl" color="secondary">
            {record.displayName}
          </Heading>
          <Flex flexWrap="wrap" style={{ gap: '8px' }}>
            <CollectibleStatusBadge status={record.status} />
            <MetadataStorageBadge storage={record.metadata.status} />
          </Flex>
          <Story>{record.description}</Story>
          <Text fontSize="13px" color="textSubtle">
            {COLLECTIBLE_CATEGORY_LABELS[record.category]} · {record.role}
          </Text>
        </HeroBody>
      </Hero>

      <MetricGrid>
        <Metric>
          <MetricLabel>Identity level</MetricLabel>
          <MetricValue>{COLLECTIBLE_CATEGORY_LABELS[record.category]}</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>Supply</MetricLabel>
          <MetricValue>
            {record.supply.statedMaxSupply ?? '—'}
          </MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>Ownership</MetricLabel>
          <MetricValue>{record.status === 'live_or_legacy_existing' ? 'Transferable' : 'Registry'}</MetricValue>
        </Metric>
      </MetricGrid>

      <Section>
        <Heading as="h2" scale="md" color="secondary" mb="12px">
          Privileges
        </Heading>
        <ChipRow>
          {privileges.map((p) => (
            <Chip key={p}>{p}</Chip>
          ))}
        </ChipRow>
      </Section>

      <Section>
        <Heading as="h2" scale="md" color="secondary" mb="8px">
          Collection
        </Heading>
        <Text fontSize="14px" color="textSubtle" mb="8px">
          {record.supply.notes}
        </Text>
        <Text fontSize="12px" color="textSubtle">
          {COLLECTIBLE_STATUS_LABELS[record.status]}
        </Text>
      </Section>

      <ToggleBtn type="button" onClick={() => setManifestOpen((v) => !v)}>
        {manifestOpen ? 'Hide machine manifest' : 'View machine manifest'}
      </ToggleBtn>

      {manifestOpen ? <CollectibleManifestViewer manifest={manifest} slug={record.slug} /> : null}

      <Text fontSize="12px" color="textDisabled" textAlign="center">
        <Link href="/collectibles">
          <Text as="span" color="primary">
            ← Collectibles
          </Text>
        </Link>
      </Text>
    </Page>
  )
}

export default CollectibleDetail
