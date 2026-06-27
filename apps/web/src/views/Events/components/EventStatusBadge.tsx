import React from 'react'
import styled from 'styled-components'
import { Flex, Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { EventStatus } from 'registry/events/types'

const Badge = styled(Flex)<{ $status: EventStatus }>`
  align-items: center;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid
    ${({ $status }) =>
      $status === 'registry_derived' ? 'rgba(73, 170, 242, 0.45)' : 'rgba(184, 173, 210, 0.45)'};
  background: rgba(255, 255, 255, 0.04);
  min-height: 28px;
`

const LABELS: Record<EventStatus, string> = {
  observed: 'Observed',
  registry_derived: 'Registry Derived',
}

interface EventStatusBadgeProps {
  status: EventStatus
}

const EventStatusBadge: React.FC<EventStatusBadgeProps> = ({ status }) => {
  const { t } = useTranslation()
  return (
    <Badge $status={status}>
      <Text fontSize="12px" color="text">
        {t(LABELS[status])}
      </Text>
    </Badge>
  )
}

export default EventStatusBadge
