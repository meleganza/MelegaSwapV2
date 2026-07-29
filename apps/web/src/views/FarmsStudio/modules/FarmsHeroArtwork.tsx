/**
 * FARMS_MODULE_001 — animated LP farming artwork (CSS/SVG only).
 * Sequence: LP pair → farm module → MARCO rewards. Respects prefers-reduced-motion.
 */
import React from 'react'
import styled, { keyframes } from 'styled-components'
import { farmsHero } from './farmsHeroTokens'

/** Canonical MARCO token address (BSC) — logo via Token Lists / CDN when available. */
const MARCO_LOGO =
  'https://tokens.pancakeswap.finance/images/0x963556de0eb8138E97A85F0A86eE0acD159D210b.png'
const WBNB_LOGO = 'https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png'

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
  align-items: center;
  gap: 8px;
`

const Col = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
`

const Label = styled.span`
  margin-top: 10px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.55);
  font-family: system-ui, sans-serif;
`

const PairTrack = styled.div`
  position: relative;
  width: 96px;
  height: 64px;
`

const PairMoving = styled.div`
  position: absolute;
  left: 0;
  top: 8px;
  display: flex;
  align-items: center;
  will-change: transform;
  animation: ${drift} 5.6s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    left: 18px;
  }
`

const Token = styled.img<{ $size: number; $offset?: boolean }>`
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  border-radius: 999px;
  border: 2px solid rgba(244, 196, 48, 0.65);
  background: #141414;
  object-fit: cover;
  margin-left: ${(p) => (p.$offset ? '-12px' : '0')};
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
`

const MarcoCore = styled.img`
  position: absolute;
  left: 34px;
  top: 22px;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 2px solid #22c55e;
  background: #121212;
  object-fit: cover;
`

const Spark = styled.img<{ $delay: string; $x: string; $y: string }>`
  position: absolute;
  left: 42px;
  top: 28px;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 1px solid rgba(244, 196, 48, 0.7);
  background: #121212;
  object-fit: cover;
  opacity: 0;
  animation: ${emit} 2.8s ease-out infinite;
  animation-delay: ${(p) => p.$delay};
  --tx: ${(p) => p.$x};
  --ty: ${(p) => p.$y};

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 0.85;
    transform: translate(${(p) => p.$x}, ${(p) => p.$y});
  }
`

export const FarmsHeroArtwork: React.FC = () => (
  <Frame data-testid="farms-hero-artwork" data-farms-hero-artwork aria-hidden="true">
    <Glow />
    <Stage>
      <Col>
        <PairTrack>
          <PairMoving>
            <Token src={MARCO_LOGO} alt="" $size={40} />
            <Token src={WBNB_LOGO} alt="" $size={40} $offset />
          </PairMoving>
        </PairTrack>
        <Label>LP Pair</Label>
      </Col>
      <Col>
        <FarmModule>
          <FarmInner />
        </FarmModule>
        <Label>Farm</Label>
      </Col>
      <Col>
        <RewardStage>
          <MarcoCore src={MARCO_LOGO} alt="" />
          <Spark src={MARCO_LOGO} alt="" $delay="0s" $x="48px" $y="-20px" />
          <Spark src={MARCO_LOGO} alt="" $delay="0.7s" $x="56px" $y="8px" />
          <Spark src={MARCO_LOGO} alt="" $delay="1.4s" $x="40px" $y="22px" />
        </RewardStage>
        <Label>MARCO Rewards</Label>
      </Col>
    </Stage>
  </Frame>
)

export default FarmsHeroArtwork
