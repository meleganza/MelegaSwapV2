import React from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { typography } from 'design-system/melega'
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
import { projectsStudioColors, projectsStudioLayout } from './projectsStudioTokens'

const Root = styled.div`
  color: ${projectsStudioColors.text};
  font-family: ${typography.fontFamily.body};
  background: ${projectsStudioColors.canvas};
  padding: 0 0 32px;
  min-width: 0;
  overflow-x: hidden;

  @media (max-width: 767px) {
    padding: 0 0 ${projectsStudioLayout.mobileBottomPad};
  }
`

const Content = styled.div`
  max-width: ${projectsStudioLayout.contentMax};
  margin: 0 auto;
  padding: ${projectsStudioLayout.contentPaddingTop} ${projectsStudioLayout.contentPaddingX}
    ${projectsStudioLayout.contentPaddingBottom};
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: ${projectsStudioLayout.sectionGap};

  @media (max-width: 767px) {
    padding: 16px 16px ${projectsStudioLayout.mobileBottomPad};
  }
`

export const PageColumnGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, calc(66.666% + ${projectsStudioLayout.featuredGridAdjust}))
    minmax(0, calc(33.333% - ${projectsStudioLayout.featuredGridAdjust}));
  column-gap: ${projectsStudioLayout.pageGridGap};
  row-gap: ${projectsStudioLayout.pageGridGap};
  width: 100%;
  min-width: 0;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`

export const FeaturedSlot = styled.div`
  min-width: 0;
`

export const AdvisorSlot = styled.div`
  min-width: 0;
`

export const ProjectsStudioScreen: React.FC = () => (
  <ProjectsRuntimeProvider>
    <Root data-projects-studio-screen="true">
      <PageMeta />
      <ProjectsStudioGlobalStyle />
      <TrendingRibbon />
      <Content>
        <ProjectsStudioPageHeader />
        <ProjectsKpiRow />
        <PageColumnGrid data-pr-page-grid>
          <FeaturedSlot>
            <FeaturedProjectPanel />
          </FeaturedSlot>
          <AdvisorSlot>
            <AIProjectAdvisorPanel />
          </AdvisorSlot>
        </PageColumnGrid>
        <ProjectsFilterRow />
        <ProjectsGrid />
        <ProjectsActivityTable />
      </Content>
    </Root>
  </ProjectsRuntimeProvider>
)

export default ProjectsStudioScreen
