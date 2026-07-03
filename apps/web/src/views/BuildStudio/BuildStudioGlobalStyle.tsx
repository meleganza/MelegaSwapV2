import { createGlobalStyle, keyframes } from 'styled-components'
import { buildStudioColors, buildStudioLayout } from './buildStudioTokens'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`

const flowPulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
`

const arrowPulse = keyframes`
  0%, 100% { opacity: 0.45; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(2px); }
`

const BuildStudioGlobalStyle = createGlobalStyle`
  @property --ring-angle {
    syntax: '<angle>';
    inherits: false;
    initial-value: 0deg;
  }

  [data-build-studio-screen] {
    color: ${buildStudioColors.white};
    background: ${buildStudioColors.pageBg};
  }

  [data-build-studio-screen] [data-bs-panel] {
    transition: transform ${buildStudioLayout.transition} ease,
      border-color ${buildStudioLayout.transition} ease,
      box-shadow ${buildStudioLayout.transition} ease;
  }

  [data-build-studio-screen] [data-bs-kpi-card] {
    animation: ${fadeIn} 400ms ease-out both;
  }

  [data-build-studio-screen] [data-bs-kpi-card]:nth-child(1) { animation-delay: 0ms; }
  [data-build-studio-screen] [data-bs-kpi-card]:nth-child(2) { animation-delay: 80ms; }
  [data-build-studio-screen] [data-bs-kpi-card]:nth-child(3) { animation-delay: 160ms; }
  [data-build-studio-screen] [data-bs-kpi-card]:nth-child(4) { animation-delay: 240ms; }
  [data-build-studio-screen] [data-bs-kpi-card]:nth-child(5) { animation-delay: 320ms; }

  [data-build-studio-screen] [data-bs-flow-connector] {
    animation: ${flowPulse} 2s ease-in-out infinite;
  }

  [data-build-studio-screen] [data-bs-pipeline-arrow] {
    animation: ${arrowPulse} ${buildStudioLayout.arrowAnim} ease-in-out infinite;
  }

  [data-build-studio-screen] [data-bs-artwork]:hover {
    transform: scale(1.03);
    transition: transform 220ms ease;
  }

  @media (max-width: 767px) {
    [data-build-studio-screen] [data-bs-panel] {
      width: 100% !important;
      max-width: 100% !important;
      height: auto !important;
      min-height: 0 !important;
    }
  }
`

export default BuildStudioGlobalStyle
