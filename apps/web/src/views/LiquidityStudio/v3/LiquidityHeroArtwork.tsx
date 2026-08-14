/** Founder-approved MARCO multichain artwork for the locked Liquidity hero geometry. */
import React from 'react'
import styled, { keyframes } from 'styled-components'
import { liqV3 } from './liquidityV3Tokens'

const LIQUIDITY_HERO_ARTWORK = '/images/yield/marco-multichain-orbit-hero.webp'

const depthParallax = keyframes`
  0%, 100% { transform: scale(1.16) translate3d(-2.4%, 0.8%, 0); }
  50% { transform: scale(1.22) translate3d(1.2%, -1.1%, 0); }
`

const glowBreath = keyframes`
  0%, 100% { opacity: 0.3; transform: translate3d(0, 0, 0) scale(0.96); }
  50% { opacity: 0.62; transform: translate3d(-1.4%, -0.8%, 0) scale(1.06); }
`

const orbitTurn = keyframes`
  from { transform: translate3d(-50%, -50%, 0) rotate(-9deg); opacity: 0.18; }
  50% { opacity: 0.42; }
  to { transform: translate3d(-50%, -50%, 0) rotate(351deg); opacity: 0.18; }
`

const lightPass = keyframes`
  0%, 18% { transform: translate3d(-160%, 0, 0) skewX(-18deg); opacity: 0; }
  36% { opacity: 0.24; }
  58%, 100% { transform: translate3d(210%, 0, 0) skewX(-18deg); opacity: 0; }
`

const particleFloat = keyframes`
  0%, 100% { transform: translate3d(0, 3px, 0) scale(0.8); opacity: 0.22; }
  50% { transform: translate3d(7px, -7px, 0) scale(1.12); opacity: 0.68; }
`

const Frame = styled.div`
  position: relative;
  width: calc(100% + 56px);
  max-width: none;
  height: calc(100% + 32px);
  margin: -16px -20px -16px -36px;
  justify-self: stretch;
  align-self: stretch;
  overflow: hidden;
  isolation: isolate;
  contain: paint;
  pointer-events: none;
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.38) 7%, #000 20%, #000 100%);
  mask-image: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.38) 7%, #000 20%, #000 100%);

  @media (max-width: ${liqV3.mobileBreak}) {
    width: calc(100% + 16px);
    height: calc(100% + 32px);
    margin: -16px -16px -16px 0;
    align-self: center;
  }
`

const Artwork = styled.img`
  position: absolute;
  inset: -10%;
  width: 120%;
  height: 120%;
  display: block;
  object-fit: cover;
  object-position: 64% center;
  transform-origin: 58% 50%;
  animation: ${depthParallax} 18s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  will-change: transform;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transform: scale(1.16);
    will-change: auto;
  }
`

const DepthVeil = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(90deg, rgba(3, 3, 3, 0.3), rgba(3, 3, 3, 0.02) 46%, rgba(3, 3, 3, 0.08)),
    radial-gradient(circle at 66% 52%, rgba(244, 196, 48, 0.08), transparent 44%);
`

const OrbitalGlow = styled.div`
  position: absolute;
  left: 66%;
  top: 53%;
  width: 74%;
  height: 54%;
  z-index: 2;
  border: 1px solid rgba(255, 211, 77, 0.17);
  border-left-color: rgba(255, 255, 255, 0.38);
  border-right-color: rgba(244, 196, 48, 0.03);
  border-radius: 50%;
  filter: drop-shadow(0 0 7px rgba(244, 196, 48, 0.15));
  animation: ${orbitTurn} 21s linear infinite;
  will-change: transform, opacity;
`

const Glow = styled.div`
  position: absolute;
  right: 7%;
  bottom: 4%;
  width: 60%;
  height: 60%;
  z-index: 2;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(244, 196, 48, 0.17), transparent 68%);
  filter: blur(10px);
  animation: ${glowBreath} 7.2s ease-in-out infinite;
  will-change: transform, opacity;
`

const LightSweep = styled.div`
  position: absolute;
  top: -22%;
  bottom: -22%;
  left: 34%;
  width: 13%;
  z-index: 3;
  background: linear-gradient(90deg, transparent, rgba(255, 245, 204, 0.42), transparent);
  filter: blur(9px);
  animation: ${lightPass} 10.5s ease-in-out infinite;
  will-change: transform, opacity;
`

const Particle = styled.span<{ $left: string; $top: string; $delay: string; $size: string }>`
  position: absolute;
  left: ${({ $left }) => $left};
  top: ${({ $top }) => $top};
  width: ${({ $size }) => $size};
  height: ${({ $size }) => $size};
  z-index: 4;
  border-radius: 50%;
  background: #ffe18a;
  box-shadow: 0 0 9px rgba(244, 196, 48, 0.62);
  animation: ${particleFloat} 5.8s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay};
  will-change: transform, opacity;
`

export const LiquidityHeroArtwork: React.FC = () => (
  <Frame
    data-testid="liquidity-hero-artwork"
    data-liquidity-hero-approved-artwork="marco-multichain-orbit"
    data-liquidity-hero-animated="true"
    data-animation-cost="transform-only"
    aria-hidden="true"
  >
    <Artwork src={LIQUIDITY_HERO_ARTWORK} alt="" width={1672} height={941} decoding="async" fetchPriority="high" />
    <DepthVeil />
    <Glow />
    <OrbitalGlow />
    <LightSweep />
    <Particle $left="18%" $top="25%" $delay="-1.2s" $size="3px" />
    <Particle $left="85%" $top="19%" $delay="-3.7s" $size="4px" />
    <Particle $left="77%" $top="79%" $delay="-2.4s" $size="3px" />
  </Frame>
)

export default LiquidityHeroArtwork
