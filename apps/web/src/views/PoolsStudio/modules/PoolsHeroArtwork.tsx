/**
 * POOLS_MODULE_001 — Founder-approved MARCO 3D hero artwork.
 * Motion stays on compositor-only transforms/opacity and preserves the locked
 * 480×230 artwork box used by the Pools hero.
 */
import React from 'react'
import styled, { keyframes } from 'styled-components'
import { poolsHero } from './poolsHeroTokens'

const POOLS_HERO_ARTWORK = '/images/pools/pools-hero-marco-3d.webp'

const cinematicDrift = keyframes`
  0%, 100% { transform: scale(1.05) translate3d(-0.8%, 0.3%, 0); }
  50% { transform: scale(1.085) translate3d(1.2%, -0.8%, 0); }
`

const glowBreath = keyframes`
  0%, 100% { opacity: 0.3; transform: translate3d(0, 0, 0) scale(0.96); }
  50% { opacity: 0.65; transform: translate3d(-1.5%, -1%, 0) scale(1.06); }
`

const orbitTurn = keyframes`
  from { transform: translate3d(-50%, -50%, 0) rotate(-8deg); opacity: 0.2; }
  50% { opacity: 0.46; }
  to { transform: translate3d(-50%, -50%, 0) rotate(352deg); opacity: 0.2; }
`

const lightPass = keyframes`
  0%, 18% { transform: translate3d(-155%, 0, 0) skewX(-18deg); opacity: 0; }
  35% { opacity: 0.26; }
  56%, 100% { transform: translate3d(205%, 0, 0) skewX(-18deg); opacity: 0; }
`

const particleFloat = keyframes`
  0%, 100% { transform: translate3d(0, 3px, 0) scale(0.8); opacity: 0.24; }
  50% { transform: translate3d(7px, -7px, 0) scale(1.15); opacity: 0.72; }
`

const Frame = styled.div`
  width: ${poolsHero.artworkBoxW};
  height: ${poolsHero.artworkBoxH};
  max-width: 100%;
  position: relative;
  flex: 0 0 auto;
  overflow: hidden;
  isolation: isolate;
  contain: paint;
  pointer-events: none;
  /* Feather the raster into the existing hero instead of rendering a framed card. */
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%);
  mask-image: linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%);

  @media (max-width: ${poolsHero.mobileBreak}) {
    width: min(100%, ${poolsHero.mobileArtworkMaxW});
    height: ${poolsHero.mobileArtworkMaxH};
  }
`

const Artwork = styled.img`
  position: absolute;
  inset: -2%;
  width: 104%;
  height: 104%;
  display: block;
  object-fit: cover;
  object-position: 62% center;
  transform-origin: 62% 50%;
  animation: ${cinematicDrift} 13s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  will-change: transform;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transform: scale(1.05);
    will-change: auto;
  }
`

const DepthVeil = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(90deg, rgba(3, 3, 3, 0.28) 0%, rgba(3, 3, 3, 0.03) 44%, rgba(3, 3, 3, 0.07) 100%),
    radial-gradient(circle at 67% 52%, rgba(244, 196, 48, 0.08), transparent 43%);
`

const OrbitalGlow = styled.div`
  position: absolute;
  left: 64%;
  top: 52%;
  width: 72%;
  height: 52%;
  z-index: 2;
  border: 1px solid rgba(255, 211, 77, 0.18);
  border-left-color: rgba(255, 255, 255, 0.4);
  border-right-color: rgba(244, 196, 48, 0.04);
  border-radius: 50%;
  filter: drop-shadow(0 0 7px rgba(244, 196, 48, 0.16));
  animation: ${orbitTurn} 19s linear infinite;
  will-change: transform, opacity;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    will-change: auto;
  }
`

const Glow = styled.div`
  position: absolute;
  right: 8%;
  bottom: 5%;
  width: 58%;
  height: 58%;
  z-index: 2;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(244, 196, 48, 0.18), rgba(244, 196, 48, 0) 68%);
  filter: blur(10px);
  animation: ${glowBreath} 6.8s ease-in-out infinite;
  will-change: transform, opacity;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    will-change: auto;
  }
`

const LightSweep = styled.div`
  position: absolute;
  top: -22%;
  bottom: -22%;
  left: 34%;
  width: 13%;
  z-index: 3;
  background: linear-gradient(90deg, transparent, rgba(255, 245, 204, 0.46), transparent);
  filter: blur(9px);
  animation: ${lightPass} 9.5s ease-in-out infinite;
  will-change: transform, opacity;

  @media (prefers-reduced-motion: reduce) {
    display: none;
    animation: none;
    will-change: auto;
  }
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
  box-shadow: 0 0 9px rgba(244, 196, 48, 0.66);
  animation: ${particleFloat} 5.2s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay};
  will-change: transform, opacity;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    will-change: auto;
  }
`

export const PoolsHeroArtwork: React.FC = () => (
  <Frame
    data-testid="pools-hero-artwork"
    data-pools-hero-artwork
    data-pools-hero-approved-artwork="marco-3d"
    data-pools-hero-animated="true"
    aria-hidden="true"
  >
    <Artwork src={POOLS_HERO_ARTWORK} alt="" width={1669} height={942} decoding="async" fetchPriority="high" />
    <DepthVeil />
    <Glow />
    <OrbitalGlow />
    <LightSweep />
    <Particle $left="19%" $top="24%" $delay="-1.1s" $size="3px" />
    <Particle $left="84%" $top="20%" $delay="-3.6s" $size="4px" />
    <Particle $left="76%" $top="78%" $delay="-2.2s" $size="3px" />
  </Frame>
)

export default PoolsHeroArtwork
