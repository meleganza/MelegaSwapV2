import { createGlobalStyle, keyframes } from 'styled-components'
import { collectiblesStudioColors, collectiblesStudioLayout } from './collectiblesStudioTokens'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`

const floatSlow = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`

const particleDrift = keyframes`
  0% { transform: translate(0, 0) scale(1); opacity: 0.3; }
  50% { opacity: 0.8; }
  100% { transform: translate(12px, -18px) scale(1.2); opacity: 0.2; }
`

const glowPulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
`

const CollectiblesStudioGlobalStyle = createGlobalStyle`
  @property --ring-angle {
    syntax: '<angle>';
    inherits: false;
    initial-value: 0deg;
  }

  [data-collectibles-studio-screen] {
    color: ${collectiblesStudioColors.white};
    background: ${collectiblesStudioColors.pageBg};
  }

  [data-collectibles-studio-screen] [data-cs-panel],
  [data-collectibles-studio-screen] [data-cs-kpi-card],
  [data-collectibles-studio-screen] [data-cs-collection-card] {
    transition: transform ${collectiblesStudioColors.transition} ease,
      border-color ${collectiblesStudioColors.transition} ease,
      box-shadow ${collectiblesStudioColors.transition} ease;
  }

  [data-collectibles-studio-screen] [data-cs-panel]:hover,
  [data-collectibles-studio-screen] [data-cs-kpi-card]:hover,
  [data-collectibles-studio-screen] [data-cs-collection-card]:hover {
    border-color: ${collectiblesStudioColors.gold};
    transform: translateY(-3px);
    box-shadow: ${collectiblesStudioColors.shadow};
  }

  [data-collectibles-studio-screen] [data-cs-collection-card]:hover [data-cs-artwork] {
    transform: scale(1.03);
  }

  [data-collectibles-studio-screen] [data-cs-kpi-card] {
    animation: ${fadeIn} 400ms ease-out both;
  }

  [data-collectibles-studio-screen] [data-cs-kpi-card]:nth-child(1) { animation-delay: 0ms; }
  [data-collectibles-studio-screen] [data-cs-kpi-card]:nth-child(2) { animation-delay: 90ms; }
  [data-collectibles-studio-screen] [data-cs-kpi-card]:nth-child(3) { animation-delay: 180ms; }
  [data-collectibles-studio-screen] [data-cs-kpi-card]:nth-child(4) { animation-delay: 270ms; }
  [data-collectibles-studio-screen] [data-cs-kpi-card]:nth-child(5) { animation-delay: 360ms; }

  [data-collectibles-studio-screen] [data-cs-collection-card] {
    animation: ${fadeIn} 350ms ease-out both;
  }

  [data-collectibles-studio-screen] [data-cs-hero-art] {
    animation: ${floatSlow} 12s ease-in-out infinite;
  }

  [data-collectibles-studio-screen] [data-cs-featured-coin] {
    animation: ${floatSlow} 8s ease-in-out infinite;
  }

  [data-collectibles-studio-screen] [data-cs-particle] {
    animation: ${particleDrift} 12s ease-in-out infinite;
  }

  [data-collectibles-studio-screen] [data-cs-hero-glow] {
    animation: ${glowPulse} 12s ease-in-out infinite;
  }

  [data-collectibles-studio-screen] [data-cs-sidebar-row] {
    animation: ${fadeIn} 300ms ease-out both;
  }

  @media (max-width: 767px) {
    [data-collectibles-studio-screen] [data-cs-panel] {
      width: 100% !important;
      max-width: 100% !important;
      height: auto !important;
      min-height: 0 !important;
    }

    [data-collectibles-studio-screen] [data-cs-collection-card] {
      width: 100% !important;
      max-width: 100% !important;
    }
  }
`

export default CollectiblesStudioGlobalStyle
