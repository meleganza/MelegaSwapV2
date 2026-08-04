import React from 'react'
import styled from 'styled-components'
import { useProjectsRuntime } from '../projectsRuntime/ProjectsRuntimeContext'
import { projectsStudioColors, projectsStudioLayout } from '../projectsStudioTokens'
import ProjectGridCard from './ProjectGridCard'

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  min-width: 0;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (min-width: 1280px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  @media (min-width: 1600px) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
`

const EmptyPanel = styled.div`
  grid-column: 1 / -1;
  min-height: 200px;
  padding: 32px 24px;
  border-radius: ${projectsStudioLayout.cardRadius};
  border: 1px solid ${projectsStudioColors.cardBorder};
  background: ${projectsStudioColors.card};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 6px;
`

const EmptyTitle = styled.p`
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: ${projectsStudioColors.text};
`

const EmptyDesc = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: ${projectsStudioColors.muted};
  max-width: 360px;
`

const Count = styled.p`
  margin: 0 0 4px;
  font-size: 12px;
  font-weight: 600;
  color: ${projectsStudioColors.muted};
  grid-column: 1 / -1;
`

export const ProjectsGrid: React.FC = () => {
  const { projects } = useProjectsRuntime()

  return (
    <div data-pr-grid data-testid="projects-directory-grid">
      <Count data-testid="projects-directory-count">
        {projects.length} project{projects.length === 1 ? '' : 's'}
      </Count>
      <Grid>
        {projects.length === 0 ? (
          <EmptyPanel data-pr-grid-empty>
            <EmptyTitle>No projects match this filter</EmptyTitle>
            <EmptyDesc>Adjust search or filters, or list a new project.</EmptyDesc>
          </EmptyPanel>
        ) : (
          projects.map((project) => <ProjectGridCard key={project.id} project={project} />)
        )}
      </Grid>
    </div>
  )
}

export default ProjectsGrid
