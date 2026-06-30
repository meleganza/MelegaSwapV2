import React from 'react'
import styled from 'styled-components'
import { colors, typography, spacing, radius } from '../../tokens'
import { MelegaSectionTitle } from '../SectionTitle'

export interface MelegaSectionCardProps {
  title: string
  action?: React.ReactNode
  subtitle?: string
  children: React.ReactNode
  minHeight?: string
  'data-testid'?: string
}

const Card = styled.section<{ $minHeight?: string }>`
  background: ${colors.surface1};
  border: 1px solid ${colors.border};
  border-radius: ${radius.xl};
  padding: ${spacing[4]};
  box-sizing: border-box;
  min-height: ${({ $minHeight }) => $minHeight || '160px'};
  box-shadow: none;
`

export const MelegaSectionCard: React.FC<MelegaSectionCardProps> = ({
  title,
  action,
  subtitle,
  children,
  minHeight,
  'data-testid': testId,
}) => (
  <Card $minHeight={minHeight} data-testid={testId}>
    <MelegaSectionTitle title={title} subtitle={subtitle} action={action} />
    {children}
  </Card>
)

export default MelegaSectionCard
