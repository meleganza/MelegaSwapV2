import React from 'react'
import styled from 'styled-components'
import { projectsStudioColors } from '../projectsStudioTokens'
import { PrGhostBtn, PrPreviewBadge, PrPrimaryBtn } from './projectsStudioPrimitives'

const Row = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  min-width: 0;

  @media (max-width: 767px) {
    flex-direction: column;
    align-items: flex-start;
  }
`

const Left = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`

const Title = styled.h1`
  margin: 0;
  font-size: 38px;
  font-weight: 800;
  line-height: 1.05;
  color: ${projectsStudioColors.text};
`

const Subtitle = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  color: ${projectsStudioColors.subtitle};
  max-width: 560px;
`

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  flex-wrap: wrap;

  @media (max-width: 767px) {
    width: 100%;
  }
`

export const ProjectsStudioPageHeader: React.FC = () => (
  <div data-pr-page-header>
    <Row>
      <Left>
        <Title>PROJECTS</Title>
        <Subtitle>
          Discover AI-indexed crypto projects. Find verified ecosystems. Trade with confidence.
        </Subtitle>
      </Left>
      <Right>
        <PrGhostBtn type="button" style={{ whiteSpace: 'nowrap' }}>
          AI Indexing: How it works
        </PrGhostBtn>
        <PrPrimaryBtn type="button">
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
          List Your Project
        </PrPrimaryBtn>
      </Right>
    </Row>
  </div>
)

export default ProjectsStudioPageHeader
