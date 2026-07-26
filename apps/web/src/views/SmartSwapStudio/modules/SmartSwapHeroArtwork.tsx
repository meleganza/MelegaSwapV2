/**
 * SMART_SWAP_MODULE_001 — decorative route/execution artwork (local SVG).
 * Communicates: Token path → Liquidity → Route selection → Execution.
 * No fake prices, fees, savings, yield rates, or balances.
 */
import React from 'react'
import styled from 'styled-components'
import { smartSwapHero } from './smartSwapHeroTokens'

const Frame = styled.div`
  width: ${smartSwapHero.artworkBoxW};
  height: ${smartSwapHero.artworkBoxH};
  max-width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  flex: 0 0 auto;

  @media (max-width: ${smartSwapHero.mobileBreak}) {
    width: min(100%, ${smartSwapHero.mobileArtworkMaxW});
    height: ${smartSwapHero.mobileArtworkMaxH};
  }
`

const Glow = styled.div`
  position: absolute;
  inset: 10% 12% 8%;
  background: radial-gradient(
    ellipse at 50% 55%,
    rgba(244, 196, 48, 0.18) 0%,
    rgba(59, 130, 246, 0.08) 45%,
    rgba(8, 8, 8, 0) 74%
  );
  filter: blur(2px);

  @media (prefers-reduced-motion: reduce) {
    filter: none;
  }
`

const Svg = styled.svg`
  width: 96%;
  height: 96%;
  display: block;
  overflow: visible;
`

export const SmartSwapHeroArtwork: React.FC = () => (
  <Frame data-testid="smart-swap-hero-artwork" data-smart-swap-hero-artwork aria-hidden="true">
    <Glow />
    <Svg viewBox="0 0 480 230" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Token path */}
      <circle cx="58" cy="115" r="22" fill="#1A1A1A" stroke="#F4C430" strokeWidth="2" />
      <circle cx="58" cy="115" r="9" fill="#F4C430" opacity="0.9" />
      <circle cx="98" cy="115" r="22" fill="#141414" stroke="rgba(59,130,246,0.8)" strokeWidth="2" />
      <circle cx="98" cy="115" r="9" fill="#3B82F6" opacity="0.9" />
      <text x="78" y="168" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="11" fontFamily="system-ui,sans-serif">
        Token path
      </text>

      <path d="M128 115 H158" stroke="rgba(244,196,48,0.65)" strokeWidth="2" strokeLinecap="round" />
      <path d="M152 108 L162 115 L152 122" stroke="rgba(244,196,48,0.65)" strokeWidth="2" fill="none" />

      {/* Liquidity sources */}
      <rect x="168" y="78" width="70" height="74" rx="12" fill="#161616" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <rect x="180" y="92" width="46" height="10" rx="3" fill="rgba(244,196,48,0.35)" />
      <rect x="180" y="110" width="38" height="10" rx="3" fill="rgba(59,130,246,0.35)" />
      <rect x="180" y="128" width="42" height="10" rx="3" fill="rgba(34,197,94,0.3)" />
      <text x="203" y="178" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="11" fontFamily="system-ui,sans-serif">
        Liquidity
      </text>

      <path d="M248 115 H278" stroke="rgba(59,130,246,0.7)" strokeWidth="2" strokeLinecap="round" />
      <path d="M272 108 L282 115 L272 122" stroke="rgba(59,130,246,0.7)" strokeWidth="2" fill="none" />

      {/* Route selection */}
      <rect x="288" y="72" width="78" height="86" rx="12" fill="#121212" stroke="#F4C430" strokeWidth="2" />
      <path d="M304 96 H350 M304 115 H342 M304 134 H346" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="350" cy="115" r="5" fill="#F4C430" />
      <text x="327" y="178" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="11" fontFamily="system-ui,sans-serif">
        Route
      </text>

      <path d="M376 115 H406" stroke="rgba(34,197,94,0.75)" strokeWidth="2" strokeLinecap="round" />
      <path d="M400 108 L410 115 L400 122" stroke="rgba(34,197,94,0.75)" strokeWidth="2" fill="none" />

      {/* Execution */}
      <circle cx="436" cy="115" r="28" fill="#121212" stroke="#22C55E" strokeWidth="2" />
      <path d="M424 115 H448 M436 103 V127" stroke="#F4C430" strokeWidth="2" strokeLinecap="round" />
      <text x="436" y="178" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="11" fontFamily="system-ui,sans-serif">
        Execution
      </text>
    </Svg>
  </Frame>
)

export default SmartSwapHeroArtwork
