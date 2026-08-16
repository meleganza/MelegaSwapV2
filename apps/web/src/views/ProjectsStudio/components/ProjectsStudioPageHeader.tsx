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

  @media (min-width: 768px) and (max-width: 1279px) {
    grid-template-columns: minmax(270px, 0.38fr) minmax(0, 0.62fr);
    gap: 14px;
  }

  @media (max-width: 767px) {
    height: 224px;
    display: block;
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
    width: calc(100% - 176px);
    max-width: 140px;
    height: 100%;
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

  @media (min-width: 768px) and (max-width: 1279px) {
    margin-top: 4px;
    font-size: 36px;
    line-height: 38px;
  }

  @media (max-width: 767px) {
    font-size: 32px;
    line-height: 37px;
  }
`

const Sub = styled.p`
  max-width: 330px;
  margin: 8px 0 0;
  font-family: ${PR_FONT_BODY};
  font-size: 14px;
  line-height: 21px;
  color: ${projectsStudioColors.secondary};

  @media (min-width: 768px) and (max-width: 1279px) {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-top: 4px;
    font-size: 13px;
    line-height: 17px;
  }

  @media (max-width: 767px) {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    flex-shrink: 0;
    font-size: 11px;
    line-height: 14px;
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

  @media (min-width: 768px) and (max-width: 1279px) {
    flex-wrap: nowrap;
    gap: 6px;
    margin-top: 6px;

    a {
      flex: 1 1 0;
      height: 28px;
      min-height: 28px;
      padding: 0 7px;
      font-size: 10px;
      white-space: nowrap;
    }
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
      min-height: 28px;
      padding: 0 4px;
      font-size: 8.5px;
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

  /* Directory hero: one complete premium placement at compact widths.
     Keeping the rail non-scrollable preserves the card halo without a
     rectangular clipping surface or a browser-native scrollbar. */
  @media (min-width: 768px) and (max-width: 1279px) {
    width: 100%;
    max-width: 100%;

    & > section,
    & > section > div {
      width: 100%;
      max-width: 100%;
      min-width: 0;
      box-sizing: border-box;
    }

    & > section > div {
      display: block;
      overflow: visible;
      padding: 7px 9px;
      margin: 0;
      background: transparent;
      box-sizing: border-box;
    }

    & > section > div > * {
      width: 100%;
      max-width: 100%;
      min-width: 0;
    }

    & > section > div > *:not(:first-child) {
      display: none;
    }
  }

  @media (max-width: 767px) {
    position: absolute;
    top: 16px;
    right: 8px;
    bottom: 16px;
    width: 176px;
    height: 148px;
    padding: 2px 0;

    & > section,
    & > section > div {
      width: 100%;
      max-width: 100%;
      min-width: 0;
      height: 148px;
      box-sizing: border-box;
    }

    & > section > div {
      display: block;
      overflow: visible;
      padding: 6px;
      margin: 0;
      background: transparent;
      box-sizing: border-box;
    }

    & > section > div > * {
      width: 100%;
      max-width: 100%;
      min-width: 0;
    }

    & > section > div > *:not(:first-child) {
      display: none;
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
