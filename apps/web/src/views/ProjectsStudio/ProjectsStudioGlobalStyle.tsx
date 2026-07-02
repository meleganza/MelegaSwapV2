import { createGlobalStyle, keyframes } from 'styled-components'
import { projectsStudioColors, projectsStudioLayout } from './projectsStudioTokens'

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

const ProjectsStudioGlobalStyle = createGlobalStyle`
  [data-projects-studio-screen] {
    color: ${projectsStudioColors.text};
    background: ${projectsStudioColors.canvas};
  }

  [data-projects-studio-screen] [data-pr-panel],
  [data-projects-studio-screen] [data-pr-project-card],
  [data-projects-studio-screen] [data-pr-kpi-card] {
    transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
  }

  [data-projects-studio-screen] [data-pr-panel]:hover,
  [data-projects-studio-screen] [data-pr-kpi-card]:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.28);
  }

  [data-projects-studio-screen] [data-pr-project-card]:hover {
    transform: translateY(-2px);
    border-color: rgba(212, 175, 55, 0.35);
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.28);
  }

  [data-projects-studio-screen] [data-pr-kpi-card] [data-pr-kpi-value] {
    animation: ${kpiCountUp} 700ms ease-out both;
  }

  @media (max-width: 767px) {
    [data-projects-studio-screen] [data-pr-panel] {
      width: 100% !important;
      max-width: 100% !important;
      height: auto !important;
      min-height: 0 !important;
    }

    [data-projects-studio-screen] [data-pr-project-card] {
      width: 100% !important;
      max-width: 100% !important;
      height: auto !important;
      min-height: ${projectsStudioLayout.cardHeight} !important;
    }
  }
`

export default ProjectsStudioGlobalStyle
