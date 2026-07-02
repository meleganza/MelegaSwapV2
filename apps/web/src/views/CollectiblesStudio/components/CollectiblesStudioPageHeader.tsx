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

const glow = keyframes`
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(1.05); }
`

const Hero = styled.section`
  display: grid;
  grid-template-columns: ${collectiblesStudioLayout.heroLeftPct} ${collectiblesStudioLayout.heroRightPct};
  min-height: ${collectiblesStudioLayout.heroHeight};
  gap: 20px;
  align-items: stretch;
  min-width: 0;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    min-height: 0;
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
`

const Subtitle = styled.p`
  margin: 0;
  max-width: 420px;
  font-family: ${CS_FONT_BODY};
  font-size: 20px;
  line-height: 30px;
  font-weight: 400;
  color: ${collectiblesStudioColors.secondary};
`

const BtnRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 767px) {
    flex-direction: column;
    width: 100%;
  }
`

const ArtWrap = styled.div`
  position: relative;
  border-radius: ${collectiblesStudioLayout.cardRadius};
  overflow: hidden;
  min-height: ${collectiblesStudioLayout.heroHeight};
  border: 1px solid ${collectiblesStudioColors.border};
  background: #0a0806;
`

const ArtBg = styled.div`
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 55% 45%, rgba(214, 180, 69, 0.55) 0%, transparent 42%),
    radial-gradient(ellipse at 50% 80%, rgba(214, 180, 69, 0.2) 0%, transparent 50%),
    linear-gradient(180deg, #1a1208 0%, #080808 70%);
`

const Portal = styled.div`
  position: absolute;
  top: 50%;
  left: 55%;
  transform: translate(-50%, -50%);
  width: 180px;
  height: 180px;
  border-radius: 50%;
  border: 2px solid rgba(214, 180, 69, 0.6);
  box-shadow:
    0 0 60px rgba(214, 180, 69, 0.35),
    inset 0 0 40px rgba(214, 180, 69, 0.15);
  animation: ${glow} 8s ease-in-out infinite;
`

const PortalInner = styled.div`
  position: absolute;
  inset: 20px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(214, 180, 69, 0.4) 0%, transparent 70%);
`

const Ray = styled.div<{ $deg: number }>`
  position: absolute;
  top: 50%;
  left: 55%;
  width: 2px;
  height: 120px;
  background: linear-gradient(180deg, rgba(214, 180, 69, 0.5) 0%, transparent 100%);
  transform-origin: top center;
  transform: translate(-50%, 0) rotate(${({ $deg }) => $deg}deg);
  opacity: 0.3;
`

const Particle = styled.span<{ $top: string; $left: string; $delay: string }>`
  position: absolute;
  top: ${({ $top }) => $top};
  left: ${({ $left }) => $left};
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: ${collectiblesStudioColors.gold};
  animation-delay: ${({ $delay }) => $delay};
`

const Silhouette = styled.div`
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 140px;
  background: linear-gradient(180deg, transparent 0%, #080808 30%, #050505 100%);
  clip-path: polygon(30% 0%, 70% 0%, 85% 100%, 15% 100%);
  opacity: 0.9;
`

const HeroGlow = styled.div`
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 60% 50%, rgba(214, 180, 69, 0.12) 0%, transparent 55%);
  pointer-events: none;
`

export const CollectiblesStudioPageHeader: React.FC = () => (
  <Hero data-cs-page-header>
    <Left>
      <Title>COLLECTIBLES</Title>
      <Subtitle>
        Own exclusive digital identities, memberships, achievements, AI utilities, and Civilization access.
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
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <Ray key={deg} $deg={deg} />
      ))}
      <Portal>
        <PortalInner />
      </Portal>
      <Particle data-cs-particle $top="20%" $left="30%" $delay="0s" />
      <Particle data-cs-particle $top="35%" $left="70%" $delay="2s" />
      <Particle data-cs-particle $top="55%" $left="25%" $delay="4s" />
      <Particle data-cs-particle $top="15%" $left="60%" $delay="6s" />
      <Particle data-cs-particle $top="70%" $left="80%" $delay="3s" />
      <Silhouette />
    </ArtWrap>
  </Hero>
)

export default CollectiblesStudioPageHeader
