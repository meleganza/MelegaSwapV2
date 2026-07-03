import React from 'react'
import styled from 'styled-components'
import { useProjectsRuntime } from '../projectsRuntime/ProjectsRuntimeContext'
import { projectsStudioLayout } from '../projectsStudioTokens'
import ProjectGridCard from './ProjectGridCard'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${projectsStudioLayout.gridColumns}, 1fr);
  gap: ${projectsStudioLayout.gridGap};
  min-width: 0;

  @media (max-width: 1099px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`

export const ProjectsGrid: React.FC = () => {
  const { projects } = useProjectsRuntime()

  return (
    <Grid data-pr-grid>
      {projects.map((project) => (
        <ProjectGridCard key={project.id} project={project} />
      ))}
    </Grid>
  )
}

export default ProjectsGrid
