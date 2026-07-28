/**
 * LIQUIDITY_MODULE_001_HERO — concept introduction only.
 * Two journeys named; no Add Liquidity form; no AI Builder execution.
 */
import React from 'react'
import NextLink from 'next/link'
import styled from 'styled-components'
import { LiquidityHeroArtwork } from './LiquidityHeroArtwork'
import { LiquidityHeroTrustPanel } from './LiquidityHeroTrustPanel'
import { LIQUIDITY_HERO_COPY, liquidityHero } from './liquidityHeroTokens'

const Shell = styled.section`
  width: 100%;
  max-width: ${liquidityHero.contentMax};
  margin: ${liquidityHero.topAfterTrending} auto 0;
  box-sizing: border-box;
  background: ${liquidityHero.pageBg};
`

const Hero = styled.div`
  width: 100%;
  max-width: ${liquidityHero.heroW};
  min-height: ${liquidityHero.heroH};
  height: ${liquidityHero.heroH};
  margin: 0 auto;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: ${liquidityHero.leftW} ${liquidityHero.artworkW} ${liquidityHero.trustW};
  column-gap: ${liquidityHero.columnGap};
  align-items: center;
  overflow: hidden;

  @media (max-width: ${liquidityHero.tabletBreak}) {
    height: auto;
    min-height: 0;
    grid-template-columns: 1fr;
    row-gap: 16px;
    justify-items: center;
    text-align: center;
    padding: 0 16px 8px;
  }

  @media (max-width: ${liquidityHero.mobileBreak}) {
    max-height: ${liquidityHero.mobileHeroMaxH};
    padding: 0 16px 4px;
  }
`

const Left = styled.div`
  width: 100%;
  max-width: ${liquidityHero.leftW};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;

  @media (max-width: ${liquidityHero.tabletBreak}) {
    align-items: center;
    max-width: ${liquidityHero.mobileContentW};
  }

  @media (min-width: 431px) and (max-width: ${liquidityHero.tabletBreak}) {
    max-width: ${liquidityHero.mobile430ContentW};
  }
`

const Title = styled.h1`
  margin: 0;
  font-size: ${liquidityHero.titleSize};
  line-height: ${liquidityHero.titleLine};
  font-weight: ${liquidityHero.titleWeight};
  letter-spacing: ${liquidityHero.titleTracking};
  color: ${liquidityHero.titleColor};

  @media (max-width: ${liquidityHero.mobileBreak}) {
    font-size: ${liquidityHero.mobileTitleSize};
    line-height: ${liquidityHero.mobileTitleLine};
  }
`

const Description = styled.p`
  margin: ${liquidityHero.gapAfterTitle} 0 0;
  max-width: ${liquidityHero.descMaxW};
  font-size: ${liquidityHero.descSize};
  line-height: ${liquidityHero.descLine};
  font-weight: 400;
  color: ${liquidityHero.descColor};
  white-space: pre-line;
`

const Journeys = styled.p`
  margin: ${liquidityHero.gapAfterJourney} 0 0;
  max-width: ${liquidityHero.descMaxW};
  font-size: ${liquidityHero.journeySize};
  line-height: ${liquidityHero.journeyLine};
  font-weight: 500;
  color: ${liquidityHero.journeyColor};
`

const Actions = styled.div`
  margin-top: ${liquidityHero.gapBeforeActions};
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;

  @media (max-width: ${liquidityHero.tabletBreak}) {
    justify-content: center;
  }
`

const PrimaryCta = styled(NextLink)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${liquidityHero.primaryCtaW};
  height: ${liquidityHero.primaryCtaH};
  border-radius: ${liquidityHero.ctaRadius};
  background: ${liquidityHero.gold};
  color: #111;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  border: none;
  transition: background 0.15s ease;

  &:hover {
    background: ${liquidityHero.goldHover};
  }

  &:focus-visible {
    outline: ${liquidityHero.focusRing};
    outline-offset: ${liquidityHero.focusOffset};
  }
`

const Center = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
`

const Right = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 0;

  @media (max-width: ${liquidityHero.tabletBreak}) {
    justify-content: center;
  }
`

export const LiquidityHeroModule: React.FC = () => (
  <Shell
    data-testid="liquidity-hero-module"
    data-liquidity-module="001-hero"
    data-architecture="LIQUIDITY_ARCHITECTURE_000"
    aria-labelledby="liquidity-hero-title"
  >
    <Hero data-testid="liquidity-hero-geometry" data-liquidity-hero-geometry="1376x260">
      <Left data-testid="liquidity-hero-left">
        <Title id="liquidity-hero-title">{LIQUIDITY_HERO_COPY.title}</Title>
        <Description>{LIQUIDITY_HERO_COPY.description}</Description>
        <Journeys data-testid="liquidity-hero-journeys">{LIQUIDITY_HERO_COPY.journeys}</Journeys>
        <Actions>
          <PrimaryCta href={liquidityHero.addLiquidityHref} data-testid="liquidity-hero-cta-add">
            {LIQUIDITY_HERO_COPY.primaryCta}
          </PrimaryCta>
        </Actions>
      </Left>
      <Center data-testid="liquidity-hero-center">
        <LiquidityHeroArtwork />
      </Center>
      <Right data-testid="liquidity-hero-right">
        <LiquidityHeroTrustPanel />
      </Right>
    </Hero>
  </Shell>
)

export default LiquidityHeroModule
