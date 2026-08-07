import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useProjectsRuntime } from '../projectsRuntime/ProjectsRuntimeContext'
import { PROJECTS_SCROLL_KEY } from '../projectsDirectoryV3'
import { projectsStudioColors, projectsStudioLayout, PR_FONT_BODY } from '../projectsStudioTokens'
import ProjectGridCard from './ProjectGridCard'

const Wrap = styled.div`
  min-width: 0;
`

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

  @media (min-width: 1440px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`

const EmptyPanel = styled.div`
  grid-column: 1 / -1;
  padding: 20px 16px;
  border-radius: ${projectsStudioLayout.cardRadius};
  border: 1px solid ${projectsStudioColors.cardBorder};
  background: rgba(255, 255, 255, 0.02);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 10px;
`

const EmptyTitle = styled.p`
  margin: 0;
  font-family: ${PR_FONT_BODY};
  font-size: 14px;
  font-weight: 650;
  color: ${projectsStudioColors.text};
`

const ResetBtn = styled.button`
  height: 36px;
  padding: 0 14px;
  border-radius: 9px;
  border: 1px solid ${projectsStudioColors.cardBorder};
  background: transparent;
  color: ${projectsStudioColors.text};
  font-family: ${PR_FONT_BODY};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    border-color: ${projectsStudioColors.gold};
  }
`

const Count = styled.p`
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 600;
  color: ${projectsStudioColors.muted};
`

const LoadMore = styled.button`
  display: block;
  margin: 16px auto 0;
  height: 40px;
  padding: 0 20px;
  border-radius: 10px;
  border: 1px solid ${projectsStudioColors.cardBorder};
  background: ${projectsStudioColors.card};
  color: ${projectsStudioColors.text};
  font-family: ${PR_FONT_BODY};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    border-color: ${projectsStudioColors.gold};
  }
`

export const ProjectsGrid: React.FC = () => {
  const { projects, visibleProjects, hasMore, loadMore, resetFilters } = useProjectsRuntime()

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PROJECTS_SCROLL_KEY)
      if (!raw) return
      const y = Number(raw)
      if (Number.isFinite(y) && y > 0) {
        window.requestAnimationFrame(() => window.scrollTo(0, y))
      }
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    const onScroll = () => {
      try {
        sessionStorage.setItem(PROJECTS_SCROLL_KEY, String(window.scrollY))
      } catch {
        /* ignore */
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <Wrap data-pr-grid data-testid="projects-directory-grid" data-projects-grid="v3">
      <Count data-testid="projects-directory-count">
        {`Showing ${visibleProjects.length} of ${projects.length} project${projects.length === 1 ? '' : 's'}`}
      </Count>
      <Grid>
        {projects.length === 0 ? (
          <EmptyPanel data-pr-grid-empty data-testid="projects-directory-empty">
            <EmptyTitle>No projects match these filters.</EmptyTitle>
            <ResetBtn type="button" data-testid="projects-empty-reset" onClick={() => resetFilters()}>
              Reset Filters
            </ResetBtn>
          </EmptyPanel>
        ) : (
          visibleProjects.map((project) => (
            <ProjectGridCard key={`${project.chainId ?? 0}:${project.contractAddress ?? project.id}`} project={project} />
          ))
        )}
      </Grid>
      {hasMore ? (
        <LoadMore type="button" data-testid="projects-load-more" onClick={() => loadMore()}>
          Load More
        </LoadMore>
      ) : null}
    </Wrap>
  )
}

export default ProjectsGrid
