/**
 * FARMS_MODULE_001 — Farms Hero (orientation only).
 * Primary CTA: Create Farm (modal). Secondary: Explore Farms.
 */
import React, { useCallback } from 'react'
import styled from 'styled-components'
import { typography } from 'design-system/melega'
import { CanonicalHeroEyebrow } from 'views/shared/CanonicalHeroEyebrow'
import { FarmsHeroArtwork } from './FarmsHeroArtwork'
import { FarmsHeroFeaturedCompact } from './FarmsHeroFeaturedCompact'
import { FARMS_HERO_COPY, farmsHero } from './farmsHeroTokens'

const Module = styled.section`
  position: relative;
  width: 100%;
  max-width: ${farmsHero.contentMax};
  height: 216px;
  min-width: 0;
  box-sizing: border-box;
  overflow: hidden;
  font-family: ${typography.fontFamily.body};
  color: ${farmsHero.titleColor};
  padding: 16px 20px;
  background: radial-gradient(circle at 18% 30%, rgba(244, 196, 48, 0.12), transparent 34%),
    linear-gradient(105deg, #111006 0%, #090909 43%, #060606 100%);
  border: 1px solid rgba(221, 185, 47, 0.22);
  border-radius: 18px;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.3);

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: radial-gradient(circle, rgba(244, 196, 48, 0.2) 0 1px, transparent 1.4px);
    background-size: 52px 52px;
    opacity: 0.12;
  }

  @media (max-width: ${farmsHero.tabletBreak}) {
    padding: 16px;
  }

  @media (max-width: ${farmsHero.mobileBreak}) {
    width: 100%;
    max-width: none;
    height: 224px;
    max-height: none;

    [data-testid='farms-hero-artwork'] {
      width: 100% !important;
      max-width: 100% !important;
      height: 100% !important;
      margin: 0 !important;
      align-self: stretch !important;
      justify-self: stretch !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
`

const Inner = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: minmax(270px, 0.34fr) minmax(300px, 0.39fr) minmax(240px, 0.27fr);
  column-gap: 16px;
  align-items: center;
  min-width: 0;
  box-sizing: border-box;

  @media (max-width: ${farmsHero.tabletBreak}) {
    height: 100%;
    grid-template-columns: minmax(240px, 0.36fr) minmax(0, 0.37fr) minmax(0, 0.27fr);
    column-gap: 10px;
  }

  @media (max-width: ${farmsHero.mobileBreak}) {
    display: grid;
    grid-template-columns: minmax(188px, 0.62fr) minmax(0, 0.38fr);
    gap: 10px;
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
  margin: 6px 0 0;
  font-size: 46px;
  line-height: 52px;
  font-weight: 750;
  letter-spacing: -0.025em;
  color: ${farmsHero.titleColor};

  @media (max-width: ${farmsHero.mobileBreak}) {
    font-size: 34px;
    line-height: 40px;
  }
`

const Description = styled.p`
  margin: 8px 0 0;
  max-width: ${farmsHero.descMaxW};
  font-size: 14px;
  line-height: 21px;
  font-weight: 400;
  color: ${farmsHero.descColor};
  white-space: pre-line;

  @media (max-width: ${farmsHero.mobileBreak}) {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-size: 12px;
    line-height: 18px;
  }
`

const Actions = styled.div`
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: ${farmsHero.ctaGap};
  align-items: center;

  @media (max-width: ${farmsHero.mobileBreak}) {
    margin-top: 8px;
    width: 100%;
    flex-wrap: nowrap;
    gap: 6px;
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`

const PrimaryCta = styled.button`
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
  font-family: ${typography.fontFamily.body};

  &:hover {
    background: ${farmsHero.goldHover};
  }

  &:focus-visible {
    outline: ${farmsHero.focusRing};
    outline-offset: ${farmsHero.focusOffset};
  }

  @media (max-width: ${farmsHero.mobileBreak}) {
    width: auto;
    min-width: 90px;
    height: 32px;
    min-height: 32px;
    padding: 0 8px;
    font-size: 10px;
    flex: 0 0 auto;
  }
`

const SecondaryCta = styled.a`
  box-sizing: border-box;
  width: ${farmsHero.secondaryCtaW};
  height: ${farmsHero.secondaryCtaH};
  min-height: 44px;
  border-radius: ${farmsHero.ctaRadius};
  background: transparent;
  color: ${farmsHero.gold};
  font-size: 14px;
  font-weight: 750;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  border: 1px solid rgba(244, 196, 48, 0.45);
  cursor: pointer;

  &:hover {
    border-color: ${farmsHero.gold};
  }

  &:focus-visible {
    outline: ${farmsHero.focusRing};
    outline-offset: ${farmsHero.focusOffset};
  }

  @media (max-width: ${farmsHero.mobileBreak}) {
    width: auto;
    min-width: 90px;
    height: 32px;
    min-height: 32px;
    padding: 0 8px;
    font-size: 10px;
    flex: 0 0 auto;
  }
`

const ArtCol = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;

  @media (max-width: ${farmsHero.tabletBreak}) {
    width: 100%;
  }

  @media (max-width: ${farmsHero.mobileBreak}) {
    width: 100%;
    justify-content: center;
    overflow: hidden;
    border-radius: 0 16px 16px 0;
  }
`

const TrustCol = styled.div`
  width: 100%;
  height: 100%;
  max-height: 176px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  align-self: center;
  gap: 12px;
  min-width: 0;

  @media (max-width: ${farmsHero.tabletBreak}) {
    width: 100%;
  }

  @media (max-width: ${farmsHero.mobileBreak}) {
    display: none;
  }
`

function scrollToExploreFarms() {
  if (typeof document === 'undefined') return false
  const el =
    document.getElementById('explore-farms') || document.querySelector<HTMLElement>('[data-fs-explore-farms="true"]')
  if (!el) return false
  const reduce =
    typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  return true
}

export const FarmsHeroModule: React.FC<{ onRequestCreateFarm?: () => void }> = ({ onRequestCreateFarm }) => {
  const onExploreFarms = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (scrollToExploreFarms()) {
      e.preventDefault()
    }
  }, [])

  const onCreateFarm = useCallback(() => {
    onRequestCreateFarm?.()
  }, [onRequestCreateFarm])

  return (
    <Module
      data-testid="farms-hero-module"
      data-farms-module="001"
      data-farms-architecture="000"
      data-pixel-farms-hero="canonical-216"
      data-canonical-hero-height="216"
      aria-labelledby="farms-hero-title"
    >
      <Inner data-testid="farms-hero-inner">
        <Left data-testid="farms-hero-left">
          <CanonicalHeroEyebrow icon="farms">Melega DEX Earn</CanonicalHeroEyebrow>
          <Title id="farms-hero-title">{FARMS_HERO_COPY.title}</Title>
          <Description>{FARMS_HERO_COPY.description}</Description>
          <Actions>
            <PrimaryCta type="button" onClick={onCreateFarm} data-testid="farms-hero-create-farm">
              {FARMS_HERO_COPY.primaryCta}
            </PrimaryCta>
            <SecondaryCta
              href={farmsHero.exploreFarmsHref}
              onClick={onExploreFarms}
              data-testid="farms-hero-explore-farms"
            >
              {FARMS_HERO_COPY.secondaryCta}
            </SecondaryCta>
          </Actions>
        </Left>
        <ArtCol>
          <FarmsHeroArtwork />
        </ArtCol>
        <TrustCol>
          <FarmsHeroFeaturedCompact />
        </TrustCol>
      </Inner>
    </Module>
  )
}

export default FarmsHeroModule
