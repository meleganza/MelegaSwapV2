import { createGlobalStyle, keyframes } from 'styled-components'
import { poolsStudioColors } from './poolsStudioTokens'

const shimmer = keyframes`
  0%, 100% { opacity: 0.45; }
  50% { opacity: 0.9; }
`

const donutSweep = keyframes`
  from { stroke-dashoffset: 440; }
  to { stroke-dashoffset: var(--donut-offset, 0); }
`

const kpiCountUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const PoolsStudioGlobalStyle = createGlobalStyle`
  [data-pools-studio-screen] {
    color: ${poolsStudioColors.text};
    background: ${poolsStudioColors.canvas};
  }

  [data-pools-studio-screen] [data-ps-panel],
  [data-pools-studio-screen] [data-ps-pool-card],
  [data-pools-studio-screen] [data-ps-kpi-card],
  [data-pools-studio-screen] [data-ps-analytics-card] {
    transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease, background 150ms ease;
  }

  [data-pools-studio-screen] [data-ps-panel]:hover,
  [data-pools-studio-screen] [data-ps-kpi-card]:hover,
  [data-pools-studio-screen] [data-ps-analytics-card]:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(212, 175, 55, 0.08);
  }

  [data-pools-studio-screen] [data-ps-pool-card]:hover {
    transform: translateY(-2px);
    border-color: rgba(212, 175, 55, 0.55);
    background: ${poolsStudioColors.cardHover};
    box-shadow: 0 12px 28px rgba(212, 175, 55, 0.1);
  }

  [data-pools-studio-screen] [data-ps-sparkline],
  [data-pools-studio-screen] [data-ps-line-chart] {
    animation: ${shimmer} 8s ease-in-out infinite;
  }

  [data-pools-studio-screen] [data-ps-donut] circle[data-ps-donut-segment] {
    animation: ${donutSweep} 900ms ease-out forwards;
  }

  [data-pools-studio-screen] [data-ps-donut-segment]:hover {
    opacity: 0.85;
  }

  [data-pools-studio-screen] [data-ps-kpi-card] [data-ps-kpi-value] {
    animation: ${kpiCountUp} 700ms ease-out both;
  }

  [data-pools-studio-screen] [data-ps-kpi-row] [data-ps-kpi-card]:nth-child(2) [data-ps-kpi-value] {
    animation-delay: 80ms;
  }

  [data-pools-studio-screen] [data-ps-kpi-row] [data-ps-kpi-card]:nth-child(3) [data-ps-kpi-value] {
    animation-delay: 160ms;
  }

  [data-pools-studio-screen] [data-ps-kpi-row] [data-ps-kpi-card]:nth-child(4) [data-ps-kpi-value] {
    animation-delay: 240ms;
  }

  [data-pools-studio-screen] [data-ps-kpi-row] [data-ps-kpi-card]:nth-child(5) [data-ps-kpi-value] {
    animation-delay: 320ms;
  }

  @media (max-width: 767px) {
    [data-pools-studio-screen] [data-ps-panel] {
      width: 100% !important;
      max-width: 100% !important;
      height: auto !important;
      min-height: 0 !important;
    }

    [data-pools-studio-screen] [data-ps-pool-card] {
      width: 100% !important;
      max-width: 100% !important;
      height: auto !important;
      min-height: 292px !important;
    }

    [data-pools-studio-screen] [data-ps-advisor] {
      max-width: 100% !important;
    }
  }
`

export default PoolsStudioGlobalStyle
