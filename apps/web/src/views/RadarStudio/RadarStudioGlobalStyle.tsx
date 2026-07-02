import { createGlobalStyle, keyframes } from 'styled-components'
import { radarStudioColors, radarStudioLayout } from './radarStudioTokens'

const heatPulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.65; }
`

const livePulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.92); }
`

const ticker = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`

const RadarStudioGlobalStyle = createGlobalStyle`
  @keyframes rdHeatPulse {
    ${heatPulse}
  }

  [data-radar-studio-screen] {
    color: ${radarStudioColors.white};
    background: ${radarStudioColors.canvas};
  }

  [data-radar-studio-screen] [data-rd-panel],
  [data-radar-studio-screen] [data-rd-kpi-card],
  [data-radar-studio-screen] [data-rd-discovery-card] {
    transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
  }

  [data-radar-studio-screen] [data-rd-panel]:hover,
  [data-radar-studio-screen] [data-rd-kpi-card]:hover,
  [data-radar-studio-screen] [data-rd-discovery-card]:hover {
    transform: translateY(-2px);
    border-color: ${radarStudioColors.hoverBorder};
    box-shadow: ${radarStudioColors.shadow};
  }

  [data-radar-studio-screen] [data-rd-live-dot] {
    animation: ${livePulse} 2s ease-in-out infinite;
  }

  [data-radar-studio-screen] [data-rd-ticker-track] {
    animation: ${ticker} 28s linear infinite;
  }

  @media (max-width: ${radarStudioLayout.stackBreakpoint}) {
    [data-radar-studio-screen] [data-rd-page-grid] {
      grid-template-columns: 1fr !important;
    }
  }

  @media (max-width: 767px) {
    [data-radar-studio-screen] [data-rd-discovery-card],
    [data-radar-studio-screen] [data-rd-panel] {
      width: 100% !important;
      max-width: 100% !important;
      height: auto !important;
      min-height: 0 !important;
    }
  }
`

export default RadarStudioGlobalStyle
