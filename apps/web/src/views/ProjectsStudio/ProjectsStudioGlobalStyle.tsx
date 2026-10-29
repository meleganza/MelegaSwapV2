import { createGlobalStyle } from 'styled-components'
import { projectsStudioColors } from './projectsStudioTokens'

const ProjectsStudioGlobalStyle = createGlobalStyle`
  [data-projects-studio-screen] {
    color: ${projectsStudioColors.text};
    background: ${projectsStudioColors.canvas};
  }

  [data-projects-studio-screen] [data-pr-panel],
  [data-projects-studio-screen] [data-pr-project-card],
  [data-projects-studio-screen] [data-pr-kpi-card],
  [data-projects-studio-screen] [data-pr-featured],
  [data-projects-studio-screen] [data-pr-advisor],
  [data-projects-studio-screen] [data-pr-activity] {
    transition: border-color 180ms ease;
  }

  /* Attribute selectors avoid styled-components component-id collisions with legacy Home cards. */
  [data-projects-studio-screen] [data-featured-slug],
  [data-projects-studio-screen] [data-testid='projects-directory-list'] a {
    background: #FFFFFF !important;
    background-image: none !important;
    border-color: #E5E2D9 !important;
    color: #171817 !important;
  }

  [data-projects-studio-screen] [data-featured-slug] a:not([data-testid^='featured-trade']) {
    border-color: #E5E2D9 !important;
  }
`

export default ProjectsStudioGlobalStyle
