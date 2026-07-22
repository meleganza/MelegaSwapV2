import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { MelegaSearchBar, colors, typography } from 'design-system/melega'
import {
  buildGlobalSearchIndex,
  globalSearchCategoryLabel,
  searchGlobal,
  type GlobalSearchResult,
} from 'lib/global-search'

const Root = styled.div`
  position: relative;
  width: clamp(190px, 18vw, 300px);
  max-width: 100%;
  flex-shrink: 1;

  @media (max-width: 1279px) {
    width: clamp(180px, 16vw, 210px);
  }

  @media (max-width: 1023px) {
    width: 100%;
  }
`

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 200;
  max-height: 420px;
  overflow: auto;
  background: #101010;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
  padding: 8px;
`

const ResultButton = styled.button<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  width: 100%;
  border: none;
  border-radius: 10px;
  padding: 10px 12px;
  text-align: left;
  cursor: pointer;
  background: ${({ $active }) => ($active ? 'rgba(244, 196, 48, 0.12)' : 'transparent')};
  color: ${colors.textPrimary};
  font-family: ${typography.fontFamily.body};

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }
`

const ResultLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
`

const ResultMeta = styled.span`
  font-size: 12px;
  color: #8f8f8f;
  line-height: 1.35;
`

const CategoryTag = styled.span`
  display: inline-block;
  margin-top: 4px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #F4C430;
`

const EmptyState = styled.div`
  padding: 16px 12px;
  font-size: 14px;
  color: #8f8f8f;
  text-align: center;
`

const GlobalSearch: React.FC = () => {
  const router = useRouter()
  const rootRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const index = useMemo(() => buildGlobalSearchIndex(), [])
  const results = useMemo(() => searchGlobal(index, query), [index, query])

  const navigateTo = useCallback(
    (result: GlobalSearchResult) => {
      setOpen(false)
      setQuery('')
      void router.push(result.href)
    },
    [router],
  )

  const showDropdown = open && query.trim().length > 0

  useEffect(() => {
    setActiveIndex(0)
  }, [query, results.length])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        const input = rootRef.current?.querySelector('input')
        input?.focus()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!showDropdown) return undefined
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [showDropdown])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setOpen(false)
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!results.length) return
      setActiveIndex((prev) => (prev + 1) % results.length)
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!results.length) return
      setActiveIndex((prev) => (prev - 1 + results.length) % results.length)
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      const target = results[activeIndex] ?? results[0]
      if (target) navigateTo(target)
    }
  }

  return (
    <Root ref={rootRef} data-global-search-root data-melega-global-search>
      <MelegaSearchBar
        placeholder="Search tokens, projects, pools..."
        value={query}
        onChange={(value) => {
          setQuery(value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
      />
      {showDropdown && (
        <Dropdown data-global-search-dropdown role="listbox" aria-label="Search results">
          {results.length === 0 ? (
            <EmptyState data-global-search-empty>No results found</EmptyState>
          ) : (
            results.map((result, index) => (
              <ResultButton
                key={result.id}
                type="button"
                data-global-search-result
                data-result-id={result.id}
                $active={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => navigateTo(result)}
              >
                <ResultLabel>{result.label}</ResultLabel>
                {result.subtitle && <ResultMeta>{result.subtitle}</ResultMeta>}
                <CategoryTag>{globalSearchCategoryLabel(result.category)}</CategoryTag>
              </ResultButton>
            ))
          )}
        </Dropdown>
      )}
    </Root>
  )
}

export default GlobalSearch
