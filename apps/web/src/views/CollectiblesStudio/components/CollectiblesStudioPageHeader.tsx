import React from 'react'
import styled, { keyframes } from 'styled-components'
import { NAV_COMING_SOON_LABEL, scrollToElement } from 'lib/navigation/comingSoon'
import {
  MelegaStudioOutlineBtn,
  MelegaStudioPageHeader,
  MelegaStudioPrimaryBtn,
  STUDIO_PAGE_TITLES,
  studioConstitutionLayout,
} from 'design-system/melega'
import { collectiblesStudioColors } from '../collectiblesStudioTokens'
import { IconPlus, IconSparkles } from './collectiblesStudioIcons'

const floatY = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`

const pulseOpacity = keyframes`
  0%, 100% { opacity: 0.92; }
  50% { opacity: 1; }
`

const BtnRow = styled.div`
  display: flex;
  gap: ${studioConstitutionLayout.actionGroupGap};
  flex-wrap: wrap;
  margin-top: 8px;

  @media (max-width: 767px) {
    flex-direction: column;
    width: 100%;
  }
`

const ArtWrap = styled.div`
  position: relative;
  border-radius: ${studioConstitutionLayout.cardRadius};
  overflow: hidden;
  min-height: ${studioConstitutionLayout.heroMinHeight};
  border: 1px solid ${collectiblesStudioColors.border};
  background: #111111;
  animation: ${floatY} 8s ease-in-out infinite alternate, ${pulseOpacity} 12s ease-in-out infinite;

  @media (max-width: 767px) {
    height: 220px;
    width: 100%;
    min-height: 220px;
  }
`

const ArtBg = styled.div`
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 60% 45%, rgba(214, 180, 69, 0.22) 0%, transparent 55%);
`

const HeroGlow = styled.div`
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 55% 50%, rgba(214, 180, 69, 0.12) 0%, transparent 60%);
  pointer-events: none;
`

const Portal = styled.div`
  position: absolute;
  top: 50%;
  left: 55%;
  transform: translate(-50%, -50%);
  width: 160px;
  height: 160px;
  border-radius: 50%;
  border: 2px solid rgba(214, 180, 69, 0.45);
  box-shadow: 0 0 48px rgba(214, 180, 69, 0.2);
`

const PortalInner = styled.div`
  position: absolute;
  inset: 24px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(214, 180, 69, 0.28) 0%, transparent 70%);
`

const Silhouette = styled.div`
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 72px;
  height: 120px;
  background: linear-gradient(180deg, transparent 0%, #111111 40%, #080808 100%);
  clip-path: polygon(30% 0%, 70% 0%, 85% 100%, 15% 100%);
  opacity: 0.85;
`

const HeroArt = () => (
  <ArtWrap data-cs-hero-art>
    <ArtBg />
    <HeroGlow data-cs-hero-glow />
    <Portal>
      <PortalInner />
    </Portal>
    <Silhouette />
  </ArtWrap>
)

export const CollectiblesStudioPageHeader: React.FC = () => (
  <MelegaStudioPageHeader
    data-studio-header="identity-hub"
    title={STUDIO_PAGE_TITLES.identityHub}
    subtitle={
      <>
        Civilization collectible identities.
        <br />
        Registry-backed collections — not the economic Identity Console.
      </>
    }
    belowSubtitle={
      <BtnRow>
        <MelegaStudioPrimaryBtn type="button" data-cs-hero-explore onClick={() => scrollToElement('cs-collections')}>
          <IconSparkles />
          Explore Collections
        </MelegaStudioPrimaryBtn>
        <MelegaStudioOutlineBtn type="button" data-cs-hero-create disabled title={NAV_COMING_SOON_LABEL}>
          <IconPlus />
          {NAV_COMING_SOON_LABEL}
        </MelegaStudioOutlineBtn>
      </BtnRow>
    }
    media={<HeroArt />}
  />
)

export default CollectiblesStudioPageHeader
