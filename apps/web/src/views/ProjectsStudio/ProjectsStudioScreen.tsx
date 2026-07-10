import React from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import TrendingRibbon from 'views/HomeTrade/TrendingRibbon'
import ProjectsStudioGlobalStyle from './ProjectsStudioGlobalStyle'
import AIProjectAdvisorPanel from './components/AIProjectAdvisorPanel'
import FeaturedProjectPanel from './components/FeaturedProjectPanel'
import ProjectsActivityTable from './components/ProjectsActivityTable'
import ProjectsFilterRow from './components/ProjectsFilterRow'
import ProjectsGrid from './components/ProjectsGrid'
import ProjectsKpiRow from './components/ProjectsKpiRow'
import ProjectsStudioPageHeader from './components/ProjectsStudioPageHeader'
import { ProjectsRuntimeProvider } from './projectsRuntime/ProjectsRuntimeContext'
import ProjectsMachinePanel from './components/ProjectsMachinePanel'
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
  padding: ${projectsStudioLayout.contentPaddingTop} ${projectsStudioLayout.contentPaddingX}
    ${projectsStudioLayout.contentPaddingBottom};
  box-sizing: border-box;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${projectsStudioLayout.sectionGap};

  @media (max-width: 767px) {
    padding: 16px 16px ${projectsStudioLayout.mobileBottomPad};
  }
`

export const ProjectsStudioScreen: React.FC = () => (
  <ProjectsRuntimeProvider>
    <Root data-projects-studio-screen data-pr-r111b-canonical>
      <PageMeta />
      <ProjectsStudioGlobalStyle />
      <TrendingRibbon />
      <Content>
        <ProjectsStudioPageHeader />
        <ProjectsKpiRow />
        <FeaturedProjectPanel />
        <AIProjectAdvisorPanel />
        <ProjectsFilterRow />
        <ProjectsGrid />
        <ProjectsActivityTable />
        <ProjectsMachinePanel />
      </Content>
    </Root>
  </ProjectsRuntimeProvider>
)

export default ProjectsStudioScreen
