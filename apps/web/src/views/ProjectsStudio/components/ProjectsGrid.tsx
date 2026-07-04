import React from 'react'
import styled from 'styled-components'
import { useProjectsRuntime } from '../projectsRuntime/ProjectsRuntimeContext'
import { projectsStudioColors, projectsStudioLayout } from '../projectsStudioTokens'
import ProjectGridCard from './ProjectGridCard'

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${projectsStudioLayout.cardGap};
  min-width: 0;
`

const EmptyPanel = styled.div`
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

export const ProjectsGrid: React.FC = () => {
  const { projects } = useProjectsRuntime()

  return (
    <Grid data-pr-grid>
      {projects.length === 0 ? (
        <EmptyPanel data-pr-grid-empty>
          <EmptyTitle>No projects match this filter</EmptyTitle>
          <EmptyDesc>Indexed listings appear here after import review. Adjust filters or list a new project.</EmptyDesc>
        </EmptyPanel>
      ) : (
        projects.map((project) => <ProjectGridCard key={project.id} project={project} />)
      )}
    </Grid>
  )
}

export default ProjectsGrid
