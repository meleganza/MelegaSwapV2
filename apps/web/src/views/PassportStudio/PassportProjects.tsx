/**
 * PASSPORT_MODULE_004 — My Projects rail (desktop 1376×176).
 * Up to four project cards + Create New Project. Does not modify Modules 001–003.
 */
import React from 'react'
import styled from 'styled-components'
import { passportOne } from './passportTokens'
import { PassportProjectCard } from './PassportProjectCard'
import { PassportCreateProjectCard } from './PassportCreateProjectCard'
import { usePassportProjects, type UsePassportProjectsOptions } from './usePassportProjects'
import type { PassportProjectsViewModel } from './passportProjectsTypes'

const Module = styled.section`
  position: relative;
  width: 100%;
  max-width: ${passportOne.contentMax};
  height: ${passportOne.projectsH};
  min-width: 0;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: ${passportOne.projectsModuleRadius};
  border: ${passportOne.projectsModuleBorder};
  background: ${passportOne.projectsModuleBg};
  box-shadow: ${passportOne.projectsModuleShadow};
  padding: ${passportOne.projectsModulePadY} ${passportOne.projectsModulePadX};
  font-family: ${passportOne.font};
  color: ${passportOne.text};

  @media (max-width: 1199px) {
    height: auto;
    overflow: visible;
    padding: 16px;
  }

  @media (max-width: 767px) {
    width: 100%;
    max-width: none;
    height: auto;
    padding: 16px 0;
    border-radius: 16px;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
`

const Header = styled.div`
  display: none;

  @media (max-width: 1199px) {
    display: block;
    margin-bottom: 12px;
    font-size: 16px;
    line-height: 22px;
    font-weight: 750;
  }
`

const Inner = styled.div`
  width: 100%;
  height: 144px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${passportOne.projectsCardGap};
  min-width: 0;
  box-sizing: border-box;

  @media (max-width: 1199px) {
    height: auto;
    flex-wrap: wrap;
  }

  @media (max-width: 767px) {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
`

const EmptyExplain = styled.p`
  margin: 0;
  width: ${passportOne.projectsEmptyExplainW};
  max-width: 100%;
  font-size: 13px;
  line-height: 19px;
  color: ${passportOne.secondary};
  flex-shrink: 1;
  min-width: 0;

  @media (max-width: 767px) {
    width: 100%;
    order: 2;
  }
`

export type PassportProjectsProps = UsePassportProjectsOptions & {
  model?: PassportProjectsViewModel
}

export const PassportProjects: React.FC<PassportProjectsProps> = ({
  model: injected,
  fixtureProjects,
  sourceUnavailable,
}) => {
  const live = usePassportProjects({ fixtureProjects, sourceUnavailable })
  const model = injected ?? live
  const visibleProjects = model.projects.slice(0, 4)
  const isEmpty = visibleProjects.length === 0

  return (
    <Module
      data-testid="passport-projects-module"
      data-passport-module="004"
      data-pixel-passport-projects="1376x176"
      data-projects-empty={isEmpty ? 'true' : 'false'}
      aria-label="My Projects"
    >
      <Header>My Projects</Header>
      <Inner data-testid="passport-projects-inner">
        {isEmpty ? (
          <>
            <EmptyExplain data-testid="passport-projects-empty-explain">
              {model.emptyExplanation}
            </EmptyExplain>
            <PassportCreateProjectCard />
          </>
        ) : (
          <>
            {visibleProjects.map((project) => (
              <PassportProjectCard key={project.id} project={project} />
            ))}
            <PassportCreateProjectCard />
          </>
        )}
      </Inner>
    </Module>
  )
}

export default PassportProjects
