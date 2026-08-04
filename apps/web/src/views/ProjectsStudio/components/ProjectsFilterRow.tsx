import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import {
  FILTER_CATEGORIES,
  FILTER_CHAINS,
  FILTER_SORT,
  FILTER_STATUS,
} from '../projectsStudioData'
import { useProjectsRuntime } from '../projectsRuntime/ProjectsRuntimeContext'
import { PR_FONT_BODY, projectsStudioColors } from '../projectsStudioTokens'

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const Search = styled.input`
  width: 100%;
  max-width: 420px;
  height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid ${projectsStudioColors.cardBorder};
  background: ${projectsStudioColors.card};
  color: ${projectsStudioColors.text};
  font-family: ${PR_FONT_BODY};
  font-size: 14px;
  box-sizing: border-box;

  &::placeholder {
    color: ${projectsStudioColors.muted};
  }

  &:focus {
    outline: none;
    border-color: ${projectsStudioColors.gold};
  }
`

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
`

const Label = styled.span`
  font-family: ${PR_FONT_BODY};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${projectsStudioColors.muted};
  margin-right: 2px;
`

const Chip = styled.button<{ $active?: boolean }>`
  height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? projectsStudioColors.gold : projectsStudioColors.cardBorder)};
  background: ${({ $active }) => ($active ? projectsStudioColors.gold : projectsStudioColors.card)};
  color: ${({ $active }) => ($active ? '#050505' : projectsStudioColors.secondary)};
  font-family: ${PR_FONT_BODY};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 180ms ease, background 180ms ease;
  white-space: nowrap;

  &:hover {
    border-color: ${projectsStudioColors.gold};
  }
`

export const ProjectsFilterRow: React.FC = () => {
  const router = useRouter()
  const { filter, setFilter, searchQuery, setSearchQuery } = useProjectsRuntime()

  useEffect(() => {
    const sort = typeof router.query.sort === 'string' ? router.query.sort : ''
    if (sort === 'trending' && filter !== 'Trending') {
      setFilter('Trending')
    }
  }, [router.query.sort, filter, setFilter])

  return (
    <Wrap data-pr-filters data-testid="projects-directory-filters">
      <Search
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search projects, symbols, contracts…"
        aria-label="Search projects"
        data-testid="projects-directory-search"
      />
      <Row data-pr-filter-status>
        <Label>Status</Label>
        <Chip type="button" $active={filter === 'All'} onClick={() => setFilter('All')}>
          All
        </Chip>
        {FILTER_STATUS.map((chip) => (
          <Chip key={chip} type="button" $active={filter === chip} onClick={() => setFilter(chip)}>
            {chip}
          </Chip>
        ))}
      </Row>
      <Row data-pr-filter-chains>
        <Label>Chain</Label>
        {FILTER_CHAINS.map((chip) => (
          <Chip key={chip} type="button" $active={filter === chip} onClick={() => setFilter(chip)}>
            {chip}
          </Chip>
        ))}
      </Row>
      <Row data-pr-filter-categories>
        <Label>Category</Label>
        {FILTER_CATEGORIES.map((chip) => (
          <Chip key={chip} type="button" $active={filter === chip} onClick={() => setFilter(chip)}>
            {chip}
          </Chip>
        ))}
      </Row>
      <Row data-pr-filter-sort>
        <Label>Sort</Label>
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
