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
`

export default ProjectsStudioGlobalStyle
