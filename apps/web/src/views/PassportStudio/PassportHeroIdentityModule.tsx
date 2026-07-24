/**
 * PASSPORT_MODULE_001 — Hero + Identity Card module (desktop 1376×360).
 * Does not implement Modules 002–009.
 */
import React, { useCallback } from 'react'
import styled from 'styled-components'
import { passportOne } from './passportTokens'
import { PassportHeroBackground } from './PassportHeroBackground'
import { PassportHeroCopy } from './PassportHeroCopy'
import { PassportIdentityCard } from './PassportIdentityCard'
import { usePassportHeroIdentity, type UsePassportHeroIdentityOptions } from './usePassportHeroIdentity'
import type { PassportHeroIdentityViewModel } from './passportHeroIdentityTypes'

const Module = styled.section`
  position: relative;
  width: 100%;
  max-width: ${passportOne.contentMax};
  height: ${passportOne.heroH};
  min-width: 0;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: ${passportOne.heroModuleRadius};
  border: ${passportOne.heroModuleBorder};
  background: ${passportOne.heroModuleBg};
  box-shadow: ${passportOne.heroModuleShadow};
  padding: ${passportOne.heroModulePad};
  font-family: ${passportOne.font};
  color: ${passportOne.text};

  @media (max-width: 1199px) {
    height: auto;
    overflow: visible;
    padding: 24px;
  }

  @media (max-width: 767px) {
    width: 100%;
    max-width: none;
    height: auto;
    /* Horizontal pad 0 so Identity Card can measure 358px at 390 viewport */
    padding: 20px 0;
    border-radius: 16px;
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
  max-width: 1320px;
  height: 304px;
  display: grid;
  grid-template-columns: ${passportOne.heroLeftW} ${passportOne.heroRightW};
  column-gap: ${passportOne.heroGap};
  align-items: stretch;
  min-width: 0;

  @media (max-width: 1199px) {
    height: auto;
    grid-template-columns: 1fr;
    row-gap: 20px;
  }
`

export type PassportHeroIdentityModuleProps = UsePassportHeroIdentityOptions & {
  /** Optional injected view model (tests / cert only). */
  identity?: PassportHeroIdentityViewModel
}

export const PassportHeroIdentityModule: React.FC<PassportHeroIdentityModuleProps> = ({
  identity: injected,
  fixture,
  sourceUnavailable,
}) => {
  const live = usePassportHeroIdentity({ fixture, sourceUnavailable })
  const identity = injected ?? live

  const onLearnMore = useCallback(() => {
    if (typeof document === 'undefined') return
    const next = document.getElementById('passport-module-next')
    if (!next) return
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    next.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }, [])

  return (
    <Module
      data-testid="passport-hero-identity-module"
      data-passport-module="001"
      data-pixel-passport-hero="1376x360"
      aria-label="MARCO Passport hero and identity"
    >
      <PassportHeroBackground />
      <Inner data-testid="passport-hero-identity-inner">
        <PassportHeroCopy onLearnMore={onLearnMore} />
        <PassportIdentityCard identity={identity} />
      </Inner>
    </Module>
  )
}

export default PassportHeroIdentityModule
