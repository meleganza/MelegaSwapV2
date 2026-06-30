import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { melegaOperational as tokens } from 'ui/tokens'

const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: ${tokens.cardPadding};
  background: ${tokens.surface};
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radius};
  text-decoration: none;
  min-height: 180px;
  transition: border-color ${tokens.transition}, background ${tokens.transition};

  &:hover {
    border-color: ${tokens.borderGold};
    background: ${tokens.surfaceSecondary};
  }
`

const Icon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${tokens.radiusSm};
  border: 1px solid ${tokens.borderGold};
  color: ${tokens.gold};
  font-size: 18px;
  font-family: ${tokens.fontDisplay};
`

const Title = styled.h3`
  margin: 0;
  font-family: ${tokens.fontDisplay};
  font-size: 18px;
  font-weight: 600;
  color: ${tokens.text};
  letter-spacing: 0.02em;
`

const Description = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: ${tokens.textSecondary};
  flex: 1;
`

const Action = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: ${tokens.gold};
`

export interface EconomicActionCardProps {
  href: string
  title: string
  description: string
  actionLabel: string
  icon?: string
}

export const EconomicActionCard: React.FC<EconomicActionCardProps> = ({
  href,
  title,
  description,
  actionLabel,
  icon,
}) => (
  <Card href={href}>
    <Icon aria-hidden>{icon ?? '◆'}</Icon>
    <Title>{title}</Title>
    <Description>{description}</Description>
    <Action>{actionLabel} →</Action>
  </Card>
)

export default EconomicActionCard
