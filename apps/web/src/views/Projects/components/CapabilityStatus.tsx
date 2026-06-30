import React from 'react'
import styled from 'styled-components'
import { Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import {
  IntelligenceDisplayStatus,
  getIntelligenceStatusLabel,
  mapCapabilityToDisplayStatus,
} from 'registry/projects/intelligence'
import { CapabilityStatus as CapabilityStatusType } from 'registry/projects/types'

const Badge = styled.span<{ $status: IntelligenceDisplayStatus }>`
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid
    ${({ $status }) => {
      switch ($status) {
        case 'live':
          return 'rgba(49, 208, 170, 0.55)'
        case 'connected':
          return 'rgba(73, 170, 242, 0.45)'
        case 'observed':
          return 'rgba(184, 173, 210, 0.45)'
        case 'planned':
          return 'rgba(82, 50, 146, 0.45)'
        case 'deprecated':
          return 'rgba(128, 128, 128, 0.45)'
        case 'unavailable':
        default:
          return 'rgba(255, 255, 255, 0.15)'
      }
    }};
  background: rgba(255, 255, 255, 0.04);
  color: #ffffff;
`

interface CapabilityStatusProps {
  status: CapabilityStatusType | IntelligenceDisplayStatus
  notes?: string
  label?: string
}

const CapabilityStatus: React.FC<CapabilityStatusProps> = ({ status, notes, label }) => {
  const { t } = useTranslation()
  const displayStatus: IntelligenceDisplayStatus =
    typeof status === 'string' &&
    ['live', 'connected', 'observed', 'planned', 'deprecated', 'unavailable'].includes(status)
      ? (status as IntelligenceDisplayStatus)
      : mapCapabilityToDisplayStatus(status as CapabilityStatusType)

  const statusLabel = t(getIntelligenceStatusLabel(displayStatus))

  return (
    <span title={notes}>
      {label && (
        <Text as="span" fontSize="12px" color="textSubtle" mr="6px">
          {label}:
        </Text>
      )}
      <Badge $status={displayStatus}>{statusLabel}</Badge>
    </span>
  )
}

export default CapabilityStatus
