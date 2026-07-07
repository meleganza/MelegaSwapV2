import { createGlobalStyle, keyframes } from 'styled-components'
import { poolsStudioColors } from './poolsStudioTokens'

const liveDotPulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
`

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

  /* R711/R712: pools-only chrome layout — sticky (not fixed) to avoid full-page screenshot clones */
  @media (min-width: 768px) {
    [data-melega-app-shell]:has([data-pools-studio-screen]) {
      display: grid;
      grid-template-columns: 228px minmax(0, 1fr);
      grid-template-rows: auto 1fr;
      grid-template-areas:
        'sidebar header'
        'sidebar main';
      min-height: 100vh;
    }

    [data-melega-app-shell]:has([data-pools-studio-screen]) [data-melega-sidebar] {
      grid-area: sidebar;
      position: sticky;
      top: 0;
      height: 100vh;
      align-self: start;
      width: 228px;
    }

    [data-melega-app-shell]:has([data-pools-studio-screen]) [data-melega-app-header] {
      grid-area: header;
      position: sticky;
      top: 0;
      left: auto;
      right: auto;
      width: auto;
      align-self: start;
    }

    [data-melega-app-shell]:has([data-pools-studio-screen]) > main {
      grid-area: main;
      margin-left: 0 !important;
    }
  }

  [data-melega-app-shell]:has([data-pools-studio-screen]) [data-melega-mobile-header] {
    position: sticky;
    top: 0;
  }

  [data-melega-app-shell]:has([data-pools-studio-screen]) nav[aria-label='Main navigation'] {
    position: sticky;
    bottom: 0;
  }
`

export default PoolsStudioGlobalStyle
