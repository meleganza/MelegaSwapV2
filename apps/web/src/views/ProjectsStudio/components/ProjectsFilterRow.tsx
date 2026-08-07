/**
 * Projects Directory V3 — compact search + dropdown toolbar (~56–72px desktop).
 * Independent Status · Chain · Category · Sort. Mobile: Filters drawer.
 */
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import { useProjectsRuntime } from '../projectsRuntime/ProjectsRuntimeContext'
import {
  DIRECTORY_CATEGORIES,
  DIRECTORY_CHAINS,
  DIRECTORY_SORT,
  DIRECTORY_STATUS,
  type DirectoryCategory,
  type DirectoryChain,
  type DirectorySort,
  type DirectoryStatus,
} from '../projectsDirectoryV3'
import { PR_FONT_BODY, projectsStudioColors } from '../projectsStudioTokens'

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-height: 56px;
  max-height: 72px;
  min-width: 0;
  box-sizing: border-box;

  @media (max-width: 767px) {
    max-height: none;
    flex-direction: column;
    align-items: stretch;
  }
`

const Search = styled.input`
  flex: 1 1 220px;
  min-width: 0;
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

  @media (max-width: 767px) {
    flex: 1 1 auto;
    max-width: none;
    width: 100%;
  }
`

const Select = styled.select`
  appearance: none;
  height: 40px;
  min-width: 112px;
  padding: 0 30px 0 12px;
  border-radius: 10px;
  border: 1px solid ${projectsStudioColors.cardBorder};
  background:
    ${projectsStudioColors.card}
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23A8A8A8' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")
    no-repeat right 10px center;
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

const ResetBtn = styled.button`
  height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid ${projectsStudioColors.cardBorder};
  background: transparent;
  color: ${projectsStudioColors.secondary};
  font-family: ${PR_FONT_BODY};
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;

  &:hover {
    border-color: ${projectsStudioColors.gold};
    color: ${projectsStudioColors.text};
  }
`

const MobileFiltersBtn = styled.button`
  display: none;
  height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid ${projectsStudioColors.cardBorder};
  background: ${projectsStudioColors.card};
  color: ${projectsStudioColors.text};
  font-family: ${PR_FONT_BODY};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;

  @media (max-width: 767px) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
`

const DesktopFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;

  @media (max-width: 767px) {
    display: none;
  }
`

const DrawerBackdrop = styled.div<{ $open: boolean }>`
  display: ${({ $open }) => ($open ? 'block' : 'none')};
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 80;
`

const Drawer = styled.div<{ $open: boolean }>`
  display: ${({ $open }) => ($open ? 'flex' : 'none')};
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 81;
  flex-direction: column;
  gap: 10px;
  padding: 16px 16px calc(16px + env(safe-area-inset-bottom, 0px));
  background: ${projectsStudioColors.card};
  border-top: 1px solid ${projectsStudioColors.cardBorder};
  border-radius: 16px 16px 0 0;
  max-height: 70vh;
  overflow-y: auto;
`

const DrawerTitle = styled.p`
  margin: 0 0 4px;
  font-family: ${PR_FONT_BODY};
  font-size: 14px;
  font-weight: 750;
  color: ${projectsStudioColors.text};
`

function isStatus(v: string): v is DirectoryStatus {
  return (DIRECTORY_STATUS as readonly string[]).includes(v)
}
function isChain(v: string): v is DirectoryChain {
  return (DIRECTORY_CHAINS as readonly string[]).includes(v)
}
function isCategory(v: string): v is DirectoryCategory {
  return (DIRECTORY_CATEGORIES as readonly string[]).includes(v)
}
function isSort(v: string): v is DirectorySort {
  return (DIRECTORY_SORT as readonly string[]).includes(v)
}

export const ProjectsFilterRow: React.FC = () => {
  const router = useRouter()
  const {
    status,
    setStatus,
    chain,
    setChain,
    category,
    setCategory,
    sort,
    setSort,
    searchQuery,
    setSearchQuery,
    resetFilters,
  } = useProjectsRuntime()
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const sortQ = typeof router.query.sort === 'string' ? router.query.sort : ''
    if (sortQ === 'trending' && sort !== 'Trending') {
      setSort('Trending')
    }
  }, [router.query.sort, sort, setSort])

  const onSortChange = (value: string) => {
    if (!isSort(value)) return
    setSort(value)
    if (value === 'Trending') {
      void router.replace({ pathname: '/projects', query: { ...router.query, sort: 'trending' } }, undefined, {
        shallow: true,
      })
    } else if (router.query.sort === 'trending') {
      const next = { ...router.query }
      delete next.sort
      void router.replace({ pathname: '/projects', query: next }, undefined, { shallow: true })
    }
  }

  const filterSelects = (
    <>
      <Select
        aria-label="Status"
        data-testid="projects-filter-status"
        value={status}
        onChange={(e) => isStatus(e.target.value) && setStatus(e.target.value)}
      >
        {DIRECTORY_STATUS.map((opt) => (
          <option key={opt} value={opt}>
            {opt === 'All' ? 'Status' : opt}
          </option>
        ))}
      </Select>
      <Select
        aria-label="Chain"
        data-testid="projects-filter-chain"
        value={chain}
        onChange={(e) => isChain(e.target.value) && setChain(e.target.value)}
      >
        {DIRECTORY_CHAINS.map((opt) => (
          <option key={opt} value={opt}>
            {opt === 'All Chains' ? 'Chain' : opt}
          </option>
        ))}
      </Select>
      <Select
        aria-label="Category"
        data-testid="projects-filter-category"
        value={category}
        onChange={(e) => isCategory(e.target.value) && setCategory(e.target.value)}
      >
        {DIRECTORY_CATEGORIES.map((opt) => (
          <option key={opt} value={opt}>
            {opt === 'All' ? 'Category' : opt}
          </option>
        ))}
      </Select>
      <Select
        aria-label="Sort"
        data-testid="projects-filter-sort"
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
      >
        {DIRECTORY_SORT.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </Select>
      <ResetBtn type="button" data-testid="projects-filter-reset" onClick={() => resetFilters()}>
        Reset
      </ResetBtn>
    </>
  )

  return (
    <Toolbar data-pr-filters data-testid="projects-directory-filters" data-projects-filters="dropdowns">
      <Search
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search projects..."
        aria-label="Search projects"
        data-testid="projects-directory-search"
      />
      <DesktopFilters data-projects-filters-desktop>{filterSelects}</DesktopFilters>
      <MobileFiltersBtn
        type="button"
        data-testid="projects-filters-mobile"
        onClick={() => setDrawerOpen(true)}
      >
        Filters
      </MobileFiltersBtn>
      <DrawerBackdrop $open={drawerOpen} onClick={() => setDrawerOpen(false)} />
      <Drawer $open={drawerOpen} data-testid="projects-filters-drawer" role="dialog" aria-label="Filters">
        <DrawerTitle>Filters</DrawerTitle>
        {filterSelects}
        <ResetBtn type="button" onClick={() => setDrawerOpen(false)}>
          Done
        </ResetBtn>
      </Drawer>
    </Toolbar>
  )
}

export default ProjectsFilterRow
