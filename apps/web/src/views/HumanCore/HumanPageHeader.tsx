import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { melegaOperational as tokens } from 'ui/tokens'
import { EconomicBadge } from 'views/EconomicOS/components'

const Wrap = styled.header`
  width: 100%;
  max-width: ${tokens.contentMaxWidth};
  margin: 0 auto 28px;
  padding: 0 4px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Title = styled.h1`
  margin: 0;
  font-family: ${tokens.fontDisplay};
  font-size: clamp(24px, 3vw, 32px);
  font-weight: 600;
  color: ${tokens.text};
  letter-spacing: 0.02em;
`

const Subtitle = styled.p`
  margin: 0;
  font-size: 16px;
  line-height: 1.65;
  color: ${tokens.textSecondary};
  max-width: 680px;
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
`

const Primary = styled(Link)`
  display: inline-flex;
  padding: 12px 22px;
  border-radius: ${tokens.radiusSm};
  background: ${tokens.gold};
  color: ${tokens.bg};
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;

  &:hover {
    opacity: 0.92;
  }
`

const Secondary = styled(Link)`
  display: inline-flex;
  padding: 12px 22px;
  border-radius: ${tokens.radiusSm};
  border: 1px solid ${tokens.borderGold};
  color: ${tokens.gold};
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
`

const Badges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

export interface HumanPageHeaderProps {
  title: string
  subtitle?: string
  primaryAction?: { href: string; label: string }
  secondaryAction?: { href: string; label: string }
  badges?: Array<{ label: string; status?: string }>
}

export const HumanPageHeader: React.FC<HumanPageHeaderProps> = ({
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  badges,
}) => (
  <Wrap>
    <Title>{title}</Title>
    {subtitle && <Subtitle>{subtitle}</Subtitle>}
    {badges && badges.length > 0 && (
      <Badges>
        {badges.map((b) => (
          <EconomicBadge key={b.label} status={b.status ?? b.label} />
        ))}
      </Badges>
    )}
    {(primaryAction || secondaryAction) && (
      <Actions>
        {primaryAction && <Primary href={primaryAction.href}>{primaryAction.label}</Primary>}
        {secondaryAction && <Secondary href={secondaryAction.href}>{secondaryAction.label}</Secondary>}
      </Actions>
    )}
  </Wrap>
)

export default HumanPageHeader
