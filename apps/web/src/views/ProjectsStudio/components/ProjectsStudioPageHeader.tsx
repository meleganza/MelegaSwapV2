import React from 'react'
import styled from 'styled-components'
import { FeaturedProjectsRail } from 'views/HomeTrade/FeaturedProjectsRail'
import { CanonicalHeroEyebrow } from 'views/shared/CanonicalHeroEyebrow'
import { MelegaStudioGhostBtn, MelegaStudioPrimaryBtn } from 'design-system/melega'
import { PR_FONT_BODY, PR_FONT_DISPLAY, projectsStudioColors } from '../projectsStudioTokens'

/** Claim Project → ownership-gated customize flow (List Studio claim intent). */
export const CLAIM_PROJECT_HREF = '/list?intent=claim-project'

const Shell = styled.header`
  position: relative;
  width: 100%;
  height: 216px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(360px, 0.34fr) minmax(0, 0.66fr);
  gap: 20px;
  align-items: stretch;
  padding: 20px;
  overflow: hidden;
  border: 1px solid rgba(221, 185, 47, 0.22);
  border-radius: 18px;
  background: radial-gradient(circle at 18% 30%, rgba(244, 196, 48, 0.12), transparent 34%),
    linear-gradient(105deg, #111006 0%, #090909 43%, #060606 100%);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.3);

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: radial-gradient(circle, rgba(244, 196, 48, 0.2) 0 1px, transparent 1.4px);
    background-size: 52px 52px;
    opacity: 0.12;
  }

  @media (max-width: 1099px) {
    grid-template-columns: minmax(290px, 0.36fr) minmax(0, 0.64fr);
    gap: 14px;
    padding: 16px;
  }

  @media (max-width: 767px) {
    height: 224px;
    grid-template-columns: minmax(150px, 0.42fr) minmax(0, 0.58fr);
    padding: 16px;
  }
`

const Left = styled.div`
  position: relative;
  z-index: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 0 0 12px;

  @media (max-width: 767px) {
    padding-left: 2px;
  }
`

const Title = styled.h1`
  margin: 6px 0 0;
  font-family: ${PR_FONT_DISPLAY};
  font-size: 46px;
  font-weight: 750;
  line-height: 52px;
  letter-spacing: -0.025em;
  color: ${projectsStudioColors.text};

  @media (max-width: 767px) {
    font-size: 34px;
    line-height: 40px;
  }
`

const Sub = styled.p`
  max-width: 330px;
  margin: 8px 0 0;
  font-family: ${PR_FONT_BODY};
  font-size: 14px;
  line-height: 21px;
  color: ${projectsStudioColors.secondary};

  @media (max-width: 767px) {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-size: 12px;
    line-height: 18px;
  }
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;

  a {
    height: 34px;
    min-width: 0;
    padding: 0 12px;
    font-size: 12px;
  }

  @media (max-width: 767px) {
    display: flex;
    flex-wrap: nowrap;
    gap: 5px;
    margin-top: 8px;

    a {
      width: auto;
      flex: 1 1 0;
      height: 28px;
      padding: 0 4px;
      font-size: 9px;
      white-space: nowrap;
    }
  }
`

const Featured = styled.div`
  position: relative;
  z-index: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  align-self: center;
  height: 156px;
  box-sizing: border-box;
  padding: 4px 0;

  & > section {
    width: 100%;
    height: 156px;
    min-height: 0;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }

  & > section > div {
    height: 156px;
    min-height: 0;
    grid-auto-rows: minmax(0, 1fr);
  }

  & article {
    height: 100%;
    max-height: 100%;
    min-height: 0;
    padding: 6px 8px;
    gap: 2px;
  }

  & article > :nth-child(3) {
    min-height: 8px;
    height: 8px;
  }

  & article > :nth-child(4) > div > :first-child {
    white-space: nowrap;
    font-size: 8px;
    line-height: 10px;
  }

  & article > :last-child a {
    height: 28px;
    min-height: 28px;
  }

  @media (max-width: 1099px) {
    height: 150px;
    padding: 3px 0;

    & > section,
    & > section > div {
      height: 150px;
    }
  }

  @media (max-width: 767px) {
    height: 148px;
    padding: 2px 0;

    & > section,
    & > section > div {
      height: 148px;
    }
  }
`

export const ProjectsStudioPageHeader: React.FC = () => (
  <Shell
    data-studio-header="projects"
    data-testid="projects-directory-header"
    data-projects-hero="canonical"
    data-canonical-hero-height="216"
  >
    <Left>
      <CanonicalHeroEyebrow icon="discover">Melega DEX Discovery</CanonicalHeroEyebrow>
      <Title>Discover Projects</Title>
      <Sub>Explore tokens and projects across Melega DEX.</Sub>
      <Actions>
        <MelegaStudioPrimaryBtn as="a" href="/list" style={{ textDecoration: 'none' }} data-testid="projects-list-cta">
          List Your Project
        </MelegaStudioPrimaryBtn>
        <MelegaStudioGhostBtn
          as="a"
          href={CLAIM_PROJECT_HREF}
          style={{ textDecoration: 'none' }}
          data-testid="projects-claim-cta"
        >
          Claim Project
        </MelegaStudioGhostBtn>
      </Actions>
    </Left>
    <Featured aria-label="Featured projects">
      <FeaturedProjectsRail />
    </Featured>
  </Shell>
)

export default ProjectsStudioPageHeader
