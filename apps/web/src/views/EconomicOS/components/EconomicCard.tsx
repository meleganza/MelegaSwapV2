import React from 'react'
import styled from 'styled-components'
import { melegaOperational as tokens } from 'ui/tokens'

const Card = styled.article`
  background: ${tokens.surface};
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radius};
  padding: 18px 20px;
  font-size: 13px;
  color: ${tokens.textSecondary};
  line-height: 1.55;
`

const CardTitle = styled.h3`
  margin: 0 0 8px;
  font-family: ${tokens.fontDisplay};
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: ${tokens.text};
`

const CardMeta = styled.p`
  margin: 8px 0 0;
  font-size: 12px;
  color: ${tokens.textSecondary};
`

export interface EconomicCardProps {
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export const EconomicCard: React.FC<EconomicCardProps> = ({ title, children, footer }) => (
  <Card>
    {title && <CardTitle>{title}</CardTitle>}
    {children}
    {footer && <CardMeta>{footer}</CardMeta>}
  </Card>
)

export default EconomicCard
