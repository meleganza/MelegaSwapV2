import React from 'react'
import styled from 'styled-components'
import { Flex, Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { EVENT_TYPE_LABELS } from 'registry/events/constants'
import { EventType } from 'registry/events/types'

const Badge = styled(Flex)`
  align-items: center;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgba(49, 208, 170, 0.45);
  background: rgba(49, 208, 170, 0.1);
  min-height: 28px;
`

interface EventTypeBadgeProps {
  eventType: EventType
}

const EventTypeBadge: React.FC<EventTypeBadgeProps> = ({ eventType }) => {
  const { t } = useTranslation()
  return (
    <Badge>
      <Text fontSize="12px" color="text">
        {t(EVENT_TYPE_LABELS[eventType])}
      </Text>
    </Badge>
  )
}

export default EventTypeBadge
