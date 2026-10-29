/**
 * Compact Projects Directory V3 hero — 140–170px desktop.
 * Title: Discover Projects · List Your Project · Claim Project
 */
import React from 'react'
import styled from 'styled-components'
import { PR_FONT_DISPLAY, projectsStudioColors } from '../projectsStudioTokens'

/** Claim Project → ownership-gated customize flow (List Studio claim intent). */
export const CLAIM_PROJECT_HREF = '/list?intent=claim-project'

const Shell = styled.header`
  display: flex;
  align-items: center;
  min-height: 56px;
  padding: 8px 0 4px;
  box-sizing: border-box;
  min-width: 0;

  @media (max-width: 767px) {
    padding: 8px 16px 2px;
  }
`

const Title = styled.h1`
  margin: 0;
  font-family: ${PR_FONT_DISPLAY};
  font-size: 32px;
  font-weight: 750;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: ${projectsStudioColors.text};

  @media (max-width: 767px) {
    font-size: 28px;
  }
`

export const ProjectsStudioPageHeader: React.FC = () => (
  <Shell
    data-studio-header="projects"
    data-testid="projects-directory-header"
    data-projects-hero="compact-v3"
  >
    <Title>Explore</Title>
  </Shell>
)

export default ProjectsStudioPageHeader
