import React from 'react'
import styled, { keyframes } from 'styled-components'
import { PREMIUM_FONT_DISPLAY } from 'design-system/melega/tokens/premiumStudio'
import { homeTypography } from './homeTradeTokens'

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const Hero = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 2px 0;
  animation: ${fadeIn} 420ms ease-out both;

  @media (min-width: 768px) {
    display: none;
  }
`

const Title = styled.h1`
  margin: 0;
  font-family: ${PREMIUM_FONT_DISPLAY};
  font-size: ${homeTypography.mobileHeroTitle.size};
  font-weight: ${homeTypography.mobileHeroTitle.weight};
  line-height: ${homeTypography.mobileHeroTitle.lineHeight};
  letter-spacing: -0.02em;
  color: #ffffff;
`

const Support = styled.p`
  margin: 0;
  max-width: 34ch;
  font-family: ${homeTypography.mobileBody.fontFamily};
  font-size: ${homeTypography.mobileBody.size};
  font-weight: ${homeTypography.mobileBody.weight};
  line-height: ${homeTypography.mobileBody.lineHeight};
  color: #a3a3a3;
`

export const HomeHeroStatement: React.FC = () => (
  <Hero data-home-section="hero" aria-label="Melega DEX">
    <Title>Trade smarter on Melega DEX</Title>
    <Support>Swap, discover, and earn across the Melega ecosystem — one place to move.</Support>
  </Hero>
)

export default HomeHeroStatement
