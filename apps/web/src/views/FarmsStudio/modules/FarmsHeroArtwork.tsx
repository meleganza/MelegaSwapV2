/**
 * FARMS_MODULE_001 — decorative LP farming artwork (local SVG).
 * Communicates LP Pair → Farm → Reward Token. No fake rates / balances / counts.
 * Distinct from the Pools hero staking-platform composition.
 */
import React from 'react'
import styled from 'styled-components'
import { farmsHero } from './farmsHeroTokens'

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

const Svg = styled.svg`
  width: 94%;
  height: 94%;
  display: block;
  overflow: visible;
`

export const FarmsHeroArtwork: React.FC = () => (
  <Frame data-testid="farms-hero-artwork" data-farms-hero-artwork aria-hidden="true">
    <Glow />
    <Svg viewBox="0 0 480 230" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Stage 1 — LP Pair (overlapping token discs) */}
      <circle cx="96" cy="115" r="34" fill="#1A1A1A" stroke="#F4C430" strokeWidth="2" />
      <circle cx="96" cy="115" r="14" fill="#F4C430" opacity="0.9" />
      <circle cx="132" cy="115" r="34" fill="#141414" stroke="rgba(59,130,246,0.75)" strokeWidth="2" />
      <circle cx="132" cy="115" r="14" fill="#3B82F6" opacity="0.9" />
      <text
        x="114"
        y="178"
        textAnchor="middle"
        fill="rgba(255,255,255,0.55)"
        fontSize="11"
        fontFamily="system-ui,sans-serif"
      >
        LP Pair
      </text>

      {/* Arrow LP → Farm */}
      <path
        d="M178 115 H214"
        stroke="rgba(244,196,48,0.65)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M208 108 L218 115 L208 122" stroke="rgba(244,196,48,0.65)" strokeWidth="2" fill="none" />

      {/* Stage 2 — Farm vault */}
      <rect x="228" y="78" width="72" height="74" rx="14" fill="#161616" stroke="#F4C430" strokeWidth="2" />
      <rect x="242" y="94" width="44" height="28" rx="6" fill="#0F0F0F" stroke="rgba(255,255,255,0.12)" />
      <path
        d="M250 122 H278 M264 108 V136"
        stroke="#22C55E"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.85"
      />
      <ellipse cx="264" cy="158" rx="28" ry="6" fill="rgba(244,196,48,0.18)" />
      <text
        x="264"
        y="178"
        textAnchor="middle"
        fill="rgba(255,255,255,0.55)"
        fontSize="11"
        fontFamily="system-ui,sans-serif"
      >
        Farm
      </text>

      {/* Arrow Farm → Reward */}
      <path
        d="M310 115 H346"
        stroke="rgba(34,197,94,0.7)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M340 108 L350 115 L340 122" stroke="rgba(34,197,94,0.7)" strokeWidth="2" fill="none" />

      {/* Stage 3 — Reward token */}
      <circle cx="390" cy="115" r="36" fill="#121212" stroke="#22C55E" strokeWidth="2" />
      <circle cx="390" cy="115" r="18" fill="rgba(34,197,94,0.35)" stroke="#22C55E" strokeWidth="1.5" />
      <path
        d="M390 100 V130 M378 115 H402"
        stroke="#F4C430"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <text
        x="390"
        y="178"
        textAnchor="middle"
        fill="rgba(255,255,255,0.55)"
        fontSize="11"
        fontFamily="system-ui,sans-serif"
      >
        Reward Token
      </text>
    </Svg>
  </Frame>
)

export default FarmsHeroArtwork
