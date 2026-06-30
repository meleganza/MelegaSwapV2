import React from 'react'
import styled from 'styled-components'
import { melegaOperational as tokens } from 'ui/tokens'

const Card = styled.article<{ $elevated?: boolean }>`
  background: ${({ $elevated }) => ($elevated ? tokens.surfaceSecondary : tokens.surface)};
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radius};
  padding: ${tokens.cardPadding};
  font-size: 14px;
  color: ${tokens.textSecondary};
  line-height: 1.65;
`

const CardTitle = styled.h3`
  margin: 0 0 10px;
  font-family: ${tokens.fontDisplay};
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: ${tokens.text};
`

const CardMeta = styled.p`
  margin: 12px 0 0;
  font-size: 13px;
  color: ${tokens.textSecondary};
`

export interface EconomicCardProps {
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  elevated?: boolean
}

export const EconomicCard: React.FC<EconomicCardProps> = ({ title, children, footer, elevated }) => (
  <Card $elevated={elevated}>
    {title && <CardTitle>{title}</CardTitle>}
    {children}
    {footer && <CardMeta>{footer}</CardMeta>}
  </Card>
)

export default EconomicCard
