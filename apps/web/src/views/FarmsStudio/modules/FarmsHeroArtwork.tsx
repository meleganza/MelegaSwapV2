/**
 * FARMS_MODULE_001 — founder-approved MARCO multichain hero artwork.
 * Asset roles: LP Pair markets (BNB / USDT / USDC / ETH / BTCB) → Farm → Reward Token (MARCO).
 * Motion is compositor-only and preserves the locked 480×230 artwork box.
 */
import React from 'react'
import styled, { keyframes } from 'styled-components'
import { farmsHero } from './farmsHeroTokens'

const FARMS_HERO_ARTWORK = '/images/yield/marco-farms-terraced-yield-hero.jpg'

const harvestRise = keyframes`
  0%, 100% { transform: scale(1.06) translate3d(0, 1.4%, 0); }
  50% { transform: scale(1.1) translate3d(0, -1.4%, 0); }
`

const glowBreath = keyframes`
  0%, 100% { opacity: 0.3; transform: translate3d(0, 0, 0) scale(0.96); }
  50% { opacity: 0.62; transform: translate3d(-1.4%, -0.8%, 0) scale(1.06); }
`

const rewardRise = keyframes`
  0% { transform: translate3d(0, 16px, 0) scaleY(0.75); opacity: 0; }
  35% { opacity: 0.45; }
  100% { transform: translate3d(0, -30px, 0) scaleY(1.18); opacity: 0; }
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
  width: calc(100% + 80px);
  height: calc(100% + 32px);
  max-width: none;
  margin: -16px -40px;
  position: relative;
  flex: 0 0 auto;
  overflow: hidden;
  isolation: isolate;
  contain: paint;
  pointer-events: none;
  -webkit-mask-image: linear-gradient(
    90deg,
    transparent 0%,
    rgba(0, 0, 0, 0.38) 8%,
    #000 20%,
    #000 80%,
    rgba(0, 0, 0, 0.38) 92%,
    transparent 100%
  );
  mask-image: linear-gradient(
    90deg,
    transparent 0%,
    rgba(0, 0, 0, 0.38) 8%,
    #000 20%,
    #000 80%,
    rgba(0, 0, 0, 0.38) 92%,
    transparent 100%
  );

  @media (max-width: ${farmsHero.mobileBreak}) {
    width: 100%;
    height: 100%;
    margin: 0;
    -webkit-mask-image: linear-gradient(
      90deg,
      transparent 0%,
      rgba(0, 0, 0, 0.06) 42%,
      rgba(0, 0, 0, 0.72) 60%,
      #000 72%,
      #000 100%
    );
    mask-image: linear-gradient(
      90deg,
      transparent 0%,
      rgba(0, 0, 0, 0.06) 42%,
      rgba(0, 0, 0, 0.72) 60%,
      #000 72%,
      #000 100%
    );
  }
`

const Artwork = styled.img`
  position: absolute;
  inset: -8%;
  width: 116%;
  height: 116%;
  display: block;
  object-fit: cover;
  object-position: center;
  transform-origin: 50% 56%;
  animation: ${harvestRise} 10s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  will-change: transform;

  @media (max-width: ${farmsHero.mobileBreak}) {
    object-position: 66% center;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transform: scale(1.06);
    will-change: auto;
  }
`

const DepthVeil = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(90deg, rgba(3, 3, 3, 0.3), rgba(3, 3, 3, 0.02) 46%, rgba(3, 3, 3, 0.08)),
    radial-gradient(circle at 50% 54%, rgba(244, 196, 48, 0.1), transparent 48%);
`

const RewardColumn = styled.div`
  position: absolute;
  left: 44%;
  top: 8%;
  width: 12%;
  height: 58%;
  z-index: 2;
  background: linear-gradient(90deg, transparent, rgba(255, 224, 126, 0.28), transparent);
  filter: blur(6px);
  animation: ${rewardRise} 4.8s ease-out infinite;
  will-change: transform, opacity;
`

const Glow = styled.div`
  position: absolute;
  left: 20%;
  right: 20%;
  bottom: 0;
  width: 60%;
  height: 48%;
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

export const FarmsHeroArtwork: React.FC = () => (
  <Frame
    data-testid="farms-hero-artwork"
    data-farms-hero-approved-artwork="marco-terraced-yield"
    data-farms-hero-animated="true"
    data-animation-cost="transform-only"
    aria-hidden="true"
  >
    <Artwork src={FARMS_HERO_ARTWORK} alt="" width={1919} height={820} decoding="async" fetchPriority="high" />
    <DepthVeil />
    <Glow />
    <RewardColumn />
    <LightSweep />
    <Particle $left="18%" $top="25%" $delay="-1.2s" $size="3px" />
    <Particle $left="85%" $top="19%" $delay="-3.7s" $size="4px" />
    <Particle $left="77%" $top="79%" $delay="-2.4s" $size="3px" />
  </Frame>
)

export default FarmsHeroArtwork
