/**
 * Compact dropdown filters for Projects directory.
 * Status · Chain · Category · Sort — no giant pill rows.
 */
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
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  min-width: 0;
`

const Search = styled.input`
  flex: 1 1 220px;
  min-width: 0;
  max-width: 360px;
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

const Select = styled.select`
  appearance: none;
  height: 40px;
  min-width: 128px;
  padding: 0 32px 0 12px;
  border-radius: 10px;
  border: 1px solid ${projectsStudioColors.cardBorder};
  background:
    ${projectsStudioColors.card}
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23A8A8A8' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")
    no-repeat right 12px center;
  color: ${projectsStudioColors.text};
  font-family: ${PR_FONT_BODY};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${projectsStudioColors.gold};
  }
`

const STATUS_OPTIONS = ['All', ...FILTER_STATUS] as const
const CHAIN_OPTIONS = ['All chains', ...FILTER_CHAINS] as const
const CATEGORY_OPTIONS = ['All categories', ...FILTER_CATEGORIES] as const
const SORT_OPTIONS = FILTER_SORT

function isStatus(v: string): boolean {
  return (STATUS_OPTIONS as readonly string[]).includes(v)
}
function isChain(v: string): boolean {
  return (FILTER_CHAINS as readonly string[]).includes(v)
}
function isCategory(v: string): boolean {
  return (FILTER_CATEGORIES as readonly string[]).includes(v)
}
function isSort(v: string): boolean {
  return (FILTER_SORT as readonly string[]).includes(v)
}

export const ProjectsFilterRow: React.FC = () => {
  const router = useRouter()
  const { filter, setFilter, searchQuery, setSearchQuery } = useProjectsRuntime()

  useEffect(() => {
    const sort = typeof router.query.sort === 'string' ? router.query.sort : ''
    if (sort === 'trending' && filter !== 'Trending') {
      setFilter('Trending')
    }
  }, [router.query.sort, filter, setFilter])

  const statusValue = isStatus(filter) ? filter : 'All'
  const chainValue = isChain(filter) ? filter : 'All chains'
  const categoryValue = isCategory(filter) ? filter : 'All categories'
  const sortValue = isSort(filter) ? filter : 'Trending'

  return (
    <Wrap data-pr-filters data-testid="projects-directory-filters" data-projects-filters="dropdowns">
      <Search
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search projects, symbols, contracts…"
        aria-label="Search projects"
        data-testid="projects-directory-search"
      />
      <Select
        aria-label="Status"
        data-testid="projects-filter-status"
        value={statusValue}
        onChange={(e) => setFilter(e.target.value === 'All' ? 'All' : e.target.value)}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt === 'All' ? 'Status' : opt}
          </option>
        ))}
      </Select>
      <Select
        aria-label="Chain"
        data-testid="projects-filter-chain"
        value={chainValue}
        onChange={(e) => setFilter(e.target.value === 'All chains' ? 'All' : e.target.value)}
      >
        {CHAIN_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt === 'All chains' ? 'Chain' : opt}
          </option>
        ))}
      </Select>
      <Select
        aria-label="Category"
        data-testid="projects-filter-category"
        value={categoryValue}
        onChange={(e) => setFilter(e.target.value === 'All categories' ? 'All' : e.target.value)}
      >
        {CATEGORY_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt === 'All categories' ? 'Category' : opt}
          </option>
        ))}
      </Select>
      <Select
        aria-label="Sort"
        data-testid="projects-filter-sort"
        value={sortValue}
        onChange={(e) => setFilter(e.target.value)}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </Select>
    </Wrap>
  )
}

export default ProjectsFilterRow
