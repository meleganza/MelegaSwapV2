import React from 'react'
import styled from 'styled-components'
import { HumanStatus, statusTone, toHumanStatus } from './status-utils'

const Badge = styled.span<{ $color: string }>`
  display: inline-block;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 6px;
  color: ${({ $color }) => $color};
  border: 1px solid ${({ $color }) => `${$color}44`};
  background: rgba(0, 0, 0, 0.2);
`

export interface EconomicBadgeProps {
  status: string | HumanStatus
  raw?: boolean
}

export const EconomicBadge: React.FC<EconomicBadgeProps> = ({ status, raw = false }) => {
  const human = raw ? (status as HumanStatus) : toHumanStatus(status)
  return <Badge $color={statusTone(human)}>{human}</Badge>
}

export default EconomicBadge
