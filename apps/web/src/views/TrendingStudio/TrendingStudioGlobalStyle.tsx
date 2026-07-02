import { createGlobalStyle, keyframes } from 'styled-components'
import { trendingStudioColors, trendingStudioLayout } from './trendingStudioTokens'

const kpiCountUp = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`

const ringPulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.88; transform: scale(1.02); }
`

const heatPulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.72; }
`

const badgePulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`

const TrendingStudioGlobalStyle = createGlobalStyle`
  @keyframes trHeatPulse {
    ${heatPulse}
  }

  @keyframes trBadgePulse {
    ${badgePulse}
  }

  [data-trending-studio-screen] {
    color: ${trendingStudioColors.white};
    background: ${trendingStudioColors.canvas};
  }

  [data-trending-studio-screen] [data-tr-panel],
  [data-trending-studio-screen] [data-tr-kpi-card],
  [data-trending-studio-screen] [data-tr-trending-card] {
    transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
  }

  [data-trending-studio-screen] [data-tr-panel]:hover,
  [data-trending-studio-screen] [data-tr-kpi-card]:hover,
  [data-trending-studio-screen] [data-tr-trending-card]:hover {
    transform: translateY(-2px);
    box-shadow: ${trendingStudioColors.shadow};
  }

  [data-trending-studio-screen] [data-tr-kpi-value] {
    animation: ${kpiCountUp} 700ms ease-out both;
  }

  [data-trending-studio-screen] [data-tr-opportunity-ring] {
    animation: ${ringPulse} 3.2s ease-in-out infinite;
  }

  [data-trending-studio-screen] [data-tr-heat-row]:hover {
    background: ${trendingStudioColors.hoverRow};
  }

  @media (max-width: ${trendingStudioLayout.stackBreakpoint}) {
    [data-trending-studio-screen] [data-tr-page-grid] {
      grid-template-columns: 1fr !important;
    }
  }

  @media (max-width: 767px) {
    [data-trending-studio-screen] [data-tr-trending-card],
    [data-trending-studio-screen] [data-tr-panel] {
      width: 100% !important;
      max-width: 100% !important;
      height: auto !important;
      min-height: 0 !important;
    }
  }
`

export default TrendingStudioGlobalStyle
