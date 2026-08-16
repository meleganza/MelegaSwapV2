import React from 'react'
import styled from 'styled-components'
import { FeaturedProjectsRail } from 'views/HomeTrade/FeaturedProjectsRail'
import { CanonicalHeroEyebrow } from 'views/shared/CanonicalHeroEyebrow'
import { tradeColors } from '../tradeTokens'

const Hero = styled.section`
  position: relative;
  width: 100%;
  height: 216px;
  box-sizing: border-box;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(221, 185, 47, 0.22);
  background: radial-gradient(circle at 18% 30%, rgba(244, 196, 48, 0.12), transparent 34%),
    linear-gradient(105deg, #111006 0%, #090909 43%, #060606 100%);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.3);
  display: grid;
  grid-template-columns: minmax(230px, 0.3fr) minmax(0, 0.7fr);
  gap: 20px;
  align-items: stretch;
  padding: 20px;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: radial-gradient(circle, rgba(244, 196, 48, 0.2) 0 1px, transparent 1.4px);
    background-size: 52px 52px;
    opacity: 0.12;
  }

  @media (max-width: 1099px) {
    grid-template-columns: minmax(210px, 0.27fr) minmax(0, 0.73fr);
    gap: 14px;
    padding: 16px;
  }

  @media (max-width: 767px) {
    height: 224px;
    grid-template-columns: minmax(150px, 0.38fr) minmax(0, 0.62fr);
    padding: 16px;
  }
`

const Copy = styled.div`
  position: relative;
  z-index: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 12px;

  @media (max-width: 767px) {
    padding-left: 2px;
  }
`

const Title = styled.h1`
  margin: 6px 0 0;
  color: ${tradeColors.text};
  font-size: 46px;
  line-height: 52px;
  font-weight: 750;
  letter-spacing: -0.025em;

  @media (max-width: 767px) {
    font-size: 34px;
    line-height: 40px;
  }
`

const Subtitle = styled.p`
  max-width: 330px;
  margin: 8px 0 0;
  color: ${tradeColors.secondary};
  font-size: 14px;
  line-height: 21px;

  @media (max-width: 767px) {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-size: 12px;
    line-height: 18px;
  }
`

const Featured = styled.div`
  position: relative;
  z-index: 1;
  min-width: 0;
  display: flex;
  align-items: stretch;
  box-sizing: border-box;
  padding: 4px 0;

  & > section {
    width: 100%;
    height: 100%;
    min-height: 0;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }

  & > section > div {
    height: 100%;
    min-height: 0;
    grid-auto-rows: minmax(0, 1fr);
  }

  & article {
    height: 100%;
    max-height: 100%;
    min-height: 0;
    padding: 8px 10px;
    gap: 3px;
  }

  & article > :nth-child(3) {
    min-height: 8px;
    height: 8px;
  }

  & article > :nth-child(4) > div > :first-child {
    white-space: nowrap;
    font-size: 8px;
    line-height: 10px;
  }

  & article > :last-child a {
    height: 28px;
    min-height: 28px;
  }

  @media (max-width: 1099px) {
    padding: 3px 0;
  }

  @media (max-width: 767px) {
    padding: 2px 0;
    overflow: hidden;

    & > section > div > * {
      flex: 0 0 100%;
      width: 100%;
      max-width: 100%;
      min-width: 0;
    }

    & article {
      width: 100%;
      max-width: 100%;
    }
  }
`

/** Canonical 216px Swap hero with the same factual Featured Projects feed used by Home. */
export const TradeSwapHero: React.FC = () => (
  <Hero data-testid="trade-swap-hero" data-canonical-hero-height="216">
    <Copy>
      <CanonicalHeroEyebrow icon="swap">Melega DEX Trading</CanonicalHeroEyebrow>
      <Title>Swap</Title>
      <Subtitle>Trade through the best available multichain route and discover verified featured markets.</Subtitle>
    </Copy>
    <Featured aria-label="Featured projects">
      <FeaturedProjectsRail />
    </Featured>
  </Hero>
)

export default TradeSwapHero
