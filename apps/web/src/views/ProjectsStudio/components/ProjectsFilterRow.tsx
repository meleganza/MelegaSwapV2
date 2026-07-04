import React from 'react'
import styled from 'styled-components'
import { FILTER_CATEGORIES, FILTER_CHAINS, FILTER_SORT } from '../projectsStudioData'
import { useProjectsRuntime } from '../projectsRuntime/ProjectsRuntimeContext'
import { PR_FONT_BODY, projectsStudioColors, projectsStudioLayout } from '../projectsStudioTokens'

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
`

const Chip = styled.button<{ $active?: boolean }>`
  height: ${projectsStudioLayout.filterPillHeight};
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? projectsStudioColors.gold : projectsStudioColors.cardBorder)};
  background: ${({ $active }) => ($active ? projectsStudioColors.gold : projectsStudioColors.card)};
  color: ${({ $active }) => ($active ? '#050505' : projectsStudioColors.secondary)};
  font-family: ${PR_FONT_BODY};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 180ms ease, background 180ms ease;
  white-space: nowrap;

  &:hover {
    border-color: ${projectsStudioColors.gold};
  }
`

export const ProjectsFilterRow: React.FC = () => {
  const { filter, setFilter } = useProjectsRuntime()

  return (
    <Wrap data-pr-filters>
      <Row data-pr-filter-chains>
        {FILTER_CHAINS.map((chip) => (
          <Chip key={chip} type="button" $active={filter === chip} onClick={() => setFilter(chip)}>
            {chip}
          </Chip>
        ))}
      </Row>
      <Row data-pr-filter-categories>
        {FILTER_CATEGORIES.map((chip) => (
          <Chip key={chip} type="button" $active={filter === chip} onClick={() => setFilter(chip)}>
            {chip}
          </Chip>
        ))}
      </Row>
      <Row data-pr-filter-sort>
        {FILTER_SORT.map((chip) => (
          <Chip key={chip} type="button" $active={filter === chip} onClick={() => setFilter(chip)}>
            {chip}
          </Chip>
        ))}
      </Row>
    </Wrap>
  )
}

export default ProjectsFilterRow
