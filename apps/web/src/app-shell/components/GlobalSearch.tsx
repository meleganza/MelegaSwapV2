import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import useSWR from 'swr'
import { MelegaSearchBar } from 'design-system/melega/components/SearchBar'
import { colors } from 'design-system/melega/tokens/colors'
import { typography } from 'design-system/melega/tokens/typography'
import { MelegaExploreChainBadge } from 'components/Logo/MelegaExploreChainBadge'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import type { GlobalSearchCategory, GlobalSearchEntry, GlobalSearchResult } from 'lib/global-search/types'

type GlobalSearchRuntime = {
  index: GlobalSearchEntry[]
  search: (index: GlobalSearchEntry[], query: string) => GlobalSearchResult[]
  categoryLabel: (category: GlobalSearchCategory) => string
}

let globalSearchRuntimePromise: Promise<GlobalSearchRuntime> | null = null

function loadGlobalSearchRuntime(): Promise<GlobalSearchRuntime> {
  if (!globalSearchRuntimePromise) {
    globalSearchRuntimePromise = import('lib/global-search').then((runtime) => ({
      index: runtime.buildGlobalSearchIndex(),
      search: runtime.searchGlobal,
      categoryLabel: runtime.globalSearchCategoryLabel,
    }))
  }
  return globalSearchRuntimePromise
}

const Root = styled.div`
  position: relative;
  width: 100%;
  max-width: 100%;
  flex: 1 1 auto;
  min-width: 0;

  @media (max-width: 1023px) {
    width: 100%;
  }
`

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  min-width: min(360px, 92vw);
  z-index: 200;
  max-height: 460px;
  overflow: auto;
  background: #101010;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
  padding: 8px;
`

const ResultRow = styled.div<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  border-radius: 10px;
  padding: 10px 10px 8px;
  background: ${({ $active }) => ($active ? 'rgba(244, 196, 48, 0.12)' : 'transparent')};
  color: ${colors.textPrimary};
  font-family: ${typography.fontFamily.body};

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }
`

const ResultMain = styled.a`
  appearance: none;
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  text-align: left;
  cursor: pointer;
  color: inherit;
  text-decoration: none;
`

const LogoWrap = styled.span`
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
`

const TextCol = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`

const ResultLabel = styled.span`
  font-size: 14px;
  font-weight: 650;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Verified = styled.span`
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 700;
  color: #6ddc8c;
  letter-spacing: 0.02em;
`

const Sponsored = styled.span`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  border: 1px solid rgba(174, 116, 255, 0.62);
  border-radius: 999px;
  background: rgba(111, 52, 186, 0.22);
  color: #d7b7ff;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.02em;
`

const ResultMeta = styled.span`
  font-size: 12px;
  color: #8f8f8f;
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const CategoryTag = styled.span`
  display: inline-block;
  margin-top: 2px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #f4c430;
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-left: 38px;
`

const ActionBtn = styled.a`
  appearance: none;
  cursor: pointer;
  height: 26px;
  padding: 0 8px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #f5f5f5;
  font-size: 11px;
  font-weight: 650;
  text-decoration: none;

  &:hover {
    border-color: rgba(244, 196, 48, 0.4);
    color: #f4c430;
  }
`

const EmptyState = styled.div`
  padding: 16px 12px;
  font-size: 14px;
  color: #8f8f8f;
  text-align: center;
`

type ActiveSponsoredPlacement = {
  orderId: string
  projectSlug: string | null
  projectContract: string | null
  chainId: number
  name: string
  symbol: string
  logoUrl: string | null
}

async function fetchSponsoredPlacements(url: string): Promise<ActiveSponsoredPlacement[]> {
  const response = await fetch(url)
  if (!response.ok) return []
  const payload = (await response.json()) as { placements?: ActiveSponsoredPlacement[] }
  return payload.placements ?? []
}

const GlobalSearch: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [searchRuntime, setSearchRuntime] = useState<GlobalSearchRuntime | null>(null)
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const sponsoredKey = open && query.trim() ? '/api/trend-boost/active?service=sponsored-research' : null
  const { data: sponsoredPlacements = [] } = useSWR(sponsoredKey, fetchSponsoredPlacements, {
    refreshInterval: 30_000,
    revalidateOnFocus: false,
  })

  const ensureSearchRuntime = useCallback(() => {
    if (searchRuntime) return Promise.resolve(searchRuntime)
    setIsSearchLoading(true)
    return loadGlobalSearchRuntime().then((runtime) => {
      setSearchRuntime(runtime)
      setIsSearchLoading(false)
      return runtime
    })
  }, [searchRuntime])

  const results = useMemo(() => {
    if (!searchRuntime) return []
    const organic = searchRuntime.search(searchRuntime.index, query)
    const normalizedQuery = query.trim().toLowerCase()
    const paid: GlobalSearchResult[] = sponsoredPlacements
      .filter((placement) => {
        const haystack = [placement.name, placement.symbol, placement.projectContract, placement.projectSlug]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return haystack.includes(normalizedQuery)
      })
      .map((placement) => {
        const address = placement.projectContract
        const projectHref = placement.projectSlug ? `/@${placement.projectSlug}/` : '/projects'
        return {
          id: `sponsored-${placement.orderId}`,
          label: `${placement.symbol} — ${placement.chainId === 56 ? 'BSC' : `Chain ${placement.chainId}`}`,
          subtitle: placement.name,
          href: projectHref,
          category: 'token',
          searchableText: `${placement.name} ${placement.symbol} ${address ?? ''}`.toLowerCase(),
          score: Number.MAX_SAFE_INTEGER,
          scoreBoost: 1_000,
          chainId: placement.chainId,
          address,
          logoUrl: placement.logoUrl,
          verified: true,
          placement: 'sponsored',
          actions: [
            ...(address ? [{ label: 'Trade', href: `/swap?outputCurrency=${address}` }] : []),
            { label: 'Open Project', href: projectHref },
            ...(address ? [{ label: 'Add Wallet', href: `/portfolio?addToken=${address}` }] : []),
          ],
        }
      })
    const paidAddresses = new Set(paid.map((result) => result.address?.toLowerCase()).filter(Boolean))
    const paidSlugs = new Set(
      sponsoredPlacements.map((placement) => placement.projectSlug).filter((slug): slug is string => Boolean(slug)),
    )
    return [
      ...paid,
      ...organic.filter(
        (result) =>
          !paidAddresses.has(result.address?.toLowerCase()) &&
          ![...paidSlugs].some((slug) => result.href.includes(`/@${slug}/`)),
      ),
    ]
  }, [query, searchRuntime, sponsoredPlacements])

  const closeSearch = useCallback(() => {
    setOpen(false)
    setQuery('')
  }, [])

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
        void ensureSearchRuntime()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [ensureSearchRuntime])

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
      if (target) {
        closeSearch()
        window.location.assign(target.href)
      }
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
          void ensureSearchRuntime()
        }}
        onFocus={() => {
          setOpen(true)
          void ensureSearchRuntime()
        }}
        onKeyDown={handleKeyDown}
      />
      {showDropdown && (
        <Dropdown data-global-search-dropdown role="listbox" aria-label="Search results">
          {isSearchLoading ? (
            <EmptyState data-global-search-loading>Preparing search…</EmptyState>
          ) : results.length === 0 ? (
            <EmptyState data-global-search-empty>No results found</EmptyState>
          ) : (
            results.map((result: GlobalSearchResult, index) => (
              <ResultRow
                key={result.id}
                data-global-search-result
                data-result-id={result.id}
                data-result-chain={result.chainId ?? undefined}
                data-result-address={result.address ?? undefined}
                $active={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <ResultMain href={result.href} onClick={closeSearch}>
                  <LogoWrap aria-hidden>
                    <MelegaTokenAvatar
                      name={result.label}
                      symbol={result.label}
                      size={28}
                      address={result.address ?? undefined}
                      chainId={result.chainId ?? undefined}
                      logoURI={result.logoUrl ?? undefined}
                      radius="circle"
                    />
                  </LogoWrap>
                  <TextCol>
                    <TitleRow>
                      <ResultLabel>{result.label}</ResultLabel>
                      {result.placement === 'sponsored' ? <Sponsored>Sponsored</Sponsored> : null}
                      {result.chainId != null ? <MelegaExploreChainBadge chainId={result.chainId} /> : null}
                      {result.verified ? <Verified>Verified</Verified> : null}
                    </TitleRow>
                    {result.subtitle ? <ResultMeta>{result.subtitle}</ResultMeta> : null}
                    <CategoryTag>{searchRuntime?.categoryLabel(result.category) ?? result.category}</CategoryTag>
                  </TextCol>
                </ResultMain>
                {result.actions && result.actions.length > 0 ? (
                  <Actions data-global-search-actions>
                    {result.actions.map((action) => (
                      <ActionBtn
                        key={`${result.id}-${action.label}`}
                        href={action.href}
                        onClick={(e) => {
                          e.stopPropagation()
                          closeSearch()
                        }}
                      >
                        {action.label}
                      </ActionBtn>
                    ))}
                  </Actions>
                ) : null}
              </ResultRow>
            ))
          )}
        </Dropdown>
      )}
    </Root>
  )
}

export default GlobalSearch
