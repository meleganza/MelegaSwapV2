import React from 'react'
import type { ProjectMarketsDocument } from 'registry/projects/identity/markets'
import { formatRelativeTime, humanChainName, humanEnumLabel } from '../presentation/humanLabels'
import {
  Card,
  MetricCell,
  MetricGrid,
  MetricLabel,
  MetricValue,
  MutedText,
  SectionTitle,
} from './theme'

interface Props {
  marketsDocument: ProjectMarketsDocument
}

const ProjectMarketSnapshot: React.FC<Props> = ({ marketsDocument }) => {
  const preferred = marketsDocument.preferredMarkets[0] ?? null
  const hasActiveMarkets = marketsDocument.summary.activeMarketCount > 0
  const observedAt = formatRelativeTime(marketsDocument.summary.lastObservationAt)

  return (
    <Card aria-labelledby="market-snapshot-heading">
      <SectionTitle as="h2" id="market-snapshot-heading" style={{ fontSize: '22px' }}>
        Market snapshot
      </SectionTitle>

      <MetricGrid>
        <MetricCell>
          <MetricLabel>Price</MetricLabel>
          <MetricValue>Unavailable</MetricValue>
        </MetricCell>
        <MetricCell>
          <MetricLabel>24h change</MetricLabel>
          <MetricValue>Unavailable</MetricValue>
        </MetricCell>
        <MetricCell>
          <MetricLabel>Volume</MetricLabel>
          <MetricValue>Unavailable</MetricValue>
        </MetricCell>
        <MetricCell>
          <MetricLabel>Active markets</MetricLabel>
          <MetricValue>
            {hasActiveMarkets
              ? String(marketsDocument.summary.activeMarketCount)
              : 'None registered'}
          </MetricValue>
        </MetricCell>
        <MetricCell>
          <MetricLabel>Swap on Melega</MetricLabel>
          <MetricValue>{humanEnumLabel(marketsDocument.capabilities.SWAP)}</MetricValue>
        </MetricCell>
        <MetricCell>
          <MetricLabel>Buy asset</MetricLabel>
          <MetricValue>{humanEnumLabel(marketsDocument.capabilities.BUY_PROJECT_ASSET)}</MetricValue>
        </MetricCell>
      </MetricGrid>

      {preferred ? (
        <MutedText>
          Preferred pair: {preferred.displayLabel} on {humanChainName(preferred.chainId)} ·{' '}
          {humanEnumLabel(preferred.status)}
        </MutedText>
      ) : (
        <MutedText>No preferred market is registered for this project.</MutedText>
      )}

      {observedAt ? <MutedText>{observedAt}</MutedText> : null}
    </Card>
  )
}

export default ProjectMarketSnapshot
