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

  [data-liquidity-studio-screen] [data-ls-panel] {
    transition: transform 150ms ease, box-shadow 150ms ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
    }
  }

  [data-liquidity-studio-screen] [data-ls-primary-btn] {
    transition: transform 150ms ease, filter 150ms ease;

    &:hover {
      filter: brightness(1.05);
      transform: translateY(-2px);
    }

    &:active {
      transform: scale(0.99);
    }
  }

  [data-liquidity-studio-screen] [data-ls-liquidity-bar] {
    animation: ${barPulse} 6s ease-in-out infinite;
  }

  [data-liquidity-studio-screen] [data-ls-mini-chart] {
    animation: ${shimmer} 8s ease-in-out infinite;
  }
`

export default LiquidityStudioGlobalStyle
