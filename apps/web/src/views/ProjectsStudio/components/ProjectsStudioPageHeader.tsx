/**
 * Compact Projects Directory V3 hero — 140–170px desktop.
 * Title: Discover Projects · List Your Project · Claim Project
 */
import React from 'react'
import styled from 'styled-components'
import {
  MelegaStudioGhostBtn,
  MelegaStudioPrimaryBtn,
} from 'design-system/melega'
import { PR_FONT_BODY, PR_FONT_DISPLAY, projectsStudioColors } from '../projectsStudioTokens'

/** Claim Project → ownership-gated customize flow (List Studio claim intent). */
export const CLAIM_PROJECT_HREF = '/list?intent=claim-project'

const Shell = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 92px;
  padding: 14px 0 6px;
  box-sizing: border-box;
  min-width: 0;

  @media (max-width: 767px) {
    flex-direction: column;
    align-items: flex-start;
    min-height: 0;
    gap: 10px;
    padding: 10px 16px 2px;
  }
`

const Left = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
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

const Sub = styled.p`
  margin: 0;
  max-width: 520px;
  font-family: ${PR_FONT_BODY};
  font-size: 14px;
  line-height: 1.4;
  color: ${projectsStudioColors.secondary};
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  flex-shrink: 0;

  a {
    height: 40px;
    min-width: 0;
    padding: 0 16px;
    font-size: 13px;
  }
`

export const ProjectsStudioPageHeader: React.FC = () => (
  <Shell
    data-studio-header="projects"
    data-testid="projects-directory-header"
    data-projects-hero="compact-v3"
  >
    <Left>
      <Title>Explore</Title>
      <Sub>Verified projects, real markets and community discovery.</Sub>
    </Left>
    <Actions>
      <MelegaStudioPrimaryBtn as="a" href="/list" style={{ textDecoration: 'none' }} data-testid="projects-list-cta">
        Grow your project
      </MelegaStudioPrimaryBtn>
      <MelegaStudioGhostBtn
        as="a"
        href={CLAIM_PROJECT_HREF}
        style={{ textDecoration: 'none' }}
        data-testid="projects-claim-cta"
      >
        Claim page
      </MelegaStudioGhostBtn>
    </Actions>
  </Shell>
)

export default ProjectsStudioPageHeader
