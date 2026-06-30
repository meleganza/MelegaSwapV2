import React from 'react'
import styled from 'styled-components'
import { Card, Flex, Text, Heading } from '@pancakeswap/uikit'
import Link from 'next/link'
import { useTranslation } from '@pancakeswap/localization'
import { PRESENCE_TYPE_LABELS } from 'registry/presence/presence-constants'
import { StaticPresenceRecord } from 'registry/presence/presence-types'
import {
  ExecutionEligibilityBadge,
  LiquidityConfidenceBadge,
  NotCanonicalMarker,
  PresenceStatusBadge,
} from './PresenceBadges'

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

interface PresenceCardProps {
  record: StaticPresenceRecord
}

const PresenceCard: React.FC<PresenceCardProps> = ({ record }) => {
  const { t } = useTranslation()

  return (
    <Link href={`/presence/${record.slug}`} passHref legacyBehavior>
      <StyledCard as="a" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
        <Flex flexDirection="column" style={{ gap: '12px' }}>
          <Flex justifyContent="space-between" flexWrap="wrap" style={{ gap: '8px' }}>
            <Heading as="h3" scale="lg" color="secondary">
              {record.displayName}
            </Heading>
            <Flex style={{ gap: '6px' }} flexWrap="wrap">
              <PresenceStatusBadge status={record.status} />
              {!record.isCanonical && <NotCanonicalMarker />}
            </Flex>
          </Flex>
          <Text fontSize="12px" color="textSubtle">
            {PRESENCE_TYPE_LABELS[record.presenceType]} · {record.chainLabel}
          </Text>
          <Flex flexWrap="wrap" style={{ gap: '6px' }}>
            <LiquidityConfidenceBadge confidence={record.liquidityConfidence} />
            <ExecutionEligibilityBadge eligibility={record.executionEligibility} />
          </Flex>
          {record.warnings[0] && (
            <Text fontSize="11px" color="textDisabled">
              {record.warnings[0]}
            </Text>
          )}
          <Text fontSize="11px" color="textDisabled">
            {t('Venue source')}: {record.venueSource}
          </Text>
        </Flex>
      </StyledCard>
    </Link>
  )
}

export default PresenceCard
