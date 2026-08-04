/**
 * POOLS_MODULE_001 — Pools Hero (orientation only).
 * Does not mount Modules 002–010. Does not read live pool runtime.
 */
import React, { useCallback } from 'react'
import styled from 'styled-components'
import { typography } from 'design-system/melega'
import { PoolsHeroArtwork } from './PoolsHeroArtwork'
import { PoolsHeroFeaturedCompact } from './PoolsHeroFeaturedCompact'
import { POOLS_HERO_COPY, poolsHero } from './poolsHeroTokens'

const Module = styled.section`
  position: relative;
  width: 100%;
  max-width: ${poolsHero.contentMax};
  height: auto;
  min-height: ${poolsHero.heroH};
  min-width: 0;
  box-sizing: border-box;
  overflow: visible;
  font-family: ${typography.fontFamily.body};
  color: ${poolsHero.titleColor};
  background:
    radial-gradient(ellipse 42% 80% at 52% 55%, rgba(244, 196, 48, 0.07) 0%, rgba(8, 8, 8, 0) 70%),
    radial-gradient(ellipse 36% 70% at 18% 40%, rgba(59, 130, 246, 0.05) 0%, rgba(8, 8, 8, 0) 68%),
    transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;

  @media (max-width: ${poolsHero.tabletBreak}) {
    height: auto;
    max-height: none;
  }

  @media (max-width: ${poolsHero.mobileBreak}) {
    width: 100%;
    max-width: none;
    height: auto;
    max-height: ${poolsHero.mobileHeroMaxH};
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
  grid-template-columns: ${poolsHero.leftW} ${poolsHero.artworkW} ${poolsHero.trustW};
  column-gap: ${poolsHero.columnGap};
  align-items: center;
  min-width: 0;
  box-sizing: border-box;

  @media (max-width: ${poolsHero.tabletBreak}) {
    height: auto;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    column-gap: 24px;
    row-gap: 20px;
  }

  @media (max-width: ${poolsHero.mobileBreak}) {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }
`

const Left = styled.div`
  width: ${poolsHero.leftW};
  max-width: 100%;
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
  margin: 0;
  font-size: ${poolsHero.titleSize};
  line-height: ${poolsHero.titleLine};
  font-weight: ${poolsHero.titleWeight};
  letter-spacing: ${poolsHero.titleTracking};
  color: ${poolsHero.titleColor};

  @media (max-width: ${poolsHero.mobileBreak}) {
    font-size: ${poolsHero.mobileTitleSize};
    line-height: ${poolsHero.mobileTitleLine};
  }
`

const Description = styled.p`
  margin: ${poolsHero.gapAfterTitle} 0 0;
  max-width: ${poolsHero.descMaxW};
  font-size: ${poolsHero.descSize};
  line-height: ${poolsHero.descLine};
  font-weight: 400;
  color: ${poolsHero.descColor};
`

const Actions = styled.div`
  margin-top: ${poolsHero.gapBeforeActions};
  display: flex;
  flex-wrap: wrap;
  gap: ${poolsHero.ctaGap};
  align-items: center;

  @media (max-width: ${poolsHero.mobileBreak}) {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
`

const CommunityHint = styled.button`
  appearance: none;
  margin-top: 12px;
  max-width: ${poolsHero.communityCtaMaxW};
  padding: 0;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 2px;

  &:focus-visible {
    outline: ${poolsHero.focusRing};
    outline-offset: ${poolsHero.focusOffset};
  }
`

const CommunityTitle = styled.span`
  font-size: 12px;
  line-height: 16px;
  font-weight: 700;
  color: rgba(244, 196, 48, 0.92);
`

const CommunityBody = styled.span`
  font-size: 11px;
  line-height: 15px;
  font-weight: 450;
  color: rgba(255, 255, 255, 0.52);
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
    width: 100%;
    min-width: 0;
  }
`

const SecondaryCta = styled.a`
  box-sizing: border-box;
  width: ${poolsHero.secondaryCtaW};
  height: ${poolsHero.secondaryCtaH};
  min-height: 44px;
  border-radius: ${poolsHero.ctaRadius};
  background: transparent;
  color: #f7f7f7;
  font-size: 14px;
  font-weight: 650;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.18);
  cursor: pointer;

  &:hover {
    border-color: rgba(255, 255, 255, 0.32);
  }

  &:focus-visible {
    outline: ${poolsHero.focusRing};
    outline-offset: ${poolsHero.focusOffset};
  }

  @media (max-width: ${poolsHero.mobileBreak}) {
    width: 100%;
    min-width: 0;
  }
`

const ArtCol = styled.div`
  width: ${poolsHero.artworkW};
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;

  @media (max-width: ${poolsHero.tabletBreak}) {
    width: 100%;
    grid-column: 2;
  }

  @media (max-width: ${poolsHero.mobileBreak}) {
    width: 100%;
    justify-content: center;
  }
`

const TrustCol = styled.div`
  width: ${poolsHero.trustW};
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  gap: 12px;
  min-width: 0;

  @media (max-width: ${poolsHero.tabletBreak}) {
    width: 100%;
    grid-column: 1 / -1;
    justify-content: stretch;
  }

  @media (max-width: ${poolsHero.mobileBreak}) {
    width: 100%;
    justify-content: center;
  }
`

function scrollToCreatePool() {
  if (typeof document === 'undefined') return false
  const el = document.getElementById('create-pool')
  if (!el) return false
  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  return true
}

export const PoolsHeroModule: React.FC<{ onRequestCreatePool?: () => void }> = ({
  onRequestCreatePool,
}) => {
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

  const onHowItWorks = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    // How it works → docs; Create Pool uses dedicated modal.
    if (!onRequestCreatePool && scrollToCreatePool()) {
      e.preventDefault()
    }
  }, [onRequestCreatePool])

  return (
    <Module
      data-testid="pools-hero-module"
      data-pools-module="001"
      data-pools-architecture="000"
      data-pixel-pools-hero="1376x260"
      aria-labelledby="pools-hero-title"
    >
      <Inner data-testid="pools-hero-inner">
        <Left data-testid="pools-hero-left">
          <Title id="pools-hero-title">{POOLS_HERO_COPY.title}</Title>
          <Description>{POOLS_HERO_COPY.description}</Description>
          <Actions>
            <PrimaryCta
              href={poolsHero.createPoolHref}
              onClick={onCreatePool}
              data-testid="pools-hero-create-pool"
            >
              {POOLS_HERO_COPY.primaryCta}
            </PrimaryCta>
            {poolsHero.howItWorksReserved ? (
              <SecondaryCta
                href={poolsHero.howItWorksHref}
                onClick={onHowItWorks}
                data-testid="pools-hero-how-it-works"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                  <circle cx="7" cy="7" r="6.25" stroke="currentColor" strokeWidth="1.2" fill="none" />
                  <path d="M5.6 4.6v4.8L9.6 7 5.6 4.6z" fill="currentColor" />
                </svg>
                {POOLS_HERO_COPY.secondaryCta}
              </SecondaryCta>
            ) : null}
          </Actions>
          <CommunityHint
            type="button"
            data-testid="pools-hero-community-cta"
            onClick={(e) => {
              e.preventDefault()
              if (onRequestCreatePool) onRequestCreatePool()
              else scrollToCreatePool()
            }}
          >
            <CommunityTitle>{POOLS_HERO_COPY.communityCtaTitle}</CommunityTitle>
            <CommunityBody>{POOLS_HERO_COPY.communityCtaBody}</CommunityBody>
          </CommunityHint>
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
