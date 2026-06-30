import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { melegaOperational as tokens } from 'ui/tokens'

const Wrap = styled.header`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Title = styled.h1`
  margin: 0;
  font-family: ${tokens.fontDisplay};
  font-size: clamp(24px, 3vw, 32px);
  font-weight: 600;
  letter-spacing: 0.02em;
  color: ${tokens.text};
  line-height: 1.25;
`

const Subtitle = styled.p`
  margin: 0;
  font-size: 16px;
  color: ${tokens.textSecondary};
  line-height: 1.65;
  max-width: 640px;
`

const PrimaryAction = styled(Link)`
  display: inline-flex;
  align-self: flex-start;
  margin-top: 8px;
  padding: 12px 22px;
  border-radius: ${tokens.radiusSm};
  background: ${tokens.gold};
  border: 1px solid ${tokens.gold};
  color: ${tokens.bg};
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: opacity ${tokens.transition};

  &:hover {
    opacity: 0.9;
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
