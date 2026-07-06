import React from 'react'
import styled, { keyframes } from 'styled-components'
import {
  CS_FONT_BODY,
  CS_FONT_DISPLAY,
  collectiblesStudioColors,
  collectiblesStudioLayout,
} from '../collectiblesStudioTokens'
import { IconPlus, IconSparkles } from './collectiblesStudioIcons'
import { CsOutlineBtn, CsPrimaryBtn } from './collectiblesStudioPrimitives'

const floatY = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`

const pulseOpacity = keyframes`
  0%, 100% { opacity: 0.92; }
  50% { opacity: 1; }
`

const Hero = styled.section`
  display: grid;
  grid-template-columns: ${collectiblesStudioLayout.heroLeftPct} ${collectiblesStudioLayout.heroRightPct};
  min-height: ${collectiblesStudioLayout.heroHeight};
  gap: 20px;
  align-items: stretch;
  min-width: 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    min-height: 0;
    gap: 24px;
  }
`

const Left = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
  min-width: 0;
`

const Title = styled.h1`
  margin: 0;
  font-family: ${CS_FONT_DISPLAY};
  font-size: 56px;
  line-height: 1;
  font-weight: 700;
  letter-spacing: -1px;
  color: ${collectiblesStudioColors.white};

  @media (max-width: 768px) {
    font-size: 42px;
    line-height: 46px;
  }
`

const Subtitle = styled.p`
  margin: 0;
  max-width: 520px;
  font-family: ${CS_FONT_BODY};
  font-size: 22px;
  line-height: 34px;
  font-weight: 400;
  color: ${collectiblesStudioColors.secondary};

  @media (max-width: 768px) {
    font-size: 18px;
    line-height: 26px;
  }
`

const BtnRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`

const ArtWrap = styled.div`
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  min-height: ${collectiblesStudioLayout.heroHeight};
  border: 1px solid ${collectiblesStudioColors.border};
  background: #111111;
  animation: ${floatY} 8s ease-in-out infinite alternate, ${pulseOpacity} 12s ease-in-out infinite;

  @media (max-width: 768px) {
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

export const CollectiblesStudioPageHeader: React.FC = () => (
  <Hero data-cs-page-header>
    <Left>
      <Title>IDENTITY HUB</Title>
      <Subtitle>
        Digital Identities.
        <br />
        Civilization Access.
        <br />
        AI Privileges.
        <br />
        Premium Memberships.
      </Subtitle>
      <BtnRow>
        <CsPrimaryBtn type="button" data-cs-hero-explore>
          <IconSparkles />
          Explore Collections
        </CsPrimaryBtn>
        <CsOutlineBtn type="button" data-cs-hero-create>
          <IconPlus />
          Create Collectible
        </CsOutlineBtn>
      </BtnRow>
    </Left>
    <ArtWrap data-cs-hero-art>
      <ArtBg />
      <HeroGlow data-cs-hero-glow />
      <Portal>
        <PortalInner />
      </Portal>
      <Silhouette />
    </ArtWrap>
  </Hero>
)

export default CollectiblesStudioPageHeader
