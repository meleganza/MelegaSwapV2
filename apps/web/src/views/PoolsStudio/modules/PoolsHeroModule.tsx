/**
 * POOLS_MODULE_001 — Pools Hero (orientation only).
 * Does not mount Modules 002–010. Does not read live pool runtime.
 */
import React, { useCallback } from 'react'
import styled from 'styled-components'
import { typography } from 'design-system/melega'
import { CanonicalHeroEyebrow } from 'views/shared/CanonicalHeroEyebrow'
import { PoolsHeroArtwork } from './PoolsHeroArtwork'
import { PoolsHeroFeaturedCompact } from './PoolsHeroFeaturedCompact'
import { POOLS_HERO_COPY, poolsHero } from './poolsHeroTokens'

const Module = styled.section`
  position: relative;
  width: 100%;
  max-width: ${poolsHero.contentMax};
  height: 216px;
  min-width: 0;
  box-sizing: border-box;
  overflow: hidden;
  font-family: ${typography.fontFamily.body};
  color: ${poolsHero.titleColor};
  padding: 20px;
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

  @media (max-width: ${poolsHero.tabletBreak}) {
    padding: 16px;
  }

  @media (max-width: ${poolsHero.mobileBreak}) {
    width: 100%;
    max-width: none;
    height: 224px;
    max-height: none;
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

  @media (max-width: ${poolsHero.tabletBreak}) {
    height: 100%;
    grid-template-columns: minmax(240px, 0.36fr) minmax(0, 0.37fr) minmax(0, 0.27fr);
    column-gap: 10px;
  }

  @media (max-width: ${poolsHero.mobileBreak}) {
    display: grid;
    grid-template-columns: minmax(150px, 0.54fr) minmax(0, 0.46fr);
    gap: 10px;
  }
`

const Left = styled.div`
  width: 100%;
  max-width: ${poolsHero.leftW};
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;

  @media (max-width: ${poolsHero.tabletBreak}) {
    width: 100%;
    grid-column: 1;
  }

  @media (max-width: ${poolsHero.mobileBreak}) {
    width: 100%;
  }
`

const Title = styled.h1`
  margin: 6px 0 0;
  font-size: 46px;
  line-height: 52px;
  font-weight: 750;
  letter-spacing: -0.025em;
  color: ${poolsHero.titleColor};

  @media (max-width: ${poolsHero.mobileBreak}) {
    font-size: 34px;
    line-height: 40px;
  }
`

const Description = styled.p`
  margin: 8px 0 0;
  max-width: ${poolsHero.descMaxW};
  font-size: 14px;
  line-height: 21px;
  font-weight: 400;
  color: ${poolsHero.descColor};

  @media (max-width: ${poolsHero.mobileBreak}) {
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
  gap: ${poolsHero.ctaGap};
  align-items: center;

  @media (max-width: ${poolsHero.mobileBreak}) {
    width: 100%;
    margin-top: 8px;
    display: flex;
    flex-wrap: nowrap;
    gap: 6px;
  }
`

const PrimaryCta = styled.a`
  box-sizing: border-box;
  width: ${poolsHero.primaryCtaW};
  height: ${poolsHero.primaryCtaH};
  min-height: 44px;
  border-radius: ${poolsHero.ctaRadius};
  background: ${poolsHero.gold};
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
    background: ${poolsHero.goldHover};
  }

  &:focus-visible {
    outline: ${poolsHero.focusRing};
    outline-offset: ${poolsHero.focusOffset};
  }

  @media (max-width: ${poolsHero.mobileBreak}) {
    width: auto;
    min-width: 104px;
    height: 32px;
    min-height: 32px;
    padding: 0 10px;
    font-size: 11px;
  }
`

const ArtCol = styled.div`
  width: 100%;
  max-width: ${poolsHero.artworkW};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;

  @media (max-width: ${poolsHero.tabletBreak}) {
    width: 100%;
  }

  @media (max-width: ${poolsHero.mobileBreak}) {
    width: 100%;
    justify-content: center;
  }
`

const TrustCol = styled.div`
  width: 100%;
  max-width: ${poolsHero.trustW};
  max-height: 176px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  gap: 12px;
  min-width: 0;

  @media (max-width: ${poolsHero.tabletBreak}) {
    width: 100%;
  }

  @media (max-width: ${poolsHero.mobileBreak}) {
    display: none;
  }
`

function scrollToCreatePool() {
  if (typeof document === 'undefined') return false
  const el = document.getElementById('create-pool')
  if (!el) return false
  const reduce =
    typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  return true
}

export const PoolsHeroModule: React.FC<{ onRequestCreatePool?: () => void }> = ({ onRequestCreatePool }) => {
  const onCreatePool = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (onRequestCreatePool) {
        e.preventDefault()
        onRequestCreatePool()
        return
      }
      if (scrollToCreatePool()) {
        e.preventDefault()
      }
    },
    [onRequestCreatePool],
  )

  return (
    <Module
      data-testid="pools-hero-module"
      data-pools-module="001"
      data-pools-architecture="000"
      data-pixel-pools-hero="canonical-216"
      data-canonical-hero-height="216"
      aria-labelledby="pools-hero-title"
    >
      <Inner data-testid="pools-hero-inner">
        <Left data-testid="pools-hero-left">
          <CanonicalHeroEyebrow icon="pools">Melega DEX Earn</CanonicalHeroEyebrow>
          <Title id="pools-hero-title">{POOLS_HERO_COPY.title}</Title>
          <Description>{POOLS_HERO_COPY.description}</Description>
          <Actions>
            <PrimaryCta href={poolsHero.createPoolHref} onClick={onCreatePool} data-testid="pools-hero-create-pool">
              {POOLS_HERO_COPY.primaryCta}
            </PrimaryCta>
          </Actions>
        </Left>
        <ArtCol>
          <PoolsHeroArtwork />
        </ArtCol>
        <TrustCol data-ps-hero-featured>
          <PoolsHeroFeaturedCompact />
        </TrustCol>
      </Inner>
    </Module>
  )
}

export default PoolsHeroModule
