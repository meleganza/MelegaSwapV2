/**
 * POOLS_MODULE_001 — decorative staking-platform artwork (local SVG).
 * No readable fake APR, balances, or pool counts.
 */
import React from 'react'
import styled from 'styled-components'
import { poolsHero } from './poolsHeroTokens'

const Frame = styled.div`
  width: ${poolsHero.artworkBoxW};
  height: ${poolsHero.artworkBoxH};
  max-width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  flex: 0 0 auto;

  @media (max-width: ${poolsHero.mobileBreak}) {
    width: min(100%, ${poolsHero.mobileArtworkMaxW});
    height: ${poolsHero.mobileArtworkMaxH};
  }
`

const Glow = styled.div`
  position: absolute;
  inset: 8% 12% 4%;
  background: radial-gradient(
    ellipse at 50% 62%,
    rgba(244, 196, 48, 0.22) 0%,
    rgba(59, 130, 246, 0.08) 38%,
    rgba(8, 8, 8, 0) 72%
  );
  filter: blur(2px);

  @media (prefers-reduced-motion: reduce) {
    filter: none;
  }
`

const Svg = styled.svg`
  width: 92%;
  height: 92%;
  display: block;
  overflow: visible;
`

export const PoolsHeroArtwork: React.FC = () => (
  <Frame data-testid="pools-hero-artwork" data-pools-hero-artwork aria-hidden="true">
    <Glow />
    <Svg viewBox="0 0 480 230" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Platform base */}
      <ellipse cx="240" cy="168" rx="118" ry="28" fill="#121212" stroke="rgba(244,196,48,0.35)" strokeWidth="2" />
      <ellipse cx="240" cy="158" rx="96" ry="20" fill="#181818" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
      <ellipse cx="240" cy="148" rx="64" ry="12" fill="#0F0F0F" stroke="rgba(244,196,48,0.55)" strokeWidth="1.5" />
      {/* Core glow */}
      <ellipse cx="240" cy="148" rx="28" ry="6" fill="rgba(244,196,48,0.55)" />
      <path
        d="M240 70 C248 100 252 120 240 148 C228 120 232 100 240 70Z"
        fill="url(#poolsHeroBeam)"
        opacity="0.85"
      />
      {/* Floating token tiles — shapes only, no labels/values */}
      <rect x="148" y="78" width="36" height="36" rx="10" fill="#1A1A1A" stroke="#F4C430" strokeWidth="1.5" />
      <circle cx="166" cy="96" r="8" fill="#F4C430" />
      <rect x="296" y="72" width="34" height="34" rx="10" fill="#141414" stroke="rgba(59,130,246,0.65)" strokeWidth="1.5" />
      <circle cx="313" cy="89" r="7" fill="#3B82F6" />
      <rect x="188" y="48" width="30" height="30" rx="9" fill="#161616" stroke="rgba(244,196,48,0.45)" strokeWidth="1.25" />
      <circle cx="203" cy="63" r="6" fill="#FFD34D" />
      <rect x="262" y="52" width="28" height="28" rx="8" fill="#121212" stroke="rgba(255,255,255,0.18)" strokeWidth="1.25" />
      <circle cx="276" cy="66" r="5.5" fill="#B5B5B5" />
      <rect x="120" y="118" width="26" height="26" rx="8" fill="#151515" stroke="rgba(244,196,48,0.3)" strokeWidth="1" />
      <rect x="334" y="112" width="26" height="26" rx="8" fill="#151515" stroke="rgba(59,130,246,0.35)" strokeWidth="1" />
      <defs>
        <linearGradient id="poolsHeroBeam" x1="240" y1="70" x2="240" y2="148" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F4C430" stopOpacity="0.55" />
          <stop offset="1" stopColor="#F4C430" stopOpacity="0" />
        </linearGradient>
      </defs>
    </Svg>
  </Frame>
)

export default PoolsHeroArtwork
