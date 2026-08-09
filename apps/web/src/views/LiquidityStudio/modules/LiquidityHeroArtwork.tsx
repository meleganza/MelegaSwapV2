/**
 * LIQUIDITY_MODULE_001 — liquidity-specific artwork (Token → Pool → LP)
 * with animated Melega mark. Distinct from Farms / Pools artwork.
 * No fake rates / balances / counts.
 */
import React from 'react'
import styled, { keyframes } from 'styled-components'
import { MELEGA_LOGO_URI } from 'design-system/melega/constants/brand'
import { liquidityHero } from './liquidityHeroTokens'

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`

const pulse = keyframes`
  0%, 100% { opacity: 0.72; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.04); }
`

const Frame = styled.div`
  width: min(100%, 480px);
  height: ${liquidityHero.artworkBoxH};
  max-width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  flex: 0 0 auto;
  margin: 0 auto;

  @media (max-width: ${liquidityHero.mobileBreak}) {
    width: min(100%, ${liquidityHero.mobileArtworkMaxW});
    height: ${liquidityHero.mobileArtworkMaxH};
  }
`

const Glow = styled.div`
  position: absolute;
  inset: 12% 16% 8%;
  background: radial-gradient(
    ellipse at 50% 55%,
    rgba(244, 196, 48, 0.22) 0%,
    rgba(59, 130, 246, 0.08) 42%,
    rgba(8, 8, 8, 0) 74%
  );
  filter: blur(2px);
  animation: ${pulse} 4.2s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    filter: none;
    animation: none;
  }
`

const Mark = styled.img`
  position: absolute;
  width: 72px;
  height: 72px;
  object-fit: contain;
  z-index: 2;
  animation: ${float} 3.6s ease-in-out infinite;
  filter: drop-shadow(0 8px 18px rgba(244, 196, 48, 0.28));

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  @media (max-width: ${liquidityHero.mobileBreak}) {
    width: 56px;
    height: 56px;
  }
`

const Svg = styled.svg`
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
`

export const LiquidityHeroArtwork: React.FC = () => (
  <Frame data-testid="liquidity-hero-artwork" data-liquidity-hero-artwork aria-hidden="true">
    <Glow />
    <Mark src={MELEGA_LOGO_URI} alt="" width={72} height={72} data-testid="liquidity-hero-melega-mark" />
    <Svg viewBox="0 0 480 230" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(-6, 0)" opacity="0.88">
        <circle cx="88" cy="108" r="36" fill="#161616" stroke="#F4C430" strokeWidth="2" />
        <circle cx="88" cy="108" r="16" fill="#F4C430" opacity="0.92" />
        <text
          x="88"
          y="172"
          textAnchor="middle"
          fill="rgba(255,255,255,0.55)"
          fontSize="11"
          fontFamily="system-ui,sans-serif"
        >
          Token
        </text>

        <path d="M134 108 H178" stroke="rgba(244,196,48,0.65)" strokeWidth="2" strokeLinecap="round" />
        <path d="M172 101 L182 108 L172 115" stroke="rgba(244,196,48,0.65)" strokeWidth="2" fill="none" />

        <rect x="192" y="70" width="96" height="76" rx="16" fill="#141414" stroke="#3B82F6" strokeWidth="2" />
        <circle cx="220" cy="108" r="14" fill="#F4C430" opacity="0.85" />
        <circle cx="260" cy="108" r="14" fill="#3B82F6" opacity="0.85" />
        <ellipse cx="240" cy="150" rx="34" ry="7" fill="rgba(59,130,246,0.18)" />
        <text
          x="240"
          y="172"
          textAnchor="middle"
          fill="rgba(255,255,255,0.55)"
          fontSize="11"
          fontFamily="system-ui,sans-serif"
        >
          Pool
        </text>

        <path d="M300 108 H344" stroke="rgba(59,130,246,0.7)" strokeWidth="2" strokeLinecap="round" />
        <path d="M338 101 L348 108 L338 115" stroke="rgba(59,130,246,0.7)" strokeWidth="2" fill="none" />

        <rect x="356" y="72" width="84" height="72" rx="14" fill="#121212" stroke="#F4C430" strokeWidth="2" />
        <circle cx="386" cy="100" r="11" fill="#F4C430" opacity="0.9" />
        <circle cx="410" cy="100" r="11" fill="#3B82F6" opacity="0.9" />
        <path
          d="M372 128 H424 M398 118 V138"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <text
          x="398"
          y="172"
          textAnchor="middle"
          fill="rgba(255,255,255,0.55)"
          fontSize="11"
          fontFamily="system-ui,sans-serif"
        >
          LP
        </text>
      </g>
    </Svg>
  </Frame>
)

export default LiquidityHeroArtwork
