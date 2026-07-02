import { createGlobalStyle, keyframes } from 'styled-components'
import { radarStudioColors, radarStudioLayout } from './radarStudioTokens'

const heatFade = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
`

const livePulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(0,232,132,0.35); }
  50% { box-shadow: 0 0 0 8px transparent; }
`

/* ~42px/sec: track width ~2400px => ~57s */
const ticker = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`

const cardIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const RadarStudioGlobalStyle = createGlobalStyle`
  @keyframes rdHeatFade {
    ${heatFade}
  }

  @keyframes rdCardIn {
    ${cardIn}
  }

  [data-radar-studio-screen] {
    color: ${radarStudioColors.white};
    background: ${radarStudioColors.pageBg};
  }

  [data-radar-studio-screen] [data-rd-panel],
  [data-radar-studio-screen] [data-rd-kpi-card],
  [data-radar-studio-screen] [data-rd-event-card] {
    transition: transform ${radarStudioColors.transition} ease, border-color ${radarStudioColors.transition} ease,
      box-shadow ${radarStudioColors.transition} ease;
  }

  [data-radar-studio-screen] [data-rd-panel]:hover,
  [data-radar-studio-screen] [data-rd-kpi-card]:hover,
  [data-radar-studio-screen] [data-rd-event-card]:hover {
    transform: translateY(-2px);
    border-color: ${radarStudioColors.hoverBorder};
    box-shadow: ${radarStudioColors.shadow};
  }

  [data-radar-studio-screen] [data-rd-live-dot] {
    animation: ${livePulse} 2s ease-in-out infinite;
  }

  [data-radar-studio-screen] [data-rd-ticker-track] {
    animation: ${ticker} 57s linear infinite;
  }

  [data-radar-studio-screen] [data-rd-ticker-viewport]:hover [data-rd-ticker-track] {
    animation-play-state: paused;
  }

  [data-radar-studio-screen] [data-rd-heat-block] {
    animation: rdHeatFade 3s ease-in-out infinite;
  }

  [data-radar-studio-screen] [data-rd-confidence-bar] {
    animation: rdConfGrow 600ms ease-out both;
  }

  @keyframes rdConfGrow {
    from { width: 0; }
  }

  @media (max-width: ${radarStudioLayout.stackBreakpoint}) {
    [data-radar-studio-screen] [data-rd-console-grid] {
      grid-template-columns: 1fr !important;
    }
  }

  @media (max-width: 767px) {
    [data-radar-studio-screen] [data-rd-event-card],
    [data-radar-studio-screen] [data-rd-panel] {
      width: 100% !important;
      max-width: 100% !important;
    }

    [data-radar-studio-screen] [data-rd-preview-gauge] {
      width: ${radarStudioLayout.mobileGaugeSize};
      height: ${radarStudioLayout.mobileGaugeSize};
    }
  }
`

export default RadarStudioGlobalStyle
