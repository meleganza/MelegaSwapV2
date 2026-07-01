import React from 'react'
import styled from 'styled-components'
import { colors, typography } from '../../tokens'
import { MelegaSectionTitle } from '../SectionTitle'

export interface MelegaSectionCardProps {
  title: string
  action?: React.ReactNode
  subtitle?: string
  children: React.ReactNode
  minHeight?: string
  compact?: boolean
  'data-testid'?: string
}

const Card = styled.section<{ $minHeight?: string; $compact?: boolean }>`
  background: ${colors.surface1};
  border: 1px solid ${colors.border};
  border-radius: 18px;
  padding: ${({ $compact }) => ($compact ? '16px' : '22px')};
  box-sizing: border-box;
  min-height: ${({ $minHeight }) => $minHeight || '180px'};
  box-shadow: none;
`

export const MelegaSectionCard: React.FC<MelegaSectionCardProps> = ({
  title,
  action,
  subtitle,
  children,
  minHeight,
  compact,
  'data-testid': testId,
}) => (
  <Card $minHeight={minHeight} $compact={compact} data-testid={testId}>
    <MelegaSectionTitle title={title} subtitle={subtitle} action={action} cockpit />
    {children}
  </Card>
)

export default MelegaSectionCard
