import { createGlobalStyle, keyframes } from 'styled-components'
import { liquidityStudioColors } from './liquidityStudioTokens'

const barPulse = keyframes`
  0%, 100% { opacity: 0.82; }
  50% { opacity: 1; }
`

const shimmer = keyframes`
  0%, 100% { opacity: 0.45; }
  50% { opacity: 0.85; }
`

const LiquidityStudioGlobalStyle = createGlobalStyle`
  [data-liquidity-studio-screen] {
    color: ${liquidityStudioColors.text};
    background: ${liquidityStudioColors.canvas};
  }

  [data-liquidity-studio-screen] [data-ls-primary-btn] {
    transition: transform 140ms ease, filter 140ms ease;
  }

  [data-liquidity-studio-screen] [data-ls-liquidity-bar] {
    animation: ${barPulse} 6s ease-in-out infinite;
  }

  [data-liquidity-studio-screen] [data-ls-mini-chart] {
    animation: ${shimmer} 8s ease-in-out infinite;
    filter: brightness(1.04);
  }

  @media (min-width: 1100px) {
    [data-liquidity-studio-screen] [data-ls-builder],
    [data-liquidity-studio-screen] [data-ls-position-preview] {
      min-height: 440px;
      height: 100%;
    }
  }

  @media (max-width: 767px) {
    [data-liquidity-studio-screen] [data-ls-panel] {
      width: 100% !important;
      max-width: 100% !important;
      height: auto !important;
      min-height: 0 !important;
    }

    [data-liquidity-studio-screen] [data-ls-builder],
    [data-liquidity-studio-screen] [data-ls-position-preview],
    [data-liquidity-studio-screen] [data-ls-activity] {
      min-height: auto;
    }
  }
`

export default LiquidityStudioGlobalStyle
