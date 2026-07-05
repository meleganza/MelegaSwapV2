import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { melegaOperational as tokens } from 'ui/tokens'

const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 200px;
  padding: 32px 24px;
  background: ${tokens.surface};
  border: 1px solid ${tokens.borderGold};
  border-radius: ${tokens.radiusLg};
  text-decoration: none;
  text-align: center;
  transition: background ${tokens.transition}, border-color ${tokens.transition};

  &:hover {
    background: ${tokens.surfaceSecondary};
    border-color: ${tokens.gold};
  }
`

const Icon = styled.span`
  font-size: 32px;
  color: ${tokens.gold};
  font-family: ${tokens.fontDisplay};
`

const Title = styled.span`
  font-family: ${tokens.fontDisplay};
  font-size: 22px;
  font-weight: 600;
  color: ${tokens.text};
`

const Sub = styled.span`
  font-size: 14px;
  color: ${tokens.textSecondary};
`

const Cta = styled.span`
  margin-top: 4px;
  padding: 12px 28px;
  border-radius: ${tokens.radiusSm};
  background: ${tokens.gold};
  color: ${tokens.bg};
  font-size: 14px;
  font-weight: 600;
`

export const HumanSwapEntryCard: React.FC<{ href?: string; compact?: boolean }> = ({
  href = '/trade',
  compact = false,
}) => (
  <Card href={href}>
    <Icon>⇄</Icon>
    <Title>Swap</Title>
    <Sub>{compact ? 'Trade tokens on Melega DEX' : 'Exchange tokens instantly on BNB Chain'}</Sub>
    <Cta>Swap now</Cta>
  </Card>
)

export default HumanSwapEntryCard
