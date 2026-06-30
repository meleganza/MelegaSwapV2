import React from 'react'
import styled from 'styled-components'
import { melegaOperational as tokens } from 'ui/tokens'
import { HumanPageHeader } from './HumanPageHeader'
import { HumanEarnNav } from './HumanEarnNav'

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`

const SectionHeading = styled.h2`
  margin: 4px 0 0;
  font-family: ${tokens.fontDisplay};
  font-size: clamp(18px, 2.5vw, 22px);
  font-weight: 600;
  color: ${tokens.text};
  letter-spacing: 0.02em;
`

const SectionSubtitle = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.55;
  color: ${tokens.textSecondary};
`

export interface HumanEarnChromeProps {
  sectionTitle: string
  sectionSubtitle: string
  primaryAction?: { href: string; label: string }
}

export const HumanEarnChrome: React.FC<HumanEarnChromeProps> = ({
  sectionTitle,
  sectionSubtitle,
  primaryAction,
}) => (
  <Wrap data-melega-earn-section="true">
    <HumanPageHeader
      title="Earn"
      subtitle="Stake liquidity or tokens to earn rewards."
      primaryAction={primaryAction}
    />
    <HumanEarnNav />
    <SectionHeading>{sectionTitle}</SectionHeading>
    <SectionSubtitle data-section-subtitle>{sectionSubtitle}</SectionSubtitle>
  </Wrap>
)

export default HumanEarnChrome
