import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { melegaOperational as tokens } from 'ui/tokens'

const Wrap = styled.header`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 8px;
`

const Title = styled.h1`
  margin: 0;
  font-family: ${tokens.fontDisplay};
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: ${tokens.text};
  line-height: 1.3;
`

const Subtitle = styled.p`
  margin: 0;
  font-size: 15px;
  color: ${tokens.textSecondary};
  line-height: 1.6;
  max-width: 640px;
`

const PrimaryAction = styled(Link)`
  display: inline-flex;
  align-self: flex-start;
  padding: 10px 18px;
  border-radius: ${tokens.radiusSm};
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.08));
  border: 1px solid ${tokens.borderGold};
  color: ${tokens.goldHighlight};
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: border-color ${tokens.transition};

  &:hover {
    border-color: ${tokens.gold};
    color: ${tokens.text};
  }
`

export interface EconomicHeroProps {
  title: string
  subtitle: string
  primaryAction?: { href: string; label: string }
  children?: React.ReactNode
}

export const EconomicHero: React.FC<EconomicHeroProps> = ({
  title,
  subtitle,
  primaryAction,
  children,
}) => (
  <Wrap>
    <Title>{title}</Title>
    <Subtitle>{subtitle}</Subtitle>
    {children}
    {primaryAction && <PrimaryAction href={primaryAction.href}>{primaryAction.label}</PrimaryAction>}
  </Wrap>
)

export default EconomicHero
