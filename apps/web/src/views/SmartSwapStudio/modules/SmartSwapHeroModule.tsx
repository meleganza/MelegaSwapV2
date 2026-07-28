/**
 * SMART_SWAP_MODULE_001 — Smart Swap Hero (orientation only).
 * Runtime-independent. Does not execute trades, quote routes, or change economics.
 */
import React, { useCallback } from 'react'
import styled from 'styled-components'
import { typography } from 'design-system/melega'
import { SmartSwapHeroArtwork } from './SmartSwapHeroArtwork'
import { SmartSwapHeroTrustPanel } from './SmartSwapHeroTrustPanel'
import { SMART_SWAP_HERO_COPY, smartSwapHero } from './smartSwapHeroTokens'

const Module = styled.section`
  position: relative;
  width: 100%;
  max-width: ${smartSwapHero.contentMax};
  height: ${smartSwapHero.heroH};
  min-width: 0;
  box-sizing: border-box;
  overflow: visible;
  font-family: ${typography.fontFamily.body};
  color: ${smartSwapHero.titleColor};
  background:
    radial-gradient(ellipse 42% 80% at 52% 55%, rgba(244, 196, 48, 0.07) 0%, rgba(8, 8, 8, 0) 70%),
    radial-gradient(ellipse 36% 70% at 18% 40%, rgba(59, 130, 246, 0.05) 0%, rgba(8, 8, 8, 0) 68%),
    transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;

  @media (max-width: ${smartSwapHero.tabletBreak}) {
    height: auto;
    max-height: none;
  }

  @media (max-width: ${smartSwapHero.mobileBreak}) {
    width: 100%;
    max-width: none;
    height: auto;
    max-height: ${smartSwapHero.mobileHeroMaxH};
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
  grid-template-columns: ${smartSwapHero.leftW} ${smartSwapHero.artworkW} ${smartSwapHero.trustW};
  column-gap: ${smartSwapHero.columnGap};
  align-items: center;
  min-width: 0;
  box-sizing: border-box;

  @media (max-width: ${smartSwapHero.tabletBreak}) {
    height: auto;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    column-gap: 24px;
    row-gap: 20px;
  }

  @media (max-width: ${smartSwapHero.mobileBreak}) {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }
`

const Left = styled.div`
  width: ${smartSwapHero.leftW};
  max-width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;

  @media (max-width: ${smartSwapHero.tabletBreak}) {
    width: 100%;
    grid-column: 1;
  }

  @media (max-width: ${smartSwapHero.mobileBreak}) {
    width: 100%;
  }
`

const Title = styled.h1`
  margin: 0;
  font-size: ${smartSwapHero.titleSize};
  line-height: ${smartSwapHero.titleLine};
  font-weight: ${smartSwapHero.titleWeight};
  letter-spacing: ${smartSwapHero.titleTracking};
  color: ${smartSwapHero.titleColor};

  @media (max-width: ${smartSwapHero.mobileBreak}) {
    font-size: ${smartSwapHero.mobileTitleSize};
    line-height: ${smartSwapHero.mobileTitleLine};
  }
`

const Description = styled.p`
  margin: ${smartSwapHero.gapAfterTitle} 0 0;
  max-width: ${smartSwapHero.descMaxW};
  font-size: ${smartSwapHero.descSize};
  line-height: ${smartSwapHero.descLine};
  font-weight: 400;
  color: ${smartSwapHero.descColor};
  white-space: pre-line;
`

const Actions = styled.div`
  margin-top: ${smartSwapHero.gapBeforeActions};
  display: flex;
  flex-wrap: wrap;
  gap: ${smartSwapHero.ctaGap};
  align-items: center;

  @media (max-width: ${smartSwapHero.mobileBreak}) {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }
`

const PrimaryCta = styled.a`
  box-sizing: border-box;
  width: ${smartSwapHero.primaryCtaW};
  height: ${smartSwapHero.primaryCtaH};
  min-height: 44px;
  border-radius: ${smartSwapHero.ctaRadius};
  background: ${smartSwapHero.gold};
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
    background: ${smartSwapHero.goldHover};
  }

  &:focus-visible {
    outline: ${smartSwapHero.focusRing};
    outline-offset: ${smartSwapHero.focusOffset};
  }

  @media (max-width: ${smartSwapHero.mobileBreak}) {
    width: 100%;
    min-width: 0;
  }
`

const SecondaryCta = styled.button`
  box-sizing: border-box;
  width: ${smartSwapHero.secondaryCtaW};
  height: ${smartSwapHero.secondaryCtaH};
  min-height: 44px;
  border-radius: ${smartSwapHero.ctaRadius};
  background: transparent;
  color: #f7f7f7;
  font-size: 14px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.22);
  cursor: pointer;

  &:hover {
    border-color: rgba(244, 196, 48, 0.55);
    color: ${smartSwapHero.gold};
  }

  &:focus-visible {
    outline: ${smartSwapHero.focusRing};
    outline-offset: ${smartSwapHero.focusOffset};
  }

  @media (max-width: ${smartSwapHero.mobileBreak}) {
    width: 100%;
    min-width: 0;
  }
`

const Relation = styled.p`
  margin: ${smartSwapHero.gapAfterActions} 0 0;
  max-width: ${smartSwapHero.descMaxW};
  font-size: ${smartSwapHero.relationSize};
  line-height: ${smartSwapHero.relationLine};
  font-weight: 500;
  color: ${smartSwapHero.relationColor};
`

const ArtCol = styled.div`
  width: ${smartSwapHero.artworkW};
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;

  @media (max-width: ${smartSwapHero.tabletBreak}) {
    width: 100%;
    grid-column: 2;
  }

  @media (max-width: ${smartSwapHero.mobileBreak}) {
    width: 100%;
    justify-content: center;
  }
`

const TrustCol = styled.div`
  width: ${smartSwapHero.trustW};
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 0;

  @media (max-width: ${smartSwapHero.tabletBreak}) {
    width: 100%;
    grid-column: 1 / -1;
    justify-content: stretch;
  }

  @media (max-width: ${smartSwapHero.mobileBreak}) {
    width: 100%;
    justify-content: center;
  }
`

function scrollToExecution() {
  if (typeof document === 'undefined') return false
  const el =
    document.getElementById('smart-swap-execution') ||
    document.querySelector<HTMLElement>('[data-trade-cockpit]')
  if (!el) return false
  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  return true
}

export type SmartSwapHeroModuleProps = {
  /** Opens factual How It Works panel when provided. */
  onHowItWorks?: () => void
}

export const SmartSwapHeroModule: React.FC<SmartSwapHeroModuleProps> = ({ onHowItWorks }) => {
  const onStart = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (scrollToExecution()) e.preventDefault()
  }, [])

  const onHow = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      onHowItWorks?.()
      if (typeof document !== 'undefined') {
        const marker = document.getElementById('smart-swap-how-it-works')
        if (marker) {
          const reduce =
            typeof window !== 'undefined' &&
            window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
          marker.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' })
        }
      }
    },
    [onHowItWorks],
  )

  return (
    <Module
      data-testid="smart-swap-hero-module"
      data-smart-swap-module="001"
      data-smart-swap-architecture="000"
      data-pixel-smart-swap-hero="1376x260"
      aria-labelledby="smart-swap-hero-title"
    >
      <Inner data-testid="smart-swap-hero-inner">
        <Left data-testid="smart-swap-hero-left">
          <Title id="smart-swap-hero-title">{SMART_SWAP_HERO_COPY.title}</Title>
          <Description>{SMART_SWAP_HERO_COPY.description}</Description>
          <Actions>
            <PrimaryCta
              href={smartSwapHero.startSmartSwapHref}
              onClick={onStart}
              data-testid="smart-swap-hero-start"
            >
              {SMART_SWAP_HERO_COPY.primaryCta}
            </PrimaryCta>
            {smartSwapHero.howItWorksRendered ? (
              <SecondaryCta type="button" onClick={onHow} data-testid="smart-swap-hero-how-it-works">
                {SMART_SWAP_HERO_COPY.secondaryCta}
              </SecondaryCta>
            ) : null}
          </Actions>
          <Relation data-testid="smart-swap-hero-relationship">{SMART_SWAP_HERO_COPY.relationship}</Relation>
        </Left>
        <ArtCol>
          <SmartSwapHeroArtwork />
        </ArtCol>
        <TrustCol>
          <SmartSwapHeroTrustPanel />
        </TrustCol>
      </Inner>
    </Module>
  )
}

export default SmartSwapHeroModule
