import React from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import ProjectsStudioGlobalStyle from './ProjectsStudioGlobalStyle'
import ProjectsFilterRow from './components/ProjectsFilterRow'
import ProjectsGrid from './components/ProjectsGrid'
import ProjectsStudioPageHeader from './components/ProjectsStudioPageHeader'
import { ProjectsRuntimeProvider } from './projectsRuntime/ProjectsRuntimeContext'
import { projectsStudioColors, projectsStudioLayout } from './projectsStudioTokens'

const Root = styled.div`
  color: ${projectsStudioColors.text};
  background: ${projectsStudioColors.canvas};
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: hidden;
  box-sizing: border-box;
  padding-bottom: ${projectsStudioLayout.mobileBottomPad};

  @media (min-width: 769px) {
    padding-bottom: 48px;
  }
`

const Content = styled.div`
  max-width: ${projectsStudioLayout.contentMax};
  margin: 0 auto;
  padding: 12px ${projectsStudioLayout.contentPaddingX} ${projectsStudioLayout.contentPaddingBottom};
  box-sizing: border-box;
  min-width: 0;
  display: flex;
  flex-direction: column;
  /* Home desktop content rhythm; intentionally local to Projects. */
  gap: 20px;

  @media (max-width: 767px) {
    padding: 12px 0 ${projectsStudioLayout.mobileBottomPad};
    gap: 14px;
  }
`

/** Canonical multichain project discovery marketplace — V3 premium directory. */
export const ProjectsStudioScreen: React.FC = () => (
  <ProjectsRuntimeProvider>
    <Root
      data-projects-studio-screen
      data-projects-directory="v3"
      data-projects-directory-version="premium-discovery"
      data-pr-r111b-canonical
    >
      <PageMeta />
      <ProjectsStudioGlobalStyle />
      <Content>
        <ProjectsStudioPageHeader />
        <ProjectsFilterRow />
        <ProjectsGrid />
      </Content>
    </Root>
  </ProjectsRuntimeProvider>
)

export default ProjectsStudioScreen
