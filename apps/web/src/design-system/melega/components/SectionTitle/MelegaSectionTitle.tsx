import React from 'react'
import styled from 'styled-components'
import { colors, typography } from '../../tokens'

export interface MelegaSectionTitleProps {
  title: string
  action?: React.ReactNode
  subtitle?: string
  cockpit?: boolean
}

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
`

const Title = styled.h2<{ $cockpit?: boolean }>`
  margin: 0;
  font-family: ${typography.fontFamily.body};
  font-size: ${({ $cockpit }) => ($cockpit ? '24px' : typography.fontSize['3xl'])};
  font-weight: ${typography.fontWeight.heavy};
  color: ${colors.textPrimary};
  line-height: ${({ $cockpit }) => ($cockpit ? '1.15' : typography.lineHeight.snug)};

  @media (max-width: 767px) {
    font-size: ${({ $cockpit }) => ($cockpit ? '22px' : typography.fontSize['2xl'])};
  }
`

const Subtitle = styled.p`
  margin: 4px 0 0;
  font-size: ${typography.fontSize.base};
  color: ${colors.textSecondary};
`

const Action = styled.div`
  font-size: 13px;
  color: ${colors.gold};
  flex-shrink: 0;
`

export const MelegaSectionTitle: React.FC<MelegaSectionTitleProps> = ({ title, subtitle, action, cockpit }) => (
  <div>
    <Row>
      <div>
        <Title $cockpit={cockpit}>{title}</Title>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
      </div>
      {action && <Action>{action}</Action>}
    </Row>
  </div>
)

export default MelegaSectionTitle
