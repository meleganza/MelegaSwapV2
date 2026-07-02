import { createGlobalStyle, keyframes } from 'styled-components'
import { farmsStudioColors } from './farmsStudioTokens'

const shimmer = keyframes`
  0%, 100% { opacity: 0.45; }
  50% { opacity: 0.85; }
`

const FarmsStudioGlobalStyle = createGlobalStyle`
  [data-farms-studio-screen] {
    color: ${farmsStudioColors.text};
    background: ${farmsStudioColors.canvas};
  }

  [data-farms-studio-screen] [data-fs-panel],
  [data-farms-studio-screen] [data-fs-farm-card],
  [data-farms-studio-screen] [data-fs-kpi-card] {
    transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
  }

  [data-farms-studio-screen] [data-fs-panel]:hover,
  [data-farms-studio-screen] [data-fs-kpi-card]:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(212, 175, 55, 0.08);
  }

  [data-farms-studio-screen] [data-fs-farm-card]:hover {
    transform: translateY(-2px);
    border-color: rgba(212, 175, 55, 0.55);
    box-shadow: 0 12px 28px rgba(212, 175, 55, 0.08);
  }

  [data-farms-studio-screen] [data-fs-mini-chart] {
    animation: ${shimmer} 8s ease-in-out infinite;
  }

  @media (max-width: 767px) {
    [data-farms-studio-screen] [data-fs-panel],
    [data-farms-studio-screen] [data-fs-farm-card] {
      width: 100% !important;
      max-width: 100% !important;
      height: auto !important;
      min-height: 0 !important;
    }
  }
`

export default FarmsStudioGlobalStyle
