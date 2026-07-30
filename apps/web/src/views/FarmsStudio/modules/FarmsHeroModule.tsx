/**
 * FARMS_MODULE_001 — Farms Hero (orientation only).
 * Runtime-independent. Does not mount Modules 002–010. No live farm queries.
 */
import React, { useCallback } from 'react'
import styled from 'styled-components'
import { typography } from 'design-system/melega'
import { FarmsHeroArtwork } from './FarmsHeroArtwork'
import { FarmsHeroFeaturedCompact } from './FarmsHeroFeaturedCompact'
import { FARMS_HERO_COPY, farmsHero } from './farmsHeroTokens'

const Module = styled.section`
  position: relative;
  width: 100%;
  max-width: ${farmsHero.contentMax};
  height: auto;
  min-height: ${farmsHero.heroH};
  min-width: 0;
  box-sizing: border-box;
  overflow: visible;
  font-family: ${typography.fontFamily.body};
  color: ${farmsHero.titleColor};
  background:
    radial-gradient(ellipse 42% 80% at 52% 55%, rgba(244, 196, 48, 0.07) 0%, rgba(8, 8, 8, 0) 70%),
    radial-gradient(ellipse 36% 70% at 18% 40%, rgba(34, 197, 94, 0.05) 0%, rgba(8, 8, 8, 0) 68%),
    transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;

  @media (max-width: ${farmsHero.tabletBreak}) {
    height: auto;
    max-height: none;
  }

  @media (max-width: ${farmsHero.mobileBreak}) {
    width: 100%;
    max-width: none;
    height: auto;
    max-height: ${farmsHero.mobileHeroMaxH};
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
`

const Inner = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: ${farmsHero.leftW} ${farmsHero.artworkW} ${farmsHero.trustW};
  column-gap: ${farmsHero.columnGap};
  align-items: center;
  min-width: 0;
  box-sizing: border-box;

  @media (max-width: ${farmsHero.tabletBreak}) {
    height: auto;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    column-gap: 24px;
    row-gap: 20px;
  }

  @media (max-width: ${farmsHero.mobileBreak}) {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: ${farmsHero.mobileColumnGap};
  }
`

const Left = styled.div`
  width: ${farmsHero.leftW};
  max-width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;

  @media (max-width: ${farmsHero.tabletBreak}) {
    width: 100%;
    grid-column: 1;
  }

  @media (max-width: ${farmsHero.mobileBreak}) {
    width: 100%;
  }
`

const Title = styled.h1`
  margin: 0;
  font-size: ${farmsHero.titleSize};
  line-height: ${farmsHero.titleLine};
  font-weight: ${farmsHero.titleWeight};
  letter-spacing: ${farmsHero.titleTracking};
  color: ${farmsHero.titleColor};

  @media (max-width: ${farmsHero.mobileBreak}) {
    font-size: ${farmsHero.mobileTitleSize};
    line-height: ${farmsHero.mobileTitleLine};
  }
`

const Description = styled.p`
  margin: ${farmsHero.gapAfterTitle} 0 0;
  max-width: ${farmsHero.descMaxW};
  font-size: ${farmsHero.descSize};
  line-height: ${farmsHero.descLine};
  font-weight: 400;
  color: ${farmsHero.descColor};
  white-space: pre-line;

  @media (max-width: ${farmsHero.mobileBreak}) {
    margin-top: ${farmsHero.mobileGapAfterTitle};
    font-size: ${farmsHero.mobileDescSize};
    line-height: ${farmsHero.mobileDescLine};
  }
`

const Actions = styled.div`
  margin-top: ${farmsHero.gapBeforeActions};
  display: flex;
  flex-wrap: wrap;
  gap: ${farmsHero.ctaGap};
  align-items: center;

  @media (max-width: ${farmsHero.mobileBreak}) {
    margin-top: ${farmsHero.mobileGapBeforeActions};
    width: 100%;
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
  }
`

const PrimaryCta = styled.a`
  box-sizing: border-box;
  width: ${farmsHero.primaryCtaW};
  height: ${farmsHero.primaryCtaH};
  min-height: 44px;
  border-radius: ${farmsHero.ctaRadius};
  background: ${farmsHero.gold};
  color: #111;
  font-size: 14px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  border: none;
  cursor: pointer;

  &:hover {
    background: ${farmsHero.goldHover};
  }

  &:focus-visible {
    outline: ${farmsHero.focusRing};
    outline-offset: ${farmsHero.focusOffset};
  }

  @media (max-width: ${farmsHero.mobileBreak}) {
    width: 100%;
    min-width: 0;
  }
`

const ArtCol = styled.div`
  width: ${farmsHero.artworkW};
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;

  @media (max-width: ${farmsHero.tabletBreak}) {
    width: 100%;
    grid-column: 2;
  }

  @media (max-width: ${farmsHero.mobileBreak}) {
    width: 100%;
    justify-content: center;
  }
`

const TrustCol = styled.div`
  width: ${farmsHero.trustW};
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  gap: 12px;
  min-width: 0;

  @media (max-width: ${farmsHero.tabletBreak}) {
    width: 100%;
    grid-column: 1 / -1;
    justify-content: stretch;
  }

  @media (max-width: ${farmsHero.mobileBreak}) {
    width: 100%;
    justify-content: center;
  }
`

function scrollToExploreFarms() {
  if (typeof document === 'undefined') return false
  const el =
    document.getElementById('explore-farms') ||
    document.querySelector<HTMLElement>('[data-fs-explore-farms="true"]')
  if (!el) return false
  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  return true
}

export const FarmsHeroModule: React.FC = () => {
  const onExploreFarms = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (scrollToExploreFarms()) {
      e.preventDefault()
    }
  }, [])

  return (
    <Module
      data-testid="farms-hero-module"
      data-farms-module="001"
      data-farms-architecture="000"
      data-pixel-farms-hero="1376x260"
      aria-labelledby="farms-hero-title"
    >
      <Inner data-testid="farms-hero-inner">
        <Left data-testid="farms-hero-left">
          <Title id="farms-hero-title">{FARMS_HERO_COPY.title}</Title>
          <Description>{FARMS_HERO_COPY.description}</Description>
          <Actions>
            <PrimaryCta
              href={farmsHero.exploreFarmsHref}
              onClick={onExploreFarms}
              data-testid="farms-hero-explore-farms"
            >
              {FARMS_HERO_COPY.primaryCta}
            </PrimaryCta>
          </Actions>
        </Left>
        <ArtCol>
          <FarmsHeroArtwork />
        </ArtCol>
        <TrustCol>
          {/* FarmsHeroTrustPanel ("Why Farm on Melega DEX?") unmounted — kept Featured compact balanced without the second stacked card. */}
          <FarmsHeroFeaturedCompact />
        </TrustCol>
      </Inner>
    </Module>
  )
}

export default FarmsHeroModule
