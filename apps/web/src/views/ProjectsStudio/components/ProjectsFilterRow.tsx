import React, { useState } from 'react'
import styled from 'styled-components'
import { PROJECT_FILTER_CHIPS } from '../projectsStudioData'
import { projectsStudioColors, projectsStudioLayout } from '../projectsStudioTokens'

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  min-height: ${projectsStudioLayout.filterHeight};
  align-items: center;
`

const Chip = styled.button<{ $active?: boolean }>`
  height: ${projectsStudioLayout.filterHeight};
  padding: 0 ${projectsStudioLayout.filterPaddingX};
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? projectsStudioColors.gold : projectsStudioColors.borderStrong)};
  background: ${({ $active }) => ($active ? projectsStudioColors.gold : 'transparent')};
  color: ${({ $active }) => ($active ? '#050505' : projectsStudioColors.secondary)};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: border-color 180ms ease, background 180ms ease, transform 180ms ease;
  white-space: nowrap;

  &:hover {
    border-color: ${projectsStudioColors.gold};
    transform: translateY(-1px);
  }
`

export const ProjectsFilterRow: React.FC = () => {
  const [active, setActive] = useState<string>('All')

  return (
    <Row data-pr-filters>
      {PROJECT_FILTER_CHIPS.map((chip) => (
        <Chip key={chip} type="button" $active={active === chip} onClick={() => setActive(chip)}>
          {chip}
        </Chip>
      ))}
    </Row>
  )
}

export default ProjectsFilterRow
