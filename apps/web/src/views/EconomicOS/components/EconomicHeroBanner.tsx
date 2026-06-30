import React from 'react'
import styled from 'styled-components'
import { melegaOperational as tokens } from 'ui/tokens'
import { EconomicBadge } from './EconomicBadge'

const Banner = styled.div`
  position: relative;
  border-radius: ${tokens.radiusLg};
  overflow: hidden;
  border: 1px solid ${tokens.border};
  min-height: 220px;
  display: flex;
  align-items: flex-end;
  padding: 40px 36px;
  background: ${tokens.surface};

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 50% 100%, rgba(212, 175, 55, 0.18) 0%, transparent 55%),
      radial-gradient(ellipse 120% 80% at 50% 120%, rgba(255, 160, 60, 0.08) 0%, transparent 50%),
      linear-gradient(180deg, #000000 0%, #0a0a0a 40%, #111111 100%);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, ${tokens.borderGold}, transparent);
    pointer-events: none;
  }
`

const Content = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 720px;
`

const Eyebrow = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: ${tokens.textSecondary};
  letter-spacing: 0.02em;
`

const Title = styled.h1`
  margin: 0;
  font-family: ${tokens.fontDisplay};
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 700;
  color: ${tokens.text};
  letter-spacing: 0.03em;
  line-height: 1.15;
`

const Subtitle = styled.p`
  margin: 0;
  font-size: 16px;
  line-height: 1.65;
  color: ${tokens.textSecondary};
  max-width: 600px;
`

const Badges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
`

export interface EconomicHeroBannerProps {
  eyebrow?: string
  title: string
  subtitle: string
  badges?: Array<{ label: string; status?: string }>
}

export const EconomicHeroBanner: React.FC<EconomicHeroBannerProps> = ({
  eyebrow,
  title,
  subtitle,
  badges,
}) => (
  <Banner>
    <Content>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <Title>{title}</Title>
      <Subtitle>{subtitle}</Subtitle>
      {badges && badges.length > 0 && (
        <Badges>
          {badges.map((badge) => (
            <EconomicBadge key={badge.label} status={badge.status ?? badge.label} />
          ))}
        </Badges>
      )}
    </Content>
  </Banner>
)

export default EconomicHeroBanner
