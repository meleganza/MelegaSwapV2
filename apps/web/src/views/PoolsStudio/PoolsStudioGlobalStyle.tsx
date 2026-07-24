import { createGlobalStyle, keyframes } from 'styled-components'
import { poolsStudioColors } from './poolsStudioTokens'

const liveDotPulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
`

/**
 * Pools-local styles only.
 * Do NOT override the shared MelegaAppShell bottom navigation positioning —
 * sticky demotion hid the canonical mobile nav after main content (production defect).
 */
const PoolsStudioGlobalStyle = createGlobalStyle`
  [data-pools-studio-screen] {
    color: ${poolsStudioColors.text};
    background: ${poolsStudioColors.canvas};
  }

  [data-pools-studio-screen] [data-ps-live-dot] {
    animation: ${liveDotPulse} 4s ease-in-out infinite;
  }

  [data-pools-studio-screen] [data-ps-pool-card]:hover {
    border-color: ${poolsStudioColors.cardBorderHover};
  }

  [data-pools-studio-screen] [data-ps-kpi-card]:hover,
  [data-pools-studio-screen] [data-ps-advisor-wrap]:hover,
  [data-pools-studio-screen] [data-ps-health-guide]:hover,
  [data-pools-studio-screen] [data-ps-reward-pie]:hover {
    border-color: ${poolsStudioColors.cardBorderHover};
  }

  @media (max-width: 767px) {
    [data-pools-studio-screen] [data-ps-pool-card] {
      width: 100% !important;
      max-width: 100% !important;
    }
  }
`

export default PoolsStudioGlobalStyle
