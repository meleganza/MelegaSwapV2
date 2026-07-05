import React from 'react'
import styled from 'styled-components'
import {
  PR_FONT_BODY,
  PR_FONT_DISPLAY,
  projectsStudioColors,
  projectsStudioLayout,
  projectsStudioType,
} from '../projectsStudioTokens'
import CivilizationRoleLabel from 'components/Civilization/CivilizationRoleLabel'
import { PrGhostBtn, PrPrimaryBtn } from './projectsStudioPrimitives'

const Header = styled.header`
  min-height: ${projectsStudioLayout.headerHeight};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  box-sizing: border-box;

  @media (max-width: ${projectsStudioLayout.mobileBreakpoint}) {
    min-height: auto;
    flex-direction: column;
    align-items: flex-start;
  }
`

const Left = styled.div`
  min-width: 0;
`

const Title = styled.h1`
  margin: 0;
  font-family: ${PR_FONT_DISPLAY};
  font-size: ${projectsStudioType.pageTitle};
  font-weight: 700;
  line-height: 1.05;
  color: ${projectsStudioColors.text};
`

const Subtitle = styled.p`
  margin: 6px 0 0;
  font-family: ${PR_FONT_BODY};
  font-size: ${projectsStudioType.pageSubtitle};
  font-weight: 400;
  line-height: 1.5;
  color: ${projectsStudioColors.subtitle};
  max-width: ${projectsStudioType.pageSubtitleMax};
`

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;

  @media (max-width: ${projectsStudioLayout.mobileBreakpoint}) {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }
`

export const ProjectsStudioPageHeader: React.FC = () => (
  <Header data-pr-page-header>
    <Left>
      <CivilizationRoleLabel module="projects" />
      <Title>PROJECTS</Title>
      <Subtitle>
        Discover registry-indexed crypto projects. Find verified ecosystems. Trade with confidence.
      </Subtitle>
    </Left>
    <Right>
      <PrPrimaryBtn as="a" href="/build-studio#build-import">
        Import &amp; Analyze Token
      </PrPrimaryBtn>
      <PrGhostBtn type="button">AI Indexing: How it works</PrGhostBtn>
    </Right>
  </Header>
)

export default ProjectsStudioPageHeader
