/**
 * FARMS_MODULE_001 — animated LP farming artwork (CSS/SVG only).
 * Sequence: LP pair → farm module → MARCO rewards. Respects prefers-reduced-motion.
 * Logos: canonical local /images/56/tokens assets with deterministic initial fallback.
 */
import React, { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { farmsHero } from './farmsHeroTokens'

const MARCO_ADDR = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'
const WBNB_ADDR = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
const MARCO_LOGO = `/images/56/tokens/${MARCO_ADDR}.png`
const WBNB_LOGO = `/images/56/tokens/${WBNB_ADDR}.png`

const drift = keyframes`
  0% { transform: translateX(0); opacity: 0.85; }
  45% { transform: translateX(52px); opacity: 1; }
  55% { transform: translateX(52px); opacity: 1; }
  100% { transform: translateX(0); opacity: 0.85; }
`

const pulseFarm = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(244, 196, 48, 0.0); }
  50% { box-shadow: 0 0 18px 2px rgba(244, 196, 48, 0.22); }
`

const emit = keyframes`
  0% { transform: translate(0, 0) scale(0.55); opacity: 0; }
  25% { opacity: 1; }
  100% { transform: translate(54px, -18px) scale(1); opacity: 0; }
`

const Frame = styled.div`
  width: ${farmsHero.artworkBoxW};
  height: ${farmsHero.artworkBoxH};
  max-width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  flex: 0 0 auto;
  overflow: hidden;

  @media (max-width: ${farmsHero.mobileBreak}) {
    width: min(100%, ${farmsHero.mobileArtworkMaxW});
    height: ${farmsHero.mobileArtworkMaxH};
  }
`

const Glow = styled.div`
  position: absolute;
  inset: 10% 14% 6%;
  background: radial-gradient(
    ellipse at 50% 58%,
    rgba(244, 196, 48, 0.2) 0%,
    rgba(34, 197, 94, 0.08) 42%,
    rgba(8, 8, 8, 0) 74%
  );
  filter: blur(2px);

  @media (prefers-reduced-motion: reduce) {
    filter: none;
  }
`

const Stage = styled.div`
  position: relative;
  width: 94%;
  height: 94%;
  display: grid;
  grid-template-columns: 1fr 1.05fr 1fr;
  align-items: end;
  gap: 8px;

  @media (max-width: ${farmsHero.mobileBreak}) {
    gap: 4px;
  }
`

const Col = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  min-width: 0;
  height: 100%;
`

/** Fixed icon row height keeps LP Pair / Farm / MARCO Rewards logos on a shared centerline. */
const IconRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 78px;

  @media (max-width: ${farmsHero.mobileBreak}) {
    height: 64px;
  }
`

const Label = styled.span`
  margin-top: 10px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.55);
  font-family: system-ui, sans-serif;

  @media (max-width: ${farmsHero.mobileBreak}) {
    margin-top: 6px;
    font-size: 10px;
  }
`

const PairTrack = styled.div`
  position: relative;
  width: 96px;
  /** Matches the 40px token logos exactly so IconRow centers the drift track on the shared centerline. */
  height: 40px;

  @media (max-width: ${farmsHero.mobileBreak}) {
    width: 80px;
    height: 40px;
  }
`

const PairMoving = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  align-items: center;
  will-change: transform;
  animation: ${drift} 5.6s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    left: 18px;
  }
`

const TokenImg = styled.img<{ $size: number; $offset?: boolean }>`
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  border-radius: 999px;
  border: 2px solid rgba(244, 196, 48, 0.65);
  background: #141414;
  object-fit: cover;
  margin-left: ${(p) => (p.$offset ? '-12px' : '0')};
  display: block;
`

const TokenFallback = styled.span<{ $size: number; $offset?: boolean; $accent?: string }>`
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  border-radius: 999px;
  border: 2px solid ${(p) => p.$accent || 'rgba(244, 196, 48, 0.65)'};
  background: #141414;
  margin-left: ${(p) => (p.$offset ? '-12px' : '0')};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: ${(p) => Math.max(10, Math.round(p.$size * 0.38))}px;
  font-weight: 800;
  color: #f4c430;
  font-family: system-ui, sans-serif;
`

const FarmModule = styled.div`
  width: 78px;
  height: 78px;
  border-radius: 16px;
  border: 2px solid #f4c430;
  background: linear-gradient(160deg, #1a1a1a 0%, #101010 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  animation: ${pulseFarm} 3.2s ease-in-out infinite;

  @media (max-width: ${farmsHero.mobileBreak}) {
    width: 64px;
    height: 64px;
    border-radius: 14px;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const FarmInner = styled.div`
  width: 44px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #0f0f0f;
  position: relative;

  &::before,
  &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 16px;
    height: 2px;
    background: #22c55e;
    transform: translate(-50%, -50%);
  }
  &::after {
    width: 2px;
    height: 16px;
  }
`

const RewardStage = styled.div`
  position: relative;
  width: 108px;
  height: 86px;

  @media (max-width: ${farmsHero.mobileBreak}) {
    width: 88px;
    height: 72px;
  }
`

/** Centered on RewardStage's own midpoint via transform (no magic offsets to drift out of alignment). */
const MarcoCoreWrap = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`

const SparkWrap = styled.div<{ $delay: string; $x: string; $y: string }>`
  position: absolute;
  left: 42px;
  top: 28px;
  opacity: 0;
  animation: ${emit} 2.8s ease-out infinite;
  animation-delay: ${(p) => p.$delay};

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 0.85;
    transform: translate(${(p) => p.$x}, ${(p) => p.$y});
  }
`

function TokenMark({
  src,
  initial,
  size,
  offset,
  accent,
}: {
  src: string
  initial: string
  size: number
  offset?: boolean
  accent?: string
}) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <TokenFallback $size={size} $offset={offset} $accent={accent} aria-hidden>
        {initial}
      </TokenFallback>
    )
  }
  return (
    <TokenImg
      src={src}
      alt=""
      $size={size}
      $offset={offset}
      loading="eager"
      decoding="async"
      onError={() => setFailed(true)}
      data-token-logo-src={src}
    />
  )
}

export const FarmsHeroArtwork: React.FC = () => (
  <Frame data-testid="farms-hero-artwork" data-farms-hero-artwork aria-hidden="true">
    <Glow />
    <Stage>
      <Col>
        <IconRow>
          <PairTrack>
            <PairMoving>
              <TokenMark src={MARCO_LOGO} initial="M" size={40} />
              <TokenMark src={WBNB_LOGO} initial="B" size={40} offset />
            </PairMoving>
          </PairTrack>
        </IconRow>
        <Label>LP Pair</Label>
      </Col>
      <Col>
        <IconRow>
          <FarmModule>
            <FarmInner />
          </FarmModule>
        </IconRow>
        <Label>Farm</Label>
      </Col>
      <Col>
        <IconRow>
          <RewardStage>
            <MarcoCoreWrap>
              <TokenMark src={MARCO_LOGO} initial="M" size={40} accent="#22c55e" />
            </MarcoCoreWrap>
            <SparkWrap $delay="0s" $x="48px" $y="-20px">
              <TokenMark src={MARCO_LOGO} initial="M" size={18} />
            </SparkWrap>
            <SparkWrap $delay="0.7s" $x="56px" $y="8px">
              <TokenMark src={MARCO_LOGO} initial="M" size={18} />
            </SparkWrap>
            <SparkWrap $delay="1.4s" $x="40px" $y="22px">
              <TokenMark src={MARCO_LOGO} initial="M" size={18} />
            </SparkWrap>
          </RewardStage>
        </IconRow>
        <Label>MARCO Rewards</Label>
      </Col>
    </Stage>
  </Frame>
)

export default FarmsHeroArtwork
