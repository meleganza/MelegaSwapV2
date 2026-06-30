import React from 'react'
import styled from 'styled-components'
import { Text } from '@pancakeswap/uikit'
import {
  EXECUTION_ELIGIBILITY_LABELS,
  LIQUIDITY_CONFIDENCE_LABELS,
  PRESENCE_STATUS_LABELS,
} from 'registry/presence/presence-constants'
import {
  ExecutionEligibility,
  LiquidityConfidence,
  PresenceStatus,
} from 'registry/presence/presence-types'

const Badge = styled.span<{ $tone: 'success' | 'gold' | 'muted' | 'danger' | 'warning' }>`
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid
    ${({ $tone }) =>
      $tone === 'success'
        ? '#31d0aa'
        : $tone === 'gold'
          ? '#d4af37'
          : $tone === 'danger'
            ? '#f87171'
            : $tone === 'warning'
              ? '#fbbf24'
              : 'rgba(255,255,255,0.2)'};
  color: ${({ $tone }) =>
    $tone === 'success'
      ? '#31d0aa'
      : $tone === 'gold'
        ? '#ffc842'
        : $tone === 'danger'
          ? '#f87171'
          : $tone === 'warning'
            ? '#fbbf24'
            : '#a9a9a9'};
`

const statusTone = (status: PresenceStatus): 'success' | 'gold' | 'muted' | 'warning' => {
  if (status === 'LIVE') return 'success'
  if (status === 'OBSERVED') return 'gold'
  if (status === 'PLANNED') return 'warning'
  return 'muted'
}

const confidenceTone = (
  confidence: LiquidityConfidence,
): 'success' | 'gold' | 'muted' | 'warning' | 'danger' => {
  if (confidence === 'canonical') return 'success'
  if (confidence === 'observed') return 'gold'
  if (confidence === 'low') return 'danger'
  if (confidence === 'planned') return 'warning'
  return 'muted'
}

const eligibilityTone = (
  eligibility: ExecutionEligibility,
): 'success' | 'gold' | 'muted' | 'danger' => {
  if (eligibility === 'eligible') return 'success'
  if (eligibility === 'conditional') return 'gold'
  if (eligibility === 'not_eligible') return 'danger'
  return 'muted'
}

export const PresenceStatusBadge: React.FC<{ status: PresenceStatus }> = ({ status }) => (
  <Badge $tone={statusTone(status)}>{PRESENCE_STATUS_LABELS[status]}</Badge>
)

export const LiquidityConfidenceBadge: React.FC<{ confidence: LiquidityConfidence }> = ({
  confidence,
}) => <Badge $tone={confidenceTone(confidence)}>{LIQUIDITY_CONFIDENCE_LABELS[confidence]}</Badge>

export const ExecutionEligibilityBadge: React.FC<{ eligibility: ExecutionEligibility }> = ({
  eligibility,
}) => (
  <Badge $tone={eligibilityTone(eligibility)}>{EXECUTION_ELIGIBILITY_LABELS[eligibility]}</Badge>
)

export const NotCanonicalMarker: React.FC = () => (
  <Badge $tone="danger">
    <Text as="span" fontSize="10px">
      NOT CANONICAL
    </Text>
  </Badge>
)
