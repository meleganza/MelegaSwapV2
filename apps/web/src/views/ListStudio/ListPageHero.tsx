/**
 * LIST Wave 04A hero — premium Melega orbit animation (no corrupted artwork, no KPI cards).
 * 3D Melega logo with orbiting BNB + USDT on a dark gold field.
 */
import React from 'react'
import styled, { keyframes } from 'styled-components'
import { MELEGA_LOGO_URI } from 'design-system/melega/constants/brand'
import { listOne } from './listTokens'

const spinY = keyframes`
  0% { transform: rotateY(0deg) rotateX(8deg); }
  100% { transform: rotateY(360deg) rotateX(8deg); }
`

const orbitA = keyframes`
  0% { transform: rotate(0deg) translateX(108px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(108px) rotate(-360deg); }
`

const orbitB = keyframes`
  0% { transform: rotate(180deg) translateX(132px) rotate(-180deg); }
  100% { transform: rotate(540deg) translateX(132px) rotate(-540deg); }
`

const pulse = keyframes`
  0%, 100% { opacity: 0.45; transform: scale(0.96); }
  50% { opacity: 0.85; transform: scale(1.04); }
`

const Hero = styled.section`
  position: relative;
  width: 100%;
  max-width: ${listOne.contentMax};
  min-height: 280px;
  margin: ${listOne.heroTop} 0 0;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid rgba(244, 196, 48, 0.18);
  background:
    radial-gradient(ellipse 70% 60% at 70% 45%, rgba(244, 196, 48, 0.16) 0%, transparent 55%),
    radial-gradient(ellipse 50% 40% at 20% 80%, rgba(244, 196, 48, 0.08) 0%, transparent 50%),
    linear-gradient(145deg, #0c0c0c 0%, #14110a 45%, #0a0a0a 100%);
  font-family: ${listOne.font};
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  align-items: center;
  column-gap: 24px;
  padding: 28px 32px;

  @media (max-width: 767px) {
    min-height: 0;
    margin-top: ${listOne.heroTopMobile};
    padding: 22px 16px 20px;
    grid-template-columns: 1fr;
    row-gap: 18px;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
    }
  }
`

const Left = styled.div`
  position: relative;
  z-index: 1;
  min-width: 0;
`

const Title = styled.h1`
  margin: 0;
  max-width: 520px;
  font-family: ${listOne.font};
  font-size: clamp(34px, 4.2vw, 52px);
  line-height: 1.08;
  font-weight: 750;
  letter-spacing: -0.02em;
  color: ${listOne.text};
`

const Gold = styled.span`
  color: ${listOne.gold};
`

const Description = styled.p`
  margin: 16px 0 0;
  max-width: 460px;
  font-size: 15px;
  line-height: 22px;
  font-weight: 400;
  color: ${listOne.secondary};
`

const Stage = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 360px;
  height: 240px;
  margin: 0 auto;
  perspective: 720px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 767px) {
    height: 200px;
    max-width: 280px;
  }
`

const Glow = styled.div`
  position: absolute;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(244, 196, 48, 0.35) 0%, transparent 68%);
  animation: ${pulse} 3.2s ease-in-out infinite;
  pointer-events: none;
`

const LogoCore = styled.div`
  position: relative;
  width: 112px;
  height: 112px;
  border-radius: 50%;
  transform-style: preserve-3d;
  animation: ${spinY} 14s linear infinite;
  box-shadow:
    0 0 0 1px rgba(244, 196, 48, 0.35),
    0 18px 40px rgba(0, 0, 0, 0.45),
    0 0 36px rgba(244, 196, 48, 0.22);
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    border-radius: 50%;
  }

  @media (max-width: 767px) {
    width: 96px;
    height: 96px;
  }
`

const Orbiter = styled.div<{ $variant: 'bnb' | 'usdt' }>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 36px;
  height: 36px;
  margin: -18px 0 0 -18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: #111;
  animation: ${({ $variant }) => ($variant === 'bnb' ? orbitA : orbitB)}
    ${({ $variant }) => ($variant === 'bnb' ? '9s' : '12s')} linear infinite;
  background: ${({ $variant }) =>
    $variant === 'bnb'
      ? 'linear-gradient(145deg, #F3BA2F 0%, #E8A317 100%)'
      : 'linear-gradient(145deg, #26A17B 0%, #1B7A5A 100%)'};
  box-shadow:
    0 6px 16px rgba(0, 0, 0, 0.35),
    0 0 12px
      ${({ $variant }) =>
        $variant === 'bnb' ? 'rgba(243, 186, 47, 0.45)' : 'rgba(38, 161, 123, 0.4)'};
  z-index: 2;
`

const Ring = styled.div`
  position: absolute;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  border: 1px dashed rgba(244, 196, 48, 0.22);
  pointer-events: none;

  @media (max-width: 767px) {
    width: 180px;
    height: 180px;
  }
`

export const ListPageHero: React.FC = () => {
  return (
    <Hero
      data-testid="list-one-page-header"
      data-list-hero="true"
      data-list-hero-variant="melega-orbit"
      aria-label="List"
    >
      <Left data-testid="list-hero-text">
        <Title data-testid="list-hero-headline">
          List, Launch,
          <br />
          and Grow
          <br />
          on <Gold>Melega.</Gold>
        </Title>
        <Description data-testid="list-hero-description">
          Bring your token or project to life. Join the ecosystem, get discovered, and unlock powerful DeFi tools.
        </Description>
      </Left>

      <Stage data-testid="list-hero-orbit" aria-hidden>
        <Glow />
        <Ring />
        <LogoCore data-testid="list-hero-melega-logo">
          <img src={MELEGA_LOGO_URI} alt="" draggable={false} />
        </LogoCore>
        <Orbiter $variant="bnb" data-testid="list-hero-orbit-bnb">
          BNB
        </Orbiter>
        <Orbiter $variant="usdt" data-testid="list-hero-orbit-usdt">
          USDT
        </Orbiter>
      </Stage>
    </Hero>
  )
}

export default ListPageHero
